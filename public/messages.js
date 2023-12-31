/*!
 *  Lang.js for Laravel localization in JavaScript.
 *
 *  @version 1.1.10
 *  @license MIT https://github.com/rmariuzzo/Lang.js/blob/master/LICENSE
 *  @site    https://github.com/rmariuzzo/Lang.js
 *  @author  Rubens Mariuzzo <rubens@mariuzzo.com>
 */
(function (root, factory) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.Lang = factory();
  }
})(this, function () {
  "use strict";
  function inferLocale() {
    if (typeof document !== "undefined" && document.documentElement) {
      return document.documentElement.lang;
    }
  }
  function convertNumber(str) {
    if (str === "-Inf") {
      return -Infinity;
    } else if (str === "+Inf" || str === "Inf" || str === "*") {
      return Infinity;
    }
    return parseInt(str, 10);
  }
  var intervalRegexp =
    /^({\s*(\-?\d+(\.\d+)?[\s*,\s*\-?\d+(\.\d+)?]*)\s*})|([\[\]])\s*(-Inf|\*|\-?\d+(\.\d+)?)\s*,\s*(\+?Inf|\*|\-?\d+(\.\d+)?)\s*([\[\]])$/;
  var anyIntervalRegexp =
    /({\s*(\-?\d+(\.\d+)?[\s*,\s*\-?\d+(\.\d+)?]*)\s*})|([\[\]])\s*(-Inf|\*|\-?\d+(\.\d+)?)\s*,\s*(\+?Inf|\*|\-?\d+(\.\d+)?)\s*([\[\]])/;
  var defaults = { locale: "en" };
  var Lang = function (options) {
    options = options || {};
    this.locale = options.locale || inferLocale() || defaults.locale;
    this.fallback = options.fallback;
    this.messages = options.messages;
  };
  Lang.prototype.setMessages = function (messages) {
    this.messages = messages;
  };
  Lang.prototype.getLocale = function () {
    return this.locale || this.fallback;
  };
  Lang.prototype.setLocale = function (locale) {
    this.locale = locale;
  };
  Lang.prototype.getFallback = function () {
    return this.fallback;
  };
  Lang.prototype.setFallback = function (fallback) {
    this.fallback = fallback;
  };
  Lang.prototype.has = function (key, locale) {
    if (typeof key !== "string" || !this.messages) {
      return false;
    }
    return this._getMessage(key, locale) !== null;
  };
  Lang.prototype.get = function (key, replacements, locale) {
    if (!this.has(key, locale)) {
      return key;
    }
    var message = this._getMessage(key, locale);
    if (message === null) {
      return key;
    }
    if (replacements) {
      message = this._applyReplacements(message, replacements);
    }
    return message;
  };
  Lang.prototype.trans = function (key, replacements) {
    return this.get(key, replacements);
  };
  Lang.prototype.choice = function (key, number, replacements, locale) {
    replacements = typeof replacements !== "undefined" ? replacements : {};
    replacements.count = number;
    var message = this.get(key, replacements, locale);
    if (message === null || message === undefined) {
      return message;
    }
    var messageParts = message.split("|");
    var explicitRules = [];
    for (var i = 0; i < messageParts.length; i++) {
      messageParts[i] = messageParts[i].trim();
      if (anyIntervalRegexp.test(messageParts[i])) {
        var messageSpaceSplit = messageParts[i].split(/\s/);
        explicitRules.push(messageSpaceSplit.shift());
        messageParts[i] = messageSpaceSplit.join(" ");
      }
    }
    if (messageParts.length === 1) {
      return message;
    }
    for (var j = 0; j < explicitRules.length; j++) {
      if (this._testInterval(number, explicitRules[j])) {
        return messageParts[j];
      }
    }
    var pluralForm = this._getPluralForm(number);
    return messageParts[pluralForm];
  };
  Lang.prototype.transChoice = function (key, count, replacements) {
    return this.choice(key, count, replacements);
  };
  Lang.prototype._parseKey = function (key, locale) {
    if (typeof key !== "string" || typeof locale !== "string") {
      return null;
    }
    var segments = key.split(".");
    var source = segments[0].replace(/\//g, ".");
    return {
      source: locale + "." + source,
      sourceFallback: this.getFallback() + "." + source,
      entries: segments.slice(1),
    };
  };
  Lang.prototype._getMessage = function (key, locale) {
    locale = locale || this.getLocale();
    key = this._parseKey(key, locale);
    if (
      this.messages[key.source] === undefined &&
      this.messages[key.sourceFallback] === undefined
    ) {
      return null;
    }
    var message = this.messages[key.source];
    var entries = key.entries.slice();
    var subKey = "";
    while (entries.length && message !== undefined) {
      var subKey = !subKey
        ? entries.shift()
        : subKey.concat(".", entries.shift());
      if (message[subKey] !== undefined) {
        message = message[subKey];
        subKey = "";
      }
    }
    if (typeof message !== "string" && this.messages[key.sourceFallback]) {
      message = this.messages[key.sourceFallback];
      entries = key.entries.slice();
      subKey = "";
      while (entries.length && message !== undefined) {
        var subKey = !subKey
          ? entries.shift()
          : subKey.concat(".", entries.shift());
        if (message[subKey]) {
          message = message[subKey];
          subKey = "";
        }
      }
    }
    if (typeof message !== "string") {
      return null;
    }
    return message;
  };
  Lang.prototype._findMessageInTree = function (pathSegments, tree) {
    while (pathSegments.length && tree !== undefined) {
      var dottedKey = pathSegments.join(".");
      if (tree[dottedKey]) {
        tree = tree[dottedKey];
        break;
      }
      tree = tree[pathSegments.shift()];
    }
    return tree;
  };
  Lang.prototype._applyReplacements = function (message, replacements) {
    for (var replace in replacements) {
      message = message.replace(
        new RegExp(":" + replace, "gi"),
        function (match) {
          var value = replacements[replace];
          var allCaps = match === match.toUpperCase();
          if (allCaps) {
            return value.toUpperCase();
          }
          var firstCap =
            match ===
            match.replace(/\w/i, function (letter) {
              return letter.toUpperCase();
            });
          if (firstCap) {
            return value.charAt(0).toUpperCase() + value.slice(1);
          }
          return value;
        }
      );
    }
    return message;
  };
  Lang.prototype._testInterval = function (count, interval) {
    if (typeof interval !== "string") {
      throw "Invalid interval: should be a string.";
    }
    interval = interval.trim();
    var matches = interval.match(intervalRegexp);
    if (!matches) {
      throw "Invalid interval: " + interval;
    }
    if (matches[2]) {
      var items = matches[2].split(",");
      for (var i = 0; i < items.length; i++) {
        if (parseInt(items[i], 10) === count) {
          return true;
        }
      }
    } else {
      matches = matches.filter(function (match) {
        return !!match;
      });
      var leftDelimiter = matches[1];
      var leftNumber = convertNumber(matches[2]);
      if (leftNumber === Infinity) {
        leftNumber = -Infinity;
      }
      var rightNumber = convertNumber(matches[3]);
      var rightDelimiter = matches[4];
      return (
        (leftDelimiter === "[" ? count >= leftNumber : count > leftNumber) &&
        (rightDelimiter === "]" ? count <= rightNumber : count < rightNumber)
      );
    }
    return false;
  };
  Lang.prototype._getPluralForm = function (count) {
    switch (this.locale) {
      case "az":
      case "bo":
      case "dz":
      case "id":
      case "ja":
      case "jv":
      case "ka":
      case "km":
      case "kn":
      case "ko":
      case "ms":
      case "th":
      case "tr":
      case "vi":
      case "zh":
        return 0;
      case "af":
      case "bn":
      case "bg":
      case "ca":
      case "da":
      case "de":
      case "el":
      case "en":
      case "eo":
      case "es":
      case "et":
      case "eu":
      case "fa":
      case "fi":
      case "fo":
      case "fur":
      case "fy":
      case "gl":
      case "gu":
      case "ha":
      case "he":
      case "hu":
      case "is":
      case "it":
      case "ku":
      case "lb":
      case "ml":
      case "mn":
      case "mr":
      case "nah":
      case "nb":
      case "ne":
      case "nl":
      case "nn":
      case "no":
      case "om":
      case "or":
      case "pa":
      case "pap":
      case "ps":
      case "pt":
      case "so":
      case "sq":
      case "sv":
      case "sw":
      case "ta":
      case "te":
      case "tk":
      case "ur":
      case "zu":
        return count == 1 ? 0 : 1;
      case "am":
      case "bh":
      case "fil":
      case "fr":
      case "gun":
      case "hi":
      case "hy":
      case "ln":
      case "mg":
      case "nso":
      case "xbr":
      case "ti":
      case "wa":
        return count === 0 || count === 1 ? 0 : 1;
      case "be":
      case "bs":
      case "hr":
      case "ru":
      case "sr":
      case "uk":
        return count % 10 == 1 && count % 100 != 11
          ? 0
          : count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 10 || count % 100 >= 20)
          ? 1
          : 2;
      case "cs":
      case "sk":
        return count == 1 ? 0 : count >= 2 && count <= 4 ? 1 : 2;
      case "ga":
        return count == 1 ? 0 : count == 2 ? 1 : 2;
      case "lt":
        return count % 10 == 1 && count % 100 != 11
          ? 0
          : count % 10 >= 2 && (count % 100 < 10 || count % 100 >= 20)
          ? 1
          : 2;
      case "sl":
        return count % 100 == 1
          ? 0
          : count % 100 == 2
          ? 1
          : count % 100 == 3 || count % 100 == 4
          ? 2
          : 3;
      case "mk":
        return count % 10 == 1 ? 0 : 1;
      case "mt":
        return count == 1
          ? 0
          : count === 0 || (count % 100 > 1 && count % 100 < 11)
          ? 1
          : count % 100 > 10 && count % 100 < 20
          ? 2
          : 3;
      case "lv":
        return count === 0 ? 0 : count % 10 == 1 && count % 100 != 11 ? 1 : 2;
      case "pl":
        return count == 1
          ? 0
          : count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 12 || count % 100 > 14)
          ? 1
          : 2;
      case "cy":
        return count == 1
          ? 0
          : count == 2
          ? 1
          : count == 8 || count == 11
          ? 2
          : 3;
      case "ro":
        return count == 1
          ? 0
          : count === 0 || (count % 100 > 0 && count % 100 < 20)
          ? 1
          : 2;
      case "ar":
        return count === 0
          ? 0
          : count == 1
          ? 1
          : count == 2
          ? 2
          : count % 100 >= 3 && count % 100 <= 10
          ? 3
          : count % 100 >= 11 && count % 100 <= 99
          ? 4
          : 5;
      default:
        return 0;
    }
  };
  return Lang;
});

(function () {
  Lang = new Lang();
  Lang.setMessages({
    "ar.messages": {
      about_us: "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646\u0627",
      about_us_services:
        "\u0645\u0646 \u0646\u062d\u0646 \u0627\u0644\u062e\u062f\u0645\u0627\u062a",
      admin_dashboard: {
        active_jobs:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0646\u0634\u0637\u0629",
        active_users:
          "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u0646\u0634\u0637\u064a\u0646",
        featured_employers:
          "\u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0645\u064a\u0632\u064a\u0646",
        featured_employers_incomes:
          "\u062f\u062e\u0644 \u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0645\u064a\u0632\u064a\u0646",
        featured_jobs:
          "\u0648\u0638\u0627\u0626\u0641 \u0645\u0645\u064a\u0632\u0629",
        featured_jobs_incomes:
          "\u062f\u062e\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        post_statistics:
          "\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0627\u062a",
        recent_candidates:
          "\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0623\u062e\u064a\u0631",
        recent_employers:
          "\u0627\u0644\u0623\u062e\u064a\u0631 \u0623\u0631\u0628\u0627\u0628 \u0627\u0644\u0639\u0645\u0644",
        recent_jobs:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u062d\u062f\u064a\u062b\u0629",
        registered_candidates:
          "\u0627\u0644\u0645\u0631\u0634\u062d\u0648\u0646 \u0627\u0644\u0645\u0633\u062c\u0644\u0648\u0646",
        registered_employer:
          "\u0623\u0631\u0628\u0627\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0633\u062c\u0644\u064a\u0646",
        subscription_incomes:
          "\u062f\u062e\u0644 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
        today_jobs:
          "\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u064a\u0648\u0645",
        total_active_jobs:
          "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0646\u0634\u0637\u0629",
        total_candidates:
          "\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0645\u0631\u0634\u062d\u064a\u0646",
        total_employers:
          "\u0625\u062c\u0645\u0627\u0644\u064a \u0623\u0631\u0628\u0627\u0628 \u0627\u0644\u0639\u0645\u0644",
        total_users:
          "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646",
        verified_users:
          "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0627\u0644\u0645\u0639\u062a\u0645\u062f\u0648\u0646",
        weekly_users:
          "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064a\u0648\u0646",
      },
      all_resumes:
        "\u062c\u0645\u064a\u0639 \u0627\u0644\u0633\u064a\u0631 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
      all_rights_reserved:
        "\u0643\u0644 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629",
      applied_job: {
        applied_jobs: "\u0644\u063a\u0629...",
        companies: "\u0627\u0644\u0634\u0631\u0643\u0627\u062a",
        job: "\u0645\u0647\u0646\u0629",
        notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
      },
      apply_job: {
        apply_job:
          "\u0627\u0644\u062a\u0642\u062f\u0645 \u0644\u0648\u0638\u064a\u0641\u0629",
        notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        resume: "\u0627\u0633\u062a\u0626\u0646\u0641",
      },
      blog_categories:
        "\u0641\u0626\u0627\u062a \u0627\u0644\u0645\u062f\u0648\u0646\u0629",
      blogs: "\u0627\u0644\u0645\u062f\u0648\u0646\u0627\u062a",
      branding_slider: {
        brand: "\u0645\u0627\u0631\u0643\u0629",
        edit_branding_slider:
          "\u062a\u062d\u0631\u064a\u0631 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
        new_branding_slider:
          "\u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_branding_slider_available:
          "\u0644\u0627 \u064a\u062a\u0648\u0641\u0631 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0644\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
        no_branding_slider_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
      },
      branding_sliders:
        "\u0627\u0644\u0645\u062a\u0632\u0644\u062c\u0648\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
      brands:
        "\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
      candidate: {
        address: "\u0639\u0646\u0648\u0627\u0646",
        admins: "\u0627\u0644\u0645\u0634\u0631\u0641\u0648\u0646",
        already_reported:
          "\u0630\u0643\u0631\u062a \u0628\u0627\u0644\u0641\u0639\u0644",
        available_at: "\u0645\u062a\u0648\u0641\u0631 \u0639\u0646\u062f",
        birth_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u064a\u0644\u0627\u062f",
        candidate_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0631\u0634\u062d",
        candidate_language: "\u0627\u0644\u0644\u063a\u0627\u062a",
        candidate_skill: "\u0645\u0647\u0627\u0631\u0629",
        candidates: "\u0627\u0644\u0645\u0631\u0634\u062d\u0648\u0646",
        career_level:
          "\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        conform_password:
          "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
        current_salary:
          "\u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u062d\u0627\u0644\u064a",
        dashboard:
          "\u0644\u0648\u062d\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629",
        edit_admin:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0633\u0624\u0648\u0644",
        edit_candidate:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0631\u0634\u062d",
        edit_profile_information:
          "\u062a\u062d\u0631\u064a\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0645\u0644\u0641 \u0627\u0644\u062a\u0639\u0631\u064a\u0641",
        education_not_found:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0639\u0644\u064a\u0645 \u0645\u062a\u0627\u062d.",
        email:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        email_verified:
          "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        employee: "\u0627\u0644\u0645\u0648\u0638\u0641",
        expected_salary:
          "\u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u0645\u062a\u0648\u0642\u0639",
        experience: "\u062a\u062c\u0631\u0628\u0629",
        experience_not_found:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u062e\u0628\u0631\u0629 \u0645\u062a\u0627\u062d\u0629.",
        father_name: "\u0627\u0633\u0645 \u0627\u0644\u0623\u0628",
        first_name:
          "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0627\u0648\u0644",
        functional_area:
          "\u0627\u0644\u0645\u062c\u0627\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        gender: "\u062c\u0646\u0633",
        immediate_available:
          "\u0645\u062a\u0627\u062d \u0639\u0644\u0649 \u0627\u0644\u0641\u0648\u0631",
        in_years: "\u0641\u064a \u0633\u0646\u0648\u0627\u062a",
        industry: "\u0635\u0646\u0627\u0639\u0629",
        is_active: "\u0646\u0634\u0637",
        is_verified:
          "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646\u0647",
        job_alert_message:
          "\u0625\u0639\u0644\u0627\u0645\u064a \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0645 \u0646\u0634\u0631 \u0648\u0638\u064a\u0641\u0629 \u0630\u0627\u062a \u0635\u0644\u0629 \u0628\u0627\u062e\u062a\u064a\u0627\u0631\u064a.",
        last_name: "\u0627\u0644\u0643\u0646\u064a\u0629",
        marital_status:
          "\u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        national_id_card:
          "\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629",
        nationality: "\u0627\u0644\u062c\u0646\u0633\u064a\u0629",
        new_admin: "\u0645\u0634\u0631\u0641 \u062c\u062f\u064a\u062f",
        new_candidate: "\u0645\u0631\u0634\u062d \u062c\u062f\u064a\u062f",
        no_candidate_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0631\u0634\u062d \u0645\u062a\u0627\u062d",
        no_candidate_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0631\u0634\u062d",
        no_reported_candidates_available:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0623\u064a \u0645\u0631\u0634\u062d \u0645\u062a\u0627\u062d",
        no_reported_candidates_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u064a \u0645\u0631\u0634\u062d",
        not_immediate_available:
          "\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u0639\u0644\u0649 \u0627\u0644\u0641\u0648\u0631",
        password: "\u0643\u0644\u0645\u0647 \u0627\u0644\u0633\u0631",
        phone: "\u0647\u0627\u062a\u0641",
        profile:
          "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
        reporte_to_candidate:
          "\u0623\u0628\u0644\u063a \u0627\u0644\u0645\u0631\u0634\u062d\u064a\u0646",
        reported_candidate:
          "\u0627\u0644\u0645\u0631\u0634\u062d \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647",
        reported_candidate_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0631\u0634\u062d \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_candidates:
          "\u0627\u0644\u0645\u0631\u0634\u062d\u0648\u0646 \u0627\u0644\u0645\u0639\u0644\u0646\u0648\u0646",
        reported_employer:
          "\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647",
        resume_not_found:
          "\u0627\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u0645\u062a\u0627\u062d.",
        salary_currency:
          "\u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        salary_per_month:
          "\u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u0634\u0647\u0631\u064a.",
        select_candidate:
          "\u062d\u062f\u062f \u0627\u0644\u0645\u0631\u0634\u062d",
      },
      candidate_dashboard: {
        followings: "\u0623\u062a\u0628\u0627\u0639",
        location_information:
          "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629.",
        my_cv_list:
          "\u0642\u0627\u0626\u0645\u0629 \u0633\u064a\u0631\u062a\u064a \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
        no_not_available:
          "\u0627\u0644\u0631\u0642\u0645 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631.",
        profile_views:
          "\u0645\u0634\u0627\u0647\u062f\u0627\u062a \u0627\u0644\u0645\u0644\u0641",
      },
      candidate_profile: {
        add_education:
          "\u0623\u0636\u0641 \u0627\u0644\u062a\u0639\u0644\u064a\u0645",
        add_experience:
          "\u0623\u0636\u0641 \u0627\u0644\u062e\u0628\u0631\u0629",
        age: "\u0633\u0646",
        company: "\u0634\u0631\u0643\u0629",
        currently_working:
          "\u062a\u0639\u0645\u0644 \u062d\u0627\u0644\u064a\u0627",
        degree_level:
          "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629",
        degree_title:
          "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062f\u0631\u062c\u0629",
        description: "\u0648\u0635\u0641",
        edit_education:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062a\u0639\u0644\u064a\u0645",
        edit_experience:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062a\u062c\u0631\u0628\u0629",
        education: "\u0627\u0644\u062a\u0639\u0644\u064a\u0645",
        end_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621",
        experience: "\u062a\u062c\u0631\u0628\u0629",
        experience_title:
          "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062e\u0628\u0631\u0629",
        institute: "\u0645\u0639\u0647\u062f",
        online_profile:
          "\u0645\u0644\u0641 \u0634\u062e\u0635\u064a \u0639\u0644\u0649 \u0627\u0644\u0627\u0646\u062a\u0631\u0646\u062a",
        present: "\u062d\u0627\u0636\u0631",
        result: "\u0646\u062a\u064a\u062c\u0629",
        select_year: "\u062d\u062f\u062f \u0627\u0644\u0633\u0646\u0629",
        start_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0628\u062f\u0621",
        title: "\u0639\u0646\u0648\u0627\u0646",
        upload_resume:
          "\u062a\u062d\u0645\u064a\u0644 \u0627\u0633\u062a\u0626\u0646\u0627\u0641",
        work_experience:
          "\u062e\u0628\u0631\u0629 \u0641\u064a \u0627\u0644\u0639\u0645\u0644",
        year: "\u0639\u0627\u0645",
        years: "\u0633\u0646\u0648\u0627\u062a",
      },
      candidates: "\u0627\u0644\u0645\u0631\u0634\u062d\u0648\u0646",
      career_informations:
        "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629",
      career_level: {
        edit_career_level:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        level_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0648\u0649",
        new_career_level:
          "\u0645\u0633\u062a\u0648\u0649 \u0645\u0647\u0646\u064a \u062c\u062f\u064a\u062f",
        no_career_level_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0633\u062a\u0648\u0649 \u0648\u0638\u064a\u0641\u064a \u0645\u062a\u0627\u062d",
        no_career_level_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0648\u0638\u064a\u0641\u064a",
      },
      career_levels:
        "\u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629",
      city: {
        cities: "\u0645\u062f\u0646",
        city_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u062f\u064a\u0646\u0629",
        edit_city:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u062f\u064a\u0646\u0629",
        new_city:
          "\u0645\u062f\u064a\u0646\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_city_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062f\u064a\u0646\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_city_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u062f\u064a\u0646\u0629",
        state_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0648\u0644\u0627\u064a\u0629",
      },
      cms: "\u0645\u0634\u062a\u0631\u0643\u064a\u0646",
      cms_about: {
        about_desc_one:
          "\u062d\u0648\u0644 \u0648\u0635\u0641 \u0648\u0627\u062d\u062f",
        about_desc_three:
          "\u062d\u0648\u0644 \u0627\u0644\u0648\u0635\u0641 \u062b\u0644\u0627\u062b\u0629",
        about_desc_two:
          "\u062d\u0648\u0644 \u0627\u0644\u0648\u0635\u0641 \u0627\u0644\u062b\u0627\u0646\u064a",
        about_image_one:
          "\u062d\u0648\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
        about_image_three:
          "\u062d\u0648\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062b\u0627\u0644\u062b\u0629",
        about_image_two:
          "\u062d\u0648\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062b\u0627\u0646\u064a\u0629",
        about_title_one:
          "\u062d\u0648\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0623\u0648\u0644",
        about_title_three:
          "\u062d\u0648\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062b\u0627\u0644\u062b",
        about_title_two:
          "\u062d\u0648\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062b\u0627\u0646\u064a",
      },
      cms_service: {
        choose: "\u064a\u062e\u062a\u0627\u0631",
        home_banner:
          "\u0644\u0627\u0641\u062a\u0629 \u0627\u0644\u0645\u0646\u0632\u0644",
        home_description:
          "\u0648\u0635\u0641 \u0627\u0644\u0645\u0646\u0632\u0644",
        home_title:
          "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0646\u0632\u0644",
      },
      cms_services: "\u062e\u062f\u0645\u0627\u062a \u0633\u0645",
      cms_sliders:
        "\u0627\u0644\u0645\u062a\u0632\u0644\u062c\u0648\u0646 \u0633\u0645",
      common: {
        action: "\u0639\u0645\u0644",
        active: "\u0646\u0634\u064a\u0637",
        add: "\u0623\u0636\u0641",
        admin_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644",
        all: "\u0627\u0644\u0643\u0644",
        and_time: "\u0648 \u0627\u0644\u0648\u0642\u062a",
        applied: "\u0645\u064f\u0637\u0628\u0651\u064e\u0642",
        applied_on: "\u062a\u0645 \u0627\u0644\u062a\u0637\u0628\u064a\u0642",
        apply: "\u064a\u062a\u0642\u062f\u0645",
        approved_by:
          "\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u064a\u0647 \u0645\u0646 \u0642\u0628\u0644",
        are_you_sure:
          "\u0647\u0644 \u062a\u0631\u064a\u062f \u0628\u0627\u0644\u062a\u0623\u0643\u064a\u062f \u062d\u0630\u0641 \u0647\u0630\u0627",
        are_you_sure_want_to_delete:
          "\u0647\u0644 \u062a\u0631\u064a\u062f \u0628\u0627\u0644\u062a\u0623\u0643\u064a\u062f \u062d\u0630\u0641 \u0647\u0630\u0627 ",
        are_you_sure_want_to_reject:
          "\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0631\u0641\u0636 \u0647\u0630\u0627",
        are_you_sure_want_to_select:
          "\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u062a\u062d\u062f\u064a\u062f \u0647\u0630\u0627",
        back: "\u0639\u0648\u062f\u0629",
        cancel: "\u0625\u0644\u063a\u0627\u0621",
        category_image:
          "\u0635\u0648\u0631\u0629 \u0627\u0644\u0641\u0626\u0629",
        choose: "\u0623\u062e\u062a\u0631",
        choose_file: "\u0627\u062e\u062a\u0631 \u0645\u0644\u0641",
        close: "\u0642\u0631\u064a\u0628",
        closed: "\u0645\u063a\u0644\u0642",
        completed: "\u0645\u0646\u062c\u0632",
        copyright: "\u062d\u0642\u0648\u0642 \u0627\u0644\u0646\u0634\u0631",
        created_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
        created_on:
          "\u062a\u0645 \u0625\u0646\u0634\u0627\u0624\u0647\u0627 \u0639\u0644\u0649",
        custom: "\u0627\u0644\u0639\u0627\u062f\u0629",
        de_active: "\u0645\u0639\u0637\u0644",
        decline: "\u0627\u0646\u062e\u0641\u0627\u0636",
        declined: "\u0631\u0641\u0636",
        default_country_code:
          "\u0631\u0645\u0632 \u0627\u0644\u0628\u0644\u062f \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a",
        delete: "\u062d\u0630\u0641",
        deleted: "\u062a\u0645 \u0627\u0644\u062d\u0630\u0641",
        description: "\u0648\u0635\u0641",
        design_by:
          "\u062a\u0635\u0645\u064a\u0645 \u0628\u0648\u0627\u0633\u0637\u0629",
        design_by_name: "InfyOm Labs.",
        download: "\u062a\u062d\u0645\u064a\u0644",
        drafted: "\u0635\u0627\u063a",
        edit: "\u062a\u0639\u062f\u064a\u0644",
        email:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        error: "\u062e\u0637\u0623",
        expire: "\u062a\u0646\u0642\u0636\u064a",
        export_excel: "\u062a\u0635\u062f\u064a\u0631 \u0625\u0644\u0649 Excel",
        female: "\u0623\u0646\u062b\u0649",
        filter_options:
          "\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0635\u0641\u064a\u0629",
        filters: "\u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a",
        from: "\u0645\u0646",
        has_been_deleted: " \u0642\u062f \u062a\u0645 \u062d\u0630\u0641.",
        has_been_rejected: "\u0648\u0642\u062f \u0631\u0641\u0636.",
        has_been_selected:
          "\u0642\u062f \u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631\u0647.",
        hello: "\u0645\u0631\u062d\u0628\u0627",
        hi: "\u0645\u0631\u062d\u0628\u0627",
        hired: "\u0627\u0633\u062a\u0623\u062c\u0631\u062a",
        image_aspect_ratio:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0646\u0633\u0628\u0629 \u0623\u0628\u0639\u0627\u062f \u0627\u0644\u0635\u0648\u0631\u0629 1: 1.",
        image_file_type:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0646 \u0646\u0648\u0639 \u0645\u0644\u0641: jpeg\u060c jpg\u060c png.",
        last_change_by:
          "\u0622\u062e\u0631 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u0628\u0648\u0627\u0633\u0637\u0629",
        last_updated: "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b",
        live: "\u062d\u064a",
        login:
          "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
        male: "\u0627\u0644\u0630\u0643\u0631",
        "n/a": "N/A",
        name: "\u0627\u0633\u0645",
        no: "\u0644\u0627",
        no_cancel: "\u0644\u0627 \u0625\u0644\u063a\u0627\u0621",
        not_verified:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646\u0647",
        note: "\u0645\u0644\u062d\u0648\u0638\u0629",
        note_message:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0642\u0635\u064a\u0631. \u0623\u064a \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 = en.",
        ok: "\u0645\u0648\u0627\u0641\u0642",
        ongoing:
          "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0646\u0641\u064a\u0630",
        open: "\u0627\u0641\u062a\u062d",
        pause: "\u0648\u0642\u0641\u0629",
        paused:
          "\u0645\u062a\u0648\u0642\u0641 \u0645\u0624\u0642\u062a\u064b\u0627",
        preview: "\u0645\u0639\u0627\u064a\u0646\u0629",
        print: "\u0637\u0628\u0627\u0639\u0629",
        process: "\u064a\u0639\u0627\u0644\u062c...",
        reason: "\u0633\u0628\u0628",
        register: "\u062a\u0633\u062c\u064a\u0644",
        rejected: "\u0645\u0631\u0641\u0648\u0636",
        report: "\u0646\u0642\u0644",
        resend_verification_mail:
          "\u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0628\u0631\u064a\u062f \u0627\u0644\u062a\u062d\u0642\u0642",
        reset: "\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637",
        save: "\u062d\u0641\u0638",
        save_as_draft:
          "\u062d\u0641\u0638 \u0643\u0645\u0633\u0648\u062f\u0629",
        saved_successfully: " \u062d\u0641\u0638 \u0628\u0646\u062c\u0627 ",
        search: "\u064a\u0628\u062d\u062b",
        select_job_stage:
          "\u062d\u062f\u062f \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        selected: "\u0627\u0644\u0645\u062d\u062f\u062f",
        shortlist:
          "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062e\u062a\u0635\u0631\u0629",
        show: "\u064a\u0639\u0631\u0636",
        status: "\u0627\u0644\u062d\u0627\u0644\u0629",
        success: " \u0646\u0627\u062c\u062d",
        this_weeks:
          "\u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u0628\u0648\u0639",
        to: "\u0625\u0644\u0649",
        updated_successfully:
          " \u062a\u0645 \u0627\u0644\u062a\u062d\u062f\u064a\u062b \u0628\u0646\u062c\u0627\u062d",
        verified: "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642",
        view: "\u0631\u0623\u064a",
        view_more: "\u0639\u0631\u0636 \u0627\u0644\u0645\u0632\u064a\u062f",
        view_profile: "\u0639\u0631\u0636 \u0627\u0644\u0627\u0633\u0645",
        welcome: "\u0623\u0647\u0644\u0627 \u0628\u0643",
        yes: "\u0646\u0639\u0645",
        yes_delete: "\u0646\u0639\u0645 \u060c \u0627\u062d\u0630\u0641!",
        you_cancel_slot_date:
          "\u0642\u0645\u062a \u0628\u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0641\u062a\u062d\u0629 \u0644\u0644\u062a\u0627\u0631\u064a\u062e",
      },
      companies: "\u0627\u0644\u0634\u0631\u0643\u0627\u062a",
      company: {
        candidate_email:
          "\u0627\u0644\u0645\u0631\u0634\u062d \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        candidate_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0634\u062d",
        candidate_phone:
          "\u0647\u0627\u062a\u0641 \u0627\u0644\u0645\u0631\u0634\u062d",
        ceo: "\u0627\u0644\u0631\u0626\u064a\u0633 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a \u0644\u0644\u0634\u0631\u0643\u0629",
        ceo_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0631\u0626\u064a\u0633 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a",
        city: "\u0645\u062f\u064a\u0646\u0629",
        company_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0629",
        company_listing:
          "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0634\u0631\u0643\u0629",
        company_logo: "\u0634\u0639\u0627\u0631",
        company_name: "\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
        company_size: "\u0628\u062d\u062c\u0645",
        confirm_password:
          "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
        country: "\u0628\u0644\u062f",
        current_password:
          "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
        edit_company:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0634\u0631\u0643\u0629",
        edit_employer:
          "\u062a\u062d\u0631\u064a\u0631 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        email:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        email_verified:
          "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        employer: "\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        employer_ceo:
          "\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a \u0644\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        employer_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        employer_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0638\u0641",
        enter_experience_year:
          "\u0623\u062f\u062e\u0644 \u0627\u0644\u062e\u0628\u0631\u0629 \u0641\u064a \u0627\u0644\u0639\u0627\u0645",
        established_in: "\u062a\u0623\u0633\u0633\u062a \u0641\u064a",
        established_year:
          "\u0633\u0646\u0629 \u0627\u0644\u062a\u0623\u0633\u064a\u0633",
        facebook_url: "URL \u0627\u0644\u0641\u064a\u0633\u0628\u0648\u0643",
        fax: "\u0641\u0627\u0643\u0633",
        followers: "\u0645\u062a\u0627\u0628\u0639\u0648\u0646",
        google_plus_url: "\u062c\u0648\u062c\u0644 \u0628\u0644\u0633 URL",
        image: "\u0635\u0648\u0631\u0629",
        industry: "\u0635\u0646\u0627\u0639\u0629",
        is_active: "\u0646\u0634\u0637",
        is_featured: "\u0647\u064a \u0648\u0627\u0631\u062f\u0629",
        linkedin_url: "\u0644\u064a\u0646\u0643\u062f \u0625\u0646 URL",
        location: "\u0645\u0648\u0642\u0639\u0643",
        location2:
          "\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0643\u062a\u0628 \u0627\u0644\u062b\u0627\u0646\u064a",
        name: "\u0627\u0633\u0645",
        new_company: "\u0634\u0631\u0643\u0629 \u062c\u062f\u064a\u062f\u0629",
        new_employer:
          "\u0635\u0627\u062d\u0628 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f",
        new_password:
          "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_employee_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0648\u0638\u0641",
        no_employee_reported_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u0627\u0644\u0645\u062a\u0627\u062d\u0629",
        no_employer_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0648\u0638\u0641\u064a\u0646 \u0645\u062a\u0627\u062d\u064a\u0646",
        no_of_offices:
          "\u0639\u062f\u062f \u0627\u0644\u0645\u0643\u0627\u062a\u0628",
        no_reported_employer_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0635\u0627\u062d\u0628 \u0639\u0645\u0644 \u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646\u0647",
        notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        offices: "\u0645\u0643\u0627\u062a\u0628",
        ownership_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629",
        password: "\u0643\u0644\u0645\u0647 \u0627\u0644\u0633\u0631",
        pinterest_url: "\u0645\u0648\u0642\u0639 Pinterest URL",
        report_to_company:
          "\u062a\u0642\u0631\u064a\u0631 \u0625\u0644\u0649 \u0627\u0644\u0634\u0631\u0643\u0629",
        reported_by:
          "\u062a\u0645 \u0639\u0645\u0644 \u062a\u0642\u0631\u064a\u0631 \u0628\u0648\u0627\u0633\u0637\u0629",
        reported_companies:
          "\u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_company:
          "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_employer_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_employers:
          "\u0623\u0631\u0628\u0627\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_on: "\u0630\u0643\u0631\u062a \u0641\u064a",
        select_career_level:
          "\u062d\u062f\u062f \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        select_city: "\u0627\u062e\u062a\u0631 \u0645\u062f\u064a\u0646\u0629",
        select_company: "\u062d\u062f\u062f \u0634\u0631\u0643\u0629",
        select_company_size:
          "\u062d\u062f\u062f \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
        select_country:
          "\u062d\u062f\u062f \u0627\u0644\u062f\u0648\u0644\u0629",
        select_currency:
          "\u0627\u062e\u062a\u0631 \u0627\u0644\u0639\u0645\u0644\u0629",
        select_degree_level:
          "\u062d\u062f\u062f \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629",
        select_employer_size:
          "\u062d\u062f\u062f \u062d\u062c\u0645 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        select_established_year:
          "\u062d\u062f\u062f \u0633\u0646\u0629 \u0627\u0644\u062a\u0623\u0633\u064a\u0633",
        select_functional_area:
          "\u062d\u062f\u062f \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
        select_gender:
          "\u062d\u062f\u062f \u0646\u0648\u0639 \u0627\u0644\u062c\u0646\u0633",
        select_industry:
          "\u062d\u062f\u062f \u0627\u0644\u0635\u0646\u0627\u0639\u0629",
        select_job_category:
          "\u062d\u062f\u062f \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        select_job_shift:
          "\u062d\u062f\u062f \u0648\u0638\u064a\u0641\u0629 Shift",
        select_job_type:
          "\u062d\u062f\u062f \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        select_language:
          "\u0627\u062e\u062a\u0627\u0631 \u0627\u0644\u0644\u063a\u0629",
        select_marital_status:
          "\u062d\u062f\u062f \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        select_ownership_type:
          "\u062d\u062f\u062f \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643",
        select_position:
          "\u062d\u062f\u062f \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        select_salary_period:
          "\u062d\u062f\u062f \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        select_state: "\u0627\u062e\u062a\u0631 \u0648\u0644\u0627\u064a\u0647",
        state: "\u062d\u0627\u0644\u0629",
        title: "\u0645\u0633\u0645\u0649 \u0648\u0638\u064a\u0641\u064a",
        twitter_url: "Twitter URL",
        website:
          "\u0645\u0648\u0642\u0639 \u0627\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
      },
      company_size: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        company_size: "\u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
        edit_company_size:
          "\u062a\u062d\u0631\u064a\u0631 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
        new_company_size:
          "\u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u062c\u062f\u064a\u062f",
        no_company_size_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u062d\u062c\u0645 \u0634\u0631\u0643\u0629 \u0645\u062a\u0627\u062d",
        no_company_size_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629",
        show_company_size:
          "\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        size: "\u0628\u062d\u062c\u0645",
      },
      company_sizes:
        "\u0645\u0642\u0627\u0633\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0629",
      country: {
        countries: "\u0628\u0644\u062f\u0627\u0646",
        country_name: "\u0627\u0633\u0645 \u0627\u0644\u062f\u0648\u0644\u0629",
        edit_country:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062f\u0648\u0644\u0629",
        new_country: "\u0628\u0644\u062f \u062c\u062f\u064a\u062f",
        no_country_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0628\u0644\u062f \u0645\u062a\u0627\u062d",
        no_country_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0628\u0644\u062f",
        phone_code: "\u0643\u0648\u062f \u0627\u0644\u0647\u0627\u062a\u0641",
        short_code: "\u0631\u0645\u0632 \u0642\u0635\u064a\u0631",
      },
      cv_builder:
        "\u0645\u0646\u0634\u0626 \u0627\u0644\u0633\u064a\u0631\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629",
      dashboard:
        "\u0644\u0648\u062d\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629",
      datepicker: {
        last_month:
          "\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064a",
        last_week:
          "\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064a",
        this_month: "\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631",
        this_week:
          "\u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u0628\u0648\u0639",
        today: "\u0627\u0644\u064a\u0648\u0645",
      },
      email_template: {
        body: "\u0627\u0644\u062c\u0633\u0645",
        edit_email_template:
          "\u062a\u062d\u0631\u064a\u0631 \u0642\u0627\u0644\u0628 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        short_code: "\u0631\u0645\u0632 \u0642\u0635\u064a\u0631",
        subject: "\u0645\u0648\u0636\u0648\u0639",
        template_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0642\u0627\u0644\u0628",
      },
      email_templates:
        "\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
      employer: {
        job_stage:
          "\u0645\u0631\u0627\u062d\u0644 \u0627\u0644\u0639\u0645\u0644",
        job_stage_desc: "\u0648\u0635\u0641",
      },
      employer_dashboard: {
        dashboard:
          "\u0644\u0648\u062d\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629",
        followers: "\u0645\u062a\u0627\u0628\u0639\u0648\u0646",
        job_applications:
          "\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u0638\u064a\u0641\u0629",
        open_jobs:
          "\u0627\u0641\u062a\u062d \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
      },
      employer_menu: {
        closed_jobs:
          "\u0648\u0638\u0627\u0626\u0641 \u0645\u063a\u0644\u0642\u0629",
        employer_details_field:
          "\u0645\u0637\u0644\u0648\u0628 \u062d\u0642\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644.",
        employer_profile:
          "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a \u0644\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        enter_description:
          "\u0623\u062f\u062e\u0644 \u0627\u0644\u0648\u0635\u0641",
        enter_employer_details:
          "\u0623\u062f\u062e\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        enter_industry_details:
          "\u0623\u062f\u062e\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 ...",
        enter_ownership_details:
          "\u0623\u062f\u062e\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0644\u0643\u064a\u0629 ...",
        expires_on:
          " \u062a\u0646\u062a\u0647\u064a \u0635\u0644\u0627\u062d\u064a\u062a\u0647 \u0641\u064a",
        followers: "\u0645\u062a\u0627\u0628\u0639\u0648\u0646",
        general_dashboard:
          "\u0644\u0648\u062d\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u0639\u0627\u0645\u0629",
        jobs: "\u0648\u0638\u0627\u0626\u0641",
        manage_subscriptions:
          "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
        no_data_available:
          "\u0644\u0627 \u062a\u062a\u0648\u0627\u0641\u0631 \u0628\u064a\u0627\u0646\u0627\u062a",
        paused_jobs:
          "\u0648\u0638\u0627\u0626\u0641 \u0645\u062a\u0648\u0642\u0641\u0629 \u0645\u0624\u0642\u062a\u064b\u0627",
        recent_follower:
          "\u0627\u0644\u0645\u062a\u0627\u0628\u0639 \u0627\u0644\u0623\u062e\u064a\u0631",
        recent_jobs:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u062e\u064a\u0631\u0629",
        total_job_applications:
          " \u0625\u062c\u0645\u0627\u0644\u064a \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644",
        total_jobs:
          "\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
        transactions: "\u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a",
        valid_facebook_url:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d \u0644\u0640 Facebook",
        valid_google_plus_url:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d \u0644\u0640 Google Plus",
        valid_linkedin_url:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d \u0644\u0640 Linkedin",
        valid_pinterest_url:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d \u0644\u0640 Pinterest",
        valid_twitter_url:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d \u0644\u062a\u0648\u064a\u062a\u0631",
      },
      employers:
        "\u0623\u0631\u0628\u0627\u0628 \u0627\u0644\u0639\u0645\u0644",
      env: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a Env",
      expired_jobs:
        "\u0648\u0638\u0627\u0626\u0641 \u0645\u0646\u062a\u0647\u064a\u0629 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629",
      faq: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_faq:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a",
        faq: "\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a",
        faq_detail:
          "\u0623\u0633\u0626\u0644\u0629 \u0648\u0623\u062c\u0648\u0628\u0629 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644",
        new_faq:
          "\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_faq_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0626\u0644\u0629 \u0648\u0623\u062c\u0648\u0628\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_faq_found:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0626\u0644\u0629 \u0648\u0623\u062c\u0648\u0628\u0629",
        show_faq: "\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a",
        title: "\u0639\u0646\u0648\u0627\u0646",
      },
      favourite_companies: "\u0623\u062a\u0628\u0627\u0639",
      favourite_jobs:
        "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
      filter_name: {
        closed: "\u0645\u063a\u0644\u0642",
        country: "\u062f\u0648\u0644\u0629",
        digital: "\u0631\u0642\u0645\u064a",
        drafted: "\u0635\u0627\u063a",
        featured_company:
          "\u0634\u0631\u0643\u0629 \u0645\u0645\u064a\u0632\u0629",
        featured_job:
          "\u0648\u0638\u064a\u0641\u0629 \u0645\u0645\u064a\u0632\u0629",
        freelancer_job:
          "\u0648\u0638\u064a\u0641\u0629 \u0628\u0627\u0644\u0642\u0637\u0639\u0629",
        immediate: "\u0641\u0648\u0631\u064a",
        job_status:
          "\u062d\u0627\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        live: "\u064a\u0639\u064a\u0634",
        manually: "\u064a\u062f\u0648\u064a\u0627",
        paused:
          "\u0645\u062a\u0648\u0642\u0641 \u0645\u0624\u0642\u062a\u064b\u0627",
        select_featured_company:
          "\u062d\u062f\u062f \u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        select_featured_job:
          "\u062d\u062f\u062f \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        select_status:
          "\u062d\u062f\u062f \u0627\u0644\u062d\u0627\u0644\u0629",
        state: "\u062d\u0627\u0644\u0629",
        status: "\u062d\u0627\u0644\u0629",
        suspended_job:
          "\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0639\u0644\u0642\u0629",
      },
      flash: {
        about_us_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646\u0627 \u0628\u0646\u062c\u0627\u062d.",
        admin_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644.",
        admin_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0628\u0646\u062c\u0627\u062d.",
        admin_save:
          "\u062d\u0641\u0638 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0628\u0646\u062c\u0627\u062d.",
        admin_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0628\u0646\u062c\u0627\u062d.",
        all_notification_read:
          "\u062a\u0645\u062a \u0642\u0631\u0627\u0621\u0629 \u062c\u0645\u064a\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        are_you_sure_to_change_status:
          "\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u0627\u0644\u0629\u061f",
        assigned_slot_not_delete:
          "\u064a\u062c\u0628 \u0623\u0644\u0627 \u062a\u062d\u0630\u0641 \u0627\u0644\u0641\u062a\u062d\u0629 \u0627\u0644\u0645\u062e\u0635\u0635\u0629.",
        attention: "\u0627\u0646\u062a\u0628\u0627\u0647",
        brand_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        brand_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        brand_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        brand_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        cancel_reason_require:
          "\u0633\u0628\u0628 \u0627\u0644\u0625\u0644\u063a\u0627\u0621 \u0645\u0637\u0644\u0648\u0628.",
        candidate_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_education_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_education_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_education_save:
          "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_education_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_experience_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_experience_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_experience_save:
          "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u062e\u0628\u0631\u0629 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_experience_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_not_found:
          "\u0627\u0644\u0645\u0631\u0634\u062d \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f",
        candidate_profile:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u0644\u0641 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_reported:
          "\u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        candidate_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u062c\u0627\u062d.",
        career_level_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a.",
        career_level_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a \u0628\u0646\u062c\u0627\u062d.",
        career_level_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a \u0628\u0646\u062c\u0627\u062d.",
        career_level_save:
          "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a \u0628\u0646\u062c\u0627\u062d.",
        career_level_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a \u0628\u0646\u062c\u0627\u062d.",
        city_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.",
        city_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.",
        city_retrieved:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.",
        city_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.",
        city_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0628\u0646\u062c\u0627\u062d.",
        close_job:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u063a\u0644\u0642\u0629.",
        cms_service_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062e\u062f\u0645\u0627\u062a CMS \u0628\u0646\u062c\u0627\u062d.",
        comment_deleted:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062a\u0639\u0644\u064a\u0642 \u0628\u0646\u062c\u0627\u062d.",
        comment_edit:
          "\u062a\u0645 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u062a\u0639\u0644\u064a\u0642 \u0628\u0646\u062c\u0627\u062d.",
        comment_saved:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0639\u0644\u064a\u0642 \u0628\u0646\u062c\u0627\u062d.",
        comment_updated:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062a\u0639\u0644\u064a\u0642 \u0628\u0646\u062c\u0627\u062d.",
        company_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_mark_feature:
          "\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 \u0639\u0644\u0649 \u0623\u0646\u0647\u0627 \u0645\u0645\u064a\u0632\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_mark_unFeature:
          "\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 \u0639\u0644\u0649 \u0623\u0646\u0647\u0627 \u063a\u064a\u0631 \u0645\u0645\u064a\u0632\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_size_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629.",
        company_size_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_size_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_size_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062d\u062c\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        company_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        country_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0628\u0644\u062f.",
        country_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0628\u0644\u062f \u0628\u0646\u062c\u0627\u062d.",
        country_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0628\u0644\u062f \u0628\u0646\u062c\u0627\u062d.",
        country_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0628\u0644\u062f \u0628\u0646\u062c\u0627\u062d.",
        default_resume_already_upload:
          "\u062a\u0645 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0633\u064a\u0631\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629 \u0628\u0627\u0644\u0641\u0639\u0644.",
        degree_level_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629.",
        degree_level_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0639\u0644\u0645\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        degree_level_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629 \u0628\u0646\u062c\u0627\u062d.",
        degree_level_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629 \u0628\u0646\u062c\u0627\u062d.",
        degree_level_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629 \u0628\u0646\u062c\u0627\u062d.",
        description_required:
          "\u062d\u0642\u0644 \u0627\u0644\u0648\u0635\u0641 \u0645\u0637\u0644\u0648\u0628.",
        email_template:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0628\u0646\u062c\u0627\u062d.",
        email_verify:
          "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0628\u0646\u062c\u0627\u062d.",
        employer_profile:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u062a\u0639\u0631\u064a\u0641\u064a \u0644\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0628\u0646\u062c\u0627\u062d.",
        employer_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0628\u0646\u062c\u0627\u062d.",
        enter_cancel_reason:
          "\u0623\u062f\u062e\u0644 \u0633\u0628\u0628 \u0627\u0644\u0625\u0644\u063a\u0627\u0621 ...",
        enter_description:
          "\u0623\u062f\u062e\u0644 \u0627\u0644\u0648\u0635\u0641",
        enter_notes:
          "\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a ...",
        enter_post_description:
          "\u0623\u062f\u062e\u0644 \u0648\u0635\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        faqs_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0628\u0646\u062c\u0627\u062d.",
        faqs_save:
          "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u062a\u0645 \u062d\u0641\u0638\u0647\u0627 \u0628\u0646\u062c\u0627\u062d.",
        faqs_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0628\u0646\u062c\u0627\u062d.",
        fav_company_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        fav_job_added:
          "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        fav_job_remove:
          "\u062a\u0645\u062a \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629.",
        fav_job_removed:
          "\u062a\u0645\u062a \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        feature_job_price:
          "\u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0633\u0639\u0631 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u0623\u0643\u0628\u0631 \u0645\u0646 0",
        feature_quota:
          "\u0627\u0644\u062d\u0635\u0629 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629",
        featured_not_available:
          "\u0627\u0644\u062d\u0635\u0629 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629.",
        file_type:
          "\u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u0645\u0644\u0641 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639: jpeg\u060c jpg\u060c pdf\u060c doc\u060c docx.",
        functional_area_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629.",
        functional_area_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        functional_area_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        functional_area_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        header_slider_deleted:
          "\u062a\u0645 \u062d\u0630\u0641 Header Slider \u0628\u0646\u062c\u0627\u062d.",
        header_slider_save:
          "\u062a\u0645 \u062d\u0641\u0638 Header Slider \u0628\u0646\u062c\u0627\u062d.",
        header_slider_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b Header Slider \u0628\u0646\u062c\u0627\u062d.",
        image_slider_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        image_slider_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        image_slider_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        image_slider_update:
          ".\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0646\u062c\u0627\u062d",
        industry_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0635\u0646\u0627\u0639\u0629.",
        industry_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0628\u0646\u062c\u0627\u062d.",
        industry_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0628\u0646\u062c\u0627\u062d.",
        industry_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0628\u0646\u062c\u0627\u062d.",
        inquiry_deleted:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0628\u0646\u062c\u0627\u062d.",
        inquiry_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0628\u0646\u062c\u0627\u062d.",
        invoice_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_abuse_reported:
          "\u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0625\u0633\u0627\u0621\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_alert:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0628\u064a\u0647 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_application_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0637\u0644\u0628 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_application_draft:
          "\u062a\u0645\u062a \u0635\u064a\u0627\u063a\u0629 \u0637\u0644\u0628 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d",
        job_applied:
          "\u062a\u0645 \u0627\u0644\u062a\u0642\u062f\u0645 \u0644\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d",
        job_apply_by_candidate:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062a\u064a \u062a\u0642\u062f\u0645 \u0628\u0647\u0627 \u0627\u0644\u0645\u0631\u0634\u062d.",
        job_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_category_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_category_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_category_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_category_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_create_limit:
          "\u062a\u0645 \u062a\u062c\u0627\u0648\u0632 \u062d\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0644\u062d\u0633\u0627\u0628\u0643 \u060c \u0642\u0645 \u0628\u062a\u062d\u062f\u064a\u062b \u062e\u0637\u0629 \u0627\u0634\u062a\u0631\u0627\u0643\u0643.",
        job_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_draft:
          "\u062a\u0645 \u062d\u0641\u0638 \u0645\u0633\u0648\u062f\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_emailed_to:
          "\u0623\u0631\u0633\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0625\u0644\u0649 \u0635\u062f\u064a\u0642 \u0628\u0646\u062c\u0627\u062d.",
        job_make_featured:
          "\u062c\u0639\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0645\u0645\u064a\u0632\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_make_unfeatured:
          "\u062c\u0639\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u063a\u064a\u0631 \u0645\u0645\u064a\u0632\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_not_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_notification:
          "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0627\u0644\u0648\u0638\u064a\u0641\u064a \u0628\u0646\u062c\u0627\u062d.",
        job_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_schedule_send:
          "\u0625\u0631\u0633\u0627\u0644 \u062c\u062f\u0648\u0644 \u0627\u0644\u0639\u0645\u0644 \u0628\u0646\u062c\u0627\u062d.",
        job_shift_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0648\u0631\u062f\u064a\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_shift_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0648\u0638\u064a\u0641\u0629 Shift \u0628\u0646\u062c\u0627\u062d.",
        job_shift_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0648\u0631\u062f\u064a\u0629 \u0627\u0644\u0639\u0645\u0644 \u0628\u0646\u062c\u0627\u062d.",
        job_shift_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0648\u0638\u064a\u0641\u0629 Shift \u0628\u0646\u062c\u0627\u062d.",
        job_shift_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0648\u0631\u062f\u064a\u0629 \u0627\u0644\u0639\u0645\u0644 \u0628\u0646\u062c\u0627\u062d.",
        job_stage_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_stage_change:
          "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_stage_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_stage_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_stage_save:
          '\u062a\u0645 \u062d\u0641\u0638 "\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629" \u0628\u0646\u062c\u0627\u062d.',
        job_stage_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_tag_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_tag_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_tag_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_tag_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_tag_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_type_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629.",
        job_type_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_type_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_type_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_type_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        job_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        language_added:
          "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        language_changed:
          "\u062a\u063a\u064a\u0631\u062a \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d",
        language_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        language_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        language_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        language_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0644\u063a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        link_copy:
          "\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u0646\u062c\u0627\u062d.",
        manual_payment:
          "\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u064a\u062f\u0648\u064a \u0628\u0646\u062c\u0627\u062d.",
        manual_payment_denied:
          "\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u064a\u062f\u0648\u064a \u0628\u0646\u062c\u0627\u062d.",
        marital_status_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        marital_status_retrieve:
          "\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        marital_status_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        marital_status_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        media_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0628\u0646\u062c\u0627\u062d.",
        newsletter_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0646\u0634\u0631\u0629 \u0627\u0644\u0625\u062e\u0628\u0627\u0631\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        no_record:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0633\u062c\u0644\u0627\u062a.",
        not_deleted: "\u063a\u064a\u0631 \u0645\u062d\u0630\u0648\u0641",
        noticeboard_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        noticeboard_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        noticeboard_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        notification_read:
          "\u062a\u0645\u062a \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0628\u0646\u062c\u0627\u062d.",
        notification_setting_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0628\u0646\u062c\u0627\u062d.",
        ownership_type_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643.",
        ownership_type_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643 \u0628\u0646\u062c\u0627\u062d.",
        ownership_type_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        ownership_type_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        ownership_type_updated:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0646\u0648\u0639 \u0627\u0644\u0645\u0627\u0644\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        password_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0628\u0646\u062c\u0627\u062d.",
        payment_failed_try_again:
          "\u0622\u0633\u0641! \u0641\u0634\u0644 \u0627\u0644\u062f\u0641\u0639 \u060c \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0641\u064a \u0648\u0642\u062a \u0644\u0627\u062d\u0642.",
        payment_not_complete:
          "\u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0644\u0645 \u064a\u0643\u062a\u0645\u0644",
        payment_success:
          "\u0627\u0643\u062a\u0645\u0644\u062a \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643 \u0628\u0646\u062c\u0627\u062d",
        plan_Save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062e\u0637\u0629 \u0628\u0646\u062c\u0627\u062d.",
        plan_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u062e\u0637\u0629 \u060c \u0641\u0647\u064a \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643 \u0646\u0634\u0637 \u0648\u0627\u062d\u062f \u0623\u0648 \u0623\u0643\u062b\u0631.",
        plan_cant_update:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062e\u0637\u0629. \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u062e\u0637\u0629 \u0645\u0648\u062c\u0648\u062f \u0628\u0627\u0644\u0641\u0639\u0644",
        plan_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062e\u0637\u0629 \u0628\u0646\u062c\u0627\u062d.",
        plan_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0627\u0644\u062e\u0637\u0629 \u0628\u0646\u062c\u0627\u062d.",
        plan_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062e\u0637\u0629 \u0628\u0646\u062c\u0627\u062d.",
        please_wait_for:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u060c \u0644\u0642\u062f \u0623\u0636\u0641\u062a \u0628\u0627\u0644\u0641\u0639\u0644 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u064a\u062f\u0648\u064a",
        please_wait_for_com:
          "\u064a\u0631\u062c\u0649 \u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0644\u0625\u0643\u0645\u0627\u0644 \u0645\u0639\u0627\u0645\u0644\u062a\u0643",
        policy_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0633\u064a\u0627\u0633\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_category_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_category_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_category_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_category_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_comment:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u062a\u0639\u0644\u064a\u0642\u0627\u062a \u0627\u0644\u0646\u0634\u0631 \u0628\u0646\u062c\u0627\u062d.",
        post_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        post_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0646\u0634\u0648\u0631 \u0628\u0646\u062c\u0627\u062d.",
        profile_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a \u0628\u0646\u062c\u0627\u062d.",
        reason_require:
          "\u0633\u0628\u0628 \u0627\u0644\u0625\u0644\u063a\u0627\u0621 \u0645\u0637\u0644\u0648\u0628.",
        register_success_mail_active:
          "\u0644\u0642\u062f \u0642\u0645\u062a \u0628\u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u0646\u062c\u0627\u062d \u060c \u0642\u0645 \u0628\u062a\u0641\u0639\u064a\u0644 \u062d\u0633\u0627\u0628\u0643 \u0645\u0646 \u0627\u0644\u0628\u0631\u064a\u062f.",
        registration_done:
          "\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u0646\u062c\u0627\u062d.",
        report_to_company:
          "\u062a\u0642\u062f\u064a\u0645 \u062a\u0642\u0631\u064a\u0631 \u0625\u0644\u0649 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        reported_candidate_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0631\u0634\u062d \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647 \u0628\u0646\u062c\u0627\u062d.",
        reported_job_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627 \u0628\u0646\u062c\u0627\u062d.",
        resume_delete:
          "\u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u0627\u0644\u062d\u0630\u0641 \u0628\u0646\u062c\u0627\u062d.",
        resume_update:
          "\u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u062a\u062d\u062f\u064a\u062b \u0628\u0646\u062c\u0627\u062d.",
        retrieved:
          "\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0628\u0646\u062c\u0627\u062d.",
        salary_currency_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628.",
        salary_currency_destroy:
          "\u062a\u0645 \u062d\u0630\u0641 \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_currency_edit:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_currency_store:
          "\u062a\u0645 \u062d\u0641\u0638 \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_currency_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_period_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628.",
        salary_period_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_period_retrieve:
          "\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_period_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        salary_period_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0628\u0646\u062c\u0627\u062d.",
        select_employer:
          "\u062d\u062f\u062f \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644",
        select_job:
          "\u062d\u062f\u062f \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        select_job_skill:
          "\u062d\u062f\u062f \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
        select_job_tag:
          "\u062d\u062f\u062f \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        select_post_category:
          "\u062d\u062f\u062f \u0641\u0626\u0629 \u0627\u0644\u0645\u0646\u0634\u0648\u0631",
        select_skill:
          "\u062d\u062f\u062f \u0627\u0644\u0645\u0647\u0627\u0631\u0629",
        session_created:
          "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062c\u0644\u0633\u0629 \u0628\u0646\u062c\u0627\u062d.",
        setting_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0625\u0639\u062f\u0627\u062f \u0628\u0646\u062c\u0627\u062d.",
        skill_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u0647\u0627\u0631\u0629.",
        skill_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        skill_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        skill_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0628\u0646\u062c\u0627\u062d.",
        slot_already_taken:
          "\u0627\u0644\u0641\u062a\u062d\u0629 \u0645\u0623\u062e\u0648\u0630\u0629 \u0628\u0627\u0644\u0641\u0639\u0644",
        slot_cancel:
          "\u0627\u0644\u0641\u062a\u062d\u0629 \u0627\u0644\u063a\u0627\u0621 \u0628\u0646\u062c\u0627\u062d.",
        slot_choose:
          "\u0627\u062e\u062a\u0631 \u0627\u0644\u0641\u062a\u062d\u0629 \u0628\u0646\u062c\u0627\u062d",
        slot_create:
          "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u062a\u062d\u0627\u062a \u0628\u0646\u062c\u0627\u062d",
        slot_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0641\u062a\u062d\u0629 \u0628\u0646\u062c\u0627\u062d.",
        slot_preference_field:
          "\u062d\u0642\u0644 \u062a\u0641\u0636\u064a\u0644 \u0627\u0644\u0641\u062a\u062d\u0629 \u0645\u0637\u0644\u0648\u0628",
        slot_reject:
          "\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0628\u0646\u062c\u0627\u062d.",
        slot_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0641\u062a\u062d\u0629 \u0628\u0646\u062c\u0627\u062d.",
        state_cant_delete:
          "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u0627\u0644\u0648\u0644\u0627\u064a\u0629.",
        state_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062f\u0648\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        state_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062f\u0648\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        state_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062f\u0648\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        status_change:
          "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0648\u0636\u0639 \u0628\u0646\u062c\u0627\u062d.",
        status_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062d\u0627\u0644\u0629 \u0628\u0646\u062c\u0627\u062d.",
        subscribed:
          "\u062a\u0645 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0646\u062c\u0627\u062d.",
        subscription_cancel:
          "\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0646\u062c\u0627\u062d.",
        subscription_resume:
          "\u062a\u0645 \u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0646\u062c\u0627\u062d.",
        success_verify:
          "\u0644\u0642\u062f \u0646\u062c\u062d\u062a \u0641\u064a \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a. \u0627\u0644\u0631\u062c\u0627\u0621 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 !",
        testimonial_delete:
          "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        testimonial_retrieve:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        testimonial_save:
          "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0634\u0647\u0627\u062f\u0629 \u0628\u0646\u062c\u0627\u062d.",
        testimonial_update:
          "\u062a\u0645 \u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a \u0628\u0646\u062c\u0627\u062d.",
        the_name_has:
          "\u0627\u0644\u0627\u0633\u0645 \u0645\u0623\u062e\u0648\u0630 \u0628\u0627\u0644\u0641\u0639\u0644",
        there_are_no:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0633\u064a\u0631\u0629 \u0630\u0627\u062a\u064a\u0629 \u062a\u0645 \u062a\u062d\u0645\u064a\u0644\u0647\u0627.",
        this_currency_is:
          "\u0644\u0627 \u064a\u062f\u0639\u0645 PayPal \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u0629 \u0644\u0625\u062c\u0631\u0627\u0621 \u0627\u0644\u062f\u0641\u0639\u0627\u062a.",
        translation_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062a\u0631\u062c\u0645\u0629 \u0628\u0646\u062c\u0627\u062d.",
        trial_plan_update:
          "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u062a\u062c\u0631\u064a\u0628\u064a\u0629 \u0628\u0646\u062c\u0627\u062d.",
        unfollow_company:
          "\u0625\u0644\u063a\u0627\u0621 \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0646\u062c\u0627\u062d.",
        verification_mail:
          "\u062a\u0645\u062a \u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0628\u0631\u064a\u062f \u0627\u0644\u062a\u062d\u0642\u0642 \u0628\u0646\u062c\u0627\u062d.",
        your_are_not_author:
          "\u0623\u0646\u062a \u0644\u0633\u062a \u0645\u0624\u0644\u0641 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643. \u0644\u0630\u0644\u0643 \u0644\u0627 \u064a\u0633\u0645\u062d \u0644\u0643 \u0628\u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643.",
        your_payment_comp:
          "\u0627\u0643\u062a\u0645\u0644\u062a \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643 \u0628\u0646\u062c\u0627\u062d",
      },
      footer_settings:
        "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u062a\u0630\u064a\u064a\u0644",
      front_cms: "\u0627\u0644\u062c\u0628\u0647\u0629 \u0633\u0645",
      front_home: {
        candidates: "\u0627\u0644\u0645\u0631\u0634\u062d\u0648\u0646",
        companies: "\u0627\u0644\u0634\u0631\u0643\u0627\u062a",
        jobs: "\u0648\u0638\u0627\u0626\u0641",
        resumes: "\u064a\u0633\u062a\u0623\u0646\u0641",
      },
      front_settings: {
        exipre_on: "\u062a\u0634\u063a\u064a\u0644 Exipre",
        expires_on:
          "\u062a\u0646\u062a\u0647\u064a \u0635\u0644\u0627\u062d\u064a\u062a\u0647 \u0641\u064a",
        featured: "\u0645\u062a\u0645\u064a\u0632",
        featured_companies_days:
          "\u0623\u064a\u0627\u0645 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_companies_due_days:
          "\u0623\u064a\u0627\u0645 \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629",
        featured_companies_enable:
          "\u062a\u0645\u0643\u064a\u0646 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_companies_price:
          "\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_companies_quota:
          "\u062d\u0635\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_employer_not_available:
          "\u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0645\u064a\u0632 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631",
        featured_job:
          "\u0648\u0638\u064a\u0641\u0629 \u0645\u0645\u064a\u0632\u0629",
        featured_jobs_days:
          "\u0623\u064a\u0627\u0645 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_jobs_due_days:
          "\u0623\u064a\u0627\u0645 \u0627\u0633\u062a\u062d\u0642\u0627\u0642 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629",
        featured_jobs_enable:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u062a\u0645\u0643\u0651\u0646",
        featured_jobs_price:
          "\u0633\u0639\u0631 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_jobs_quota:
          "\u062d\u0635\u0629 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0645\u064a\u0632\u0629",
        featured_listing_currency:
          "\u0639\u0645\u0644\u0629 \u0642\u0627\u0626\u0645\u0629 \u0645\u0645\u064a\u0632\u0629",
        latest_jobs_enable:
          "\u0639\u0631\u0636 \u0623\u062d\u062f\u062b \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u062d\u0633\u0628 \u0628\u0644\u062f \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0630\u064a \u0642\u0627\u0645 \u0628\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
        latest_jobs_enable_message:
          "\u0633\u064a\u0639\u0631\u0636 \u0623\u062d\u062f\u062b \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0641\u064a \u0628\u0644\u062f \u0627\u0644\u0645\u0631\u0634\u062d / \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0639\u0646\u062f \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
        make_feature: "\u062c\u0639\u0644 \u0627\u0644\u0645\u064a\u0632\u0629",
        make_featured:
          "\u0627\u062c\u0639\u0644\u0647\u0627 \u0645\u0645\u064a\u0632\u0629",
        make_featured_job:
          "\u062c\u0639\u0644 \u0648\u0638\u064a\u0641\u0629 \u0645\u0645\u064a\u0632\u0629",
        pay_to_get:
          "\u0627\u062f\u0641\u0639 \u0644\u062a\u062d\u0635\u0644 \u0639\u0644\u0649",
        remove_featured:
          "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0645\u064a\u0632",
      },
      functional_area: {
        edit_functional_area:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
        name: "\u0627\u0633\u0645",
        new_functional_area:
          "\u0645\u0646\u0637\u0642\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_functional_area_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0646\u0637\u0642\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_functional_area_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0646\u0637\u0642\u0629 \u0648\u0638\u064a\u0641\u064a\u0629",
      },
      functional_areas:
        "\u0627\u0644\u0627\u0645\u0627\u0643\u0646 \u0627\u0644\u0639\u0627\u0645\u0644\u0629",
      general: "\u062c\u0646\u0631\u0627\u0644 \u0644\u0648\u0627\u0621",
      general_dashboard:
        "\u0644\u0648\u062d\u0629 \u0627\u0644\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u0639\u0627\u0645\u0629",
      general_settings:
        "\u0627\u0644\u0627\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0639\u0627\u0645\u0629",
      go_to_homepage:
        "\u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
      header_slider: {
        edit_header_slider:
          "\u062a\u062d\u0631\u064a\u0631 \u0631\u0623\u0633 \u0627\u0644\u0645\u0646\u0632\u0644\u0642",
        header_slider:
          "\u0631\u0623\u0633 \u0627\u0644\u0645\u0646\u0632\u0644\u0642",
        image_size_message:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u062f\u0642\u0629 1920 \u00d7 1080 \u0628\u0643\u0633\u0644 \u0623\u0648 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0628\u0643\u0633\u0644.",
        image_title_text:
          "\u0642\u0645 \u0628\u062a\u062d\u0645\u064a\u0644 \u0635\u0648\u0631\u0629 \u0628\u062f\u0642\u0629 1920 \u00d7 1080 \u0628\u0643\u0633\u0644 \u0623\u0648 \u0623\u0639\u0644\u0649 \u0628\u0643\u0633\u0644 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u062a\u062c\u0631\u0628\u0629 \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645.",
        new_header_slider:
          "\u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0631\u0623\u0633 \u062c\u062f\u064a\u062f",
        no_header_slider_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0631\u0623\u0633 \u0645\u062a\u0627\u062d",
      },
      header_sliders:
        "\u0645\u062a\u0632\u0644\u062c\u0648\u0646 \u0627\u0644\u0631\u0623\u0633",
      image_slider: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_imag_eslider:
          "\u062a\u062d\u0631\u064a\u0631 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u0642",
        image: "\u0635\u0648\u0631\u0629",
        image_extension_message:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0646 \u0646\u0648\u0639 \u0645\u0644\u0641: png \u060c jpg \u060c jpeg.",
        image_size_message:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 1140 \u00d7 500 \u0628\u0643\u0633\u0644 \u0623\u0648 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0628\u0643\u0633\u0644.",
        image_slider:
          "\u0645\u0646\u0632\u0644\u0642 \u0627\u0644\u0635\u0648\u0631\u0629",
        image_slider_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629",
        image_title_text:
          "\u0642\u0645 \u0628\u062a\u062d\u0645\u064a\u0644 \u0635\u0648\u0631\u0629 1140 \u00d7 500 \u0628\u0643\u0633\u0644 \u0623\u0648 \u0623\u0639\u0644\u0649 \u0628\u0643\u0633\u0644 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u062a\u062c\u0631\u0628\u0629 \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645.",
        is_active: "\u0627\u0644\u062d\u0627\u0644\u0629",
        message:
          "\u062a\u0639\u0637\u064a\u0644 \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
        message_title:
          "\u0625\u0630\u0627 \u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u0647\u0630\u0627 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u060c \u0641\u0644\u0646 \u062a\u0643\u0648\u0646 \u0634\u0627\u0634\u0629 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629 \u0645\u0631\u0626\u064a\u0629.",
        new_image_slider:
          "\u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062c\u062f\u064a\u062f",
        no_image_slider_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0635\u0648\u0631\u0629 \u0645\u062a\u0627\u062d",
        no_image_slider_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u0642",
        select_status:
          "\u062d\u062f\u062f \u0627\u0644\u062d\u0627\u0644\u0629",
        slider:
          "\u062a\u0641\u0639\u064a\u0644 \u0634\u0631\u064a\u0637 \u0627\u0644\u062a\u0645\u0631\u064a\u0631 \u0628\u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0643\u0627\u0645\u0644.",
        slider_active:
          "\u0642\u0645 \u0628\u062a\u0639\u0637\u064a\u0644 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0635\u0648\u0631\u0629 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
        slider_active_title:
          "\u0625\u0630\u0627 \u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u0647\u0630\u0627 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u060c \u0641\u0644\u0646 \u062a\u0643\u0648\u0646 \u0634\u0627\u0634\u0629 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629 \u0645\u0631\u0626\u064a\u0629.",
        slider_title:
          "\u0625\u0630\u0627 \u062a\u0645 \u062a\u0645\u0643\u064a\u0646 \u0647\u0630\u0627 \u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u060c \u0641\u0633\u064a\u0643\u0648\u0646 \u0634\u0631\u064a\u0637 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629.",
      },
      image_sliders:
        "\u0645\u0646\u0632\u0644\u0642\u0627\u062a \u0627\u0644\u0635\u0648\u0631\u0629",
      industries: "\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062a",
      industry: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_industry:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u0629",
        industry_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u0629",
        name: "\u0627\u0633\u0645",
        new_industry:
          "\u0635\u0646\u0627\u0639\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_industry_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0646\u0627\u0639\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_industry_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0635\u0646\u0627\u0639\u0629",
        size: "\u0628\u062d\u062c\u0645",
      },
      inquires: "\u064a\u0633\u062a\u0641\u0633\u0631",
      inquiry: {
        email: "\u0627\u0633\u0645...",
        inquiry: "\u0633\u0624\u0627\u0644",
        inquiry_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631",
        inquiry_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062a\u062d\u0642\u064a\u0642",
        message: "\u0631\u0633\u0627\u0644\u0629",
        name: "\u0627\u0633\u0645",
        no_inquiry_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0645\u062a\u0627\u062d",
        no_inquiry_found:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u0633\u062a\u0641\u0633\u0627\u0631",
        phone_no: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641",
        subject: "\u0645\u0648\u0636\u0648\u0639",
      },
      job: {
        add_note: "\u0627\u0636\u0641 \u0645\u0644\u0627\u062d\u0638\u0629",
        applies_job_not_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0648\u0638\u064a\u0641\u0629 \u062a\u0637\u0628\u064a\u0642\u064a\u0629",
        career_level:
          "\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        city: "\u0645\u062f\u064a\u0646\u0629",
        country: "\u0628\u0644\u062f",
        created_at: "\u0623\u0646\u0634\u0626\u062a \u0641\u064a",
        currency: "\u0639\u0645\u0644\u0629",
        degree_level:
          "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629",
        description: "\u0648\u0635\u0641",
        edit_job:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        email_to_friend:
          "\u0623\u0631\u0633\u0644 \u0625\u0644\u0649 \u0635\u062f\u064a\u0642",
        expired_job:
          "\u0648\u0638\u064a\u0641\u0629 \u0645\u0646\u062a\u0647\u064a\u0629 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629",
        expires_on:
          "\u062a\u0646\u062a\u0647\u064a \u0635\u0644\u0627\u062d\u064a\u062a\u0647 \u0641\u064a",
        favourite_companies_not_found:
          "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629",
        favourite_company:
          "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
        favourite_job:
          "\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
        favourite_job_not_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0648\u0638\u0627\u0626\u0641 \u0645\u0641\u0636\u0644\u0629",
        following_company_not_found:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0634\u0631\u0643\u0629 \u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u062a\u0627\u062d\u0629",
        friend_email:
          "\u0635\u062f\u064a\u0642 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        friend_name: "\u0627\u0633\u0645 \u0635\u062f\u064a\u0642",
        functional_area:
          "\u0627\u0644\u0645\u062c\u0627\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u064a",
        hide_salary:
          "\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0631\u0627\u062a\u0628",
        is_featured: "\u0647\u064a \u0648\u0627\u0631\u062f\u0629",
        is_freelance:
          "\u064a\u0639\u0645\u0644 \u0644\u062d\u0633\u0627\u0628\u0647 \u0627\u0644\u062e\u0627\u0635",
        is_suspended: "\u0645\u0639\u0644\u0642",
        job: "\u0645\u0647\u0646\u0629",
        job_alert:
          "\u062d\u0627\u0644\u0629 \u062a\u0623\u0647\u0628 \u0648\u0638\u064a\u0641\u0629",
        job_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_expiry_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_shift: "\u0646\u0648\u0628\u0629 \u0627\u0644\u0639\u0645\u0644",
        job_skill:
          "\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644",
        job_title:
          "\u0639\u0646\u0648\u0627\u0646 \u0648\u0638\u064a\u0641\u064a",
        job_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_url:
          "\u0631\u0627\u0628\u0637 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        new_job:
          "\u0648\u0638\u064a\u0641\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_applied_job_found:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0638\u064a\u0641\u0629 \u062a\u0637\u0628\u064a\u0642\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_favourite_job_found:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0638\u0627\u0626\u0641 \u0645\u0641\u0636\u0644\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_followers_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u062a\u0627\u0628\u0639\u0648\u0646 \u0645\u062a\u0627\u062d\u0648\u0646",
        no_followers_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u062a\u0627\u0628\u0639\u064a\u0646",
        no_following_companies_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
        no_job_reported_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0638\u064a\u0641\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_preference:
          "\u0628\u062f\u0648\u0646 \u062a\u0641\u0636\u064a\u0644",
        no_reported_job_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0648\u0638\u064a\u0641\u0629 \u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646\u0647\u0627",
        notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0646\u0637\u0627\u0642 \u0627\u0644\u0631\u0627\u062a\u0628 \u0625\u0644\u0649 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0646\u0637\u0627\u0642 \u0627\u0644\u0631\u0627\u062a\u0628 \u0645\u0646.",
        position: "\u0645\u0648\u0636\u0639",
        remove_favourite_jobs:
          "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
        reported_job:
          "\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_jobs_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
        reported_user:
          "\u062a\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645",
        salary_from: "\u0627\u0644\u0631\u0627\u062a\u0628 \u0645\u0646",
        salary_period:
          "\u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        salary_to: "\u0627\u0644\u0631\u0627\u062a\u0628 \u0644",
        state: "\u062d\u0627\u0644\u0629",
        subscriber: "\u0645\u0634\u062a\u0631\u0643",
        view_drafted_job:
          "\u0639\u0631\u0636 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0635\u0627\u063a\u0629",
        view_notes:
          "\u0639\u0631\u0636 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
      },
      job_application: {
        application_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062a\u0642\u062f\u064a\u0645",
        candidate_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0634\u062d",
        job_application: "\u0637\u0644\u0628 \u0648\u0638\u064a\u0641\u064a",
      },
      job_applications:
        "\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u0638\u064a\u0641\u0629",
      job_categories:
        "\u0641\u0626\u0627\u062a \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
      job_category: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_job_category:
          "\u062a\u062d\u0631\u064a\u0631 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        is_featured: "\u0647\u064a \u0648\u0627\u0631\u062f\u0629",
        job_category:
          "\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        name: "\u0627\u0633\u0645",
        new_job_category:
          "\u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_job_category_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0626\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_job_category_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        show_job_category:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0641\u0626\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
      },
      job_experience: {
        edit_job_experience:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062e\u0628\u0631\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
        is_active: "\u0646\u0634\u0637",
        is_default: "\u0627\u0641\u062a\u0631\u0627\u0636\u064a",
        job_experience:
          "\u062e\u0628\u0631\u0629 \u0627\u0644\u0639\u0645\u0644",
        language: "\u062e\u0628\u0631\u0629 \u0627\u0644\u0639\u0645\u0644...",
        new_job_experience:
          "\u062a\u062c\u0631\u0628\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629",
      },
      job_experiences:
        "\u0627\u0644\u062e\u0628\u0631\u0627\u062a \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
      job_notification: {
        job_notifications:
          "\u0625\u062e\u0637\u0627\u0631\u0627\u062a \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        no_jobs_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0638\u0627\u0626\u0641 \u0645\u062a\u0627\u062d\u0629",
        select_all_jobs:
          "\u062d\u062f\u062f \u0643\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
      },
      job_shift: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_job_shift:
          "\u062a\u062d\u0631\u064a\u0631 \u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062a\u062d\u0648\u0644",
        job_shift_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0648\u0631\u062f\u064a\u0629 \u0627\u0644\u0639\u0645\u0644",
        new_job_shift:
          "\u0646\u0648\u0628\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629",
        no_job_shifts_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0648\u0631\u062f\u064a\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_job_shifts_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0646\u0648\u0628\u0629 \u0639\u0645\u0644",
        shift: "\u062a\u062d\u0648\u0644",
        show_job_shift:
          "\u0646\u0648\u0628\u0629 \u0627\u0644\u0639\u0645\u0644",
        size: "\u0628\u062d\u062c\u0645",
      },
      job_shifts:
        "\u0646\u0648\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644",
      job_skill: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_job_skill:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629",
        name: "\u0627\u0633\u0645",
        new_job_skill:
          "\u0645\u0647\u0627\u0631\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629",
        show_job_skill:
          "\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644",
      },
      job_skills:
        "\u0645\u0647\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0645\u0644",
      job_stage: {
        add_slot: "\u0623\u0636\u0641 \u0641\u062a\u062d\u0629",
        add_slots: "\u0623\u0636\u0641 \u0641\u062a\u062d\u0627\u062a",
        batch: "\u062d\u0632\u0645\u0629",
        cancel_slot:
          "\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0641\u062a\u062d\u0629",
        cancel_this_slot:
          " \u0642\u0645 \u0628\u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0641\u062a\u062d\u0629",
        cancel_your_selected_slot:
          " \u0642\u0645 \u0628\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0641\u062a\u062d\u0629 \u0627\u0644\u062a\u064a \u0627\u062e\u062a\u0631\u062a\u0647\u0627 ",
        candidate_note:
          "\u0645\u0644\u0627\u062d\u0638\u0629 \u0627\u0644\u0645\u0631\u0634\u062d",
        choose_slots:
          "\u0627\u062e\u062a\u0631 \u0627\u0644\u0641\u062a\u062d\u0629",
        date: "\u062a\u0627\u0631\u064a\u062e",
        edit_job_stage:
          "\u062a\u062d\u0631\u064a\u0631 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        edit_slot:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0641\u062a\u062d\u0629",
        history: "\u062a\u0627\u0631\u064a\u062e",
        job_stage:
          "\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_stage_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        new_job_stage:
          "\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        new_slot_send:
          "\u0625\u0631\u0633\u0627\u0644 \u0641\u062a\u062d\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_job_stage_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0631\u062d\u0644\u0629 \u0639\u0645\u0644 \u0645\u062a\u0627\u062d\u0629",
        no_job_stage_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0631\u062d\u0644\u0629 \u0639\u0645\u0644",
        no_slot_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u062a\u062d\u0629 \u0645\u062a\u0627\u062d\u0629",
        reject_all_slot:
          "\u0631\u0641\u0636 \u0643\u0644 \u0627\u0644\u0641\u062a\u062d\u0627\u062a",
        rejected_all_slots:
          "\u062a\u0645 \u0631\u0641\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0641\u062a\u062d\u0627\u062a",
        send_slot:
          "\u0641\u062a\u062d\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644",
        send_slots:
          "\u0625\u0631\u0633\u0627\u0644 \u0641\u062a\u062d\u0627\u062a",
        slot: "\u0641\u062a\u062d\u0629",
        slot_preference:
          "\u062a\u0641\u0636\u064a\u0644 \u0627\u0644\u0641\u062a\u062d\u0629",
        slots: "\u0641\u062a\u062d\u0627\u062a",
        time: "\u0632\u0645\u0646",
        you_cancel_this_slot:
          "\u0642\u0645\u062a \u0628\u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0641\u062a\u062d\u0629",
        you_have_rejected_all_slot:
          "\u0644\u0642\u062f \u0631\u0641\u0636\u062a \u0643\u0644 \u0627\u0644\u0641\u062a\u062d\u0627\u062a",
        you_have_selected_this_slot:
          "\u0644\u0642\u062f \u062d\u062f\u062f\u062a \u0647\u0630\u0647 \u0627\u0644\u0641\u062a\u062d\u0629",
        your_note: "\u0645\u0644\u0627\u062d\u0638\u062a\u0643",
      },
      job_stages:
        "\u0645\u0631\u0627\u062d\u0644 \u0627\u0644\u0639\u0645\u0644",
      job_tag: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_job_tag:
          "\u062a\u062d\u0631\u064a\u0631 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_tag: "\u064a\u0648\u0645 \u0627\u0644\u0639\u0645\u0644",
        job_tag_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0639\u0645\u0644",
        name: "\u0627\u0633\u0645",
        new_job_tag:
          "\u0639\u0644\u0627\u0645\u0629 \u0645\u0647\u0645\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_job_tag_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0644\u0627\u0645\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_job_tag_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0639\u0644\u0627\u0645\u0629 \u0645\u0647\u0645\u0629",
        show_job_tag:
          "\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        size: "\u0628\u062d\u062c\u0645",
      },
      job_tags:
        "\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
      job_type: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_job_type:
          "\u062a\u062d\u0631\u064a\u0631 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        job_type_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        name: "\u0627\u0633\u0645",
        new_job_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_job_type_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0646\u0648\u0639 \u0648\u0638\u064a\u0641\u0629 \u0645\u062a\u0627\u062d",
        no_job_type_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        show_job_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
      },
      job_types:
        "\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
      jobs: "\u0648\u0638\u0627\u0626\u0641",
      language: {
        edit_language:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0644\u063a\u0629",
        is_active: "\u0646\u0634\u0637",
        is_default: "\u0627\u0641\u062a\u0631\u0627\u0636\u064a",
        is_rtl: "\u0647\u0644 RTL",
        iso_code: "\u0643\u0648\u062f ISO",
        language: "\u0644\u063a\u0629",
        native: "\u0645\u062d\u0644\u064a",
        new_language: "\u0644\u063a\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_language_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0644\u063a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_language_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0644\u063a\u0629",
      },
      languages: "\u0627\u0644\u0644\u063a\u0627\u062a",
      marital_status: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_marital_status:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        marital_status:
          "\u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        marital_status_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        new_marital_status:
          "\u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0632\u0648\u0627\u062c\u064a\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_marital_status_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u062d\u0627\u0644\u0629 \u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_marital_status_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
        show_marital_status:
          "\u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
      },
      marital_statuses:
        "\u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629",
      months: {
        apr: "\u0623\u0628\u0631\u064a\u0644",
        aug: "\u0623\u063a\u0633\u0637\u0633",
        dec: "\u062f\u064a\u0633\u0645\u0628\u0631",
        feb: "\u0641\u0628\u0631\u0627\u064a\u0631",
        jan: "\u064a\u0646\u0627\u064a\u0631",
        jul: "\u064a\u0648\u0644\u064a\u0648",
        jun: "\u064a\u0648\u0646\u064a\u0648",
        mar: "\u0645\u0627\u0631\u0633",
        may: "\u0645\u0627\u064a\u0648",
        nov: "\u0646\u0648\u0641\u0645\u0628\u0631",
        oct: "\u0623\u0643\u062a\u0648\u0628\u0631",
        sep: "\u0633\u0628\u062a\u0645\u0628\u0631",
      },
      no_skills: "\u0644\u0627 \u0645\u0647\u0627\u0631\u0627\u062a",
      no_subscriber_available:
        "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0634\u062a\u0631\u0643 \u0645\u062a\u0648\u0641\u0631",
      no_subscriber_found:
        "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0634\u062a\u0631\u0643",
      noticeboard: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_noticeboard:
          "\u062a\u062d\u0631\u064a\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        is_active: "\u0646\u0634\u0637",
        new_noticeboard:
          "\u0644\u0648\u062d\u0629 \u0625\u0639\u0644\u0627\u0646\u0627\u062a \u062c\u062f\u064a\u062f\u0629",
        no_noticeboard_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0644\u0648\u062d\u0629 \u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062a\u0627\u062d\u0629",
        no_noticeboard_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0644\u0648\u062d\u0629 \u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        noticeboard:
          "\u0644\u0648\u062d \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a",
        noticeboard_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
        title: "\u0639\u0646\u0648\u0627\u0646",
      },
      noticeboards:
        "\u0644\u0627\u0641\u062a\u0627\u062a \u062a\u0646\u0628\u064a\u0647",
      notification: {
        company: "\u0634\u0631\u0643\u0629 ",
        company_marked_featured:
          "\u0627\u0644\u0634\u0631\u0643\u0629 \u0645\u0645\u064a\u0632\u0629 \u0628\u0639\u0644\u0627\u0645\u0629",
        empty_notifications:
          "\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u064a \u0625\u062e\u0637\u0627\u0631\u0627\u062a",
        job_application_rejected_message:
          "\u062a\u0645 \u0631\u0641\u0636 \u0637\u0644\u0628\u0643 \u0644\u0640",
        job_application_select_message:
          "\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631\u0643 \u0644",
        job_application_shortlist_message:
          "\u062a\u0645 \u0625\u062f\u0631\u0627\u062c \u0637\u0644\u0628\u0643 \u0641\u064a \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062e\u062a\u0635\u0631\u0629 \u0644\u0640",
        job_application_submitted:
          "\u062a\u0645 \u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u0627\u0644\u062a\u0648\u0638\u064a\u0641 \u0644\u0640",
        mark_all_as_read:
          "\u0627\u0634\u0631 \u0639\u0644\u064a\u0647\u0627 \u0628\u0627\u0646\u0647\u0627 \u0642\u0631\u0627\u062a",
        marked_as_featured:
          "\u062a\u0645 \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0645\u0645\u064a\u0632\u0629",
        new_candidate_registered:
          "\u0645\u0631\u0634\u062d \u062c\u062f\u064a\u062f \u0645\u0633\u062c\u0644",
        new_employer_registered:
          "\u0635\u0627\u062d\u0628 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f \u0645\u0633\u062c\u0644",
        notifications: "\u0625\u0634\u0639\u0627\u0631\u0627\u062a",
        purchase: "\u0634\u0631\u0627\u0621",
        read_notification:
          "\u062a\u0645\u062a \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u062e\u0637\u0627\u0631 \u0628\u0646\u062c\u0627\u062d",
        started_following:
          "\u0628\u062f\u0623\u062a \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629",
        started_following_you:
          "\u0628\u062f\u0627\u062a \u0627\u0644\u0627\u062d\u0642\u0643.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "\u0639\u0646\u062f\u0645\u0627 \u0631\u0641\u0636 \u0645\u0631\u0634\u062d \u0644\u0648\u0638\u064a\u0641\u0629",
        CANDIDATE_SELECTED_FOR_JOB:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0631\u0634\u062d \u0644\u0644\u0648\u0638\u064a\u0641\u0629",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "\u0639\u0646\u062f\u0645\u0627 \u062a\u0645 \u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0631\u0634\u062d \u0644\u0644\u0648\u0638\u064a\u0641\u0629",
        EMPLOYER_PURCHASE_PLAN:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0634\u062a\u0631\u064a \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u062e\u0637\u0629 \u0627\u0634\u062a\u0631\u0627\u0643",
        FOLLOW_COMPANY:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0628\u062f\u0623 \u0627\u0644\u0645\u0631\u0634\u062d \u0641\u064a \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0634\u0631\u0643\u0629",
        FOLLOW_JOB:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0628\u062f\u0623 \u0627\u0644\u0645\u0631\u0634\u062d \u0641\u064a \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0648\u0638\u0627\u0626\u0641",
        JOB_ALERT:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0646\u0634\u0626 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0648\u0638\u064a\u0641\u0629",
        JOB_APPLICATION_SUBMITTED:
          "\u0639\u0646\u062f \u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u0648\u0638\u064a\u0641\u0629 \u062c\u062f\u064a\u062f",
        MARK_COMPANY_FEATURED:
          "\u0639\u0646\u062f \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0627\u0639\u062a\u0628\u0627\u0631\u0647\u0627 \u0645\u0645\u064a\u0632\u0629",
        MARK_COMPANY_FEATURED_ADMIN:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0636\u0639 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0639\u0644\u0627\u0645\u0629 \u0645\u0645\u064a\u0632\u0629 \u0639\u0644\u0649 \u0627\u0644\u0634\u0631\u0643\u0629",
        MARK_JOB_FEATURED:
          "\u0639\u0646\u062f \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0639\u0644\u0649 \u0623\u0646\u0647\u0627 \u0645\u0645\u064a\u0632\u0629",
        MARK_JOB_FEATURED_ADMIN:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u0636\u0639 \u0635\u0627\u062d\u0628 \u0627\u0644\u0639\u0645\u0644 \u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0639\u0644\u0649 \u0623\u0646\u0647\u0627 \u0645\u0645\u064a\u0632\u0629",
        NEW_CANDIDATE_REGISTERED:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0645\u0631\u0634\u062d \u062c\u062f\u064a\u062f",
        NEW_EMPLOYER_REGISTERED:
          "\u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0635\u0627\u062d\u0628 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f",
        admin: "\u0645\u0634\u0631\u0641",
        blog_category:
          "\u0641\u0626\u0629 \u0627\u0644\u0645\u062f\u0648\u0646\u0629",
        candidate: "\u0645\u0631\u0634\u062d",
        employer: "\u0645\u0648\u0638\u0641",
      },
      ownership_type: {
        edit_ownership_type:
          "\u062a\u062d\u0631\u064a\u0631 \u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629",
        new_ownership_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_ownership_type_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0646\u0648\u0639 \u0645\u0644\u0643\u064a\u0629 \u0645\u062a\u0627\u062d",
        no_ownership_type_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0645\u0644\u0643\u064a\u0629",
        ownership_type:
          "\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629",
        ownership_type_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629",
      },
      ownership_types:
        "\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u0644\u0643\u064a\u0629",
      phone: {
        invalid_country_code:
          "\u0631\u0645\u0632 \u0627\u0644\u062f\u0648\u0644\u0629 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d",
        invalid_number:
          "\u0631\u0642\u0645 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d",
        too_long: "\u0637\u0648\u064a\u0644 \u062c\u062f\u0627",
        too_short: "\u0642\u0635\u064a\u0631 \u062c\u062f\u0627",
        valid_number: "\u0631\u0642\u0645 \u0635\u0627\u0644\u062d",
      },
      plan: {
        active_subscription:
          "\u0627\u0634\u062a\u0631\u0627\u0643 \u0646\u0634\u0637",
        allowed_jobs:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0633\u0645\u0648\u062d \u0628\u0647\u0627",
        amount: "\u0643\u0645\u064a\u0629",
        cancel_reason:
          "\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0633\u0628\u0628",
        cancel_subscription:
          "\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
        currency: "\u0639\u0645\u0644\u0629",
        current_plan:
          "\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
        edit_plan:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062e\u0637\u0629",
        edit_subscription_plan:
          "\u062a\u062d\u0631\u064a\u0631 \u062e\u0637\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
        ends_at: "\u0643\u0644 \u0634\u0647\u0631",
        is_trial_plan:
          "\u0647\u064a \u062e\u0637\u0629 \u062a\u062c\u0631\u064a\u0628\u064a\u0629",
        job_allowed:
          "\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0633\u0645\u0648\u062d \u0628\u0647\u0627",
        job_used:
          "\u0627\u0644\u0648\u0638\u064a\u0641\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0629",
        jobs_allowed:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0633\u0645\u0648\u062d \u0628\u0647\u0627",
        jobs_used:
          "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0629",
        new_plan: "\u0623\u0636\u0641 \u062e\u0637\u0629",
        new_subscription_plan:
          "\u062e\u0637\u0629 \u0627\u0634\u062a\u0631\u0627\u0643 \u062c\u062f\u064a\u062f\u0629",
        pay_with_manually:
          "\u0627\u062f\u0641\u0639 \u064a\u062f\u0648\u064a\u0627",
        pay_with_paypal:
          "\u0627\u0644\u062f\u0641\u0639 \u0628\u0648\u0627\u0633\u0637 \u0628\u0627\u0649 \u0628\u0627\u0644",
        pay_with_stripe:
          "\u0627\u0644\u062f\u0641\u0639 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 Stripe",
        per_month: "\u0643\u0644 \u0634\u0647\u0631",
        plan: "\u064a\u062e\u0637\u0637",
        plan_amount_cannot_be_changes:
          "\u0645\u0644\u0627\u062d\u0638\u0629: - \u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u063a\u064a\u064a\u0631 \u0645\u0628\u0644\u063a \u0627\u0644\u062e\u0637\u0629.",
        pricing: "\u0627\u0644\u062a\u0633\u0639\u064a\u0631",
        processing: "\u064a\u0639\u0627\u0644\u062c",
        purchase:
          "\u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u0634\u0631\u0627\u0621",
        renews_on: "\u064a\u062c\u062f\u062f \u0641\u064a",
        subscription_cancelled:
          "\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
        subscriptions:
          "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a",
      },
      plans: "\u0627\u0644\u062e\u0637\u0637",
      position: {
        edit_position:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0648\u0638\u064a\u0641\u0629",
        new_position: "\u0645\u0646\u0635\u0628 \u062c\u062f\u064a\u062f",
        position: "\u0645\u0648\u0636\u0639",
      },
      positions: "\u0627\u0644\u0645\u0646\u0627\u0635\u0628",
      post: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        blog: "\u0645\u062f\u0648\u0646\u0629",
        comment: "\u062a\u0639\u0644\u064a\u0642",
        comments: "\u062a\u0639\u0644\u064a\u0642\u0627\u062a",
        description: "\u0648\u0635\u0641",
        edit_post:
          "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0646\u0634\u0648\u0631",
        image: "\u0635\u0648\u0631\u0629",
        new_post: "\u0645\u0646\u0634\u0648\u0631 \u062c\u062f\u064a\u062f",
        no_posts_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0634\u0627\u0631\u0643\u0627\u062a \u0645\u062a\u0627\u062d\u0629",
        no_posts_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u064a\u0629 \u0645\u0646\u0634\u0648\u0631\u0627\u062a",
        post: "\u0628\u0631\u064a\u062f",
        post_a_comments:
          "\u0627\u0646\u0634\u0631 \u062a\u0639\u0644\u064a\u0642",
        post_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0646\u0634\u0648\u0631",
        posts: "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0627\u062a",
        select_post_categories:
          "\u062d\u062f\u062f \u0641\u0626\u0627\u062a \u0627\u0644\u0646\u0634\u0631",
        show_post: "\u0628\u0631\u064a\u062f",
        title: "\u0639\u0646\u0648\u0627\u0646",
      },
      post_category: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_post_category:
          "\u062a\u062d\u0631\u064a\u0631 \u0641\u0626\u0629 \u0627\u0644\u0645\u0646\u0634\u0648\u0631",
        name: "\u0627\u0633\u0645",
        new_post_category:
          "\u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_post_category_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0626\u0629 \u0648\u0638\u064a\u0641\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_post_category_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0641\u0626\u0629 \u0648\u0638\u064a\u0641\u0629",
        post_categories:
          "\u0641\u0626\u0627\u062a \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
        post_category:
          "\u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
        post_category_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
        show_post_category:
          "\u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
      },
      post_comment: {
        post_comment: "\u0623\u0636\u0641 \u062a\u0639\u0644\u064a\u0642\u0627",
        post_comment_details:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0627 \u0628\u0639\u062f \u0627\u0644\u062a\u0639\u0644\u064a\u0642",
      },
      post_comments:
        "\u0627\u0643\u062a\u0628 \u062a\u0639\u0644\u064a\u0642\u0627",
      pricing_table: { get_started: "\u0627\u0644\u0628\u062f\u0621" },
      pricings_table:
        "\u062c\u062f\u0648\u0644 \u0627\u0644\u062a\u0633\u0639\u064a\u0631",
      professional_skills:
        "\u0645\u0647\u0627\u0631\u0627\u062a \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629",
      profile:
        "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
      recent_blog:
        "\u0645\u062f\u0648\u0646\u0629 \u062d\u062f\u064a\u062b\u0629",
      reported_jobs:
        "\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0628\u0644\u063a \u0639\u0646\u0647\u0627",
      required_degree_level: {
        edit_required_degree_level:
          "\u062a\u062d\u0631\u064a\u0631 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629",
        name: "\u0627\u0633\u0645",
        new_required_degree_level:
          "\u0645\u0633\u062a\u0648\u0649 \u062f\u0631\u062c\u0629 \u062c\u062f\u064a\u062f",
        no_degree_level_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0633\u062a\u0648\u0649 \u062f\u0631\u062c\u0629 \u0645\u062a\u0627\u062d",
        no_degree_level_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0639\u0644\u0645\u064a\u0629",
        show_required_degree_level:
          "\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u062c\u0629",
      },
      required_degree_levels:
        "\u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0627\u0644\u062f\u0631\u062c\u0629",
      resumes: {
        candidate_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0634\u062d",
        file: "\u0645\u0644\u0641",
        name: "\u0627\u0633\u0645",
        no_resume_available:
          "\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u0645\u062a\u0627\u062d",
        no_resume_found: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641",
        resume_name: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641",
      },
      salary_currencies:
        "\u0639\u0645\u0644\u0627\u062a \u0627\u0644\u0631\u0627\u062a\u0628",
      salary_currency: {
        currency_code:
          "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629",
        currency_icon:
          "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629",
        currency_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u0644\u0629",
        edit_salary_currency:
          "\u062a\u062d\u0631\u064a\u0631 \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        new_salary_currency:
          "\u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_salary_currency_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u0645\u062a\u0627\u062d\u0629",
        no_salary_currency_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
      },
      salary_period: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_salary_period:
          "\u062a\u062d\u0631\u064a\u0631 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        new_salary_period:
          "\u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
        no_salary_period_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u062a\u0631\u0629 \u0631\u0627\u062a\u0628 \u0645\u062a\u0627\u062d\u0629",
        no_salary_period_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        period: "\u0641\u062a\u0631\u0629",
        salary_period_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0641\u062a\u0631\u0629 \u0627\u0644\u0631\u0627\u062a\u0628",
        size: "\u0628\u062d\u062c\u0645",
      },
      salary_periods:
        "\u0641\u062a\u0631\u0627\u062a \u0627\u0644\u0631\u0627\u062a\u0628",
      see_all_plans:
        "\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u062e\u0637\u0637",
      selected_candidate:
        "\u0627\u0644\u0645\u0631\u0634\u062d \u0627\u0644\u0645\u062e\u062a\u0627\u0631",
      setting: {
        about_us:
          "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646\u0627",
        address: "\u0639\u0646\u0648\u0627\u0646",
        application_name:
          "\u0627\u0633\u0645 \u0627\u0644\u062a\u0637\u0628\u064a\u0642",
        choose: "\u0623\u062e\u062a\u0631",
        company_description:
          "\u0648\u0635\u0641 \u0627\u0644\u0634\u0631\u0643\u0629",
        company_url:
          "\u0639\u0646\u0648\u0627\u0646 url \u0644\u0644\u0634\u0631\u0643\u0629",
        configuration_update:
          "\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u062a\u0643\u0648\u064a\u0646",
        cookie: "\u0628\u0633\u0643\u0648\u064a\u062a",
        disable_cookie:
          "\u062a\u0639\u0637\u064a\u0644 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
        disable_edit:
          "\u062a\u0639\u0637\u064a\u0644 \u0627\u0644\u062a\u062d\u0631\u064a\u0631",
        email:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        enable_cookie:
          "\u062a\u0645\u0643\u064a\u0646 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
        enable_edit:
          "\u062a\u0645\u0643\u064a\u0646 \u0627\u0644\u062a\u062d\u0631\u064a\u0631",
        enable_google_recaptcha:
          "\u062a\u0645\u0643\u064a\u0646 Google reCAPTCHA \u0644\u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0639\u0645\u0644 \u0648\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0645\u0631\u0634\u062d \u0648\u0634\u0627\u0634\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0646\u0627.",
        facebook: "\u0628\u0631\u064a\u062f",
        facebook_app_id:
          "\u0645\u0639\u0631\u0641 \u062a\u0637\u0628\u064a\u0642 Facebook",
        facebook_app_secret:
          "\u0633\u0631 \u062a\u0637\u0628\u064a\u0642 Facebook",
        facebook_redirect:
          "\u0625\u0639\u0627\u062f\u0629 \u062a\u0648\u062c\u064a\u0647 Facebook",
        facebook_url: "URL \u0627\u0644\u0641\u064a\u0633\u0628\u0648\u0643",
        favicon: "\u0641\u0627\u0641\u064a\u0643\u0648\u0646",
        front_settings:
          "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0623\u0645\u0627\u0645\u064a\u0629",
        general: "\u062c\u0646\u0631\u0627\u0644 \u0644\u0648\u0627\u0621",
        google: "\u062c\u0648\u062c\u0644",
        google_client_id:
          "\u0645\u0639\u0631\u0651\u0641 \u0639\u0645\u064a\u0644 \u062c\u0648\u062c\u0644",
        google_client_secret:
          "\u0633\u0631 \u0639\u0645\u064a\u0644 \u062c\u0648\u062c\u0644",
        google_plus_url: "\u062c\u0648\u062c\u0644 \u0628\u0644\u0633 URL",
        google_redirect:
          "\u062c\u0648\u062c\u0644 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0648\u062c\u064a\u0647",
        image_validation:
          "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0642\u064a\u0627\u0633 90 \u00d7 60 \u0628\u0643\u0633\u0644.",
        linkedIn_url: "\u064a\u0646\u0643\u062f\u064a\u0646 URL",
        linkedin: "\u064a\u0646\u0643\u062f\u064a\u0646",
        linkedin_client_id:
          "\u0645\u0639\u0631\u0641 \u064a\u0646\u0643\u062f\u064a\u0646",
        linkedin_client_secret:
          "\u0633\u0631 \u0639\u0645\u064a\u0644 \u064a\u0646\u0643\u062f\u064a\u0646",
        logo: "\u0634\u0639\u0627\u0631",
        mail: "\u0628\u0631\u064a\u062f",
        mail__from_address:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0645\u0646 \u0627\u0644\u0639\u0646\u0648\u0627\u0646",
        mail_host:
          "\u0645\u0636\u064a\u0641 \u0627\u0644\u0628\u0631\u064a\u062f",
        mail_mailer:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0627\u0631\u0633\u0627\u0644",
        mail_password:
          "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0627\u0644\u0628\u0631\u064a\u062f",
        mail_port:
          "\u0645\u0646\u0641\u0630 \u0627\u0644\u0628\u0631\u064a\u062f",
        mail_username:
          "\u0627\u0633\u0645 \u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0628\u0631\u064a\u062f",
        notification_settings:
          "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0625\u0634\u0639\u0627\u0631",
        paypal: "\u0628\u0627\u064a \u0628\u0627\u0644",
        paypal_client_id:
          "\u0645\u0639\u0631\u0641 \u0639\u0645\u064a\u0644 \u0628\u0627\u064a \u0628\u0627\u0644",
        paypal_secret: "\u0633\u0631 \u0628\u0627\u064a \u0628\u0627\u0644",
        phone: "\u0647\u0627\u062a\u0641",
        privacy_policy:
          "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
        pusher: "\u0627\u0646\u062a\u0647\u0627\u0632\u064a",
        pusher_app_cluster:
          "\u0645\u062c\u0645\u0648\u0639\u0629 \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0646\u062a\u0647\u0627\u0632\u064a",
        pusher_app_id:
          "\u0645\u0639\u0631\u0641 \u062a\u0637\u0628\u064a\u0642 \u0627\u0646\u062a\u0647\u0627\u0632\u064a",
        pusher_app_key:
          "\u0645\u0641\u062a\u0627\u062d \u062a\u0637\u0628\u064a\u0642 \u0627\u0646\u062a\u0647\u0627\u0632\u064a",
        pusher_app_secret:
          "\u0633\u0631 \u062a\u0637\u0628\u064a\u0642 \u0627\u0646\u062a\u0647\u0627\u0632\u064a",
        social_settings:
          "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a",
        stripe: "\u0634\u0631\u064a\u0637",
        stripe_key:
          "\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0634\u0631\u064a\u0637",
        stripe_secret_key:
          "\u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0633\u0631\u064a \u0627\u0644\u0634\u0631\u064a\u0637\u064a",
        stripe_webhook_key:
          "\u0645\u0641\u062a\u0627\u062d \u062e\u0637\u0627\u0641 \u0627\u0644\u0648\u064a\u0628 \u0627\u0644\u0634\u0631\u064a\u0637\u064a",
        terms_conditions:
          "\u0627\u0644\u0623\u062d\u0643\u0627\u0645 \u0648\u0627\u0644\u0634\u0631\u0648\u0637",
        twitter_url: "Twitter URL",
        update_application_configuration:
          "\u0623\u0646\u062a \u0639\u0644\u0649 \u0648\u0634\u0643 \u062a\u062d\u062f\u064a\u062b \u0642\u064a\u0645 \u062a\u0643\u0648\u064a\u0646 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u060c \u0647\u0644 \u062a\u0631\u064a\u062f \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629\u061f",
      },
      settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
      skill: {
        action: "\u0639\u0645\u0644",
        add: "\u0623\u0636\u0641",
        description: "\u0648\u0635\u0641",
        edit_skill:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0647\u0627\u0631\u0629",
        name: "\u0627\u0633\u0645",
        new_skill:
          "\u0645\u0647\u0627\u0631\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_skill_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0647\u0627\u0631\u0627\u062a \u0645\u062a\u0627\u062d\u0629",
        no_skill_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u064a \u0645\u0647\u0627\u0631\u0629",
        show_skill: "\u0645\u0647\u0627\u0631\u0629",
        skill_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0647\u0627\u0631\u0629",
      },
      skills: "\u0645\u0647\u0627\u0631\u0627\u062a",
      social_media:
        "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a",
      social_settings:
        "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a",
      state: {
        country_name: "\u0628\u0627\u0633\u0645 \u0627\u0644\u0628\u0644\u062f",
        edit_state:
          "\u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u062f\u0648\u0644\u0629",
        new_state: "\u062f\u0648\u0644\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_state_available:
          "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0644\u0627\u064a\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_state_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0648\u0644\u0627\u064a\u0629",
        state_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0648\u0644\u0627\u064a\u0629",
        states: "\u062a\u0646\u0635 \u0639\u0644\u0649",
      },
      subscribers: "\u0645\u0634\u062a\u0631\u0643\u064a\u0646",
      subscriptions_plans:
        "\u062e\u0637\u0637 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a",
      testimonial: {
        customer_image:
          "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0645\u064a\u0644",
        customer_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0632\u0628\u0648\u0646",
        description: "\u0648\u0635\u0641",
        edit_testimonial:
          "\u062a\u062d\u0631\u064a\u0631 \u0634\u0647\u0627\u062f\u0629",
        new_testimonial:
          "\u0634\u0647\u0627\u062f\u0629 \u062c\u062f\u064a\u062f\u0629",
        no_testimonial_available:
          "\u0644\u0627 \u0634\u0647\u0627\u062f\u0629 \u0645\u062a\u0627\u062d\u0629",
        no_testimonial_found:
          "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0634\u0647\u0627\u062f\u0629",
        testimonial: "\u0634\u0647\u0627\u062f\u0629",
        testimonial_detail:
          "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0634\u0647\u0627\u062f\u0629",
        testimonials:
          "\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a - \u0627\u0644\u062a\u0648\u0635\u064a\u0627\u062a",
      },
      testimonials:
        "\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a - \u0627\u0644\u062a\u0648\u0635\u064a\u0627\u062a",
      tooltip: {
        change_app_logo:
          "\u062a\u063a\u064a\u064a\u0631 \u0634\u0639\u0627\u0631 \u0627\u0644\u062a\u0637\u0628\u064a\u0642",
        change_favicon:
          "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0623\u064a\u0642\u0648\u0646\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
        change_home_banner:
          "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0645\u0646\u0632\u0644 banner",
        change_image:
          "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629",
        change_profile:
          "\u062a\u063a\u064a\u064a\u0631 \u0645\u0644\u0641 \u0627\u0644\u062a\u0643\u0648\u064a\u0646",
        copy_preview_link:
          "\u0646\u0633\u062e \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629",
      },
      transaction: {
        approved: "\u0648\u0627\u0641\u0642",
        denied: "\u0631\u0641\u0636",
        invoice: "\u0641\u0627\u062a\u0648\u0631\u0629",
        payment_approved:
          "\u062d\u0627\u0644\u0629 \u0627\u0644\u0633\u062f\u0627\u062f",
        plan_name: "\u0627\u0633\u0645 \u0627\u0644\u062e\u0637\u0629",
        select_manual_payment:
          "\u062d\u062f\u062f \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u064a\u062f\u0648\u064a",
        subscription_id: "\u0627\u0633\u0645 \u0627\u0644\u062e\u0637\u0629",
        transaction_date:
          "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0635\u0641\u0642\u0629",
        type: "\u064a\u0643\u062a\u0628",
        user_name: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0638\u0641",
      },
      transactions: "\u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a",
      translation_manager:
        "\u0645\u062f\u064a\u0631 \u0627\u0644\u062a\u0631\u062c\u0645\u0629",
      user: {
        change_password:
          "\u063a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631",
        edit_profile:
          "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
        email:
          "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
        first_name:
          "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0627\u0648\u0644",
        last_name: "\u0627\u0644\u0643\u0646\u064a\u0629",
        logout: "\u062a\u0633\u062c\u064a\u0644 \u062e\u0631\u0648\u062c",
        name: "\u0627\u0633\u0645",
        password: "\u0643\u0644\u0645\u0647 \u0627\u0644\u0633\u0631",
        password_confirmation:
          "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
        phone: "\u0647\u0627\u062a\u0641",
        profile_picture:
          "\u0627\u0644\u0635\u0648\u0631\u0647 \u0627\u0644\u0634\u062e\u0635\u064a\u0647",
        required_field_messages:
          "\u064a\u0631\u062c\u0649 \u0645\u0644\u0621 \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.",
        user_name:
          "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645",
      },
      user_language: {
        change_language:
          "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0644\u063a\u0629",
        language: "\u0644\u063a\u0629",
      },
      weekdays: {
        fri: "\u0627\u0644\u0627\u0628",
        mon: "\u0645",
        sat: "\u0633",
        sun: "\u0633",
        thu: "\u062a\u064a",
        tue: "\u062a\u064a",
        wed: "\u062f\u0628\u0644\u064a\u0648",
      },
      your_cv:
        "\u0627\u0644\u0633\u064a\u0631\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643",
    },
    "ar.pagination": {
      next: "\u0627\u0644\u062a\u0627\u0644\u0649 &raquo;",
      previous: "&laquo; \u0627\u0644\u0633\u0627\u0628\u0642",
    },
    "ar.validation": {
      accepted:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0642\u0628\u0648\u0644\u0647.",
      active_url:
        "\u0627\u0644 attribute: \u0644\u064a\u0633 \u0639\u0646\u0648\u0627\u0646 URL \u0635\u0627\u0644\u062d\u064b\u0627.",
      after:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e\u064b\u0627 \u0628\u0639\u062f date:.",
      after_or_equal:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e\u064b\u0627 \u0628\u0639\u062f \u0623\u0648 \u064a\u0633\u0627\u0648\u064a date:.",
      alpha:
        "\u0627\u0644 attribute: \u0642\u062f \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0623\u062d\u0631\u0641 \u0641\u0642\u0637.",
      alpha_dash:
        "\u0627\u0644 attribute: \u0642\u062f \u062a\u062d\u062a\u0648\u064a \u0641\u0642\u0637 \u0639\u0644\u0649 \u0623\u062d\u0631\u0641 \u0648\u0623\u0631\u0642\u0627\u0645 \u0648\u0634\u0631\u0637\u0627\u062a \u0648\u0634\u0631\u0637\u0627\u062a \u0633\u0641\u0644\u064a\u0629.",
      alpha_num:
        "\u0627\u0644 attribute: \u0642\u062f \u062a\u062d\u062a\u0648\u064a \u0641\u0642\u0637 \u0639\u0644\u0649 \u0623\u062d\u0631\u0641 \u0648\u0623\u0631\u0642\u0627\u0645.",
      array:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0645\u0635\u0641\u0648\u0641\u0629.",
      attributes: [],
      before:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e \u0642\u0628\u0644 date:.",
      before_or_equal:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e\u064b\u0627 \u0642\u0628\u0644 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a date:.",
      between: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0628\u064a\u0646 min: \u0648 max: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0627\u0646 \u064a\u0643\u0648\u0646 \u0648\u0633\u0637\u0627 min: \u0648 max: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0627\u0646 \u064a\u0643\u0648\u0646 \u0648\u0633\u0637\u0627 min: \u0648 max:.",
        string:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0627\u0646 \u064a\u0643\u0648\u0646 \u0648\u0633\u0637\u0627 min: \u0648 max: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      boolean:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u062d\u0642\u0644 \u0635\u062d\u064a\u062d\u064b\u0627 \u0623\u0648 \u062e\u0637\u0623.",
      confirmed:
        "\u0627\u0644 attribute: \u0627\u0644\u062a\u0623\u0643\u064a\u062f \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "\u0627\u0644 attribute: \u0647\u0630\u0627 \u0644\u064a\u0633 \u062a\u0627\u0631\u064a\u062e \u0635\u062d\u064a\u062d.",
      date_equals:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u062a\u0627\u0631\u064a\u062e\u064b\u0627 \u0645\u0633\u0627\u0648\u064a\u064b\u0627 \u0644\u0640 date:.",
      date_format:
        "\u0627\u0644 attribute: \u0644\u0627 \u064a\u062a\u0637\u0627\u0628\u0642 \u0645\u0639 \u0627\u0644\u0634\u0643\u0644 format:.",
      different:
        "\u0627\u0644 attribute: \u0648 other: \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0645\u062e\u062a\u0644\u0641.",
      digits:
        "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0648\u0623\u0646 digits: \u0623\u0631\u0642\u0627\u0645.",
      digits_between:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0627\u0646 \u064a\u0643\u0648\u0646 \u0648\u0633\u0637\u0627 min: \u0648 max: \u0623\u0631\u0642\u0627\u0645.",
      dimensions:
        "\u0627\u0644 attribute: \u0623\u0628\u0639\u0627\u062f \u0627\u0644\u0635\u0648\u0631\u0629 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629.",
      distinct:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0644\u0647 \u0642\u064a\u0645\u0629 \u0645\u0643\u0631\u0631\u0629.",
      email:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0646\u0648\u0627\u0646 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u0627\u0644\u062d.",
      ends_with:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0646\u062a\u0647\u064a \u0628\u0648\u0627\u062d\u062f \u0645\u0645\u0627 \u064a\u0644\u064a: values:.",
      exists:
        "\u0627\u0644 \u0627\u0644\u0645\u062d\u062f\u062f attribute: \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0645\u0644\u0641\u064b\u0627.",
      filled:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0644\u0644\u062d\u0642\u0644 \u0642\u064a\u0645\u0629.",
      gt: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u062b\u0631 \u0645\u0646 value: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0643\u064a\u0644\u0648 value: \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 value:.",
        string:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 value: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      gte: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0627\u0646 \u064a\u0645\u0644\u0643 value: \u0645\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0623\u0648 \u0623\u0643\u062b\u0631.",
        file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value:.",
        string:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      image:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0635\u0648\u0631\u0629.",
      in: "\u0627\u0644 \u0627\u0644\u0645\u062d\u062f\u062f attribute: \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      in_array:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f \u0641\u064a other:.",
      integer:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0635\u062d\u064a\u062d\u0627.",
      ip: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0646\u0648\u0627\u0646 IP \u0635\u0627\u0644\u062d\u064b\u0627.",
      ipv4: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0646\u0648\u0627\u0646 IPv4 \u0635\u0627\u0644\u062d\u064b\u0627.",
      ipv6: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0646\u0648\u0627\u0646 IPv6 \u0635\u0627\u0644\u062d\u064b\u0627.",
      json: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0633\u0644\u0633\u0644\u0629 JSON \u0635\u0627\u0644\u062d\u0629.",
      lt: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 value: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 value: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 value:.",
        string:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 value: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      lte: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0644\u0627 \u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0623\u0643\u062b\u0631 \u0645\u0646 value: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0635\u063a\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0635\u063a\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value:.",
        string:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0635\u063a\u0631 \u0645\u0646 \u0623\u0648 \u064a\u0633\u0627\u0648\u064a value: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      max: {
        array:
          "\u0627\u0644 attribute: \u0642\u062f \u0644\u0627 \u064a\u0643\u0648\u0646 \u0623\u0643\u062b\u0631 \u0645\u0646 max: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u0642\u062f \u0644\u0627 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 max: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u0642\u062f \u0644\u0627 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 max:.",
        string:
          "\u0627\u0644 attribute: \u0642\u062f \u0644\u0627 \u064a\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 max: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      mimes:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0645\u0644\u0641\u064b\u0627 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639: values:.",
      mimetypes:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0645\u0644\u0641\u064b\u0627 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639: values:.",
      min: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 min: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 min: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 min:.",
        string:
          "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0623\u0646 \u064a\u0643\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 min: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      not_in:
        "\u0627\u0644 \u0627\u0644\u0645\u062d\u062f\u062f attribute: \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      not_regex:
        "\u0627\u0644 attribute: \u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      numeric:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0631\u0642\u0645\u0627.",
      password:
        "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629.",
      present:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u062d\u0642\u0644 \u0645\u0648\u062c\u0648\u062f\u064b\u0627.",
      regex:
        "\u0627\u0644 attribute: \u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      required:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628.",
      required_if:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628 \u0639\u0646\u062f\u0645\u0627 other: \u064a\u0643\u0648\u0646 value:.",
      required_unless:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628 \u0645\u0627 \u0644\u0645 \u064a\u0643\u0646 other: \u0641\u064a \u062f\u0627\u062e\u0644 values:.",
      required_with:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628 \u0639\u0646\u062f\u0645\u0627 values: \u062d\u0627\u0636\u0631.",
      required_with_all:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628 \u0639\u0646\u062f\u0645\u0627 values: \u062d\u0627\u0636\u0631\u0648\u0646.",
      required_without:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628 \u0639\u0646\u062f\u0645\u0627 values: \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f.",
      required_without_all:
        "\u0627\u0644 attribute: \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628\u064b\u0627 \u0641\u064a \u062d\u0627\u0644\u0629 \u0639\u062f\u0645 \u0648\u062c\u0648\u062f \u0623\u064a \u0645\u0646 values: \u062d\u0627\u0636\u0631\u0648\u0646.",
      same: "\u0627\u0644 attribute: \u0648 other: \u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0637\u0627\u0628\u0642.",
      size: {
        array:
          "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 size: \u0627\u0644\u0639\u0646\u0627\u0635\u0631.",
        file: "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0648\u0623\u0646 size: \u0643\u064a\u0644\u0648 \u0628\u0627\u064a\u062a.",
        numeric:
          "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0648\u0623\u0646 size:.",
        string:
          "\u0627\u0644 attribute: \u0644\u0627 \u0628\u062f \u0648\u0623\u0646 size: \u0627\u0644\u0634\u062e\u0635\u064a\u0627\u062a.",
      },
      starts_with:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0628\u062f\u0623 \u0628\u0648\u0627\u062d\u062f \u0645\u0645\u0627 \u064a\u0644\u064a: values:.",
      string:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0633\u0644\u0633\u0644\u0629.",
      timezone:
        "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0645\u0646\u0637\u0642\u0629 \u0635\u0627\u0644\u062d\u0629.",
      unique:
        "\u0627\u0644 attribute: \u0644\u0642\u062f \u0627\u062a\u062e\u0630\u062a \u0628\u0627\u0644\u0641\u0639\u0644.",
      uploaded:
        "\u0627\u0644 attribute: \u0641\u0634\u0644 \u0627\u0644\u062a\u062d\u0645\u064a\u0644.",
      url: "\u0627\u0644 attribute: \u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d.",
      uuid: "\u0627\u0644 attribute: \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 UUID \u0635\u0627\u0644\u062d\u064b\u0627.",
    },
    "de.messages": {
      about_us: "\u00dcber uns",
      about_us_services: "\u00dcber uns Dienstleistungen",
      admin_dashboard: {
        active_jobs: "Aktiv Jobs",
        active_users: "Aktiv Benutzer",
        featured_employers: "Vorgestellte Arbeitgeber",
        featured_employers_incomes: "Einkommen der empfohlenen Arbeitgeber",
        featured_jobs: "Vorgestellt Jobs",
        featured_jobs_incomes: "Ausgew\u00e4hlte Jobs Einkommen",
        post_statistics: "Beitragsstatistik",
        recent_candidates: "Aktuelle Kandidaten",
        recent_employers: "Aktuelle Arbeitgeber",
        recent_jobs: "K\u00fcrzlich Arbeitspl\u00e4tze",
        registered_candidates: "Registrierte Kandidaten",
        registered_employer: "Registrierte Arbeitgeber",
        subscription_incomes: "Abonnement-Einkommen",
        today_jobs: "Heute Jobs",
        total_active_jobs: "Insgesamt aktive Jobs",
        total_candidates: "Gesamtzahl der Kandidaten",
        total_employers: "Arbeitgeber insgesamt",
        total_users: "Gesamt Benutzer",
        verified_users: "Verifiziert Benutzer",
        weekly_users: "W\u00f6chentliche Benutzer",
      },
      all_resumes: "Alle Lebensl\u00e4ufe",
      all_rights_reserved: "Alle Rechte vorbehalten",
      applied_job: {
        applied_jobs: "Angewandte Jobs",
        companies: "Firmen",
        job: "Trabajo",
        notes: "Notizen",
      },
      apply_job: {
        apply_job: "Job bewerben",
        notes: "Notizen",
        resume: "Fortsetzen",
      },
      blog_categories: "Blog-Kategorien",
      blogs: "Blogs",
      branding_slider: {
        brand: "Marke",
        edit_branding_slider: "Branding Slider bearbeiten",
        new_branding_slider: "Neuer Branding Slider",
        no_branding_slider_available:
          "Kein Branding-Schieberegler verf\u00fcgbar",
        no_branding_slider_found: "Kein Branding-Schieberegler gefunden",
      },
      branding_sliders: "Marken-Schieberegler",
      brands: "Marken",
      candidate: {
        address: "Adresse",
        admins: "Admins",
        available_at: "Verf\u00fcgbar um",
        birth_date: "Geburtsdatum",
        candidate_details: "Kandidatendetails",
        candidate_language: "Sprachen",
        candidate_skill: "F\u00e4higkeit",
        candidates: "Kandidaten",
        career_level: "Karrierestufe",
        conform_password: "Passwort anpassen",
        current_salary: "Current Salary",
        dashboard: "Instrumententafel",
        edit_admin: "Administrator bearbeiten",
        edit_candidate: "Kandidat bearbeiten",
        edit_profile_information: "Profilinformationen bearbeiten",
        education_not_found: "Keine Ausbildung verf\u00fcgbar.",
        email: "Email",
        email_verified: "Email \u00fcberpr\u00fcft",
        employee: "Angestellter",
        expected_salary: "Erwartetes Gehalt",
        experience: "Erfahrung",
        experience_not_found: "Keine Erfahrung verf\u00fcgbar.",
        expired_job: "Abgelaufene Stelle",
        father_name: "vaters name",
        first_name: "Vorname",
        functional_area: "Funktionsbereich",
        gender: "Geschlecht",
        immediate_available: "Sofort verf\u00fcgbar",
        in_year: "In Jahren",
        industry: "Industrie",
        is_active: "Ist aktiv",
        is_verified: "Wird \u00fcberpr\u00fcft",
        job_alert_message:
          "Benachrichtigen Sie mich per E-Mail, wenn ein Job ver\u00f6ffentlicht wird, der f\u00fcr meine Wahl relevant ist.",
        last_name: "Nachname",
        marital_status: "Familienstand",
        national_id_card: "Personalausweis",
        nationality: "Nationalit\u00e4t",
        new_admin: "Neuer Administrator",
        new_candidate: "Neuer Kandidat",
        no_candidate_available: "Kein Kandidat verf\u00fcgbar",
        no_candidate_found: "Kein Kandidat gefunden",
        no_reported_candidates_available:
          "Kein Kandidat gemeldet verf\u00fcgbar",
        no_reported_candidates_found: "Kein gemeldeter Kandidat gefunden",
        not_immediate_available: "Nicht sofort verf\u00fcgbar",
        password: "Passwort",
        phone: "Telefon",
        profile: "Profil",
        reporte_to_candidate: "Bereits gemeldet",
        reported_candidate: "Gemeldeter Kandidat",
        reported_candidate_detail: "Berichtete Kandidatendetails",
        reported_candidates: "Gemeldete Kandidaten",
        reported_employer: "Gemeldeter Arbeitgeber",
        resume_not_found: "Kein Lebenslauf verf\u00fcgbar.",
        salary_currency: "Gehaltsw\u00e4hrung",
        salary_per_month: "Gehalt pro Monat.",
        select_candidate: "W\u00e4hlen Sie Kandidat aus",
      },
      candidate_dashboard: {
        followings: "Folgen",
        location_information: "Standortinformationen nicht verf\u00fcgbar.",
        my_cv_list: "Meine Lebenslaufliste",
        no_not_available: "Nummer nicht verf\u00fcgbar.",
        profile_views: "Profilansichten",
      },
      candidate_profile: {
        Degree_Title: "Titel des Abschlusses",
        Degree_level: "Degree Level",
        add_education: "Bildung hinzuf\u00fcgen",
        add_experience: "Erfahrung hinzuf\u00fcgen",
        age: "Das Alter",
        company: "Firma",
        currently_working: "Derzeit arbeitend",
        description: "Beschreibung",
        edit_education: "Bildung bearbeiten",
        edit_experience: "Edit Experience",
        education: "Bildung",
        end_date: "Endtermin",
        experience: "Erfahrung",
        experience_title: "erfahrungstitel",
        institute: "Institut",
        online_profile: "Online Profil",
        present: "Geschenk",
        result: "Ergebnis",
        select_year: "Jahr ausw\u00e4hlen",
        start_date: "Startdatum",
        title: "Titel",
        upload_resume: "Upload Resume",
        work_experience: "Berufserfahrung",
        year: "Jahr",
        years: "Jahre",
      },
      candidates: "Kandidaten",
      career_informations: "Karriereinformationen",
      career_level: {
        edit_career_level: "Karriereebene bearbeiten",
        level_name: "Level Name",
        new_career_level: "New Career Level",
        no_career_level_available: "Keine Karrierestufe verf\u00fcgbar",
        no_career_level_found: "Keine Karrierestufe gefunden",
      },
      career_levels: "Karrierestufen",
      careers_levels: "Karrierestufen",
      city: {
        cities: "St\u00e4dte",
        city_name: "Stadtname",
        edit_city: "Stadt bearbeiten",
        new_city: "Neue Stadt",
        no_city_available: "Keine Stadt verf\u00fcgbar",
        no_city_found: "Keine Stadt gefunden",
        state_name: "Statusname",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "\u00dcber Beschreibung Eins",
        about_desc_three: "\u00dcber Beschreibung Drei",
        about_desc_two: "\u00dcber Beschreibung Zwei",
        about_image_one: "\u00dcber Bild eins",
        about_image_three: "\u00dcber Bild drei",
        about_image_two: "\u00dcber Bild zwei",
        about_title_one: "\u00dcber Titel eins",
        about_title_three: "\u00dcber Titel Drei",
        about_title_two: "\u00dcber den zweiten Titel",
      },
      cms_service: {
        choose: "W\u00e4hlen",
        home_banner: "Home-Banner",
        home_description: "Startseite Beschreibung",
        home_title: "Startseite Titel",
      },
      cms_services: "CMS-Dienste",
      cms_sliders: "CMS-Schieberegler",
      common: {
        action: "Aktion",
        active: "Aktiv",
        add: "Hinzuf\u00fcgen",
        admin_name: "Administratorname",
        all: "Alle",
        and_time: "und Zeit",
        applied: "Angewandt",
        applied_on: "Aufgetragen auf",
        apply: "Sich bewerben",
        approved_by: "Genehmigt durch",
        are_you_sure: "M\u00f6chten Sie dies wirklich l\u00f6schen?",
        are_you_sure_want_to_delete:
          "M\u00f6chtest du das wirklich l\u00f6schen ",
        are_you_sure_want_to_reject: "M\u00f6chtest du das wirklich ablehnen",
        are_you_sure_want_to_select:
          "M\u00f6chten Sie dies wirklich ausw\u00e4hlen?",
        back: "Zur\u00fcck",
        cancel: "Abbrechen",
        category_image: "Kategoriebild",
        choose: "w\u00e4hlen",
        choose_file: "Datei w\u00e4hlen",
        close: "Schlie\u00dfen",
        completed: "abgeschlossen",
        copyright: "Urheberrechte",
        created_date: "Erstellungsdatum",
        created_on: "Erstellt am",
        custom: "Brauch",
        de_active: "Deaktivieren",
        decline: "ablehnen",
        declined: "Zur\u00fcckgegangen",
        default_country_code: "Standard-L\u00e4ndercode",
        delete: "L\u00f6schen",
        deleted: "Gel\u00f6scht",
        description: "Beschreibung",
        design_by: "Design von",
        design_by_name: "InfyOm-Labs.",
        download: "Herunterladen",
        drafted: "Eingezogen",
        edit: "Bearbeiten",
        email: "Email",
        error: "Fehler",
        expire: "Erl\u00f6schen",
        export_excel: "Nach Excel exportieren",
        female: "weiblich",
        filter_options: "Filteroptionen",
        filters: "Filter",
        from: "Aus",
        has_been_deleted: " wurde gel\u00f6scht.",
        has_been_rejected: "wurde abgelehnt.",
        has_been_selected: "wurde ausgew\u00e4hlt.",
        hello: "Hallo",
        hi: "Hallo",
        hired: "Gemietet",
        image_aspect_ratio: "Das Bildseitenverh\u00e4ltnis sollte 1:1 sein.",
        image_file_type:
          "Das Bild muss eine Datei des Typs sein: jpeg, jpg, png.",
        last_change_by: "Letzte \u00c4nderungen vony",
        last_updated: "Zuletzt aktualisiert",
        live: "Leben",
        login: "Anmeldung",
        male: "m\u00e4nnlich",
        "n/a": "N/A",
        name: "Name",
        no: "nein",
        no_cancel: "Nein, Abbrechen",
        not_verified: "Not Verified",
        note: "Notiz",
        note_message: "Bitte Kurzcode der Sprache eingeben. dh Englisch = en.",
        ok: "OK",
        ongoing: "Laufend",
        open: "\u00f6ffnen",
        pause: "Pause",
        paused: "Pause",
        preview: "Vorschau",
        print: "Drucken",
        process: "Wird bearbeitet...",
        reason: "Grund",
        register: "Registrieren",
        rejected: "abgelehnt",
        report: "Bericht",
        resend_verification_mail: "Best\u00e4tigungsmail erneut senden",
        reset: "Zur\u00fccksetzen",
        save: "speichern",
        save_as_draft: "Als Entwurf speichern",
        saved_successfully: " Erfolgreich gespeichert",
        search: "Suche",
        select_job_stage: "W\u00e4hlen Sie Jobphase aus",
        selected: "Ausgew\u00e4hlt",
        shortlist: "Auswahlliste",
        show: "Zeigen",
        status: "Status",
        success: " Erfolgreich",
        to: "Zu",
        updated_successfully: " Erfolgreich geupdated",
        verified: "Verifiziert",
        view: "Aussicht",
        view_more: "Mehr anzeigen",
        view_profile: "Name anzeigen",
        welcome: "Willkommen",
        yes: "ja",
        yes_delete: "Ja, l\u00f6schen!",
        you_cancel_slot_date: "Sie stornieren diesen Slot f\u00fcr ein Datum",
      },
      companies: "Firmen",
      company: {
        candidate_email: "Kandidaten-E-Mail",
        candidate_name: "Kandidatenname",
        candidate_phone: "Kandidatentelefon",
        ceo: "Name des CEO",
        ceo_name: "CEO-Name",
        city: "Stadt",
        company_details: "Firmendetails",
        company_listing: "Firmenliste",
        company_logo: "Logo",
        company_name: "Firmenname",
        company_size: "Gr\u00f6\u00dfe",
        confirm_password: "Best\u00e4tigen Passwort",
        country: "Land",
        current_password: "Jetziges Passwort",
        edit_company: "Firma bearbeiten",
        edit_employer: "Arbeitgeber bearbeiten",
        email: "Email",
        email_verified: "Email \u00fcberpr\u00fcft",
        employer: "Arbeitgeber",
        employer_ceo: "Arbeitgeber CEO",
        employer_details: "Angaben zum Arbeitgeber",
        employer_name: "Name des Arbeitgebers",
        employers: "Arbeitgeber",
        enter_experience_year: "Geben Sie Erfahrung im Jahr ein",
        established_in: "Etabliert Im",
        established_year: "Sie Gr\u00fcndungsjahr",
        facebook_url: "Facebook URL",
        fax: "Fax",
        followers: "Follower",
        google_plus_url: "Google Plus-URL",
        image: "Bild",
        industry: "Industrie",
        is_active: "Ist Aktiv",
        is_featured: "Ist Vorgestellt",
        linkedin_url: "Linkedin-URL",
        location: "Ort",
        location2: "2. B\u00fcrostandort",
        name: "Nname",
        new_company: "Neu Unternehmen",
        new_employer: "Neuer Arbeitgeber",
        new_password: "Neues Passwort",
        no_employee_found: "Kein Mitarbeiter gefunden",
        no_employee_reported_available:
          "Keine Mitarbeiterberichte verf\u00fcgbar",
        no_employer_available: "Keine Mitarbeiter verf\u00fcgbar",
        no_of_offices: "Nein von B\u00fcros",
        no_reported_employer_found: "Kein gemeldeter Arbeitgeber gefunden",
        notes: "Anmerkungen",
        offices: "B\u00fcros",
        ownership_type: "Eigentum Type",
        password: "Passwort",
        pinterest_url: "Pinterest-URL",
        report_to_company: "Bericht an Firma",
        reported_by: "Berichtet von",
        reported_companies: "Gemeldete Unternehmen",
        reported_company: "Gemeldete Firma",
        reported_employer_detail: "Gemeldete Arbeitgeberdetails",
        reported_employers: "Gemeldete Arbeitgeber",
        reported_on: "Berichtete \u00fcber",
        select_career_level: "W\u00e4hlen Sie Karrierestufe",
        select_city: "Stadt w\u00e4hlen",
        select_company: "Unternehmen ausw\u00e4hlen",
        select_company_size: "Unternehmensgr\u00f6\u00dfe ausw\u00e4hlen",
        select_country: "Land ausw\u00e4hlen",
        select_currency: "W\u00e4hrung w\u00e4hlen",
        select_degree_level: "W\u00e4hlen Sie die Studienstufe aus",
        select_employer_size: "W\u00e4hlen Sie Arbeitgebergr\u00f6\u00dfe aus",
        select_established_year: "W\u00e4hlen Sie Gr\u00fcndungsjahr",
        select_functional_area: "W\u00e4hlen Sie Funktionsbereich aus",
        select_gender: "W\u00e4hle Geschlecht",
        select_industry: "Branche ausw\u00e4hlen",
        select_job_category: "Jobkategorie ausw\u00e4hlen",
        select_job_shift: "W\u00e4hlen Sie Jobschicht aus",
        select_job_type: "Jobtyp ausw\u00e4hlen",
        select_language: "Sprache ausw\u00e4hlen",
        select_marital_status: "W\u00e4hlen Sie Familienstand",
        select_ownership_type: "W\u00e4hlen Sie den Eigentumstyp aus",
        select_position: "Position ausw\u00e4hlen",
        select_salary_period: "Gehaltszeitraum ausw\u00e4hlen",
        select_state: "Staat w\u00e4hlen",
        state: "Zustand",
        title: "Berufsbezeichnung",
        twitter_url: "Twitter-URL",
        website: "Webseite",
      },
      company_size: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        company_size: "Firmengr\u00f6\u00dfe",
        edit_company_size: "Unternehmensgr\u00f6\u00dfe bearbeiten",
        new_company_size: "Neue Unternehmensgr\u00f6\u00dfe",
        no_company_size_available:
          "Keine Unternehmensgr\u00f6\u00dfe verf\u00fcgbar",
        no_company_size_found: "Keine Unternehmensgr\u00f6\u00dfe gefunden",
        show_company_size: "Jobkategorie",
        size: "Gr\u00f6\u00dfe",
      },
      company_sizes: "Unternehmensgr\u00f6\u00dfen",
      country: {
        countries: "L\u00e4nder",
        country_name: "L\u00e4ndername",
        edit_country: "Land bearbeiten",
        new_country: "Neues Land",
        no_country_available: "Kein Land verf\u00fcgbar",
        no_country_found: "Kein Land gefunden",
        phone_code: "Telefoncode",
        short_code: "Funktionscode",
      },
      cv_builder: "Lebenslauf-Ersteller",
      dashboard: "Instrumententafel",
      datepicker: {
        last_month: "Im vergangenen Monat",
        last_week: "Letzte Woche",
        this_month: "Diesen Monat",
        this_week: "In dieser Woche",
        today: "Heute",
      },
      email_template: {
        body: "K\u00f6rper",
        edit_email_template: "E-Mail-Vorlage bearbeiten",
        short_code: "Kurzcode",
        subject: "Betreff",
        template_name: "Vorlagenname",
      },
      email_templates: "E-Mail-Vorlagen",
      employer: { job_stage: "Jobphasen", job_stage_desc: "Beschreibung" },
      employer_dashboard: {
        dashboard: "Instrumententafel",
        followers: "Anh\u00e4nger",
        job_applications: "Bewerbungen",
        open_jobs: "Offene Jobs",
      },
      employer_menu: {
        closed_jobs: "geschlossene Jobs",
        employer_details_field: "Das Feld Arbeitgeberdetails ist erforderlich.",
        employer_profile: "Arbeitgeberprofil",
        enter_description: "Beschreibung eingeben",
        enter_employer_details: "Arbeitgeberdaten eingeben",
        enter_industry_details: "Branchendetails eingeben...",
        enter_ownership_details: "Eigentumsdetails eingeben...",
        expires_on: "L\u00e4uft aus am",
        followers: "Anh\u00e4nger",
        general_dashboard: "Allgemeines Dashboard",
        jobs: "Arbeitspl\u00e4tze",
        manage_subscriptions: "Abonnement verwalten",
        no_data_available: "keine Daten verf\u00fcgbar",
        paused_jobs: "pausierte Jobs",
        recent_follower: "neuer Anh\u00e4nger",
        recent_jobs: "letzte Jobs",
        total_job_applications: "Bewerbungen insgesamt",
        total_jobs: "Gesamtzahl der Arbeitspl\u00e4tze",
        transactions: "Transaktionen",
        valid_facebook_url:
          "Bitte geben Sie eine g\u00fcltige Facebook-URL ein",
        valid_google_plus_url:
          "Bitte geben Sie eine g\u00fcltige Google Plus-URL ein",
        valid_linkedin_url:
          "Bitte geben Sie eine g\u00fcltige Linkedin-URL ein",
        valid_pinterest_url: "Bitte gib eine g\u00fcltige Pinterest-URL ein",
        valid_twitter_url: "Bitte geben Sie eine g\u00fcltige Twitter-URL ein",
      },
      employers: "Arbeitgeber",
      env: "Umgebungseinstellungen",
      expired_jobs: "Abgelaufene Jobs",
      faq: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_faq: "FAQ bearbeiten",
        faq: "FAQ",
        faq_detail: "FAQs Details",
        new_faq: "Neue FAQ",
        no_faq_available: "Keine FAQs verf\u00fcgbar",
        no_faq_found: "Keine FAQs gefunden",
        show_faq: "FAQ",
        title: "Titel",
      },
      favourite_companies: "Lieblingsunternehmen",
      favourite_jobs: "Lieblingsjobs",
      filter_name: {
        closed: "Abgeschlossen",
        country: "Land",
        digital: "DIGITAL",
        drafted: "Eingezogen",
        featured_company: "Hervorgehobenes Unternehmen",
        featured_job: "Top Stellen",
        freelancer_job: "Freiberufler Job",
        immediate: "Sofort",
        job_status: "Beruflicher Status",
        live: "Livin",
        manually: "MANUELL",
        paused: "Angehalten",
        select_featured_company:
          "W\u00e4hlen Sie Vorgestelltes Unternehmen aus",
        select_featured_job: "W\u00e4hlen Sie Ausgew\u00e4hlter Job aus",
        select_status: "Status ausw\u00e4hlen",
        state: "Bundesland",
        status: "Status",
        suspended_job: "Angehaltener Job",
      },
      flash: {
        about_us_update: "\u00dcber uns erfolgreich aktualisiert.",
        admin_cant_delete: "Admin kann nicht gel\u00f6scht werden.",
        admin_delete: "Admin erfolgreich gel\u00f6scht.",
        admin_save: "Admin erfolgreich gespeichert.",
        admin_update: "Admin erfolgreich aktualisiert.",
        all_notification_read: "Alle Benachrichtigungen erfolgreich gelesen.",
        are_you_sure_to_change_status:
          "M\u00f6chten Sie den Status wirklich \u00e4ndern?",
        assigned_slot_not_delete:
          "Zugewiesener Steckplatz sollte nicht gel\u00f6scht werden.",
        attention: "Aufmerksamkeit",
        brand_delete: "Marke erfolgreich gel\u00f6scht.",
        brand_retrieved: "Marke erfolgreich abgerufen.",
        brand_save: "Marke erfolgreich gespeichert.",
        brand_update: "Marke erfolgreich aktualisiert.",
        cancel_reason_require: "Abbruchgrund ist erforderlich.",
        candidate_delete: "Kandidat erfolgreich gel\u00f6scht.",
        candidate_education_delete:
          "Candidate Education erfolgreich gel\u00f6scht.",
        candidate_education_retrieved:
          "Kandidatenausbildung erfolgreich abgerufen.",
        candidate_education_save:
          "Candidate Education erfolgreich hinzugef\u00fcgt.",
        candidate_education_update:
          "Kandidatenausbildung erfolgreich aktualisiert.",
        candidate_experience_delete:
          "Candidate Experience erfolgreich gel\u00f6scht.",
        candidate_experience_retrieved:
          "Candidate Experience erfolgreich abgerufen.",
        candidate_experience_save:
          "Candidate Experience erfolgreich hinzugef\u00fcgt.",
        candidate_experience_update:
          "Candidate Experience erfolgreich aktualisiert.",
        candidate_not_found: "Kandidat nicht gefunden",
        candidate_profile: "Kandidatenprofil erfolgreich aktualisiert.",
        candidate_reported: "Kandidat erfolgreich gemeldet.",
        candidate_retrieved: "Kandidat erfolgreich abgerufen.",
        candidate_save: "Kandidat erfolgreich gespeichert.",
        candidate_update: "Kandidat erfolgreich aktualisiert.",
        career_level_cant_delete:
          "Karrierelevel kann nicht gel\u00f6scht werden.",
        career_level_delete: "Karrierelevel erfolgreich aktualisiert.",
        career_level_retrieved: "Karrierestufe erfolgreich abgerufen.",
        career_level_save: "Karrierelevel erfolgreich hinzugef\u00fcgt.",
        career_level_update: "Karrierelevel erfolgreich aktualisiert.",
        city_cant_delete: "Stadt kann nicht gel\u00f6scht werden.",
        city_delete: "Stadt erfolgreich gel\u00f6scht.",
        city_retrieved: "Stadt erfolgreich abgerufen.",
        city_save: "Stadt erfolgreich gespeichert.",
        city_update: "Stadt erfolgreich aktualisiert.",
        close_job: "Geschlossener Auftrag kann nicht bearbeitet werden.",
        cms_service_update: "CMS-Dienste erfolgreich aktualisiert.",
        comment_deleted: "Kommentar erfolgreich gel\u00f6scht.",
        comment_edit: "Kommentarbearbeitung erfolgreich.",
        comment_saved: "Kommentar erfolgreich gespeichert.",
        comment_updated: "Kommentar erfolgreich aktualisiert.",
        company_delete: "Firma erfolgreich gel\u00f6scht.",
        company_mark_feature: "Firmenmarke als erfolgreich vorgestellt.",
        company_mark_unFeature:
          "Firmenkennzeichnung erfolgreich als nicht gekennzeichnet.",
        company_save: "Firma erfolgreich gespeichert.",
        company_size_cant_delete:
          "Unternehmensgr\u00f6\u00dfe kann nicht gel\u00f6scht werden.",
        company_size_delete:
          "Unternehmensgr\u00f6\u00dfe erfolgreich gel\u00f6scht.",
        company_size_save:
          "Unternehmensgr\u00f6\u00dfe erfolgreich gespeichert.",
        company_size_update:
          "Unternehmensgr\u00f6\u00dfe erfolgreich aktualisiert.",
        company_update: "Firma erfolgreich aktualisiert.",
        country_cant_delete: "Land kann nicht gel\u00f6scht werden.",
        country_delete: "Land erfolgreich gel\u00f6scht.",
        country_save: "Land erfolgreich gespeichert.",
        country_update: "Land erfolgreich aktualisiert.",
        default_resume_already_upload:
          "Standard-Lebenslauf wurde bereits hochgeladen.",
        degree_level_cant_delete: "Grad kann nicht gel\u00f6scht werden.",
        degree_level_delete: "Grad erfolgreich gel\u00f6scht.",
        degree_level_retrieve: "Grad erfolgreich abgerufen.",
        degree_level_save: "Grad erfolgreich gespeichert.",
        degree_level_update: "Grad erfolgreich aktualisiert.",
        description_required: "Beschreibungsfeld ist erforderlich.",
        email_template: "E-Mail-Vorlage erfolgreich aktualisiert.",
        email_verify: "E-Mail erfolgreich verifiziert.",
        employer_profile: "Arbeitgeberprofil erfolgreich aktualisiert.",
        employer_update: "Arbeitgeber erfolgreich aktualisiert.",
        enter_cancel_reason: "Abbruchgrund eingeben...",
        enter_description: "Beschreibung eingeben",
        enter_notes: "Notizen eingeben...",
        enter_post_description: "Enter Post Description",
        faqs_delete: "FAQs erfolgreich gel\u00f6scht.",
        faqs_save:
          "Land kann nicht gel\u00f6scht werden.aFAQs erfolgreich gespeichert.",
        faqs_update: "FAQs erfolgreich aktualisiert.",
        fav_company_delete: "Lieblingsunternehmen erfolgreich gel\u00f6scht.",
        fav_job_added: "Lieblingsjob erfolgreich hinzugef\u00fcgt.",
        fav_job_remove: "Lieblingsjob wurde entfernt.",
        fav_job_removed: "Bevorzugter Job erfolgreich entfernt.",
        feature_job_price:
          "Der Preis der empfohlenen Jobs sollte gr\u00f6\u00dfer als 0 sein",
        feature_quota: "Empfohlenes Kontingent ist nicht verf\u00fcgbar",
        featured_not_available:
          "Empfohlenes Kontingent ist nicht verf\u00fcgbar.",
        file_type:
          "Das Dokument muss folgende Dateitypen haben: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete:
          "Funktionsbereich kann nicht gel\u00f6scht werden.",
        functional_area_delete: "Funktionsbereich erfolgreich gel\u00f6scht.",
        functional_area_save: "Funktionsbereich erfolgreich gespeichert.",
        functional_area_update: "Funktionsbereich erfolgreich aktualisiert.",
        header_slider_deleted: "Header Slider erfolgreich gel\u00f6scht.",
        header_slider_save: "Header Slider erfolgreich gespeichert.",
        header_slider_update: "Header Slider erfolgreich aktualisiert.",
        image_slider_delete: "Image Slider erfolgreich gel\u00f6scht.",
        image_slider_retrieve: "Image Slider erfolgreich abgerufen.",
        image_slider_save: "Image Slider erfolgreich gespeichert.",
        image_slider_update: "Image Slider erfolgreich aktualisiert.",
        industry_cant_delete: "Branche kann nicht gel\u00f6scht werden.",
        industry_delete: "Branche erfolgreich gel\u00f6scht.",
        industry_save: "Industrie erfolgreich gespeichert.",
        industry_update: "Branche erfolgreich aktualisiert.",
        inquiry_deleted: "Anfrage erfolgreich gel\u00f6scht.",
        inquiry_retrieve: "Anfrage erfolgreich abgerufen.",
        invoice_retrieve: "Rechnung erfolgreich abgerufen.",
        job_abuse_reported: "Job-Missbrauch erfolgreich gemeldet.",
        job_alert: "Job Alert erfolgreich aktualisiert.",
        job_application_delete: "Bewerbung erfolgreich gel\u00f6scht.",
        job_application_draft: "Bewerbung erfolgreich verfasst",
        job_applied: "Job erfolgreich beworben",
        job_apply_by_candidate:
          "Vom Kandidaten beworbene Stelle kann nicht gel\u00f6scht werden.",
        job_cant_delete: "Auftrag kann nicht gel\u00f6scht werden",
        job_category_cant_delete:
          "Jobkategorie kann nicht gel\u00f6scht werden.",
        job_category_delete: "Jobkategorie erfolgreich gespeichert.",
        job_category_save: "Jobkategorie erfolgreich gespeichert.",
        job_category_update: "Aktualisierung der Jobkategorie erfolgreich.",
        job_create_limit:
          "Das Joberstellungslimit Ihres Kontos wurde \u00fcberschritten. Aktualisieren Sie Ihren Abonnementplan.",
        job_delete: "Auftrag erfolgreich gel\u00f6scht.",
        job_draft: "Job-Entwurf erfolgreich gespeichert.",
        job_emailed_to: "Job E-Mail an Freund erfolgreich.",
        job_make_featured: "Job Make erfolgreich vorgestellt.",
        job_make_unfeatured: "Job erfolgreich aus dem Feature entfernt.",
        job_not_found: "Auftrag erfolgreich gespeichert.",
        job_notification: "Auftragsbenachrichtigung erfolgreich gesendet.",
        job_save: "Auftrag erfolgreich gespeichert.",
        job_schedule_send: "Auftragsplan erfolgreich gesendet.",
        job_shift_cant_delete: "Job Shift kann nicht gel\u00f6scht werden.",
        job_shift_delete: "Job Shift deleted successfully.",
        job_shift_retrieve: "Job-Shift erfolgreich abgerufen.",
        job_shift_save: "Job-Schicht erfolgreich gespeichert.",
        job_shift_update: "Job Shift erfolgreich aktualisiert.",
        job_stage_cant_delete: "Jobphase kann nicht gel\u00f6scht werden.",
        job_stage_change: "Auftragsphase erfolgreich ge\u00e4ndert.",
        job_stage_delete: "Jobphase erfolgreich gel\u00f6scht.",
        job_stage_retrieve: "Auftragsphase erfolgreich abgerufen.",
        job_stage_save: "Auftragsphase erfolgreich gespeichert.",
        job_stage_update: "Job Stage updated successfully.",
        job_tag_cant_delete: "Job-Tag kann nicht gel\u00f6scht werden.",
        job_tag_delete: "Job-Tag erfolgreich gel\u00f6scht.",
        job_tag_retrieve: "Job-Tag erfolgreich abgerufen.",
        job_tag_save: "Job-Tag erfolgreich gespeichert.",
        job_tag_update: "Job-Tag erfolgreich aktualisiert.",
        job_type_cant_delete: "Auftragstyp kann nicht gel\u00f6scht werden.",
        job_type_delete: "Auftragstyp erfolgreich gel\u00f6scht.",
        job_type_retrieve: "Auftragstyp erfolgreich abgerufen.",
        job_type_save: "Auftragstyp erfolgreich gespeichert.",
        job_type_update: "Auftragstyp erfolgreich aktualisiert.",
        job_update: "Auftrag erfolgreich aktualisiert.",
        language_added: "Sprache erfolgreich hinzugef\u00fcgt.",
        language_changed: "Sprache erfolgreich ge\u00e4ndert",
        language_delete: "Sprache erfolgreich gel\u00f6scht.",
        language_retrieve: "Sprache erfolgreich abgerufen.",
        language_save: "Sprache erfolgreich gespeichert.",
        language_update: "Sprache erfolgreich aktualisiert.",
        link_copy: "Link erfolgreich kopiert.",
        manual_payment: "Manuelle Zahlung erfolgreich genehmigt.",
        manual_payment_denied: "Manuelle Zahlung erfolgreich verweigert.",
        marital_status_delete: "Familienstand erfolgreich gel\u00f6scht.",
        marital_status_retrieve: "Familienstand erfolgreich abgerufen.",
        marital_status_save: "Familienstand erfolgreich gespeichert.",
        marital_status_update: "Familienstand erfolgreich aktualisiert.",
        media_delete: "Medien erfolgreich gel\u00f6scht.",
        newsletter_delete: "Newsletter erfolgreich gel\u00f6scht.",
        no_record: "Keine Aufzeichnungen gefunden.",
        not_deleted: "Nicht gel\u00f6scht",
        noticeboard_retrieve: "Schwarzes Brett erfolgreich abgerufen.",
        noticeboard_save: "Schwarzes Brett erfolgreich gespeichert.",
        noticeboard_update: "Schwarzes Brett erfolgreich aktualisiert.",
        notification_read: "Benachrichtigung erfolgreich gelesen.",
        notification_setting_update:
          "Benachrichtigungseinstellungen erfolgreich aktualisiert.",
        ownership_type_cant_delete:
          "Eigentumstyp kann nicht gel\u00f6scht werden.",
        ownership_type_delete: "Eigentumstyp erfolgreich gel\u00f6scht.",
        ownership_type_retrieve: "Eigentumstyp erfolgreich abgerufen.",
        ownership_type_save: "Eigentumsart erfolgreich gespeichert.",
        ownership_type_updated: "Eigentumstyp erfolgreich aktualisiert.",
        password_update: "Passwort erfolgreich aktualisiert.",
        payment_failed_try_again:
          "Verzeihung! Zahlung fehlgeschlagen, bitte versuchen Sie es sp\u00e4ter erneut.",
        payment_not_complete: "Ihre Zahlung ist nicht abgeschlossen",
        payment_success: "Ihre Zahlung wurde erfolgreich abgeschlossen",
        plan_Save: "Plan erfolgreich gespeichert.",
        plan_cant_delete:
          "Plan kann nicht gel\u00f6scht werden, er enth\u00e4lt ein oder mehrere aktive Abonnements.",
        plan_cant_update:
          "Plan kann nicht aktualisiert werden. Das Abonnement f\u00fcr diesen Plan ist bereits vorhanden",
        plan_delete: "Plan erfolgreich gel\u00f6scht.",
        plan_retrieve: "Plan Retrieved Successfully.",
        plan_update: "Plan erfolgreich aktualisiert.",
        please_wait_for:
          "Bitte warten Sie auf die Genehmigung des Administrators, da Sie bereits eine manuelle Zahlung hinzugef\u00fcgt haben",
        please_wait_for_com:
          "Bitte warten Sie auf die Genehmigung des Administrators, um Ihre Transaktion abzuschlie\u00dfen",
        policy_update: "Richtlinie erfolgreich aktualisiert.",
        post_category_delete: "Beitragskategorie erfolgreich gel\u00f6scht.",
        post_category_retrieve: "Beitragskategorie erfolgreich abgerufen.",
        post_category_save: "Beitragskategorie erfolgreich gespeichert.",
        post_category_update: "Beitragskategorie erfolgreich aktualisiert.",
        post_comment: "Beitragskommentare erfolgreich abgerufen.",
        post_delete: "Beitrag erfolgreich gel\u00f6scht.",
        post_save: "Beitrag erfolgreich gespeichert.",
        post_update: "Beitrag erfolgreich aktualisiert.",
        profile_update: "Profil erfolgreich aktualisiert.",
        reason_require: "Der Abbruchgrund ist erforderlich.",
        register_success_mail_active:
          "Sie haben sich erfolgreich registriert, aktivieren Sie Ihr Konto per Mail.",
        registration_done: "Registrierung erfolgreich durchgef\u00fchrt.",
        report_to_company: "Erfolgreich an Unternehmen melden.",
        reported_candidate_delete:
          "Gemeldeter Kandidat erfolgreich gel\u00f6scht.",
        reported_job_delete: "Gemeldete Jobs erfolgreich gel\u00f6scht.",
        resume_delete: "L\u00f6schen erfolgreich fortsetzen.",
        resume_update: "Lebenslauf erfolgreich aktualisiert.",
        retrieved: "Erfolgreich abgerufen.",
        salary_currency_cant_delete:
          "Gehaltsw\u00e4hrung kann nicht gel\u00f6scht werden.",
        salary_currency_destroy:
          "Gehaltsw\u00e4hrung erfolgreich gel\u00f6scht.",
        salary_currency_edit: "Gehaltsw\u00e4hrung erfolgreich abgerufen.",
        salary_currency_store: "Gehaltsw\u00e4hrung erfolgreich gespeichert.",
        salary_currency_update: "Gehaltsw\u00e4hrung erfolgreich aktualisiert.",
        salary_period_cant_delete:
          "Gehaltszeitraum kann nicht gel\u00f6scht werden.",
        salary_period_delete: "Gehaltsperiode erfolgreich gel\u00f6scht.",
        salary_period_retrieve: "Gehaltsperiode erfolgreich abgerufen.",
        salary_period_save: "Gehaltsperiode erfolgreich gespeichert.",
        salary_period_update: "Gehaltszeitraum erfolgreich aktualisiert.",
        select_employer: "Arbeitgeber ausw\u00e4hlen",
        select_job_skill: "W\u00e4hlen Sie Job-Skill",
        select_job_tag: "W\u00e4hlen Sie Job-Tag aus",
        select_post_category: "W\u00e4hlen Sie die Beitragskategorie aus",
        select_skill: "W\u00e4hlen Sie Fertigkeit aus",
        session_created: "Sitzung erfolgreich erstellt.",
        setting_update: "Einstellung erfolgreich aktualisiert.",
        skill_cant_delete: "F\u00e4higkeit kann nicht gel\u00f6scht werden.",
        skill_delete: "F\u00e4higkeit erfolgreich gel\u00f6scht.",
        skill_save: "Fertigkeit erfolgreich gespeichert.",
        skill_update: "Fertigkeit erfolgreich aktualisiert.",
        slot_already_taken: "Slot bereits vergeben",
        slot_cancel: "Slot-Abbruch erfolgreich.",
        slot_choose: "Slot-Auswahl erfolgreich",
        slot_create: "Slots erfolgreich erstellt",
        slot_delete: "Slot erfolgreich gel\u00f6scht.",
        slot_preference_field: "Das Slot-Pr\u00e4ferenzfeld ist erforderlich",
        slot_reject: "Slots erfolgreich abgelehnt",
        slot_update: "Steckplatz erfolgreich aktualisiert.",
        state_cant_delete: "Staat kann nicht gel\u00f6scht werden.",
        state_delete: "Zustand erfolgreich gel\u00f6scht.",
        state_save: "Zustand erfolgreich gespeichert.",
        state_update: "Zustand erfolgreich aktualisiert.",
        status_change: "Status erfolgreich ge\u00e4ndert.",
        status_update: "Status erfolgreich aktualisiert.",
        subscribed: "Erfolgreich abonniert.",
        subscription_cancel: "Abonnement erfolgreich gek\u00fcndigt.",
        subscription_resume: "Das Abonnement wurde erfolgreich fortgesetzt.",
        success_verify:
          "Sie haben Ihre E-Mail erfolgreich best\u00e4tigt. Bitte loggen Sie sich ein !",
        testimonial_delete: "Referenzen erfolgreich gel\u00f6scht.",
        testimonial_retrieve: "Zeugnisse erfolgreich abgerufen.",
        testimonial_save: "Testimonial erfolgreich gespeichert.",
        testimonial_update: "Referenzen erfolgreich aktualisiert.",
        the_name_has: "Der Name ist bereits vergeben",
        there_are_no: "Es wurde kein Lebenslauf hochgeladen.",
        this_currency_is:
          "Diese W\u00e4hrung wird von PayPal f\u00fcr Zahlungen nicht unterst\u00fctzt.",
        translation_update: "\u00dcbersetzung erfolgreich aktualisiert.",
        trial_plan_update: "Testplan erfolgreich aktualisiert.",
        unfollow_company: "Unternehmen erfolgreich entfolgen.",
        verification_mail: "Best\u00e4tigungsmail erfolgreich erneut gesendet.",
        your_are_not_author:
          "Sie sind nicht Autor des Abonnements. Sie sind also nicht berechtigt, dieses Abonnement zu k\u00fcndigen.",
        your_payment_comp: "Ihre Zahlung wurde erfolgreich abgeschlossen",
      },
      footer_settings: "Fu\u00dfzeileneinstellungen",
      front_cms: "Front-CMS",
      front_home: {
        candidates: "Kandidaten",
        companies: "Firmen",
        jobs: "Arbeitspl\u00e4tze",
        resumes: "Wird fortgesetzt",
      },
      front_settings: {
        exipre_on: "Ablauf am",
        expires_on: "L\u00e4uft aus am",
        featured: "Vorgestellt",
        featured_companies_days: "Ausgew\u00e4hlte Unternehmenstage",
        featured_companies_due_days:
          "F\u00e4lligkeitstage f\u00fcr Standardunternehmen",
        featured_companies_enable: "Ausgew\u00e4hlte Unternehmen aktivieren",
        featured_companies_price: "Empfohlene Unternehmen Preis",
        featured_companies_quota: "Empfohlene Unternehmensquote",
        featured_employer_not_available:
          "vorgestellter Arbeitgeber nicht verf\u00fcgbar",
        featured_job: "Top Stellen",
        featured_jobs_days: "Ausgew\u00e4hlte Jobtage",
        featured_jobs_due_days: "F\u00e4lligkeitstage f\u00fcr Standardjobs",
        featured_jobs_enable: "Ausgew\u00e4hlte Jobs aktivieren",
        featured_jobs_price: "Ausgew\u00e4hlte Jobs Preis",
        featured_jobs_quota: "Ausgew\u00e4hlte Jobquote",
        featured_listing_currency: "Empfohlene Angebotsw\u00e4hrung",
        latest_jobs_enable:
          "Zeigt die neuesten Jobs gem\u00e4\u00df dem Land des angemeldeten Benutzers an",
        latest_jobs_enable_message:
          "Es werden die neuesten Jobs des Landes des Bewerbers / Arbeitgebers angezeigt, wenn sie angemeldet sind",
        make_feature: "Funktion erstellen",
        make_featured: "Hervorgehoben machen",
        make_featured_job: "Machen Sie einen vorgestellten Job",
        pay_to_get: "Zahlen, um zu bekommen",
        remove_featured: "entfernen gekennzeichnet",
      },
      functional_area: {
        edit_functional_area: "Sprache Funktionell Bereich",
        name: "Name",
        new_functional_area: "Neue Funktionell Bereich",
        no_functional_area_available:
          "Kein funktionaler Bereich verf\u00fcgbar",
        no_functional_area_found: "Kein funktionaler Bereich gefunden",
      },
      functional_areas: "Funktionsbereiche",
      general: "Allgemeines",
      general_dashboard: "Allgemeines Dashboard",
      general_settings: "Allgemeine Einstellungen",
      go_to_homepage: "Zur Startseite gehen",
      header_slider: {
        edit_header_slider: "Header Slider bearbeiten",
        header_slider: "Header-Schieberegler",
        image_size_message:
          "Das Bild muss mindestens 1920 x 1080 Pixel gro\u00df sein.",
        image_title_text:
          "Laden Sie ein Bild mit 1920 x 1080 Pixel oder mehr hoch, um die beste Benutzererfahrung zu erzielen.",
        new_header_slider: "New Header Slider",
        no_header_slider_available: "Kein Header-Slider verf\u00fcgbar",
      },
      header_sliders: "Header-Schieberegler",
      image_slider: {
        Aktion: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_image_slider: "Bildschieberegler bearbeiten",
        image: "Bild",
        image_extension_message:
          "Das Bild muss eine Datei vom Typ png, jpg, jpeg sein.",
        image_size_message:
          "Das Bild muss ein Pixel von 1140 x 500 oder mehr haben.",
        image_slider: "Bild-Slider",
        image_slider_details: "Details zum Bildschieberegler",
        image_title_text:
          "Laden Sie ein Bild mit 1140 x 500 Pixel oder mehr hoch, um die beste Benutzererfahrung zu erzielen.",
        is_active: "Status",
        message: "Deaktiviere die Homepage-Jobsuche",
        message_title:
          "Wenn diese Option deaktiviert ist, wird der Standardsuchbildschirm nicht angezeigt.",
        new_image_slider: "Neuer Bildschieber",
        no_image_slider_available: "Kein Bild-Slider verf\u00fcgbar",
        no_image_slider_found: "Kein Bild-Slider gefunden",
        select_status: "W\u00e4hlen Sie Status",
        slider: "Aktivieren Sie den Schieberegler in voller Breite.",
        slider_active:
          "Deaktivieren Sie den Schieberegler f\u00fcr das Startseitenbild",
        slider_active_title:
          "Wenn diese Option deaktiviert ist, wird der Standardbildschirm des Bildschiebereglers nicht angezeigt.",
        slider_title:
          "Wenn diese Option aktiviert ist, wird der Bildschieberegler in voller Breite angezeigt.",
      },
      image_sliders: "Bildschieberegler",
      industries: "Branchen",
      industry: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_industry: "Bearbeiten Industrie",
        industry_detail: "Branchendetails",
        name: "Name",
        new_industry: "Neu Industrie",
        no_industry_available: "Keine Branche verf\u00fcgbar",
        no_industry_found: "Keine Branche gefunden",
        size: "Gr\u00f6\u00dfe",
      },
      inquires: "Anfragen",
      inquiry: {
        email: "Email",
        inquiry: "Anfrage",
        inquiry_date: "Anfrage date",
        inquiry_details: "Anfrage details",
        message: "Botschaft",
        name: "Name",
        no_inquiry_available: "Keine Anfrage verf\u00fcgbar",
        no_inquiry_found: "Keine Anfrage gefunden",
        phone_no: "Telefonnummer",
        subject: "Betreff",
      },
      job: {
        Job: "Job",
        add_note: "Notiz hinzuf\u00fcgen",
        applies_job_not_found: "Kein angewandter Job gefunden",
        career_level: "Karrierestufe",
        city: "Stadt",
        country: "Land",
        created_at: "Hergestellt in",
        currency: "W\u00e4hrung",
        degree_level: "Abschlussstufe",
        description: "Beschreibung",
        edit_job: "Bearbeiten Job",
        email_to_friend: "E-Mail an Freund",
        expires_on: "L\u00e4uft aus am",
        favourite_companies_not_found: "Lieblingsunternehmen nicht gefunden",
        favourite_company: "Lieblingsunternehmen",
        favourite_job: "Lieblingsjob",
        favourite_job_not_found: "Keine Lieblingsjobs gefunden",
        following_company_not_found: "Keine folgende Firma gefunden",
        friend_email: "E-Mail von Freunden",
        friend_name: "Freundesname",
        functional_area: "Funktionsbereich",
        hide_salary: "Gehalt verbergen",
        is_featured: "Ist Vorgestellt",
        is_freelance: "Ist Freiberuflich",
        is_suspended: "Ist Suspendiert",
        job_alert: "Job-Benachrichtigung",
        job_details: "Job Einzelheiten",
        job_expiry_date: "Jobablaufdatum",
        job_shift: "Jobverschiebung",
        job_skill: "Job Fertigkeit",
        job_title: "Job Titel",
        job_type: "Jobtyp",
        job_url: "Job-URL",
        new_job: "Neuer Job",
        no_applied_job_found: "Kein angewandter Job verf\u00fcgbar",
        no_favourite_job_found: "Keine Lieblingsjobs verf\u00fcgbar",
        no_followers_available: "Keine Follower verf\u00fcgbar",
        no_followers_found: "Keine Follower gefunden",
        no_following_companies_found: "Folgende Firma nicht verf\u00fcgbar",
        no_job_reported_available: "Kein Job gemeldet verf\u00fcgbar",
        no_preference: "No Preference",
        no_reported_job_found: "Kein gemeldeter Job gefunden",
        notes: "Anmerkungen",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "Bitte Gehaltsspanne bis gr\u00f6\u00dfer als Gehaltsspanne von eingeben.",
        position: "Position",
        remove_favourite_jobs: "Lieblingsjob entfernen",
        reported_job: "Gemeldeter Job",
        reported_jobs_detail: "Gemeldete Auftragsdetails",
        reported_user: "Gemeldeter Benutzer",
        salary_from: "Gehalt von",
        salary_period: "Gehaltsperiode",
        salary_to: "Gehalt zu",
        state: "Zustand",
        subscriber: "Abonnent",
        view_notes: "Notizen anzeigen",
      },
      job_application: {
        application_date: "Bewerbungsdatum",
        candidate_name: "Kandidatenname",
        job_application: "Bewerbung",
      },
      job_applications: "Bewerbungen",
      job_categories: "Jobkategorien",
      job_category: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_job_category: "Jobkategorie bearbeiten",
        is_featured: "Ist Vorgestellt",
        job_category: "Jobkategorie",
        name: "Name",
        new_job_category: "Neue Jobkategorie",
        no_job_category_available: "Keine Jobkategorie verf\u00fcgbar",
        no_job_category_found: "Keine Jobkategorie gefunden",
        show_job_category: "Details zur Jobkategorie",
      },
      job_experience: {
        edit_job_experience: "Sprache Job erfahrung",
        is_active: "Ist Aktiv",
        is_default: "Ist Standard",
        job_experience: "Berufserfahrung",
        language: "Sprache",
        new_job_experience: "Neue Job Experience",
      },
      job_experiences: "Berufserfahrungen",
      job_notification: {
        job_notifications: "Jobbenachrichtigungen",
        no_jobs_available: "Keine Jobs verf\u00fcgbar",
        select_all_jobs: "W\u00e4hlen Sie Alle Jobs aus",
      },
      job_shift: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_job_shift: "Job Verschiebung bearbeiten",
        job_shift_detail: "Job Shift Details",
        new_job_shift: "New Job Verschiebung",
        no_job_shifts_available: "Keine Jobverschiebung verf\u00fcgbar",
        no_job_shifts_found: "Keine Jobverschiebung gefunden",
        shift: "Verschiebung",
        show_job_shift: "Job Verschiebung",
        size: "Gr\u00f6\u00dfe",
      },
      job_shifts: "Jobverschiebungen",
      job_skill: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_job_skill: "Bearbeiten Job Fertigkeit",
        name: "Name",
        new_job_skill: "Neu Job Fertigkeit",
        show_job_skill: "Job Fertigkeit",
      },
      job_skills: "Job Kompetenzen",
      job_stage: {
        Batch: "Batch",
        add_slot: "Steckplatz hinzuf\u00fcgen",
        add_slots: "Slots hinzuf\u00fcgen",
        batch: "Charge",
        cancel_slot: "Slot abbrechen",
        cancel_this_slot: "Diesen Slot abbrechen",
        cancel_your_selected_slot: "Sende deinen ausgew\u00e4hlten Slot",
        candidate_note: "Kandidatennotiz",
        choose_slots: "Slot w\u00e4hlen",
        date: "Datum",
        edit_job_stage: "Jobphase bearbeiten",
        edit_slot: "Slot bearbeiten",
        history: "Geschichte",
        job_stage: "Job-Phase",
        job_stage_detail: "Job-Phasen-Detail",
        new_job_stage: "Neue Job-Phase",
        new_slot_send: "Neuer Slot senden",
        no_job_stage_available: "Keine Job-Phase verf\u00fcgbar",
        no_job_stage_found: "Keine Jobphase gefunden",
        no_slot_available: "Kein Slot verf\u00fcgbar",
        reject_all_slot: "Alle Slots ablehnen",
        rejected_all_slots: "Alle Slots abgelehnt",
        send_slot: "Slot senden",
        send_slots: "Slots senden",
        slot: "Slot",
        slot_preference: "Slot-Pr\u00e4ferenz",
        slots: "Slots",
        time: "Zeit",
        you_cancel_this_slot: "Du stornierst diesen Slot",
        you_have_rejected_all_slot: "Sie haben alle Slots abgelehnt",
        you_have_selected_this_slot: "Sie haben diesen Slot ausgew\u00e4hlt",
        your_note: "Your NotDu bist nichte",
      },
      job_stages: "Jobphasen",
      job_tag: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_job_tag: "Firma Job Etikett",
        job_tag: "Job-Tag",
        job_tag_detail: "Job-Tag-Details",
        name: "Name",
        new_job_tag: "Neue Job-Tag-Nummer",
        no_job_tag_available: "Kein Job-Tag verf\u00fcgbar",
        no_job_tag_found: "Kein Job-Tag gefunden",
        show_job_tag: "Job Etikett",
        size: "Gr\u00f6\u00dfe",
      },
      job_tags: "Job-Tags",
      job_type: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_job_type: "Jobtyp bearbeiten",
        job_type: "Auftragstyp",
        job_type_detail: "Jobtypdetails",
        name: "Name",
        new_job_type: "Neuer Jobtyp",
        no_job_type_available: "Kein Jobtyp verf\u00fcgbar",
        no_job_type_found: "Kein Jobtyp gefunden",
        show_job_type: "Jobtyp",
      },
      job_types: "Jobtypen",
      jobs: "Arbeitspl\u00e4tze",
      language: {
        edit_language: "Sprache bearbeiten",
        is_active: "Ist Aktiv",
        is_default: "Ist Standard",
        is_rtl: "Ist RTL",
        iso_code: "ISO Code",
        language: "Sprache",
        native: "Einheimisch",
        new_language: "Neue Sprache",
        no_language_available: "Keine Sprache verf\u00fcgbar",
        no_language_found: "Keine Sprache gefunden",
      },
      languages: "Sprachen",
      marital_status: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_marital_status: "Familienstand bearbeiten",
        marital_status: "Familienstand",
        marital_status_detail: "Angaben zum Familienstand",
        new_marital_status: "Neuer Familienstand",
        no_marital_status_available: "Kein Familienstand verf\u00fcgbar",
        no_marital_status_found: "Kein Familienstand gefunden",
        show_marital_status: "Familienstand",
      },
      marital_statuses: "Familienstand",
      months: {
        apr: "Apr",
        aug: "Aug",
        dec: "Dec",
        feb: "Feb",
        jan: "Jan",
        jul: "Juli",
        jun: "Jun",
        mar: "Besch\u00e4digen",
        may: "Kann",
        nov: "Nov",
        oct: "Okt",
        sep: "Sep",
      },
      no_skills: "Keine F\u00e4higkeiten",
      no_subscriber_available: "Kein Abonnent verf\u00fcgbar",
      no_subscriber_found: "Kein Abonnent gefunden",
      noticeboard: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_noticeboard: "Noticeboard bearbeiten",
        is_active: "Ist aktiv",
        new_noticeboard: "New Noticeboard",
        no_noticeboard_available: "Kein Schwarzes Brett verf\u00fcgbar",
        no_noticeboard_found: "Kein Schwarzes Brett gefunden",
        noticeboard: "Schwarzes Brett",
        noticeboard_detail: "Anschlagtafel Details",
        title: "Titel",
      },
      noticeboards: "Schwarzes Brett",
      notification: {
        company: "Unternehmen",
        company_marked_featured:
          "Das Unternehmen markiert als gekennzeichnet durch",
        empty_notifications: "Wir konnten keine Benachrichtigungen finden",
        job_application_rejected_message:
          "Ihre Bewerbung wird abgelehnt f\u00fcr",
        job_application_select_message: "Sie sind ausgew\u00e4hlt f\u00fcr",
        job_application_shortlist_message:
          "Ihre Bewerbung ist in die engere Wahl gezogen",
        job_application_submitted: "Bewerbung eingereicht f\u00fcr",
        mark_all_as_read: "Markiere alle als gelesen",
        marked_as_featured: "als gekennzeichnet markiert",
        new_candidate_registered: "Neuer Kandidat registriert",
        new_employer_registered: "Neuer Arbeitgeber registriert",
        notifications: "Benachrichtigungen",
        purchase: "Kauf",
        read_notification: "Benachrichtigung erfolgreich gelesen",
        started_following: "angefangen zu folgen",
        started_following_you: "Begann dir zu folgen.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "Wenn ein Kandidat f\u00fcr den Job abgelehnt wurde",
        CANDIDATE_SELECTED_FOR_JOB:
          "Wenn ein Kandidat f\u00fcr den Job ausgew\u00e4hlt wurde",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "Wenn ein Kandidat f\u00fcr den Job in die engere Wahl kommt",
        EMPLOYER_PURCHASE_PLAN: "Wenn ein Arbeitgeber ein Abonnement kauft",
        FOLLOW_COMPANY: "Wenn ein Kandidat beginnt, dem Unternehmen zu folgen",
        FOLLOW_JOB: "Wenn ein Kandidat beginnt, Jobs zu folgen",
        JOB_ALERT: "Wenn ein Arbeitgeber einen Job schafft",
        JOB_APPLICATION_SUBMITTED: "Beim Einreichen einer neuen Bewerbung",
        MARK_COMPANY_FEATURED: "Wenn Unternehmen als gekennzeichnet markieren",
        MARK_COMPANY_FEATURED_ADMIN:
          "Wenn der Arbeitgeber den Job als Hervorgehoben markiert",
        MARK_JOB_FEATURED: "Wenn Job als empfohlen markiert",
        MARK_JOB_FEATURED_ADMIN:
          "Wenn der Arbeitgeber den Job als Hervorgehoben markiert",
        NEW_CANDIDATE_REGISTERED: "Wenn sich ein neuer Kandidat registriert",
        NEW_EMPLOYER_REGISTERED: "Wenn sich ein neuer Arbeitgeber registriert",
        admin: "Administratorin",
        blog_category: "Blog-Kategorie",
        candidate: "Kandidatin",
        employer: "Mitarbeiterin",
      },
      ownership_type: {
        edit_ownership_type: "Bearbeiten Eigentum Art",
        new_ownership_type: "Neu Eigentum Art",
        no_ownership_type_available: "Kein Besitztyp verf\u00fcgbar",
        no_ownership_type_found: "Kein Eigentumstyp gefunden",
        ownership_type: "Eigentumstyp",
        ownership_type_detail: "Details zum Eigent\u00fcmertyp",
      },
      ownership_types: "Eigentum Typen",
      phone: {
        invalid_country_code: "Ung\u00fcltiger L\u00e4ndercode",
        invalid_number: "Ung\u00fcltige Nummer",
        too_long: "Zu lang",
        too_short: "Zu kurz",
        valid_number: "G\u00fcltige Nummer",
      },
      plan: {
        active_subscription: "aktives Abonnement",
        allowed_jobs: "Zul\u00e4ssige Jobs",
        amount: "Menge",
        cancel_reason: "Grund abbrechen",
        cancel_subscription: "Abonnement k\u00fcndigen",
        currency: "W\u00e4hrung",
        current_plan: "Derzeitiger Plan",
        edit_plan: "Plan bearbeiten",
        edit_subscription_plan: "Abonnement bearbeiten",
        ends_at: "Endet am",
        is_trial_plan: "Ist Testplan",
        job_allowed: "Arbeit erlaubt",
        job_used: "Job verwendet",
        jobs_allowed: "Jobs erlaubt",
        jobs_used: "Verwendete Jobs",
        new_plan: "Plan hinzuf\u00fcgen",
        new_subscription_plan: "neues Abonnement",
        pay_with_manually: "Bezahlen mit Manuell",
        pay_with_paypal: "Zahlen Sie mit PayPal",
        pay_with_stripe: "Bezahlen Sie mit Stripe",
        per_month: "Pro Monat",
        plan: "Planen",
        plan_amount_cannot_be_changes:
          "Hinweis: - Der Planbetrag kann nicht ge\u00e4ndert werden.",
        pricing: "Preisgestaltung",
        processing: "wird bearbeitet",
        purchase: "Kauf",
        renews_on: "Erneuert weiter",
        subscription_cancelled: "Abonnement gek\u00fcndigt",
        subscriptions: "Abonnements",
      },
      plans: "Pl\u00e4ne",
      position: {
        edit_position: "Position bearbeiten",
        new_position: "Neue Position",
        position: "Position",
      },
      positions: "Positionen",
      post: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        blog: "Blog",
        comment: "Kommentar",
        comments: "Bemerkungen",
        description: "Beschreibung",
        edit_post: "Beitrag bearbeiten",
        image: "Bild",
        new_post: "Neuer Beitrag",
        no_posts_available: "Keine Beitr\u00e4ge verf\u00fcgbar",
        no_posts_found: "Keine Eintr\u00e4ge gefunden",
        post: "Post",
        post_a_comments: "Einen Kommentar posten",
        post_details: "Details ver\u00f6ffentlichen",
        posts: "Beitr\u00e4ge",
        select_post_categories: "W\u00e4hlen Sie Beitragskategorien",
        show_post: "Post",
        title: "Titel",
      },
      post_category: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_post_category: "Beitragskategorie bearbeiten",
        name: "Name",
        new_post_category: "Neue Beitragskategorie",
        no_post_category_available: "Keine Post-Kategorie verf\u00fcgbar",
        no_post_category_found: "Keine Beitragskategorie gefunden",
        post_categories: "Post-Kategorien",
        post_category: "Beitragskategorie",
        post_category_detail: "Details zur Post-Kategorie",
        show_post_category: "Beitragskategorie",
      },
      post_comment: {
        post_comment: "Kommentar posten",
        post_comment_details: "Kommentardetails posten",
      },
      post_comments: "Kommentar schreiben",
      pricing_table: { get_started: "loslegen" },
      pricings_table: "Preistabelle",
      professional_skills: "professionelle F\u00e4higkeiten",
      profile: "Profile",
      recent_blog: "Letzter Blog",
      reported_jobs: "Gemeldete Jobs",
      required_degree_level: {
        edit_required_degree_level: "Sprache Grad Niveau",
        name: "Name",
        new_required_degree_level: "Neue Grad Niveau",
        no_degree_level_available: "Kein Abschluss verf\u00fcgbar",
        no_degree_level_found: "Kein Abschluss gefunden",
        show_required_degree_level: "Grad Niveau",
      },
      required_degree_levels: "Abschlussstufen",
      resumes: {
        candidate_name: "Name des Kandidaten",
        file: "Datei",
        name: "Name",
        no_resume_available: "Kein Lebenslauf verf\u00fcgbar",
        no_resume_found: "Kein Lebenslauf gefunden",
        resume_name: "Dateiname",
      },
      salary_currencies: "Gehaltsw\u00e4hrungen",
      salary_currency: {
        currency_code: "W\u00e4hrungscode",
        currency_icon: "W\u00e4hrungssymbol",
        currency_name: "W\u00e4hrungsname",
        edit_salary_currency: "Rediger l\u00f8nningsvaluta",
        new_salary_currency: "Ny l\u00f8nningsvaluta",
        no_salary_currency_available:
          "Keine Gehaltsw\u00e4hrung verf\u00fcgbar",
        no_salary_currency_found: "Keine Gehaltsw\u00e4hrung gefunden",
      },
      salary_period: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_salary_period: "Gehaltsperiode bearbeiten",
        new_salary_period: "Neue Gehaltsperiode",
        no_salary_period_available: "Keine Gehaltsperiode verf\u00fcgbar",
        no_salary_period_found: "Keine Gehaltsperiode gefunden",
        period: "Periode",
        salary_period_detail: "Angaben zum Gehaltszeitraum",
        size: "Gr\u00f6\u00dfe",
      },
      salary_periods: "Gehaltsperioden",
      see_all_plans: "Alle Pl\u00e4ne anzeigen",
      selected_candidate: "Ausgew\u00e4hlter Kandidat",
      setting: {
        about_us: "\u00dcber uns",
        address: "Adresse",
        application_name: "Anwendungsname",
        choose: "w\u00e4hlen",
        company_description: "Firmenbeschreibung",
        company_url: "Firmen-URL",
        configuration_update: "Konfigurations-Update",
        cookie: "Pl\u00e4tzchen",
        disable_cookie: "Cookie deaktivieren",
        disable_edit: "Bearbeiten deaktivieren",
        email: "Email",
        enable_cookie: "Cookie aktivieren",
        enable_edit: "Bearbeiten aktivieren",
        enable_google_recaptcha:
          "Aktivieren Sie Google reCAPTCHA f\u00fcr Arbeitgeber, Kandidatenregistrierung und Kontaktbildschirm.",
        facebook: "Facebook",
        facebook_app_id: "Facebook App ID",
        facebook_app_secret: "Facebook App Geheimnis",
        facebook_redirect: "Facebook-Weiterleitung",
        facebook_url: "Facebook URL",
        favicon: "Favicon",
        front_settings: "Fronteinstellungen",
        general: "General",
        google: "Google",
        google_client_id: "Google Client ID",
        google_client_secret: "Google Client Secret",
        google_plus_url: "Google Plus-URL",
        google_redirect: "Google Redirect",
        image_validation: "Das Bild muss Pixel 90 x 60 haben.",
      
        linkedIn_url: "LinkedIn-URL",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Id",
        linkedin_client_secret: "LinkedIn Client Secret",
        logo: "Logo",
        mail: "Posta",
        mail__from_address: "Mail von Adresse",
        mail_host: "Mail Host",
        mail_mailer: "Mail-Mailer",
        mail_password: "E-Mail-Passwort",
        mail_port: "Mail Port",
        mail_username: "Mail-Benutzername",
        paypal: "Paypal",
        paypal_client_id: "Paypal Client ID",
        paypal_secret: "Paypal Geheimnis",
        phone: "Telefon",
        privacy_policy: "Datenschutz-Bestimmungen",
        pusher: "Dr\u00fccker",
        pusher_app_cluster: "Pusher App Cluster",
        pusher_app_id: "Pusher App ID",
        pusher_app_key: "Pusher App Key",
        pusher_app_secret: "Dr\u00fccker-App-Geheimnis",
        social_settings: "Social Settings",
        stripe: "Streifen",
        stripe_key: "Streifenschl\u00fcssel",
        stripe_secret_key: "Stripe Secret Key",
        stripe_webhook_key: "Streifen-Webhook-Schl\u00fcssel",
        terms_conditions: "Gesch\u00e4ftsbedingungen",
        twitter_url: "Twitter-URL",
        update_application_configuration:
          "Sie sind dabei, die Konfigurationswerte der Anwendung zu aktualisieren, m\u00f6chten fortfahren ?",
      },
      settings: "die Einstellungen",
      skill: {
        action: "Aktion",
        add: "Hinzuf\u00fcgen",
        description: "Beschreibung",
        edit_skill: "Fertigkeit bearbeiten",
        name: "Name",
        new_skill: "Neue Fertigkeit",
        no_skill_available: "Keine F\u00e4higkeiten verf\u00fcgbar",
        no_skill_found: "Keine F\u00e4higkeit gefunden",
        show_skill: "Fertigkeit",
        skill_detail: "F\u00e4higkeitsdetails",
      },
      skills: "F\u00e4higkeiten",
      social_media: "Sozialen Medien",
      social_settings: "Social Settings",
      state: {
        country_name: "Im Namen des Landes",
        edit_state: "Status bearbeiten",
        new_state: "Neuer Staat",
        no_state_available: "Kein Status verf\u00fcgbar",
        no_state_found: "Kein Staat gefunden",
        state_name: "Statusname",
        states: "Zust\u00e4nde",
      },
      subscribers: "Abonnenten",
      subscriptions_plans: "Abonnementpl\u00e4ne",
      testimonial: {
        customer_image: "Kundenimage",
        customer_name: "Kundenname",
        description: "Beschreibung",
        edit_testimonial: "Testimonial bearbeiten",
        new_testimonial: "New Testimonial",
        no_testimonial_available: "Kein Testimonial verf\u00fcgbar",
        no_testimonial_found: "Kein Testimonial gefunden",
        testimonial: "Zeugnis",
        testimonial_detail: "Testimonial Details",
        testimonials: "Testimonials",
      },
      testimonials: "Referenzen",
      tooltip: {
        change_app_logo: "App-Logo \u00e4ndern",
        change_favicon: "Favicon \u00e4ndern",
        change_home_banner: "Heimatbanner wechseln",
        change_image: "Bild \u00e4ndern",
        change_profile: "Konfigurationsdatei \u00e4ndern",
        copy_preview_link: "Vorschaulink kopieren",
      },
      transaction: {
        approved: "Genehmigt",
        denied: "Bestritten",
        invoice: "Rechnung",
        payment_approved: "Zahlungsstatus",
        plan_name: "Plan Name",
        select_manual_payment: "W\u00e4hlen Sie Manuelle Zahlung",
        subscription_id: "Abonnement-ID",
        transaction_date: "Transaktionsdatum",
        type: "Art",
        user_name: "Name des Arbeitgebers",
      },
      transactions: "Transaktionen",
      translation_manager: "\u00dcbersetzungsmanager",
      user: {
        change_password: "Kennwort \u00e4ndern",
        edit_profile: "Profil bearbeiten",
        email: "Email",
        first_name: "Vorname",
        last_name: "Nachname",
        logout: "Logout",
        name: "Name",
        password: "Passwort",
        password_confirmation: "Passwort best\u00e4tigen",
        phone: "Telefon",
        required_field_messages:
          "Bitte f\u00fcllen Sie alle erforderlichen Felder aus.",
        user_name: "Benutzername",
      },
      user_language: {
        change_language: "Sprache \u00e4ndern",
        language: "Sprache",
      },
      weekdays: {
        fri: "FR",
        mon: "MO",
        sat: "Sa",
        sun: "SONNE",
        thu: "DO",
        tue: "DI",
        wed: "HEIRATEN",
      },
      your_cv: "Ihr Lebenslauf",
    },
    "de.pagination": {
      next: "N\u00e4chster &raquo;",
      previous: "&laquo; Bisherige",
    },
    "de.validation": {
      accepted: "Das :attribute muss akzeptiert werden.",
      active_url: "Das :attribute ist keine g\u00fcltige URL.",
      after: "Das :attribute muss ein Datum nach :date sein.",
      after_or_equal:
        "Das :attribute muss ein Datum nach oder gleich :date sein.",
      alpha: "Das :attribute darf nur Buchstaben enthalten.",
      alpha_dash:
        "Das :attribute darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten.",
      alpha_num: "Das :attribute darf nur Buchstaben und Zahlen enthalten.",
      array: "Das :attribute muss ein Array sein.",
      attributes: [],
      before: "Das :attribute muss ein Datum vor :date sein.",
      before_or_equal:
        "Das :attribute muss ein Datum vor oder gleich :date sein.",
      between: {
        array: "Das :attribute muss zwischen :min und :max liegen.",
        file: "Das :attribute muss zwischen :min und :max Kilobyte liegen.",
        numeric: "Das :attribute muss zwischen :min und :max liegen.",
        string:
          "Das :attribute muss zwischen den Zeichen :min und :max liegen.",
      },
      boolean: "Das :attribute muss wahr oder falsch sein.",
      confirmed:
        "Die Best\u00e4tigung des :attribute stimmt nicht \u00fcberein.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "Das :attribute ist kein g\u00fcltiges Datum.",
      date_equals:
        "Das :attribute muss ein Datum sein, das dem :date entspricht.",
      date_format:
        "Das :attribute stimmt nicht mit dem Format :format \u00fcberein.",
      different: "Das :attribute und :other muss unterschiedlich sein.",
      digits: "Das :attribute muss sein :digits Ziffern.",
      digits_between:
        "Das :attribute muss zwischen den Ziffern :min und :max liegen.",
      dimensions: "Das :attribute hat ung\u00fcltige Bildabmessungen.",
      distinct: "Das :attribute hat einen doppelten Wert.",
      email: "Das :attribute muss eine g\u00fcltige E-Mail-Adresse sein.",
      ends_with:
        "Das :attribute muss mit einem der folgenden Werte enden : :values.",
      exists: "Das :attribute selected ist ung\u00fcltig.",
      file: "Das :attribute muss eine Datei sein.",
      filled: "Das :attribute muss einen Wert haben.",
      gt: {
        array: "Das :attribute muss mehr als :value Elemente enthalten.",
        file: "Das :attribute muss gr\u00f6\u00dfer sein als :value Kilobyte.",
        numeric: "Das :attribute muss gr\u00f6\u00dfer als der :value sein.",
        string: "Das :attribute muss gr\u00f6\u00dfer sein als :value Zeichen.",
      },
      gte: {
        array: "Das :attribute muss mindestens :value Elemente enthalten.",
        file: "Das :attribute muss gr\u00f6\u00dfer oder gleich :value Kilobyte sein.",
        numeric:
          "Das :attribute muss gr\u00f6\u00dfer oder gleich :value sein.",
        string:
          "Das :attribute muss gr\u00f6\u00dfer oder gleich :value zeichen sein.",
      },
      image: "Das :attribute muss ein Bild sein.",
      in: "Das :attribute selected ist ung\u00fcltig.",
      in_array: "Das :attribute existiert nicht in :other.",
      integer: "Das :attribute muss eine Ganzzahl sein.",
      ip: "Das :attribute muss eine g\u00fcltige IP-Adresse sein.",
      ipv4: "Das :attribute muss eine g\u00fcltige IPv4-Adresse sein.",
      ipv6: "Das :attribute muss eine g\u00fcltige IPv6-Adresse sein.",
      json: "Das :attribute muss eine g\u00fcltige JSON-Zeichenfolge sein.",
      lt: {
        array: "Das :attribute muss weniger als :value Elemente enthalten.",
        file: "Das :attribute muss kleiner als :value Kilobyte sein.",
        numeric: "Das :attribute muss kleiner als :value sein.",
        string: "Das :attribute muss kleiner als :value sein.",
      },
      lte: {
        array: "Das :attribute darf nicht mehr als :value Elemente enthalten.",
        file: "Das :attribute muss kleiner oder gleich :value Kilobyte sein.",
        numeric: "Das :attribute muss kleiner oder gleich :value sein.",
        string: "Das :attribute muss kleiner oder gleich :value zeichen sein.",
      },
      max: {
        array: "Das :attribute darf nicht mehr als :max Elemente enthalten.",
        file: "Das :attribute darf nicht gr\u00f6\u00dfer als :max Kilobyte sein.",
        numeric: "Das :attribute darf nicht gr\u00f6\u00dfer sein als :max.",
        string:
          "Das :attribute darf nicht gr\u00f6\u00dfer als :max Zeichen sein.",
      },
      mimes: "Das :attribute muss eine Datei vom Typ : :values sein.",
      mimetypes: "Das :attribute muss eine Datei vom Typ : :values sein.",
      min: {
        array: "Das :attribute muss mindestens :min Elemente enthalten.",
        file: "Das :attribute muss mindestens :min Kilobyte betragen.",
        numeric: "Das :attribute muss mindestens :min sein.",
        string: "Das :attribute muss mindestens :min Zeichen enthalten.",
      },
      not_in: "Das :attribute selected ist ung\u00fcltig.",
      not_regex: "Das :attribute format ist ung\u00fcltig.",
      numeric: "Das :attribute muss eine Zahl sein.",
      password: "Das Passwort ist inkorrekt.",
      present: "Das :attribute muss vorhanden sein.",
      regex: "Das :attribute ist ung\u00fcltig.",
      required: "Das Feld :attribute ist erforderlich.",
      required_if:
        "Das Feld :attribute ist erforderlich, wenn :other ist :value .",
      required_unless:
        "Das :attribute ist erforderlich, es sei denn :other befindet sich in: values.",
      required_with:
        "Das :attribute ist erforderlich, wenn :values vorhanden ist.",
      required_with_all:
        "Das :attribute ist erforderlich, wenn :values vorhanden sind.",
      required_without:
        "Das Feld :attribute ist erforderlich, wenn :values nicht vorhanden ist.",
      required_without_all:
        "Das Feld :attribute ist erforderlich, wenn keiner der Werte vorhanden ist.",
      same: "Das :attribute und :other m\u00fcssen \u00fcbereinstimmen.",
      size: {
        array: "Das :attribute muss Elemente der :Gr\u00f6\u00dfe enthalten.",
        file: "Das :attribute muss :Gr\u00f6\u00dfe Kilobyte sein.",
        numeric: "Das :attribute muss :size sein.",
        string: "Das :attribute muss Zeichen der :Gr\u00f6\u00dfe sein.",
      },
      starts_with:
        "Das :attribute muss mit einem der folgenden Werte beginnen : :values.",
      string: "Das :attribute muss eine Zeichenfolge sein.",
      timezone: "Das :attribute muss eine g\u00fcltige Zone sein.",
      unique: "Das :attribute wurde bereits \u00fcbernommen.",
      uploaded: "Das :attribute konnte nicht hochgeladen werden.",
      url: "Das :attribute format ist ung\u00fcltig.",
      uuid: "Das :attribute muss eine g\u00fcltige UUID sein.",
    },
    "en.messages": {
      about_us: "About Us",
      about_us_services: "About Us Services",
      admin_dashboard: {
        active_jobs: "Active Jobs",
        active_users: "Active Users",
        featured_employers: "Featured Employers",
        featured_employers_incomes: "Featured Employers Incomes",
        featured_jobs: "Featured Jobs",
        featured_jobs_incomes: "Featured Jobs Incomes",
        post_statistics: "Posts Statistics",
        recent_candidates: "Recent Candidates",
        recent_employers: "Recent Employers",
        recent_jobs: "Recent Jobs",
        registered_candidates: "Registered Candidates",
        registered_employer: "Registered Employers",
        subscription_incomes: "Subscription Incomes",
        today_jobs: "Today Jobs",
        total_active_jobs: "Total Active Jobs",
        total_candidates: "Total Candidates",
        total_employers: "Total Employers",
        total_users: "Total Users",
        verified_users: "Verified Users",
        weekly_users: "Weekly Users",
      },
      all_resumes: "All Resumes",
      all_rights_reserved: "All Rights Reserved | NullCave.club",
      applied_job: {
        applied_jobs: "Applied Jobs",
        companies: "Companies",
        job: "Job",
        notes: "Notes",
      },
      apply_job: { apply_job: "Apply Job", notes: "Notes", resume: "Resume" },
      blog_categories: "Blog Categories",
      blogs: "Blogs",
      branding_slider: {
        brand: "Brand",
        edit_branding_slider: "Edit Branding Slider",
        new_branding_slider: "New Branding Slider",
        no_branding_slider_available: "No Branding Slider Available",
        no_branding_slider_found: "No Branding Slider Found",
      },
      branding_sliders: "Branding Sliders",
      brands: "Brands",
      by_signing_up_you_agree_to_our: "By signing up you agree to our",
      candidate: {
        address: "Address",
        admins: "Admins",
        already_reported: "Already Reported",
        available_at: "Available At",
        birth_date: "Birth Date",
        candidate_details: "Candidate Details",
        candidate_language: "Languages",
        candidate_skill: "Skill",
        candidates: "Candidates",
        career_level: "Career Level",
        conform_password: "Confirm Password",
        current_salary: "Current Salary",
        dashboard: "Dashboard",
        edit_admin: "Edit Admin",
        edit_candidate: "Edit Candidate",
        edit_profile_information: "Edit Profile Information",
        education_not_found: "No Education Available.",
        email: "Email",
        email_verified: "Email Verified",
        employee: "Employee",
        expected_salary: "Expected Salary",
        experience: "Experience",
        experience_not_found: "No Experience Available.",
        father_name: "Father Name",
        first_name: "First Name",
        functional_area: "Functional Area",
        gender: "Gender",
        immediate_available: "Immediate Available",
        in_years: "In Years",
        industry: "Industry",
        is_active: "Is Active",
        is_verified: "Is Verified",
        job_alert_message:
          "Notify me By Email when a jobs gets posted that is relevant to my choice.",
        last_name: "Last Name",
        marital_status: "Marital Status",
        national_id_card: "National ID Card",
        nationality: "Nationality",
        new_admin: "New Admin",
        new_candidate: "New Candidate",
        no_candidate_available: "No Candidate Available",
        no_candidate_found: "No Candidate Found",
        no_reported_candidates_available: "No Candidate Reported Available",
        no_reported_candidates_found: "No Candidate Reported Found",
        not_immediate_available: "Not Immediate Available",
        password: "Password",
        phone: "Phone",
        profile: "Profile",
        reporte_to_candidate: "Report To Candidates",
        reported_candidate: "Reported Candidate",
        reported_candidate_detail: "Reported Candidate Details",
        reported_candidates: "Reported Candidates",
        reported_employer: "Reported Employer",
        resume_not_found: "No Resume Available.",
        salary_currency: "Salary Currency",
        salary_per_month: "Salary per month.",
        select_candidate: "Select Candidate",
        0: "Employee",
      },
      candidate_dashboard: {
        followings: "Followings",
        location_information: "Location Information not available.",
        my_cv_list: "My CV List",
        no_not_available: "Number not available.",
        profile_views: "Profile Views",
      },
      candidate_profile: {
        add_education: "Add Education",
        add_experience: "Add Experience",
        age: "Age",
        company: "Company",
        currently_working: "Currently Working",
        degree_level: "Degree Level",
        degree_title: "Degree Title",
        description: "Description",
        edit_education: "Edit Education",
        edit_experience: "Edit Experience",
        education: "Education",
        end_date: "End Date",
        experience: "Experience",
        experience_title: "Experience Title",
        institute: "Institute",
        online_profile: "Online Profile",
        present: "Present",
        result: "Result",
        select_year: "Select Year",
        start_date: "Start Date",
        title: "Title",
        upload_resume: "Upload Resume",
        work_experience: "Work & Experience",
        year: "Year",
        years: "Years",
      },
      candidates: "Candidates",
      career_informations: "Career Informations",
      career_level: {
        edit_career_level: "Edit Career Level",
        level_name: "Level Name",
        new_career_level: "New Career Level",
        no_career_level_available: "No Career Level Available",
        no_career_level_found: "No Career Level Found",
      },
      career_levels: "Career Levels",
      city: {
        cities: "Cities",
        city_name: "City Name",
        edit_city: "Edit City",
        new_city: "New City",
        no_city_available: "No City Available",
        no_city_found: "No City Found",
        state_name: "State Name",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "About Description One",
        about_desc_three: "About Description Three",
        about_desc_two: "About Description Two",
        about_image_one: "About Image One",
        about_image_three: "About Image Three",
        about_image_two: "About Image Two",
        about_title_one: "About Title One",
        about_title_three: "About Title Three",
        about_title_two: "About Title Two",
      },
      cms_service: {
        choose: "Choose",
        home_banner: "Home Banner",
        home_description: "Home Description",
        home_title: "Home Title",
      },
      cms_services: "CMS Services",
      cms_sliders: "CMS Sliders",
      comments: "Comments",
      common: {
        action: "Action",
        active: "Active",
        add: "Add",
        admin_name: "Admin Name",
        all: "All",
        and_time: "and time",
        applied: "Applied",
        applied_on: "Applied On",
        apply: "Apply",
        approved_by: "Approved by",
        are_you_sure: "¿Seguro que quieres eliminar este",
        are_you_sure_want_to_delete: "¿Seguro que quieres eliminar este",
        are_you_sure_want_to_reject: "¿Seguro que quieres rechazar esto",
        are_you_sure_want_to_remove: "¿Estás seguro que quieres eliminar esto",
        are_you_sure_want_to_select: "¿Estás segura que quieres seleccionar ",
        back: "Back",
        cancel: "Cancel",
        category_image: "Category Image",
        choose: "Choose",
        choose_file: "Choose file",
        close: "Close",
        closed: "Closed",
        completed: "Completed",
        copyright: "Copyright",
        created_date: "Created Date",
        created_on: "Created On",
        custom: "Custom",
        de_active: "Deactive",
        decline: "Decline",
        declined: "Declined",
        default_country_code: "Default Country Code",
        delete: "Delete",
        deleted: "Deleted",
        description: "Description",
        design_by: "Design By",
        design_by_name: "InfyOm Labs.",
        download: "Download",
        drafted: "Drafted",
        edit: "Edit",
        email: "Email",
        error: "Error",
        expire: "Expire",
        export_excel: "Export to Excel",
        female: "Female",
        filter: "Filter",
        filter_options: "Filter Options",
        filters: "Filters",
        from: "From",
        has_been_deleted: "has been deleted.",
        has_been_rejected: "has been rejected.",
        has_been_removed: "has been removed.",
        has_been_selected: "has been selected.",
        hello: "Hello",
        hi: "Hi",
        hired: "Hired",
        image_aspect_ratio: "Image aspect ratio should be 1:1.",
        image_file_type: "The image must be a file of type: jpeg, jpg, png.",
        last_change_by: "Last Changes By",
        last_updated: "Last Updated",
        live: "Live",
        login: "Login",
        male: "Male",
        "n/a": "N/A",
        name: "Name",
        no: "No",
        no_cancel: "No,Cancelar",
        not_verified: "Not Verified",
        note: "Note",
        note_message: "Please enter language short code. i.e English = en.",
        ok: "OK",
        ongoing: "Ongoing",
        open: "Open",
        pause: "Pause",
        paused: "Paused",
        preview: "Preview",
        print: "Print",
        process: "Processing...",
        reason: "Reason",
        register: "Register",
        rejected: "Rejected",
        remove: "Remove",
        removed: "removed",
        report: "Report",
        resend_verification_mail: "Resend Verification Mail",
        reset: "Reset",
        save: "Save",
        save_as_draft: "Save As Draft",
        saved_successfully: "saved Successfully",
        search: "Buscar",
        select_job_stage: "Select Job Stage",
        selected: "Selected",
        shortlist: "Shortlisted",
        show: "Show",
        status: "Status",
        success: "Successful",
        this_week: "The Week",
        to: "To",
        updated_successfully: "updated Successfully",
        verified: "Verified",
        view: "View",
        view_more: "View More",
        view_profile: "View Profile",
        view_public_profile: "View Public Profile",
        welcome: "Welcome",
        yes: "Yes",
        yes_delete: "Yes,Delete!",
        you_cancel_slot_date: "You cancel this slot for date",
      },
      companies: "Companies",
      company: {
        candidate_email: "Candidate Email",
        candidate_name: "Candidate Name",
        candidate_phone: "Candidate Phone",
        ceo: "Company CEO",
        ceo_name: "CEO Name",
        city: "City",
        company_details: "Company Details",
        company_listing: "Company Listing",
        company_logo: "Logo",
        company_name: "Company Name",
        company_size: "Size",
        confirm_password: "Confirm Password",
        country: "Country",
        current_password: "Current Password",
        edit_company: "Edit Company",
        edit_employer: "Edit Employer",
        email: "Email",
        email_verified: "Email Verified",
        employer: "Employer",
        employer_ceo: "Employer CEO",
        employer_details: "Employer Details",
        employer_name: "Employer Name",
        employers: "Employers",
        enter_experience_year: "Enter Experience In Year",
        established_in: "Established In",
        established_year: "Established Year",
        facebook_url: "Facebook URL",
        fax: "Fax",
        followers: "Followers",
        google_plus_url: "Google Plus URL",
        image: "Image",
        industry: "Industry",
        is_active: "Is Active",
        is_featured: "Is Featured",
        linkedin_url: "Linkedin URL",
        location: "Location",
        location2: "2nd Office Location",
        name: "Name",
        new_company: "New Company",
        new_employer: "New Employer",
        new_password: "New Password",
        no_employee_found: "No Employee Found",
        no_employee_reported_available: "No Employee Reported  Available",
        no_employer_available: "No Employee Available",
        no_of_offices: "No of Offices",
        no_reported_employer_found: "No Reported Employer Found",
        notes: "Notes",
        offices: "Offices",
        ownership_type: "Ownership Type",
        password: "Password",
        pinterest_url: "Pinterest URL",
        report_to_company: "Report to Company",
        reported_by: "Reported By",
        reported_companies: "Reported Companies",
        reported_company: "Reported Company",
        reported_employer_detail: "Reported Employer Details",
        reported_employers: "Reported Employers",
        reported_on: "Reported On",
        select_career_level: "Select Career Level",
        select_city: "Select City",
        select_company: "Select Company",
        select_company_size: "Select Company Size",
        select_country: "Select Country",
        select_currency: "Select Currency",
        select_degree_level: "Select Degree Level",
        select_employer_size: "Select Employer Size",
        select_established_year: "Select Established Year",
        select_functional_area: "Select Functional Area",
        select_gender: "Select Gender",
        select_industry: "Select Industry",
        select_job_category: "Select Job Category",
        select_job_shift: "Select Job Shift",
        select_job_type: "Select Job Type",
        select_language: "Select Language",
        select_marital_status: "Select Marital Status",
        select_ownership_type: "Select OwnerShip Type",
        select_position: "Select Position",
        select_salary_period: "Select Salary Period",
        select_state: "Select State",
        state: "State",
        title: "Job Title",
        twitter_url: "Twitter URL",
        website: "Website",
      },
      company_size: {
        action: "Action",
        add: "Add",
        company_size: "Company Size",
        edit_company_size: "Edit Company Size",
        new_company_size: "New Company Size",
        no_company_size_available: "No Company Size Available",
        no_company_size_found: "No Company Size Found",
        show_company_size: "Job Category",
        size: "Size",
      },
      company_sizes: "Company Sizes",
      country: {
        countries: "Countries",
        country_name: "Country Name",
        edit_country: "Edit Country",
        new_country: "New Country",
        no_country_available: "No Country Available",
        no_country_found: "No Country Found",
        phone_code: "Phone Code",
        short_code: "Short Code",
      },
      cv_builder: "CV Builder",
      dashboard: "Dashboard",
      datepicker: {
        custom: "Custom Range",
        last_month: "Last Month",
        last_week: "Last Week",
        this_month: "This Month",
        this_week: "This Week",
        today: "Today",
      },
      email_template: {
        body: "Body",
        edit_email_template: "Edit Email Template",
        short_code: "Short Code",
        subject: "Subject",
        template_name: "Template Name",
      },
      email_templates: "Email Templates",
      employer: { job_stage: "Job Stages", job_stage_desc: "Description" },
      employer_dashboard: {
        dashboard: "Dashboard",
        followers: "Followers",
        job_applications: "Job Applications",
        open_jobs: "Open Jobs",
      },
      employer_menu: {
        closed_jobs: "Closed Jobs",
        employer_details_field: "Employer Details field is required.",
        employer_profile: "Employer Profile",
        enter_description: "Enter Description",
        enter_employer_details: "Enter Employer Details",
        enter_industry_details: "Enter Industry Details...",
        enter_ownership_details: "Enter Ownership Details...",
        expires_on: "Expires On",
        followers: "Followers",
        general_dashboard: "General Dashboard",
        jobs: "Jobs",
        live_jobs: "Live Jobs",
        manage_subscriptions: "Manage Subscription",
        no_data_available: "No data available",
        paused_jobs: "Paused Jobs",
        recent_follower: "Recent Follower",
        recent_jobs: "Recent Jobs",
        total_job_applications: "Total Job Applications",
        total_jobs: "Total Jobs",
        transactions: "Transactions",
        valid_facebook_url: "Please enter a valid Facebook URL",
        valid_google_plus_url: "Please enter a valid Google Plus URL",
        valid_linkedin_url: "Please enter a valid Linkedin URL",
        valid_pinterest_url: "Please enter a valid Pinterest URL",
        valid_twitter_url: "Please enter a valid Twitter URL",
      },
      employers: "Employers",
      env: "Env Settings",
      expired_jobs: "Expired Jobs",
      faq: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_faq: "Edit FAQs",
        faq: "FAQs",
        faq_detail: "FAQs Details",
        new_faq: "New FAQs",
        no_faq_available: "No FAQ Available",
        no_faq_found: "No FAQ Found",
        show_faq: "FAQs",
        title: "Title",
      },
      favourite_companies: "Followings",
      favourite_jobs: "Favourite Jobs",
      fileName: "messages.php",
      filter_name: {
        closed: "Closed",
        country: "Country",
        digital: "DIGITAL",
        drafted: "Drafted",
        featured_company: "Featured Company",
        featured_job: "Featured Job",
        freelancer_job: "Freelancer Job",
        immediate: "Immediate",
        job_status: "Job Status",
        live: "Live",
        manually: "MANUALLY",
        paused: "Paused",
        select_featured_company: "Select Featured Company",
        select_featured_job: "Select Featured Job",
        select_status: "Select Status",
        state: "State",
        status: "Status",
        suspended_job: "Suspended Job",
      },
      flash: {
        about_us_update: "About us updated successfully.",
        admin_cant_delete: "Admin cannot be deleted.",
        admin_delete: "Admin deleted successfully.",
        admin_save: "Admin saved successfully.",
        admin_update: "Admin updated successfully.",
        all_notification_read: "Todas las notificaciones fueron leídas correctamente.",
        are_you_sure_to_change_status:
          "Are you sure want to change the status?",
        assigned_slot_not_delete: "Assigned slot should not delete.",
        attention: "Attention",
        brand_delete: "Brand deleted successfully.",
        brand_retrieved: "Brand retrieved successfully.",
        brand_save: "Brand saved successfully.",
        brand_update: "Brand updated successfully.",
        cancel_reason_require: "Cancel reason is required.",
        candidate_delete: "Candidate deleted successfully.",
        candidate_education_delete: "Candidate Education deleted successfully.",
        candidate_education_retrieved:
          "Candidate Education retrieved successfully.",
        candidate_education_save: "Candidate Education added successfully.",
        candidate_education_update: "Candidate Education updated successfully.",
        candidate_experience_delete:
          "Candidate Experience deleted successfully.",
        candidate_experience_retrieved:
          "Candidate Experience retrieved successfully.",
        candidate_experience_save: "Candidate Experience added successfully.",
        candidate_experience_update:
          "Candidate Experience updated successfully.",
        candidate_not_found: "Candidate not found",
        candidate_profile: "Candidate profile updated successfully.",
        candidate_reported: "Candidate Reported successfully.",
        candidate_retrieved: "Candidate retrieved successfully.",
        candidate_save: "Candidate saved successfully.",
        candidate_update: "Candidate updated successfully.",
        career_level_cant_delete: "Career Level can't be deleted.",
        career_level_delete: "Career Level deleted successfully.",
        career_level_retrieved: "Career Level retrieved successfully.",
        career_level_save: "Career Level added successfully.",
        career_level_update: "Career Level updated successfully.",
        city_cant_delete: "City can't be deleted.",
        city_delete: "City deleted successfully.",
        city_retrieved: "City retrieved successfully.",
        city_save: "City saved successfully.",
        city_update: "City updated successfully.",
        close_job: "Closed job can not be edited.",
        cms_service_update: "CMS Services updated successfully.",
        comment_deleted: "Comment deleted successfully.",
        comment_edit: "Comment edit successfully.",
        comment_saved: "Comment saved successfully.",
        comment_updated: "Comment updated successfully.",
        company_delete: "Company deleted successfully.",
        company_mark_feature: "Company mark as featured successfully.",
        company_mark_unFeature: "Company mark as unfeatured successfully.",
        company_save: "Company saved successfully.",
        company_size_cant_delete: "Company Size can't be deleted.",
        company_size_delete: "Company Size deleted successfully.",
        company_size_save: "Company Size saved successfully.",
        company_size_update: "Company Size updated successfully.",
        company_update: "Company updated successfully.",
        country_cant_delete: "Country cannot be deleted.",
        country_delete: "Country deleted successfully.",
        country_save: "Country saved successfully.",
        country_update: "Country updated successfully.",
        default_resume_already_upload: "Default Resume already been uploaded.",
        degree_level_cant_delete: "Degree Level can't be deleted.",
        degree_level_delete: "Degree Level deleted successfully.",
        degree_level_retrieve: "Degree Level Retrieved Successfully.",
        degree_level_save: "Degree Level saved successfully.",
        degree_level_update: "Degree Level updated successfully.",
        description_required: "Description field is required.",
        email_template: "Email Template updated successfully.",
        email_verify: "Email verified successfully.",
        employer_profile: "Employer Profile updated successfully.",
        employer_update: "Employer updated successfully.",
        enter_cancel_reason: "Enter Cancel Reason...",
        enter_description: "Enter description",
        enter_notes: "Enter Notes...",
        enter_post_description: "Enter Post Description",
        faqs_delete: "FAQs deleted successfully.",
        faqs_save: "FAQs saved successfully.",
        faqs_update: "FAQs updated successfully.",
        fav_company_delete: "Favourite Company deleted successfully.",
        fav_job_added: "Trabajo favorito agregado con \u00e9xito.",
        fav_job_remove: "Favourite Job has been removed.",
        fav_job_removed: "Favourite Job removed successfully.",
        feature_job_price: "Featured jobs price should be greater than 0",
        feature_quota: "Featured Quota is Not available",
        featured_not_available: "Featured Quota is Not available.",
        file_type:
          "The document must be a file of type: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete: "Functional Area can't be deleted.",
        functional_area_delete: "Functional Area deleted successfully.",
        functional_area_save: "Functional Area saved successfully.",
        functional_area_update: "Functional Area updated successfully.",
        header_slider_deleted: "Header Slider deleted successfully.",
        header_slider_save: "Header Slider saved successfully.",
        header_slider_update: "Header Slider updated successfully.",
        image_slider_delete: "Image Slider deleted successfully.",
        image_slider_retrieve: "Image Slider Retrieved Successfully.",
        image_slider_save: "Image Slider saved successfully.",
        image_slider_update: "Image Slider updated successfully.",
        industry_cant_delete: "Industry can't be deleted.",
        industry_delete: "Industry deleted successfully.",
        industry_save: "Industry saved successfully.",
        industry_update: "Industry updated successfully.",
        inquiry_deleted: "Inquiry deleted successfully.",
        inquiry_retrieve: "Inquiry Retrieved Successfully.",
        invoice_retrieve: "Invoice Retrieved Successfully.",
        job_abuse_reported: "Job Abuse reported successfully.",
        job_alert: "Job Alert updated successfully.",
        job_application_delete: "Job Application deleted successfully.",
        job_application_draft: "Job Application Drafted Successfully",
        job_applied: "Job Applied Successfully",
        job_apply_by_candidate:
          "El trabajo solicitado por el candidato no se puede eliminar.",
        job_cant_delete: "Job can't be Deleted",
        job_category_cant_delete: "Job Category can't be deleted.",
        job_category_delete: "Job Category Deleted Successfully.",
        job_category_save: "Job Category Saved successfully.",
        job_category_update: "Job Category Update successfully.",
        job_create_limit:
          "Job create limit exceeded of your account, Update your subscription plan.",
        job_delete: "Job deleted successfully.",
        job_draft: "Job Draft saved successfully.",
        job_emailed_to: "Job Emailed to friend successfully.",
        job_make_featured: "Job Make Featured successfully.",
        job_make_unfeatured: "Job Make UnFeatured successfully.",
        job_not_found: "Job Not Found.",
        job_notification: "Job Notification send successfully.",
        job_save: "Job saved successfully.",
        job_schedule_send: "job schedule send successfully.",
        job_shift_cant_delete: "Job Shift can't be deleted.",
        job_shift_delete: "Job Shift deleted successfully.",
        job_shift_retrieve: "Job Shift Retrieved Successfully.",
        job_shift_save: "Job Shift saved successfully.",
        job_shift_update: "Job Shift updated successfully.",
        job_stage_cant_delete: "Job Stage can't be deleted.",
        job_stage_change: "Job Stage changed successfully.",
        job_stage_delete: "Job Stage deleted successfully.",
        job_stage_retrieve: "Job Stage Retrieved Successfully.",
        job_stage_save: "Job Stage saved successfully.",
        job_stage_update: "Job Stage updated successfully.",
        job_tag_cant_delete: "Job Tag can't be deleted.",
        job_tag_delete: "Job Tag deleted successfully.",
        job_tag_retrieve: "Job Tag Retrieved Successfully.",
        job_tag_save: "Job Tag saved successfully.",
        job_tag_update: "Job Tag updated successfully.",
        job_type_cant_delete: "Job Type can't be deleted.",
        job_type_delete: "Job Type deleted successfully.",
        job_type_retrieve: "Job Type Retrieved Successfully.",
        job_type_save: "Job Type saved successfully.",
        job_type_update: "Job Type updated successfully.",
        job_update: "Job updated successfully.",
        language_added: "Language added successfully.",
        language_changed: "Language changed successfully",
        language_delete: "Language Deleted Successfully.",
        language_retrieve: "Language Retrieved Successfully.",
        language_save: "Language Saved successfully.",
        language_update: "Language Updated Successfully.",
        link_copy: "Link Copied Successfully.",
        manual_payment: "Manual Payment Approved successfully.",
        manual_payment_denied: "Manual Payment Denied successfully.",
        marital_status_delete: "Marital Status deleted successfully.",
        marital_status_retrieve: "Marital Status Retrieved Successfully.",
        marital_status_save: "Marital Status saved successfully.",
        marital_status_update: "Marital Status updated successfully.",
        media_delete: "Media deleted successfully.",
        newsletter_delete: "NewsLetter deleted successfully.",
        no_record: "No records found.",
        not_deleted: "Not Deleted",
        noticeboard_retrieve: "Noticeboard Retrieved Successfully.",
        noticeboard_save: "Noticeboard saved successfully.",
        noticeboard_update: "Noticeboard updated successfully.",
        notification_read: "Notification read successfully.",
        notification_setting_update:
          "Notification settings updated successfully.",
        ownership_type_cant_delete: "OwnerShip Type can't be deleted.",
        ownership_type_delete: "OwnerShip Type deleted successfully.",
        ownership_type_retrieve: "OwnerShip Type retrieved successfully.",
        ownership_type_save: "OwnerShip Type saved successfully.",
        ownership_type_updated: "OwnerShip Type updated successfully.",
        password_update: "Password updated successfully.",
        payment_failed_try_again:
          "Sorry! Payment is failed, Try again after some time.",
        payment_not_complete: "Your Payment is not completed",
        payment_success: "Su pago se completó con éxito",
        plan_Save: "Plan saved successfully.",
        plan_cant_delete:
          "Plan can not be deleted, it contains one or more active subscriptions.",
        plan_cant_update:
          "Plan cann't be update. Subscription for this plan is already exists",
        plan_delete: "Plan deleted successfully.",
        plan_retrieve: "Plan Retrieved Successfully.",
        plan_update: "Plan updated successfully.",
        please_wait_for:
          "Please wait for admin approval you already added manual payment",
        please_wait_for_com:
          "Please wait for Admin approval for complete your transaction",
        policy_update: "Policy updated successfully.",
        post_category_delete: "Post category deleted successfully.",
        post_category_retrieve: "Post category Retrieved Successfully.",
        post_category_save: "Post category saved successfully.",
        post_category_update: "Post category updated successfully.",
        post_comment: "Post Comments Retrieved Successfully.",
        post_delete: "Post deleted successfully.",
        post_save: "Post saved successfully.",
        post_update: "Post updated successfully.",
        profile_update: "Profile updated successfully.",
        reason_require: "The Cancel Reason is required.",
        register_success_mail_active:
          "Te has registrado correctamente.",
        registration_done: "Registration done successfully.",
        report_to_company: "Report to company successfully.",
        reported_candidate_delete: "Reported Candidate deleted successfully.",
        reported_job_delete: "Reported Jobs deleted successfully.",
        resume_delete: "Resume delete successfully.",
        resume_update: "Resume updated successfully.",
        retrieved: "Retrieved successfully.",
        salary_currency_cant_delete: "Salary Currency can't be deleted.",
        salary_currency_destroy: "Salary Currency deleted successfully.",
        salary_currency_edit: "Salary Currency retrieved successfully.",
        salary_currency_store: "Salary Currency saved successfully.",
        salary_currency_update: "Salary Currency updated successfully.",
        salary_period_cant_delete: "Salary Period can't be deleted.",
        salary_period_delete: "Salary Period deleted successfully.",
        salary_period_retrieve: "Salary Period Retrieved Successfully.",
        salary_period_save: "Salary Period saved successfully.",
        salary_period_update: "Salary Period updated successfully.",
        select_employer: "Select Employer",
        select_job: "Select Job",
        select_job_skill: "Select Job Skill",
        select_job_tag: "Select Job Tag",
        select_post_category: "Select Post Category",
        select_skill: "Select Skill",
        session_created: "Session created successfully.",
        setting_update: "Setting updated successfully.",
        skill_cant_delete: "Skill can't be deleted.",
        skill_delete: "Skill deleted successfully.",
        skill_save: "Skill saved successfully.",
        skill_update: "Skill updated successfully.",
        slot_already_taken: "Slot already been taken",
        slot_cancel: "Slot Cancel Successfully.",
        slot_choose: "Slot choose successfully",
        slot_create: "Slots Created Successfully",
        slot_delete: "Slot deleted successfully.",
        slot_preference_field: "Slot Preference Field is required",
        slot_reject: "Slots rejected successfully",
        slot_update: "Slot Updated Successfully.",
        state_cant_delete: "State cannot be deleted.",
        state_delete: "State deleted successfully.",
        state_save: "State saved successfully.",
        state_update: "State updated successfully.",
        status_change: "Status changed successfully.",
        status_update: "Status updated successfully.",
        subscribed: "Subscribed successfully.",
        subscription_cancel: "Subscription cancelled successfully.",
        subscription_resume: "Subscription resumed successfully.",
        success_verify:
          "You have successfully verified your email. Please login !",
        testimonial_delete: "Testimonials deleted successfully.",
        testimonial_retrieve: "Testimonials Retrieved Successfully.",
        testimonial_save: "Testimonial saved successfully.",
        testimonial_update: "Testimonials updated successfully.",
        the_name_has: "The name has already been taken",
        there_are_no: "There are no resume uploaded.",
        this_currency_is:
          "This currency is not supported by PayPal for making payments.",
        translation_update: "Translation updated successfully.",
        trial_plan_update: "Trial Plan Updated successfully.",
        unfollow_company: "Unfollow Company successfully.",
        verification_mail: "Verification mail resent successfully.",
        your_are_not_author:
          "Yor are not author of subscription. so you are not allowed to cancel this subscription.",
        your_payment_comp: "La suscripción se ha realizado correctamente",
      },
      footer_settings: "Footer Settings",
      front_cms: "Front CMS",
      front_home: {
        candidates: "Candidates",
        companies: "Companies",
        jobs: "Jobs",
        resumes: "Resumes",
      },
      front_settings: {
        exipre_on: "Exipre On",
        expires_on: "Expires On",
        featured: "Featured",
        featured_companies_days: "Featured Companies Days",
        featured_companies_due_days: "Default Companies Due Days",
        featured_companies_enable: "Featured Companies enable",
        featured_companies_price: "Featured Companies Price",
        featured_companies_quota: "Featured Companies Quota",
        featured_employer_not_available: "Featured Employer Not Available",
        featured_job: "Featured Job",
        featured_jobs_days: "Featured Jobs Days",
        featured_jobs_due_days: "Default Jobs Due Days",
        featured_jobs_enable: "Featured jobs enable",
        featured_jobs_price: "Featured Jobs Price",
        featured_jobs_quota: "Featured Jobs Quota",
        featured_listing_currency: "Featured Listing Currency",
        latest_jobs_enable: "Show latest jobs as per logged in user's country",
        latest_jobs_enable_message:
          "It will show latest jobs of candidate/employer's country when they are logged in",
        make_feature: "Make Feature",
        make_featured: "Make Featured",
        make_featured_job: "Make Featured Job",
        pay_to_get: "Pay to get",
        remove_featured: "Remove Featured",
      },
      functional_area: {
        edit_functional_area: "Edit Functional Area",
        name: "Name",
        new_functional_area: "New Functional Area",
        no_functional_area_available: "No Functional Area Available",
        no_functional_area_found: "No Functional Area Found",
      },
      functional_areas: "Functional Areas",
      general: "General",
      general_dashboard: "General Dashboard",
      general_settings: "General Settings",
      go_to_homepage: "Go To HomePage",
      header_slider: {
        edit_header_slider: "Edit Header Slider",
        header_slider: "Header Slider",
        image_size_message:
          "The image must be of pixel 1920 x 1080 or above pixel.",
        image_title_text:
          "Upload 1920 x 1080 pixels or above pixels image to get best user experience.",
        new_header_slider: "New Header Slider",
        no_header_slider_available: "No Header Slider Available",
      },
      header_sliders: "Header Sliders",
      image_slider: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_image_slider: "Edit Image Slider",
        image: "Image",
        image_extension_message:
          "The image must be a file of type: png, jpg, jpeg.",
        image_size_message:
          "The image must be of pixel 1140 x 500 or above pixel.",
        image_slider: "Image Slider",
        image_slider_details: "Image Slider Details",
        image_title_text:
          "Upload 1140 x 500 pixels or above pixels image to get best user experience.",
        is_active: "Status",
        message: "Enable the home page job search",
        message_title:
          "If this toggle is disabled the default search screen will not be visible.",
        new_image_slider: "New Image Slider",
        no_image_slider_available: "No Image Slider Available",
        no_image_slider_found: "No Image Slider Found",
        select_status: "Select Status",
        slider: "Enable full width slider",
        slider_active: "Enable the home page image slider",
        slider_active_title:
          "If this toggle is disabled the default image slider screen will not be visible.",
        slider_title:
          "If this toggle is enable image slider is full width screen.",
      },
      image_sliders: "Image Sliders",
      industries: "Industries",
      industry: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_industry: "Edit Industry",
        industry_detail: "Industry Details",
        name: "Name",
        new_industry: "New Industry",
        no_industry_available: "No Industry Available",
        no_industry_found: "No Industry Found",
        size: "Size",
      },
      inquires: "Inquiries",
      inquiry: {
        email: "Email",
        inquiry: "Inquiry",
        inquiry_date: "Inquiry Date",
        inquiry_details: "Inquiry Details",
        message: "Message",
        name: "Name",
        no_inquiry_available: "No Inquiry Available",
        no_inquiry_found: "No Inquiry Found",
        phone_no: "Phone No",
        subject: "Subject",
      },
      job: {
        add_note: "Add Note",
        applies_job_not_found: "No Applied Job Found",
        career_level: "Career Level",
        city: "City",
        country: "Country",
        created_at: "Created At",
        currency: "Currency",
        degree_level: "Degree Level",
        description: "Description",
        edit_job: "Edit Job",
        email_to_friend: "Email to Friend",
        expired_job: "Expired job",
        expires_on: "Expires On",
        favourite_companies_not_found: "Favourite Company Not Found",
        favourite_company: "Favourite Company",
        favourite_job: "Trabajo favorito",
        favourite_job_not_found: "No Favorite Jobs Found",
        following_company_not_found: "No Following Company Found",
        friend_email: "Friend Email",
        friend_name: "Friend Name",
        functional_area: "Functional Areas",
        hide_salary: "Hide Salary",
        is_featured: "Is Featured",
        is_freelance: "Is Freelance",
        is_suspended: "Is Suspended",
        job: "Job",
        job_alert: "Job Alerts",
        job_details: "Job Details",
        job_expiry_date: "Job Expiry Date",
        job_shift: "Job Shift",
        job_skill: "Job Skill",
        job_title: "Job Title",
        job_type: "Job Type",
        job_url: "Job URL",
        new_job: "New Job",
        no_applied_job_found: "No Applied Job Available",
        no_favourite_job_found: "No Favorite Jobs Available",
        no_followers_available: "No followers Available",
        no_followers_found: "No followers found",
        no_following_companies_found: "No Following Company Available",
        no_job_reported_available: "No Job Reported Available",
        no_preference: "No Preference",
        no_reported_job_found: "No Reported Job Found",
        notes: "Notes",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "Please enter Salary Range To greater than Salary Range From.",
        position: "Position",
        remove_favourite_jobs: "Remove Favourite Job",
        reported_job: "Reported Job",
        reported_jobs_detail: "Reported Job Details",
        reported_user: "Reported User",
        salary_from: "Salary From",
        salary_period: "Salary Period",
        salary_to: "Salary To",
        state: "State",
        subscriber: "Subscriber",
        view_drafted_job: "View Drafted Job",
        view_notes: "View Notes",
      },
      job_application: {
        application_date: "Application Date",
        candidate_name: "Candidate Name",
        job_application: "Socorrista",
      },
      job_applications: "Job Applications",
      job_categories: "Job Categories",
      job_category: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_job_category: "Edit Job Category",
        is_featured: "Is Featured",
        job_category: "Job Category",
        name: "Name",
        new_job_category: "New Job Category",
        no_job_category_available: "No Job Category Available",
        no_job_category_found: "No Job Category Found",
        show_job_category: "Job Category Details",
      },
      job_experience: {
        edit_job_experience: "Edit Job Experience",
        is_active: "Is Active",
        is_default: "Is Default",
        job_experience: "Job Experience",
        language: "Language",
        new_job_experience: "New Job Experience",
      },
      job_experiences: "Job Experiences",
      job_notification: {
        job_notifications: "Job Notifications",
        no_jobs_available: "No jobs available",
        select_all_jobs: "Select All Jobs",
      },
      job_shift: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_job_shift: "Edit Job Shift",
        job_shift_detail: "Job Shift Details",
        new_job_shift: "New Job Shift",
        no_job_shifts_available: "No Job Shift Available",
        no_job_shifts_found: "No Job Shift Found",
        shift: "Shift",
        show_job_shift: "Job Shift",
        size: "Size",
      },
      job_shifts: "Job Shifts",
      job_skill: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_job_skill: "Edit Job Skill",
        name: "Name",
        new_job_skill: "New Job Skill",
        show_job_skill: "Job Skill",
      },
      job_skills: "Job Skills",
      job_stage: {
        add_slot: "Add Slot",
        add_slots: "Add Slots",
        batch: "Batch",
        cancel_slot: "Cancel Slot",
        cancel_this_slot: "Cancel all slot",
        cancel_your_selected_slot: "Cancel your selected slot",
        candidate_note: "Candidate Note",
        choose_slots: "Choose Slot",
        date: "Date",
        edit_job_stage: "Edit Job Stage",
        edit_slot: "Edit Slot",
        history: "History",
        job_stage: "Job Stage",
        job_stage_detail: "Job Stage Details",
        new_job_stage: "New Job Stage",
        new_slot_send: "New Slot Send",
        no_job_stage_available: "No Job Stage Available",
        no_job_stage_found: "No Job Stage Found",
        no_slot_available: "No Slot Available",
        reject_all_slot: "Reject All Slot",
        rejected_all_slots: "Rejected All Slots",
        send_slot: "Send Slot",
        send_slots: "Send Slots",
        slot: "Slot",
        slot_preference: "Slot Preference",
        slots: "Slots",
        time: "Time",
        you_cancel_this_slot: "You Cancel this slot",
        you_have_rejected_all_slot: "You Have Rejected All Slot",
        you_have_selected_this_slot: "You Have Selected this Slot",
        your_note: "Your Note",
      },
      job_stages: "Job Stages",
      job_tag: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_job_tag: "Edit Job Tag",
        job_tag: "Job Tag",
        job_tag_detail: "Job Tag Details",
        name: "Name",
        new_job_tag: "New Job Tag",
        no_job_tag_available: "No Job Tag Available",
        no_job_tag_found: "No Job Tag Found",
        show_job_tag: "Job Tag",
        size: "Size",
      },
      job_tags: "Job Tags",
      job_type: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_job_type: "Edit Job Type",
        job_type: "Job Type",
        job_type_detail: "Job Type Details",
        name: "Name",
        new_job_type: "New Job Type",
        no_job_type_available: "No Job Type Available",
        no_job_type_found: "No Job Type Found",
        show_job_type: "Job Type",
      },
      job_types: "Job Types",
      jobs: "Jobs",
      language: {
        edit_language: "Edit Language",
        is_active: "Is Active",
        is_default: "Is Default",
        is_rtl: "Is RTL",
        iso_code: "ISO Code",
        language: "Language",
        native: "Native",
        new_language: "New Language",
        no_language_available: "No Language Available",
        no_language_found: "No Language Found",
      },
      "language-name": "en",
      languages: "Languages",
      marital_status: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_marital_status: "Edit Marital Status",
        marital_status: "Marital Status",
        marital_status_detail: "Marital Status Details",
        new_marital_status: "New Marital Status",
        no_marital_status_available: "No Marital Status Available",
        no_marital_status_found: "No Marital Status Found",
        show_marital_status: "Marital Status",
      },
      marital_statuses: "Marital Status",
      months: {
        apr: "Apr",
        aug: "Aug",
        dec: "Dec",
        feb: "Feb",
        jan: "Jan",
        jul: "Jul",
        jun: "Jun",
        mar: "Mar",
        may: "May",
        nov: "Nov",
        oct: "Oct",
        sep: "Sep",
      },
      no_keyword_found: "No Keyword Found",
      no_skills: "No Skills",
      no_subscriber_available: "No Subscriber Available",
      no_subscriber_found: "No Subscriber Found",
      noticeboard: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_noticeboard: "Edit Noticeboard",
        is_active: "Is Active",
        new_noticeboard: "New Noticeboard",
        no_noticeboard_available: "No Noticeboard Available",
        no_noticeboard_found: "No Noticeboard Found",
        noticeboard: "Noticeboard",
        noticeboard_detail: "Noticeboard Details",
        title: "Title",
      },
      noticeboards: "Noticeboards",
      notification: {
        company: "Company",
        company_marked_featured: "The company marked as featured by",
        empty_notifications: "We couldn't find any notifications",
        job_application_rejected_message: "Your application is Rejected for",
        job_application_select_message: "You are selected for",
        job_application_shortlist_message:
          "Your application is Shortlisted for",
        job_application_submitted: "Solicitud de trabajo presentada por ",
        mark_all_as_read: "Mark All As Read",
        marked_as_featured: "marked as featured",
        new_candidate_registered: "New Candidate Registered",
        new_employer_registered: "New Employer Registered",
        notifications: "Notifications",
        purchase: "compra",
        read_notification: "Notification read successfully",
        started_following: "Comenzó a seguir",
        started_following_you: "Comenzó a seguirte.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB: "When a candidate rejected for Job",
        CANDIDATE_SELECTED_FOR_JOB: "When a candidate selected for Job",
        CANDIDATE_SHORTLISTED_FOR_JOB: "When a candidate shortlisted for Job",
        EMPLOYER_PURCHASE_PLAN:
          "When an employer purchases a subscription plan",
        FOLLOW_COMPANY: "When a candidate starts to follow Company",
        FOLLOW_JOB: "When a candidate starts to follow Jobs",
        JOB_ALERT: "When an employer create a Job",
        JOB_APPLICATION_SUBMITTED:
          "When candidate submitting a new Job Application",
        MARK_COMPANY_FEATURED: "When admin mark Company as Featured",
        MARK_COMPANY_FEATURED_ADMIN: "When employer mark Company as Featured",
        MARK_JOB_FEATURED: "When admin mark Job as Featured",
        MARK_JOB_FEATURED_ADMIN: "When employer mark Job as Featured",
        NEW_CANDIDATE_REGISTERED: "When a new candidate Registered",
        NEW_EMPLOYER_REGISTERED: "When a new employer Registered",
        admin: "Admin",
        blog_category: "Blog Category",
        candidate: "Candidate",
        employer: "Employer",
      },
      ownership_type: {
        edit_ownership_type: "Edit Ownership Type",
        new_ownership_type: "New Ownership Type",
        no_ownership_type_available: "No Ownership Type Available",
        no_ownership_type_found: "No Ownership Type Found",
        ownership_type: "Ownership Type",
        ownership_type_detail: "Ownership Type Details",
      },
      ownership_types: "Ownership Types",
      phone: {
        invalid_country_code: "Invalid country code",
        invalid_number: "Invalid number",
        too_long: "Too long",
        too_short: "Too short",
        valid_number: "Valid Number",
      },
      plan: {
        active_subscription: "Active Subscriptions",
        allowed_jobs: "Allowed Jobs",
        amount: "Amount",
        cancel_reason: "Cancel Reason",
        cancel_subscription: "Cancel Subscription",
        currency: "Currency",
        current_plan: "Current Plan",
        edit_plan: "Edit Plan",
        edit_subscription_plan: "Edit Subscription Plan",
        ends_at: "Ends At",
        is_trial_plan: "Is Trial Plan",
        job_allowed: "Job Allowed",
        job_used: "Job Used",
        jobs_allowed: "Jobs Allowed",
        jobs_used: "Jobs Used",
        new_plan: "Add Plan",
        new_subscription_plan: "Add Subscription Plan",
        pay_with_manually: "Pay With Manually",
        pay_with_paypal: "Pay with Paypal",
        pay_with_stripe: "Pay with Stripe",
        per_month: "Per Month",
        plan: "Plan",
        plan_amount_cannot_be_changes: "Note:- Plan Amount Cannot Be Change.",
        pricing: "Pricing",
        processing: "Processing",
        purchase: "Compra",
        renews_on: "Renews On",
        subscription_cancelled: "Subscription Cancelled",
        subscriptions: "Subscriptions",
        upgrade: "Upgrade",
      },
      plans: "Plans",
      position: {
        edit_position: "Edit Position",
        new_position: "New Position",
        position: "Position",
      },
      positions: "Positions",
      post: {
        action: "Action",
        add: "Add",
        blog: "Blog",
        comment: "Comment",
        comments: "Comments",
        description: "Description",
        edit_post: "Edit Post",
        image: "Image",
        new_post: "New Post",
        no_posts_available: "No Posts Available",
        no_posts_found: "No Post Found",
        post: "Post",
        post_a_comments: "Post a Comment",
        post_details: "Post Details",
        posts: "Posts",
        select_post_categories: "Select Post Categories",
        show_post: "Post",
        title: "Title",
      },
      post_category: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_post_category: "Edit Post Category",
        name: "Name",
        new_post_category: "New Post Category",
        no_post_category_available: "No Post Category Available",
        no_post_category_found: "No Post Category Found",
        post_categories: "Post Categories",
        post_category: "Post Category",
        post_category_detail: "Post Category Details",
        show_post_category: "Post Category",
      },
      post_comment: {
        post_comment: "Post Comment",
        post_comment_details: "Post Comment Details",
      },
      post_comments: "Post Comments",
      pricing_table: { get_started: "Get started" },
      pricings_table: "Pricing Tables",
      professional_skills: "Professional Skills",
      profile: "Profile",
      recent_blog: "Recent blogs",
      remember_me: "Remember me",
      reported_jobs: "Reported Jobs",
      required_degree_level: {
        edit_required_degree_level: "Edit Degree Level",
        name: "Name",
        new_required_degree_level: "New Degree Level",
        no_degree_level_available: "No Degree Level Available",
        no_degree_level_found: "No Degree Level Found",
        show_required_degree_level: "Degree Level",
      },
      required_degree_levels: "Degree Levels",
      resumes: {
        candidate_name: "Candidate Name",
        file: "File",
        name: "Name",
        no_resume_available: "No Resume Available",
        no_resume_found: "No Resume Found",
        resume_name: "File Name",
      },
      salary_currencies: "Salary Currencies",
      salary_currency: {
        currency_code: "Currency Code",
        currency_icon: "Currency Icon",
        currency_name: "Currency Name",
        edit_salary_currency: "Edit Salary Currency",
        new_salary_currency: "New Salary Currency",
        no_salary_currency_available: "No Salary Currency Available",
        no_salary_currency_found: "No Salary Currency Found",
      },
      salary_period: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_salary_period: "Edit Salary Period",
        new_salary_period: "New Salary Period",
        no_salary_period_available: "No Salary Period Available",
        no_salary_period_found: "No Salary Period Found",
        period: "Period",
        salary_period: "Salary Period",
        salary_period_detail: "Salary Period Details",
        size: "Size",
      },
      salary_periods: "Salary Periods",
      save: "Save",
      see_all_plans: "See All Plans",
      selected_candidate: "Selected Candidates",
      setting: {
        about_us: "About Us",
        address: "Address",
        application_name: "Application Name",
        choose: "Choose",
        company_description: "Company Description",
        company_url: "Company URL",
        configuration_update: "Configuration Update",
        cookie: "Cookie",
        current_version: "Current Version",
        disable_cookie: "Disable Cookie",
        disable_edit: "Disable Edit",
        email: "Email",
        enable_cookie: "Enable Cookie",
        enable_edit: "Enable Edit",
        enable_google_recaptcha:
          "Enable Google reCAPTCHA for Employers, Candidate registration and Contact Us screen.",
        facebook: "Facebook",
        facebook_app_id: "Facebook App ID",
        facebook_app_secret: "Facebook App Secret",
        facebook_redirect: "Facebook Redirect",
        facebook_url: "Facebook URL",
        favicon: "Favicon",
        front_settings: "Front Settings",
        general: "General",
        google: "Google",
        google_client_id: "Google Client ID",
        google_client_secret: "Google Client Secret",
        google_plus_url: "URL Instagram",
        google_redirect: "Google Redirect",
        image_validation: "The image must be of pixel 90 x 60.",
        linkedIn_url: "LinkedIn URL",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Id",
        linkedin_client_secret: "LinkedIn Client Secret",
        logo: "Logo",
        mail: "Mail",
        mail__from_address: "Mail From Address",
        mail_host: "Mail Host",
        mail_mailer: "Mail Mailer",
        mail_password: "Mail Password",
        mail_port: "Mail Port",
        mail_username: "Mail Username",
        notification_settings: "Notification Settings",
        paypal: "Paypal",
        paypal_client_id: "Paypal Client ID",
        paypal_secret: "Paypal Secret",
        phone: "Phone",
        privacy_policy: "Privacy Policy",
        pusher: "Pusher",
        pusher_app_cluster: "Pusher App Cluster",
        pusher_app_id: "Pusher App ID",
        pusher_app_key: "Pusher App Key",
        pusher_app_secret: "Pusher App Secret",
        social_settings: "Social Settings",
        stripe: "Stripe",
        stripe_key: "Stripe Key",
        stripe_secret_key: "Stripe Secret Key",
        stripe_webhook_key: "Stripe Webhook Key",
        term_conditions: "Term & Conditons",
        terms_conditions: "Terms And Conditions",
        twitter_url: "Twitter URL",
        update_application_configuration:
          "You are about to update application configuration values, want to continue ?",
      },
      settings: "Settings",
      skill: {
        action: "Action",
        add: "Add",
        description: "Description",
        edit_skill: "Edit  Skill",
        name: "Name",
        new_skill: "New Skill",
        no_skill_available: "No Skill Available",
        no_skill_found: "No Skill Found",
        show_skill: "Skill",
        skill_detail: "Skill Details",
      },
      skills: "Skills",
      social_media: "Social Media",
      social_settings: "Social Settings",
      state: {
        country_name: "Country Name",
        edit_state: "Edit State",
        new_state: "New State",
        no_state_available: "No State Available",
        no_state_found: "No State Found",
        state_name: "State Name",
        states: "States",
      },
      subscriber: { email: "Email" },
      subscribers: "Subscribers",
      subscriptions_plans: "Subscription Plans",
      term_conditions: "Term & Conditons",
      testimonial: {
        customer_image: "Customer Image",
        customer_name: "Customer Name",
        description: "Description",
        edit_testimonial: "Edit Testimonial",
        new_testimonial: "New Testimonial",
        no_testimonial_available: "No Testimonial Available",
        no_testimonial_found: "No Testimonial Found",
        testimonial: "Testimonial",
        testimonial_detail: "Testimonial Details",
        testimonials: "Testimonials",
      },
      testimonials: "Testimonials",
      tooltip: {
        change_app_logo: "Change app logo",
        change_category_image: "Change category image",
        change_favicon: "Change favicon",
        change_home_banner: "Change home banner",
        change_image: "Change Image",
        change_profile: "Change Profile",
        copy_preview_link: "Copy Preview Link",
      },
      transaction: {
        approved: "Approved",
        denied: "Denied",
        invoice: "Invoice",
        payment_approved: "Payment Status",
        plan_name: "Plan Name",
        select_manual_payment: "Select Manual Payment",
        subscription_id: "Subscription Id",
        transaction_date: "Transaction Date",
        type: "Type",
        user_name: "Employer Name",
      },
      transactions: "Transactions",
      translation_manager: "Translation Manager",
      user: {
        change_password: "Change Password",
        edit_profile: "Edit Profile",
        email: "Email",
        first_name: "First Name",
        last_name: "Last Name",
        logout: "Logout",
        name: "Name",
        password: "Password",
        password_confirmation: "Confirm Password",
        phone: "Phone",
        profile_picture: "Profile Picture",
        required_field_messages: "Please fill all the required fields.",
        user_name: "Username",
      },
      user_language: {
        change_language: "Change Language",
        language: "Language",
      },
      weekdays: {
        fri: "FRI",
        mon: "MON",
        sat: "SAT",
        sun: "SUN",
        thu: "THU",
        tue: "TUE",
        wed: "WED",
      },
      your_cv: "Your CV",
    },
    "en.pagination": { next: "Next &raquo;", previous: "&laquo; Previous" },
    "en.validation": {
      accepted: "The :attribute must be accepted.",
      active_url: "The :attribute is not a valid URL.",
      after: "The :attribute must be a date after :date.",
      after_or_equal: "The :attribute must be a date after or equal to :date.",
      alpha: "The :attribute must only contain letters.",
      alpha_dash:
        "The :attribute must only contain letters, numbers, dashes and underscores.",
      alpha_num: "The :attribute must only contain letters and numbers.",
      array: "The :attribute must be an array.",
      attributes: [],
      before: "The :attribute must be a date before :date.",
      before_or_equal:
        "The :attribute must be a date before or equal to :date.",
      between: {
        array: "The :attribute must have between :min and :max items.",
        file: "The :attribute must be between :min and :max kilobytes.",
        numeric: "The :attribute must be between :min and :max.",
        string: "The :attribute must be between :min and :max characters.",
      },
      boolean: "The :attribute field must be true or false.",
      confirmed: "The :attribute confirmation does not match.",
      current_password: "The password is incorrect.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "The :attribute is not a valid date.",
      date_equals: "The :attribute must be a date equal to :date.",
      date_format: "The :attribute does not match the format :format.",
      different: "The :attribute and :other must be different.",
      digits: "The :attribute must be :digits digits.",
      digits_between: "The :attribute must be between :min and :max digits.",
      dimensions: "The :attribute has invalid image dimensions.",
      distinct: "The :attribute field has a duplicate value.",
      email: "The :attribute must be a valid email address.",
      ends_with: "The :attribute must end with one of the following: :values.",
      exists: "The selected :attribute is invalid.",
      file: "The :attribute must be a file.",
      filled: "The :attribute field must have a value.",
      gt: {
        array: "The :attribute must have more than :value items.",
        file: "The :attribute must be greater than :value kilobytes.",
        numeric: "The :attribute must be greater than :value.",
        string: "The :attribute must be greater than :value characters.",
      },
      gte: {
        array: "The :attribute must have :value items or more.",
        file: "The :attribute must be greater than or equal :value kilobytes.",
        numeric: "The :attribute must be greater than or equal :value.",
        string:
          "The :attribute must be greater than or equal :value characters.",
      },
      image: "The :attribute must be an image.",
      in: "The selected :attribute is invalid.",
      in_array: "The :attribute field does not exist in :other.",
      integer: "The :attribute must be an integer.",
      ip: "The :attribute must be a valid IP address.",
      ipv4: "The :attribute must be a valid IPv4 address.",
      ipv6: "The :attribute must be a valid IPv6 address.",
      json: "The :attribute must be a valid JSON string.",
      lt: {
        array: "The :attribute must have less than :value items.",
        file: "The :attribute must be less than :value kilobytes.",
        numeric: "The :attribute must be less than :value.",
        string: "The :attribute must be less than :value characters.",
      },
      lte: {
        array: "The :attribute must not have more than :value items.",
        file: "The :attribute must be less than or equal :value kilobytes.",
        numeric: "The :attribute must be less than or equal :value.",
        string: "The :attribute must be less than or equal :value characters.",
      },
      max: {
        array: "The :attribute must not have more than :max items.",
        file: "The :attribute must not be greater than :max kilobytes.",
        numeric: "The :attribute must not be greater than :max.",
        string: "The :attribute must not be greater than :max characters.",
      },
      mimes: "The :attribute must be a file of type: :values.",
      mimetypes: "The :attribute must be a file of type: :values.",
      min: {
        array: "The :attribute must have at least :min items.",
        file: "The :attribute must be at least :min kilobytes.",
        numeric: "The :attribute must be at least :min.",
        string: "The :attribute must be at least :min characters.",
      },
      multiple_of: "The :attribute must be a multiple of :value.",
      not_in: "The selected :attribute is invalid.",
      not_regex: "The :attribute format is invalid.",
      numeric: "The :attribute must be a number.",
      password: "The password is incorrect.",
      present: "The :attribute field must be present.",
      prohibited: "The :attribute field is prohibited.",
      prohibited_if:
        "The :attribute field is prohibited when :other is :value.",
      prohibited_unless:
        "The :attribute field is prohibited unless :other is in :values.",
      regex: "The :attribute format is invalid.",
      required: "The :attribute field is required.",
      required_if: "The :attribute field is required when :other is :value.",
      required_unless:
        "The :attribute field is required unless :other is in :values.",
      required_with:
        "The :attribute field is required when :values is present.",
      required_with_all:
        "The :attribute field is required when :values are present.",
      required_without:
        "The :attribute field is required when :values is not present.",
      required_without_all:
        "The :attribute field is required when none of :values are present.",
      same: "The :attribute and :other must match.",
      size: {
        array: "The :attribute must contain :size items.",
        file: "The :attribute must be :size kilobytes.",
        numeric: "The :attribute must be :size.",
        string: "The :attribute must be :size characters.",
      },
      starts_with:
        "The :attribute must start with one of the following: :values.",
      string: "The :attribute must be a string.",
      timezone: "The :attribute must be a valid zone.",
      unique: "The :attribute has already been taken.",
      uploaded: "The :attribute failed to upload.",
      url: "The :attribute format is invalid.",
      uuid: "The :attribute must be a valid UUID.",
    },
    "es.messages": {
      about_us: "Sobre nosotras",
      about_us_services: "Sobre nosotras Servicios",
      admin_dashboard: {
        active_jobs: "Activa Trabajos",
        active_users: "Activa Los usuarios",
        featured_employers: "Empleadores destacados",
        featured_employers_incomes: "Ingresos destacados de empleadores",
        featured_jobs: "Destacadas Trabajos",
        featured_jobs_incomes: "Ingresos de trabajos destacados",
        post_statistics: "Estad\u00edsticas de publicaciones",
        recent_candidates: "Candidatos recientes",
        recent_employers: "Empleadores recientes",
        recent_jobs: "Reciente Trabajos",
        registered_candidates: "Registrada Candidatas",
        registered_employer: "Empleadores registrados",
        subscription_incomes: "Ingresos de suscripci\u00f3n",
        today_jobs: "Hoy Trabajos",
        total_active_jobs: "Total de trabajos activos",
        total_candidates: "Candidatos totales",
        total_employers: "Empleadores totales",
        total_users: "Total Los usuarios",
        verified_users: "Verificada Los usuarios",
        weekly_users: "Usuarias semanales",
      },
      all_resumes: "Todos los CV",
      all_rights_reserved: "Todos los derechos reservados",
      applied_job: {
        applied_jobs: "Aplicada Jobs",
        companies: "Compa\u00f1\u00edas",
        job: "Trabajo",
        notes: "Notas",
      },
      apply_job: {
        apply_job: "Aplicar Trabajo",
        notes: "Notas",
        resume: "Curr\u00edculum",
      },
      blog_categories: "Blog Categorias",
      blogs: "Blogs",
      branding_slider: {
        brand: "Marca",
        edit_branding_slider: "Editar control deslizante de marca",
        new_branding_slider: "Nuevo control deslizante de marca",
        no_branding_slider_available:
          "No hay control deslizante de marca disponible",
        no_branding_slider_found:
          "No se encontr\u00f3 el control deslizante de marca",
      },
      branding_sliders: "Deslizadores de marca",
      brands: "Marcas",
      candidate: {
        address: "Habla a",
        admins: "Administradores",
        already_reported: "Ya Reportado",
        available_at: "Disponible en",
        birth_date: "Birth Fecha",
        candidate_details: "Candidata Details",
        candidate_language: "Idiomas",
        candidate_skill: "Habilidad",
        candidates: "Candidatas",
        career_level: "Carrera Nivel",
        conform_password: "Confirmar Contrase\u00f1a",
        current_salary: "Actual Salario",
        dashboard: "Tablero",
        edit_admin: "Editar administrador",
        edit_candidate: "Editar Candidata",
        edit_profile_information: "Editar Perfil Informaci\u00f3n",
        education_not_found: "No hay educaci\u00f3n disponible.",
        email: "Email",
        email_verified: "Correo Electr\u00f3nico Verificado",
        employee: "Empleada",
        expected_salary: "Sueldo esperado",
        experience: "Experiencia",
        experience_not_found: "No hay experiencia disponible.",
        expired_job: "trabajo caducado",
        father_name: "Padre Nombre",
        first_name: "Primera Nombre",
        functional_area: "Funcional Zona",
        gender: "G\u00e9nero",
        immediate_available: "Inmediata Disponible",
        in_year: "En a\u00f1os",
        industry: "Industria",
        is_active: "Es Active",
        is_verified: "Es Verified",
        job_alert_message:
          "Notificarme por correo electr\u00f3nico cuando se publique un trabajo que sea relevante para mi elecci\u00f3n.",
        last_name: "\u00daltima Nombre",
        marital_status: "Marital Estado",
        national_id_card: "Nacional ID Tarjeta",
        nationality: "Nacionalidad",
        new_admin: "Nuevo administrador",
        new_candidate: "Nueva Candidata",
        no_candidate_available: "Ning\u00fan candidato disponible",
        no_candidate_found: "Ninguna candidata encontrada",
        no_reported_candidates_available:
          "Ning\u00fan candidato informado disponible",
        no_reported_candidates_found:
          "No se ha encontrado ning\u00fan candidato informado",
        not_immediate_available: "Not Inmediata Disponible",
        password: "Contrase\u00f1a",
        phone: "Tel\u00e9fono",
        profile: "Perfil",
        reporte_to_candidate: "Reporte a los candidatos",
        reported_candidate: "Candidata reportada",
        reported_candidate_detail: "Detalle de la candidata reportada",
        reported_candidates: "Candidatos reportados",
        reported_employer: "Empleador denunciado",
        resume_not_found: "No hay curr\u00edculum disponible.",
        salary_currency: "Salario Moneda",
        salary_per_month: "Salario por mes.",
        select_candidate: "Seleccionar candidata",
      },
      candidate_dashboard: {
        followings: "Seguimientos",
        location_information: "Ubicaci\u00f3n Informaci\u00f3n not disponible.",
        my_cv_list: "Mi CV Lista",
        no_not_available: "N\u00famero not disponible.",
        profile_views: "Perfil Puntos de vista",
      },
      candidate_profile: {
        add_education: "A\u00f1adir Educaci\u00f3n",
        add_experience: "A\u00f1adir Experiencia",
        age: "Age",
        company: "Empresa",
        currently_working: "Actualmente Trabajando",
        degree_level: "La licenciatura Nivel",
        degree_title: "La licenciatura T\u00edtulo",
        description: "Descripci\u00f3n",
        edit_education: "Editar Educaci\u00f3n",
        edit_experience: "Editar Experiencia",
        education: "Educaci\u00f3n",
        end_date: "Final Date",
        experience: "Experiencia",
        experience_title: "Experiencia T\u00edtulo",
        institute: "Instituto",
        online_profile: "Perfil en l\u00ednea",
        present: "Presente",
        result: "Resultado",
        select_year: "Seleccionar a\u00f1o",
        start_date: "comienzo Fecha",
        title: "T\u00edtulo",
        upload_resume: "Upload Curr\u00edculum",
        work_experience: "Experiencia laboral",
        year: "A\u00f1o",
        years: "A\u00f1os",
      },
      candidates: "Candidatas",
      career_informations: "Informaci\u00f3n de carrera",
      career_level: {
        edit_career_level: "Editar Carrera Nivel",
        level_name: "Nivel Nombre",
        new_career_level: "Nueva Carrera Nivel",
        no_career_level_available: "No hay nivel de carrera disponible",
        no_career_level_found:
          "No se encontr\u00f3 ning\u00fan nivel de carrera",
      },
      career_levels: "Carrera Niveles",
      city: {
        cities: "Ciudades",
        city_name: "Nombre de la ciudad",
        edit_city: "Editar ciudad",
        new_city: "Ciudad Nueva",
        no_city_available: "No hay ciudad disponible",
        no_city_found: "No se ha encontrado ninguna ciudad",
        state_name: "Nombre del Estado",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "Acerca de Descripci\u00f3n Uno",
        about_desc_three: "Acerca de Descripci\u00f3n Tres",
        about_desc_two: "Acerca de Descripci\u00f3n Dos",
        about_image_one: "Acerca de la imagen uno",
        about_image_three: "Acerca de la imagen tres",
        about_image_two: "Acerca de la imagen dos",
        about_title_one: "Acerca del T\u00edtulo Uno",
        about_title_three: "Sobre el T\u00edtulo Tres",
        about_title_two: "Sobre el T\u00edtulo Dos",
      },
      cms_service: {
        choose: "Elegir",
        home_banner: "Bandera de inicio",
        home_description: "Descripci\u00f3n de la casa",
        home_title: "T\u00edtulo de la casa",
      },
      cms_services: "Servicios CMS",
      cms_sliders: "Deslizadores CMS",
      common: {
        action: "Acci\u00f3n",
        active: "Activa",
        add: "A\u00f1adir",
        admin_name: "Nombre del administrador",
        all: "Todos",
        and_time: "y tiempo",
        applied: "Aplicado",
        applied_on: "Aplicado en",
        apply: "Aplicar",
        approved_by: "Aprobado por",
        are_you_sure: "\u00bfEst\u00e1s segura que quieres eliminar esto?",
        are_you_sure_want_to_delete:
          "\u00bfEst\u00e1 seguro que desea eliminar esto?",
        are_you_sure_want_to_reject:
          "\u00bfEst\u00e1s seguro que quieres rechazar esto?",
        are_you_sure_want_to_select:
          "\u00bfEst\u00e1s seguro que quieres seleccionar esto?",
        back: "Espalda",
        cancel: "Cancelar",
        category_image: "Imagen de categor\u00eda",
        choose: "Escoger",
        choose_file: "Escoger expediente",
        close: "Cerca",
        completed: "Terminada",
        copyright: "Derechos de autor",
        created_date: "Fecha de creaci\u00f3n",
        created_on: "Creada En",
        custom: "Disfraz",
        de_active: "Deactive",
        decline: "Disminuci\u00f3n",
        declined: "Rechazado",
        default_country_code: "C\u00f3digo de pa\u00eds predeterminado",
        delete: "Eliminar",
        deleted: "Deleted",
        description: "Descripci\u00f3n",
        design_by: "Dise\u00f1o Por",
        design_by_name: "InfyOm Laboratorios.",
        download: "Descargar",
        drafted: "Redactado",
        edit: "Editar",
        email: "Email",
        error: "Error",
        expire: "Expirar",
        export_excel: "Nach Excel exportieren",
        female: "Hembra",
        filter_options: "Opciones de filtro",
        filters: "Filtros",
        from: "De",
        has_been_deleted: "ha sido eliminado.",
        has_been_rejected: "Ha sido rechazado.",
        has_been_selected: "has sido seleccionado.",
        hello: "Hola",
        hi: "Hola",
        hired: "Contratado",
        image_aspect_ratio:
          "La relaci\u00f3n de aspecto de la imagen debe ser 1: 1.",
        image_file_type:
          "La imagen debe ser un archivo de tipo: jpeg, jpg, png.",
        last_change_by: "\u00daltimos cambios por",
        last_updated: "\u00daltima Actualizada",
        live: "En Vivo",
        login: "Iniciar sesi\u00f3n",
        male: "Masculina",
        "n/a": "N/A",
        name: "Nombre",
        no: "No",
        no_cancel: "No,Cancelar",
        not_verified: "No Verificada",
        note: "Nota",
        note_message:
          "Ingrese el c\u00f3digo corto de idioma. es decir, ingl\u00e9s = en.",
        ok: "OK",
        ongoing: "En curso",
        open: "abierta",
        pause: "pausa",
        paused: "Pausado",
        preview: "Avance",
        print: "Impresi\u00f3n",
        process: "Procesando...",
        reason: "Raz\u00f3n",
        register: "Registrarse",
        rejected: "rechazada",
        report: "Reporte",
        resend_verification_mail: "Reenviar correo de verificaci\u00f3n",
        reset: "Reiniciar",
        save: "Salvar",
        save_as_draft: "Guardar como borrador",
        saved_successfully: " Guardado exitosamente",
        search: "B\u00fasqueda",
        select_job_stage: "Seleccione la etapa del trabajo",
        selected: "Seleccionado",
        shortlist: "Lista corta",
        show: "Espect\u00e1culo",
        status: "Estado",
        success: " Exitoso",
        to: "A",
        updated_successfully: " actualizado con \u00e9xito",
        verified: "Verificada",
        view: "Ver",
        view_more: "Ver M\u00e1s",
        view_profile: "Ver nombre",
        welcome: "Bienvenidas",
        yes: "si",
        yes_delete: "S\u00ed, eliminar!",
        you_cancel_slot_date: "Cancelas este espacio para la fecha",
      },
      companies: "Compa\u00f1\u00edas",
      company: {
        candidate_email: "Candidata Email",
        candidate_name: "Candidata Nombre",
        candidate_phone: "Candidata Tel\u00e9fono",
        ceo: "Nombre del CEO",
        ceo_name: "nombre del ceo",
        city: "Ciudad",
        company_details: "Empresa Detalles",
        company_listing: "Empresa Listado",
        company_logo: "Logo",
        company_name: "Nombre",
        company_size: "Talla",
        confirm_password: "Confirmar Contrase\u00f1a",
        country: "Pa\u00eds",
        current_password: "contrase\u00f1a actual",
        edit_company: "Editar Empresa",
        edit_employer: "Editar empleador",
        email: "Email",
        email_verified: "Correo Electr\u00f3nico Verificado",
        employer: "Empleador",
        employer_ceo: "CEO empleador",
        employer_details: "Detalles del empleador",
        employer_name: "Nombre del empleador",
        employers: "Empleadores",
        enter_experience_year: "Ingrese la experiencia en el a\u00f1o",
        established_in: "Establecida En",
        established_year: "el a\u00f1o establecido",
        facebook_url: "Facebook URL",
        fax: "Fax",
        followers: "Seguidoras",
        google_plus_url: "URL Instagram",
        image: "Imagen",
        industry: "Industria",
        is_active: "Es Activa",
        is_featured: "Es Destacadas",
        linkedin_url: "URL de Linkedin",
        location: "Ubicaci\u00f3n",
        location2: "2da ubicaci\u00f3n de la oficina",
        name: "Nombre",
        new_company: "Nueva Empresa",
        new_employer: "Nuevo empleador",
        new_password: "Nueva contrase\u00f1a",
        no_employee_found: "Ninguna empleada encontrada",
        no_employee_reported_available:
          "No hay informes de empleados disponibles",
        no_employer_available: "No hay empleados disponibles",
        no_of_offices: "No de Oficinas",
        no_reported_employer_found:
          "No se encontr\u00f3 ning\u00fan empleador informado",
        notes: "Notas",
        offices: "Oficinas",
        ownership_type: "Propiedad Tipo",
        password: "Contrase\u00f1a",
        pinterest_url: "URL de Pinterest",
        report_to_company: "Reporte a Empresa",
        reported_by: "Reportado por",
        reported_companies: "Reportada Compa\u00f1\u00edas",
        reported_company: "Reportada Empresa",
        reported_employer_detail: "Detalle del empleador informado",
        reported_employers: "Empleadores denunciados",
        reported_on: "Reportado en",
        select_career_level: "Seleccionar nivel de carrera",
        select_city: "Ciudad selecta",
        select_company: "Seleccionar empresa",
        select_company_size: "Seleccione el tama\u00f1o de la empresa",
        select_country: "Seleccionar pa\u00eds",
        select_currency: "Seleccione el tipo de moneda",
        select_degree_level: "Select Degree Level",
        select_employer_size: "Seleccionar tama\u00f1o de empleador",
        select_established_year: "Seleccione el a\u00f1o establecido",
        select_functional_area: "Seleccione \u00c1rea Funcional",
        select_gender: "Seleccione g\u00e9nero",
        select_industry: "Seleccione Industria",
        select_job_category: "Seleccionar categor\u00eda de trabajo",
        select_job_shift: "Seleccionar turno de trabajo",
        select_job_type: "Seleccionar tipo de trabajo",
        select_language: "Seleccione el idioma",
        select_marital_status: "Seleccionar estado civil",
        select_ownership_type: "Seleccionar tipo de propiedad",
        select_position: "Seleccionar posici\u00f3n",
        select_salary_period: "Seleccionar Per\u00edodo de Salario",
        select_state: "Seleccione estado",
        state: "Estado",
        title: "T\u00edtulo profesional",
        twitter_url: "URL de Twitter",
        website: "Sitio web",
      },
      company_size: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        company_size: "Tama\u00f1o de la empresa",
        edit_company_size: "Editar Empresa Talla",
        new_company_size: "Nueva Empresa Talla",
        no_company_size_available: "No hay tama\u00f1o de empresa disponible",
        no_company_size_found:
          "No se encontr\u00f3 el tama\u00f1o de la empresa",
        show_company_size: "Trabajo Categor\u00eda",
        size: "Talla",
      },
      company_sizes: "Empresa Tama\u00f1os",
      country: {
        countries: "Los paises",
        country_name: "Nombre del pa\u00eds",
        edit_country: "Editar pa\u00eds",
        new_country: "Nuevo pa\u00eds",
        no_country_available: "Ning\u00fan pa\u00eds disponible",
        no_country_found: "No se ha encontrado ning\u00fan pa\u00eds",
        phone_code: "C\u00f3digo telef\u00f3nico",
        short_code: "C\u00f3digo corto",
      },
      cv_builder: "Constructor de CV",
      dashboard: "Tablero",
      datepicker: {
        last_month: "El mes pasado",
        last_week: "La semana pasada",
        this_month: "Este mes",
        this_week: "Esta semana",
        today: "Este Dia",
      },
      email_template: {
        body: "Cuerpo",
        edit_email_template: "Editar plantilla de correo electr\u00f3nico",
        short_code: "C\u00f3digo corto",
        subject: "Asunto",
        template_name: "Nombre de plantilla",
      },
      email_templates: "Plantillas de correo electr\u00f3nico",
      employer: {
        job_stage: "Etapas del trabajo",
        job_stage_desc: "Descripci\u00f3n",
      },
      employer_dashboard: {
        dashboard: "Tablero",
        followers: "Seguidoras",
        job_applications: "Trabajo Aplicaciones",
        open_jobs: "Abierta Trabajos",
      },
      employer_menu: {
        closed_jobs: "trabajos cerrados",
        employer_details_field:
          "El campo Detalles del empleador es obligatorio.",
        employer_profile: "Perfil del empleador",
        enter_description: "Ingresar descripci\u00f3n",
        enter_employer_details: "Ingrese los detalles del empleador",
        enter_industry_details: "Ingrese los detalles de la industria...",
        enter_ownership_details: "Ingrese los detalles de propiedad...",
        expires_on: "expira el",
        followers: "Seguidoras",
        general_dashboard: "General Tablero",
        jobs: "Trabajos",
        manage_subscriptions: "Administrar suscripci\u00f3n",
        no_data_available: "datos no disponibles",
        paused_jobs: "trabajos en pausa",
        recent_follower: "seguidor reciente",
        recent_jobs: "trabajos recientes",
        total_job_applications: "solicitudes de empleo totales",
        total_jobs: "trabajos totales",
        transactions: "Actas",
        valid_facebook_url: "Ingrese una URL de Facebook v\u00e1lida",
        valid_google_plus_url: "Ingrese una URL v\u00e1lida de Google Plus",
        valid_linkedin_url:
          "Por favor, introduzca una URL de Linkedin v\u00e1lida",
        valid_pinterest_url: "Ingrese una URL de Pinterest v\u00e1lida",
        valid_twitter_url: "Ingrese una URL de Twitter v\u00e1lida",
      },
      employers: "Empleadores",
      env: "Configuraci\u00f3n de env",
      expired_jobs: "Trabajos caducados",
      faq: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_faq: "Editar FAQ",
        faq: "Preguntas m\u00e1s frecuentes",
        faq_detail: "Detalles de las preguntas frecuentes",
        new_faq: "Nueva FAQ",
        no_faq_available: "No hay preguntas frecuentes disponibles",
        no_faq_found: "No se encontraron preguntas frecuentes",
        show_faq: "FAQ",
        title: "T\u00edtulo",
      },
      favourite_companies: "Siguientes",
      favourite_jobs: "Favorita Trabajos",
      filter_name: {
        closed: "Cerrada",
        country: "Pa\u00eds",
        digital: "DIGITAL",
        drafted: "Redactada",
        featured_company: "Empresa Destacada",
        featured_job: "Trabajo destacado",
        freelancer_job: "trabajo independiente",
        immediate: "Inmediata",
        job_status: "Estado del trabajo",
        live: "Vivir",
        manually: "A MANO",
        paused: "en pausa",
        select_featured_company: "Seleccionar empresa destacada",
        select_featured_job: "Seleccionar trabajo destacado",
        select_status: "Seleccionar estado",
        state: "Estado",
        status: "Estado",
        suspended_job: "Trabajo suspendido",
      },
      flash: {
        about_us_update: "About us updated successfully.",
        admin_cant_delete: "El administrador no se puede eliminar.",
        admin_delete: "El administrador elimin\u00f3 con \u00e9xito.",
        admin_save: "El administrador guard\u00f3 correctamente.",
        admin_update: "El administrador se actualiz\u00f3 con \u00e9xito.",
        all_notification_read:
          "Todas las notificaciones se leyeron correctamente.",
        are_you_sure_to_change_status:
          "\u00bfEst\u00e1s seguro que quieres cambiar el estado?",
        assigned_slot_not_delete: "La ranura asignada no debe eliminarse.",
        attention: "Atenci\u00f3n",
        brand_delete: "Marca eliminada con \u00e9xito.",
        brand_retrieved: "Marca recuperada con \u00e9xito.",
        brand_save: "Marca guardada con \u00e9xito.",
        brand_update: "Marca actualizada correctamente.",
        cancel_reason_require: "Se requiere el motivo de la cancelaci\u00f3n.",
        candidate_delete: "Candidato eliminado exitosamente.",
        candidate_education_delete:
          "Candidate Education eliminado con \u00e9xito.",
        candidate_education_retrieved:
          "Educaci\u00f3n del candidato recuperada con \u00e9xito.",
        candidate_education_save:
          "Candidate Education agregado con \u00e9xito.",
        candidate_education_update:
          "Formaci\u00f3n de candidatos actualizada con \u00e9xito.",
        candidate_experience_delete:
          "Experiencia del candidato eliminada con \u00e9xito.",
        candidate_experience_retrieved:
          "Experiencia del candidato recuperada con \u00e9xito.",
        candidate_experience_save:
          "Experiencia del candidato agregada con \u00e9xito.",
        candidate_experience_update:
          "Experiencia del candidato actualizada con \u00e9xito.",
        candidate_not_found: "Candidate not found",
        candidate_profile: "Perfil de candidato actualizado con \u00e9xito.",
        candidate_reported: "Candidate Reported successfully.",
        candidate_retrieved: "Candidata recuperada con \u00e9xito.",
        candidate_save: "Candidate saved successfully.",
        candidate_update: "Candidato actualizado con \u00e9xito.",
        career_level_cant_delete: "El nivel de carrera no se puede eliminar.",
        career_level_delete: "Nivel de carrera eliminado con \u00e9xito.",
        career_level_retrieved: "Nivel de carrera recuperado con \u00e9xito.",
        career_level_save: "Nivel de carrera agregado con \u00e9xito.",
        career_level_update: "Nivel de carrera actualizado con \u00e9xito.",
        city_cant_delete: "La ciudad no se puede eliminar.",
        city_delete: "Ciudad eliminada con \u00e9xito.",
        city_retrieved: "Ciudad recuperada con \u00e9xito.",
        city_save: "Ciudad guardada con \u00e9xito.",
        city_update: "Ciudad actualizada correctamente.",
        close_job: "El trabajo cerrado no se puede editar.",
        cms_service_update: "Servicios CMS actualizados con \u00e9xito.",
        comment_deleted: "Comentario eliminado con \u00e9xito.",
        comment_edit: "Comentario editado con \u00e9xito.",
        comment_saved: "Comentario guardado con \u00e9xito.",
        comment_updated: "Comentario actualizado con \u00e9xito.",
        company_delete: "Empresa eliminada con \u00e9xito.",
        company_mark_feature: "Company mark as featured successfully.",
        company_mark_unFeature: "Company mark as unfeatured successfully.",
        company_save: "Empresa guardada con \u00e9xito.",
        company_size_cant_delete:
          "El tama\u00f1o de la empresa no se puede eliminar.",
        company_size_delete:
          "Tama\u00f1o de la empresa eliminado con \u00e9xito.",
        company_size_save: "Tama\u00f1o de la empresa guardado con \u00e9xito.",
        company_size_update:
          "Tama\u00f1o de la empresa actualizado con \u00e9xito.",
        company_update: "Empresa actualizada con \u00e9xito.",
        country_cant_delete: "No se puede eliminar el pa\u00eds.",
        country_delete: "Pa\u00eds eliminado con \u00e9xito.",
        country_save: "El pa\u00eds se guard\u00f3 correctamente.",
        country_update: "Pa\u00eds actualizado con \u00e9xito.",
        default_resume_already_upload:
          "El curr\u00edculum predeterminado ya se ha cargado.",
        degree_level_cant_delete: "El nivel de grado no se puede eliminar.",
        degree_level_delete: "Nivel de grado eliminado con \u00e9xito.",
        degree_level_retrieve: "Nivel de grado obtenido con \u00e9xito.",
        degree_level_save: "Nivel de Grado guardado con \u00e9xito.",
        degree_level_update: "Nivel de grado actualizado con \u00e9xito.",
        description_required: "El campo de descripci\u00f3n es obligatorio.",
        email_template:
          "Plantilla de correo electr\u00f3nico actualizada con \u00e9xito.",
        email_verify: "Correo electr\u00f3nico verificado con \u00e9xito.",
        employer_profile: "Perfil de empleador actualizado con \u00e9xito.",
        employer_update: "Employer updated successfully.",
        enter_cancel_reason: "Introduzca el motivo de la cancelaci\u00f3n...",
        enter_description: "Entrez la description",
        enter_notes: "Introducir notas...",
        enter_post_description:
          "Ingrese la descripci\u00f3n de la publicaci\u00f3n",
        faqs_delete: "FAQs deleted successfully.",
        faqs_save: "FAQs saved successfully.",
        faqs_update: "FAQs updated successfully.",
        fav_company_delete: "Empresa favorita eliminada con \u00e9xito.",
        fav_job_added: "Trabajo favorito agregado con \u00e9xito.",
        fav_job_remove: "El trabajo favorito ha sido eliminado.",
        fav_job_removed: "Trabajo favorito eliminado con \u00e9xito.",
        feature_job_price:
          "El precio de los trabajos destacados debe ser mayor que 0",
        feature_quota: "Featured Quota is Not available",
        featured_not_available: "La cuota destacada no est\u00e1 disponible.",
        file_type:
          "El documento debe ser un archivo de tipo: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete:
          "El \u00e1rea funcional no se puede eliminar.",
        functional_area_delete: "\u00c1rea funcional eliminada con \u00e9xito.",
        functional_area_save: "\u00c1rea funcional guardada con \u00e9xito.",
        functional_area_update:
          "\u00c1rea Funcional actualizada con \u00e9xito.",
        header_slider_deleted:
          "Control deslizante de encabezado eliminado con \u00e9xito.",
        header_slider_save:
          "Control deslizante de encabezado guardado con \u00e9xito.",
        header_slider_update:
          "Control deslizante de encabezado actualizado con \u00e9xito.",
        image_slider_delete:
          "Control deslizante de imagen eliminado con \u00e9xito.",
        image_slider_retrieve:
          "Control deslizante de imagen recuperado con \u00e9xito.",
        image_slider_save:
          "Control deslizante de imagen guardado con \u00e9xito.",
        image_slider_update:
          "Control deslizante de imagen actualizado con \u00e9xito.",
        industry_cant_delete: "La industria no se puede eliminar.",
        industry_delete: "Industria eliminada con \u00e9xito.",
        industry_save: "Industria guardada con \u00e9xito.",
        industry_update: "Industria actualizada con \u00e9xito.",
        inquiry_deleted: "Consulta eliminada con \u00e9xito.",
        inquiry_retrieve: "Consulta recuperada con \u00e9xito.",
        invoice_retrieve: "Factura recuperada con \u00e9xito.",
        job_abuse_reported: "Abuso laboral denunciado con \u00e9xito.",
        job_alert: "Alerta de empleo actualizada con \u00e9xito.",
        job_application_delete: "Solicitud de empleo eliminada con \u00e9xito.",
        job_application_draft: "Solicitud de empleo redactada con \u00e9xito",
        job_applied: "Trabajo aplicado con \u00e9xito",
        job_apply_by_candidate:
          "El trabajo solicitado por el candidato no se puede eliminar.",
        job_cant_delete: "El trabajo no se puede eliminar",
        job_category_cant_delete:
          "La categor\u00eda de trabajo no se puede eliminar.",
        job_category_delete:
          "Categor\u00eda de trabajo eliminada con \u00e9xito.",
        job_category_save: "Categor\u00eda de trabajo Guardado con \u00e9xito.",
        job_category_update:
          "Actualizaci\u00f3n de categor\u00eda de trabajo con \u00e9xito.",
        job_create_limit:
          "Se excedi\u00f3 el l\u00edmite de creaci\u00f3n de empleo de su cuenta, actualice su plan de suscripci\u00f3n.",
        job_delete: "Trabajo eliminado con \u00e9xito.",
        job_draft: "Borrador de trabajo guardado con \u00e9xito.",
        job_emailed_to:
          "Trabajo enviado por correo electr\u00f3nico a un amigo con \u00e9xito.",
        job_make_featured: "Job Make Destacado con \u00e9xito.",
        job_make_unfeatured: "Job Make UnFeatured con \u00e9xito.",
        job_not_found: "Trabajo no encontrado.",
        job_notification:
          "La notificaci\u00f3n de trabajo se envi\u00f3 con \u00e9xito.",
        job_save: "Trabajo guardado con \u00e9xito.",
        job_schedule_send: "programa de trabajo enviado con \u00e9xito.",
        job_shift_cant_delete: "El turno de trabajo no se puede eliminar.",
        job_shift_delete: "Turno de trabajo eliminado con \u00e9xito.",
        job_shift_retrieve: "Turno de trabajo recuperado con \u00e9xito.",
        job_shift_save: "El turno de trabajo se guard\u00f3 correctamente.",
        job_shift_update: "Turno de trabajo actualizado con \u00e9xito.",
        job_stage_cant_delete: "La etapa del trabajo no se puede eliminar.",
        job_stage_change: "La etapa del trabajo cambi\u00f3 con \u00e9xito.",
        job_stage_delete: "Job Etapa eliminada con \u00e9xito.",
        job_stage_retrieve: "Etapa del trabajo recuperada con \u00e9xito.",
        job_stage_save: "Etapa del trabajo guardada con \u00e9xito.",
        job_stage_update: "Etapa del trabajo actualizada con \u00e9xito.",
        job_tag_cant_delete: "La etiqueta de trabajo no se puede eliminar.",
        job_tag_delete: "Etiqueta de trabajo eliminada con \u00e9xito.",
        job_tag_retrieve: "Etiqueta de trabajo recuperada con \u00e9xito.",
        job_tag_save: "Etiqueta de trabajo guardada con \u00e9xito.",
        job_tag_update: "Etiqueta de trabajo actualizada con \u00e9xito.",
        job_type_cant_delete: "El tipo de trabajo no se puede eliminar.",
        job_type_delete: "Tipo de trabajo eliminado con \u00e9xito.",
        job_type_retrieve: "Tipo de trabajo recuperado con \u00e9xito.",
        job_type_save: "Tipo de trabajo guardado con \u00e9xito.",
        job_type_update: "Tipo de trabajo actualizado con \u00e9xito.",
        job_update: "Trabajo actualizado con \u00e9xito.",
        language_added: "Idioma a\u00f1adido con \u00e9xito.",
        language_changed: "Idioma cambiado correctamente",
        language_delete: "Idioma eliminado con \u00e9xito.",
        language_retrieve: "Idioma recuperado con \u00e9xito.",
        language_save: "Idioma Guardado con \u00e9xito.",
        language_update: "Idioma actualizado con \u00e9xito.",
        link_copy: "Enlace copiado con \u00e9xito.",
        manual_payment: "Pago manual aprobado con \u00e9xito.",
        manual_payment_denied: "Pago manual denegado con \u00e9xito.",
        marital_status_delete: "Estado civil eliminado con \u00e9xito.",
        marital_status_retrieve: "Estado civil recuperado con \u00e9xito.",
        marital_status_save: "Estado civil guardado con \u00e9xito.",
        marital_status_update: "Estado civil actualizado con \u00e9xito.",
        media_delete: "Medios eliminados con \u00e9xito.",
        newsletter_delete: "NewsLetter eliminado con \u00e9xito.",
        no_record: "No se encontraron registros.",
        not_deleted: "No eliminado",
        noticeboard_retrieve:
          "Tabl\u00f3n de anuncios recuperado con \u00e9xito.",
        noticeboard_save: "Tabl\u00f3n de anuncios guardado correctamente.",
        noticeboard_update:
          "Tabl\u00f3n de anuncios actualizado con \u00e9xito.",
        notification_read: "Notificaci\u00f3n le\u00edda con \u00e9xito.",
        notification_setting_update:
          "La configuraci\u00f3n de notificaciones se actualiz\u00f3 correctamente.",
        ownership_type_cant_delete:
          "El tipo de propiedad no se puede eliminar.",
        ownership_type_delete:
          "El tipo de propietario se elimin\u00f3 con \u00e9xito.",
        ownership_type_retrieve:
          "Tipo de propietario recuperado con \u00e9xito.",
        ownership_type_save: "Tipo de propietario guardado correctamente.",
        ownership_type_updated:
          "Tipo de propietario actualizado con \u00e9xito.",
        password_update: "Contrase\u00f1a actualizada exitosamente.",
        payment_failed_try_again:
          "\u00a1perd\u00f3n! El pago fall\u00f3, int\u00e9ntalo de nuevo m\u00e1s tarde.",
        payment_not_complete: "Su pago no se ha completado",
        payment_success: "Su pago se complet\u00f3 con \u00e9xito",
        plan_Save: "Plan guardado con \u00e9xito.",
        plan_cant_delete:
          "El plan no se puede eliminar, contiene una o m\u00e1s suscripciones activas.",
        plan_cant_update:
          "El plan no se puede actualizar. La suscripci\u00f3n para este plan ya existe",
        plan_delete: "Plan eliminado con \u00e9xito.",
        plan_retrieve: "Plan recuperado con \u00e9xito.",
        plan_update: "Plan actualizado correctamente.",
        please_wait_for:
          "Espere la aprobaci\u00f3n del administrador, ya agreg\u00f3 el pago manual",
        please_wait_for_com:
          "Espere la aprobaci\u00f3n del administrador para completar su transacci\u00f3n",
        policy_update: "Pol\u00edtica actualizada con \u00e9xito.",
        post_category_delete:
          "Categor\u00eda de publicaci\u00f3n eliminada con \u00e9xito.",
        post_category_retrieve:
          "Categor\u00eda de publicaci\u00f3n recuperada con \u00e9xito.",
        post_category_save:
          "Categor\u00eda de publicaci\u00f3n guardada con \u00e9xito.",
        post_category_update:
          "Categor\u00eda de publicaci\u00f3n actualizada con \u00e9xito.",
        post_comment: "Publicar comentarios recuperados con \u00e9xito.",
        post_delete: "Publicaci\u00f3n eliminada con \u00e9xito.",
        post_save: "Publicaci\u00f3n guardada con \u00e9xito.",
        post_update: "Publicaci\u00f3n actualizada con \u00e9xito.",
        profile_update: "Perfil actualizado con \u00e9xito.",
        reason_require: "Se requiere el motivo de la cancelaci\u00f3n.",
        register_success_mail_active:
          "Te has registrado correctamente, Activa tu cuenta desde el correo.",
        registration_done: "Registro realizado con \u00e9xito.",
        report_to_company: "Informe a la empresa con \u00e9xito.",
        reported_candidate_delete:
          "Candidato reportado eliminado exitosamente.",
        reported_job_delete: "Trabajos informados eliminados con \u00e9xito.",
        resume_delete: "Reanudar la eliminaci\u00f3n con \u00e9xito.",
        resume_update: "Curr\u00edculum actualizado con \u00e9xito.",
        retrieved: "Recuperada con \u00e9xito.",
        salary_currency_cant_delete:
          "La moneda del salario no se puede eliminar.",
        salary_currency_destroy: "Divisa de salario eliminada con \u00e9xito.",
        salary_currency_edit: "Divisa de salario recuperada con \u00e9xito.",
        salary_currency_store: "Divisa de salario guardada con \u00e9xito.",
        salary_currency_update: "Divisa de salario actualizada con \u00e9xito.",
        salary_period_cant_delete:
          "El per\u00edodo de salario no se puede eliminar.",
        salary_period_delete:
          "Per\u00edodo de salario eliminado con \u00e9xito.",
        salary_period_retrieve:
          "Per\u00edodo de salario recuperado con \u00e9xito.",
        salary_period_save: "Per\u00edodo de salario guardado con \u00e9xito.",
        salary_period_update:
          "Per\u00edodo de salario actualizado con \u00e9xito.",
        select_employer: "Seleccionar empleador",
        select_job: "Seleccionar trabajo",
        select_job_skill: "Seleccionar habilidad laboral",
        select_job_tag: "Seleccionar etiqueta de trabajo",
        select_post_category: "Seleccionar categor\u00eda de publicaci\u00f3n",
        select_skill: "Seleccionar habilidad",
        session_created: "Sesi\u00f3n creada con \u00e9xito.",
        setting_update: "Configuraci\u00f3n actualizada con \u00e9xito.",
        skill_cant_delete: "La habilidad no se puede eliminar.",
        skill_delete: "Habilidad eliminada con \u00e9xito.",
        skill_save: "Habilidad guardada con \u00e9xito.",
        skill_update: "Habilidad actualizada con \u00e9xito.",
        slot_already_taken: "Ya se ha ocupado el espacio",
        slot_cancel: "Cancelaci\u00f3n de ranura con \u00e9xito.",
        slot_choose: "Slot choose successfully",
        slot_create: "Tragamonedas creadas con \u00e9xito",
        slot_delete: "Ranura eliminada con \u00e9xito.",
        slot_preference_field:
          "El campo de preferencia de ranura es obligatorio",
        slot_reject: "Slots rejected successfully",
        slot_update: "Ranura actualizada con \u00e9xito.",
        state_cant_delete: "El estado no se puede eliminar.",
        state_delete: "Estado eliminado con \u00e9xito.",
        state_save: "Estado guardado con \u00e9xito.",
        state_update: "Estado actualizado correctamente.",
        status_change: "El estado cambi\u00f3 con \u00e9xito.",
        status_update: "Estado actualizado correctamente.",
        subscribed: "Suscrito con \u00e9xito.",
        subscription_cancel: "Suscripci\u00f3n cancelada con \u00e9xito.",
        subscription_resume:
          "La suscripci\u00f3n se reanud\u00f3 correctamente.",
        success_verify:
          "Has verificado correctamente tu correo electr\u00f3nico. Por favor Iniciar sesi\u00f3n !",
        testimonial_delete: "Testimonios eliminados con \u00e9xito.",
        testimonial_retrieve: "Testimonios Recuperados Exitosamente.",
        testimonial_save: "Testimonio guardado correctamente.",
        testimonial_update: "Testimonios actualizados con \u00e9xito.",
        the_name_has: "El nombre ya ha sido tomado.",
        there_are_no: "No hay curr\u00edculum subido.",
        this_currency_is: "PayPal no admite esta moneda para realizar pagos.",
        translation_update: "Traducci\u00f3n actualizada con \u00e9xito.",
        trial_plan_update: "Plan de prueba actualizado con \u00e9xito.",
        unfollow_company: "Dejar de seguir a la empresa con \u00e9xito.",
        verification_mail:
          "Correo de verificaci\u00f3n reenviado con \u00e9xito.",
        your_are_not_author:
          "No eres autor de la suscripci\u00f3n. por lo que no puede cancelar esta suscripci\u00f3n.",
        your_payment_comp: "Su pago se complet\u00f3 con \u00e9xito",
      },
      footer_settings: "Pie de p\u00e1gina Configuraciones",
      front_cms: "CMS frontal",
      front_home: {
        candidates: "Candidatas",
        companies: "Compa\u00f1\u00edas",
        jobs: "Trabajos",
        resumes: "CVs",
      },
      front_settings: {
        exipre_on: "Vence en",
        expires_on: "Expira el",
        featured: "Destacadas",
        featured_companies_days: "Featured Companies Days",
        featured_companies_due_days:
          "D\u00edas de vencimiento de empresas por defecto",
        featured_companies_enable: "Las empresas destacadas permiten",
        featured_companies_price: "Precio Empresas Destacadas",
        featured_companies_quota: "Cuota de empresas destacadas",
        featured_employer_not_available: "empleador destacado no disponible",
        featured_job: "Trabajo destacado",
        featured_jobs_days: "D\u00edas de trabajos destacados",
        featured_jobs_due_days:
          "D\u00edas de vencimiento de trabajos predeterminados",
        featured_jobs_enable: "Trabajos destacados habilitados",
        featured_jobs_price: "Precio de trabajos destacados",
        featured_jobs_quota: "Cuota de trabajos destacados",
        featured_listing_currency: "Moneda de la lista destacada",
        latest_jobs_enable:
          "Mostrar los \u00faltimos trabajos seg\u00fan el pa\u00eds del usuario registrado",
        latest_jobs_enable_message:
          "Mostrar\u00e1 los \u00faltimos trabajos del pa\u00eds del candidato / empleador cuando inicien sesi\u00f3n",
        make_feature: "hacer caracter\u00edstica",
        make_featured: "Hacer destacada",
        make_featured_job: "Hacer trabajo destacado",
        pay_to_get: "pagar para obtener",
        remove_featured: "eliminar destacados",
      },
      functional_area: {
        edit_functional_area: "Editar Funcional Zona",
        name: "Nombre",
        new_functional_area: "Nueva Funcional Zona",
        no_functional_area_available: "No hay \u00e1rea funcional disponible",
        no_functional_area_found: "No se encontr\u00f3 \u00e1rea funcional",
      },
      functional_areas: "Areas funcionales",
      general: "General",
      general_dashboard: "tablero general",
      general_settings: "Configuraci\u00f3n general",
      go_to_homepage: "Ir a la p\u00e1gina de inicio",
      header_slider: {
        edit_header_slider: "Editar control deslizante de encabezado",
        header_slider: "Control deslizante de encabezado",
        image_size_message:
          "La imagen debe tener un p\u00edxel de 1920 x 1080 o un p\u00edxel superior.",
        image_title_text:
          "Sube una imagen de 1920 x 1080 p\u00edxeles o m\u00e1s p\u00edxeles para obtener la mejor experiencia de usuario.",
        new_header_slider: "Nuevo control deslizante de encabezado",
        no_header_slider_available:
          "No hay control deslizante de encabezado disponible",
      },
      header_sliders: "Deslizadores de encabezado",
      image_slider: {
        action: "Acci\u00f3n",
        add: "Agregar",
        description: "Descripci\u00f3n",
        edit_image_slider: "Editar deslizador de imagen",
        image: "Imagen",
        image_extension_message:
          "La imagen debe ser un archivo de tipo: png, jpg, jpeg.",
        image_size_message:
          "La imagen debe tener un p\u00edxel de 1140 x 500 o superior.",
        image_slider: "Control deslizante de imagen",
        image_slider_details:
          "Detalles del control deslizante de im\u00e1genes",
        image_title_text:
          "Sube una imagen de 1140 x 500 p\u00edxeles o m\u00e1s p\u00edxeles para obtener la mejor experiencia de usuario.",
        is_active: "Estado",
        message:
          "Desactivar la b\u00fasqueda de empleo en la p\u00e1gina de inicio",
        message_title:
          "Si esta palanca est\u00e1 deshabilitada, la pantalla de b\u00fasqueda predeterminada no estar\u00e1 visible.",
        new_image_slider: "Nuevo control deslizante de imagen",
        no_image_slider_available:
          "No hay control deslizante de imagen disponible",
        no_image_slider_found:
          "No se encontr\u00f3 el control deslizante de imagen",
        select_status: "Seleccionar estado",
        slider: "Habilita el control deslizante de ancho completo.",
        slider_active:
          "Deshabilitar el control deslizante de la imagen de la p\u00e1gina de inicio",
        slider_active_title:
          "Si esta opci\u00f3n est\u00e1 deshabilitada, la pantalla del control deslizante de imagen predeterminada no estar\u00e1 visible.",
        slider_title:
          "Si esta palanca est\u00e1 habilitada, el control deslizante de imagen es una pantalla de ancho completo.",
      },
      image_sliders: "Deslizadores de imagen",
      industries: "Industrias",
      industry: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_industry: "Editar Industria",
        industry_detail: "Detalles de la industria",
        name: "Nombre",
        new_industry: "Nueva Industria",
        no_industry_available: "No hay industria disponible",
        no_industry_found: "No se encontr\u00f3 industria",
        size: "Talla",
      },
      inquires: "Consultas",
      inquiry: {
        email: "Email",
        inquiry: "Consulta",
        inquiry_date: "Investigaci\u00f3n Fecha",
        inquiry_details: "Investigaci\u00f3n Detalles",
        message: "Mensaje",
        name: "Nombre",
        no_inquiry_available: "No hay consultas disponibles",
        no_inquiry_found: "No se encontr\u00f3 ninguna consulta",
        phone_no: "Tel\u00e9fono No",
        subject: "Sujeta",
      },
      job: {
        add_note: "A\u00f1adir Nota",
        applies_job_not_found:
          "No se encontr\u00f3 ning\u00fan trabajo solicitado",
        career_level: "Carrera Nivel",
        city: "Ciudad",
        country: "Pa\u00eds",
        created_at: "Creada A",
        currency: "Moneda",
        degree_level: "La licenciatura Nivel",
        description: "Descripci\u00f3n",
        edit_job: "Editar Trabajo",
        email_to_friend: "Email a Amiga",
        expires_on: "Expira el",
        favourite_companies_not_found:
          "Compa\u00f1\u00eda favorita no encontrada",
        favourite_company: "Compa\u00f1\u00eda favorita",
        favourite_job: "Trabajo favorito",
        favourite_job_not_found: "No se encontraron trabajos favoritos",
        following_company_not_found: "No se encontr\u00f3 la siguiente empresa",
        friend_email: "Amiga Email",
        friend_name: "Amiga Nombre",
        functional_area: "Funcional Zona",
        hide_salary: "Esconder Salario",
        is_featured: "Es Destacadas",
        is_freelance: "Es Lanza libre",
        is_suspended: "Es Suspendida",
        job: "Trabajo",
        job_alert: "Alerta de trabajo",
        job_details: "Trabajo Detalles",
        job_expiry_date: "Trabajo Expiraci\u00f3n Fecha",
        job_shift: "Trabajo Cambio",
        job_skill: "Trabajo Habilidad",
        job_title: "Trabajo T\u00edtulo",
        job_type: "Trabajo Tipo",
        job_url: "Trabajo URL",
        new_job: "Nueva Trabajo",
        no_applied_job_found: "Ning\u00fan trabajo solicitado disponible",
        no_favourite_job_found: "No hay trabajos favoritos disponibles",
        no_followers_available: "No hay seguidores disponibles",
        no_followers_found: "No se encontraron seguidores",
        no_following_companies_found: "Siguiente empresa no disponible",
        no_job_reported_available: "Ning\u00fan trabajo informado disponible",
        no_preference: "No Preferencia",
        no_reported_job_found:
          "No se encontr\u00f3 ning\u00fan trabajo informado",
        notes: "Notas",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "Ingrese el rango de salario hasta mayor que el rango de salario desde.",
        position: "Posici\u00f3n",
        remove_favourite_jobs: "Eliminar trabajo favorito",
        reported_job: "Trabajo informado",
        reported_jobs_detail: "Detalle del trabajo informado",
        reported_user: "Reportada Usuaria",
        salary_from: "Salario De",
        salary_period: "Salario Per\u00edodo",
        salary_to: "Salario A",
        state: "Estado",
        subscriber: "Abonado",
        view_notes: "Ver notas",
      },
      job_application: {
        application_date: "Solicitud Fecha",
        candidate_name: "Candidata Nombre",
        job_application: "Aplicacion de trabajo",
      },
      job_applications: "Trabajo Aplicaciones",
      job_categories: "Categor\u00edas de trabajo",
      job_category: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_job_category: "Editar Trabajos Categor\u00eda",
        is_featured: "Es Destacadas",
        job_category: "Trabajos Categor\u00eda",
        name: "Nombre",
        new_job_category: "Nueva Trabajos Categor\u00eda",
        no_job_category_available:
          "No hay categor\u00eda de trabajo disponible",
        no_job_category_found:
          "No se encontr\u00f3 ninguna categor\u00eda de trabajo",
        show_job_category: "Detalles de la categor\u00eda de trabajo",
      },
      job_experience: {
        edit_job_experience: "Editar Trabajo Experiencia",
        is_active: "Es Activa",
        is_default: "Es Defecto",
        job_experience: "Trabajo Experiencia",
        language: "Idioma",
        new_job_experience: "Nueva Trabajo Experiencia",
      },
      job_experiences: "Trabajo Experiencias",
      job_notification: {
        job_notifications: "Notificaciones de trabajos",
        no_jobs_available: "No hay trabajos disponibles",
        select_all_jobs: "Seleccionar todos los trabajos",
      },
      job_shift: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_job_shift: "Editar Trabajo Cambio",
        job_shift_detail: "Detalles del turno de trabajo",
        new_job_shift: "Nueva Trabajo Cambio",
        no_job_shifts_available: "No hay turno de trabajo disponible",
        no_job_shifts_found: "No se encontr\u00f3 turno de trabajo",
        shift: "Cambio",
        show_job_shift: "Trabajo Cambio",
        size: "Talla",
      },
      job_shifts: "Trabajo Turnos",
      job_skill: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_job_skill: "Editar Trabajo Skill",
        name: "Nombre",
        new_job_skill: "Nueva Trabajo Habilidad",
        show_job_skill: "Trabajo Skill",
      },
      job_skills: "Trabajo Habilidades",
      job_stage: {
        add_slot: "Agregar ranura",
        add_slots: "Agregar ranuras",
        batch: "Lote",
        cancel_slot: "Cancelar espacio",
        cancel_this_slot: "Cancelar este espacio",
        cancel_your_selected_slot: "Cancelar su espacio seleccionado",
        candidate_note: "Nota del candidato",
        choose_slots: "Elegir ranura",
        date: "Fecha",
        edit_job_stage: "Editar etapa de trabajo",
        edit_slot: "Editar ranura",
        history: "Historia",
        job_stage: "Etapa de trabajo",
        job_stage_detail: "Detalle de la etapa del trabajo",
        new_job_stage: "Nueva etapa de trabajo",
        new_slot_send: "Env\u00edo de nueva ranura",
        no_job_stage_available: "No hay etapa de trabajo disponible",
        no_job_stage_found: "No se encontr\u00f3 ninguna etapa de trabajo",
        no_slot_available: "No hay espacio disponible",
        reject_all_slot: "Rechazar todas las ranuras",
        rejected_all_slots: "Todas las ranuras rechazadas",
        "rejected_all_slots ": " Todas las ranuras rechazadas ",
        send_slot: "Enviar ranura",
        send_slots: "Enviar ranuras",
        slot: "Ranura",
        slot_preference: "Preferencia de ranura",
        slots: "Tragamonedas",
        time: "Hora",
        you_cancel_this_slot: "Cancelar este espacio",
        you_have_rejected_all_slot: "Has rechazado todas las plazas",
        you_have_selected_this_slot: "Has seleccionado este espacio",
        your_note: "Tu nota",
      },
      job_stages: "Etapas del trabajo",
      job_tag: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_job_tag: "Editar Trabajo Etiqueta",
        job_tag: "Etiqueta de trabajo",
        job_tag_detail: "Detalles de la etiqueta de trabajo",
        name: "Nombre",
        new_job_tag: "Etiqueta de trabajo nueva",
        no_job_tag_available: "No hay etiqueta de trabajo disponible",
        no_job_tag_found: "No se encontr\u00f3 ninguna etiqueta de trabajo",
        show_job_tag: "Trabajo Etiqueta",
        size: "Talla",
      },
      job_tags: "Trabajo Etiquetas",
      job_type: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_job_type: "Editar Trabajo Tipo",
        job_type: "El tipo de trabajo",
        job_type_detail: "Detalles del tipo de trabajo",
        name: "Nombre",
        new_job_type: "Nueva Trabajo Tipo",
        no_job_type_available: "Ning\u00fan tipo de trabajo disponible",
        no_job_type_found: "No se encontr\u00f3 ning\u00fan tipo de trabajo",
        show_job_type: "Mostrar Trabajo Tipo",
      },
      job_types: "Trabajo Tipos",
      jobs: "Trabajos",
      language: {
        edit_language: "Editar Idioma",
        is_active: "Es Activa",
        is_default: "Es Defecto",
        is_rtl: "Es RTL",
        iso_code: "YO ASI C\u00f3digo",
        language: "Idioma",
        native: "Nativa",
        new_language: "Nueva Idioma",
        no_language_available: "No hay idioma disponible",
        no_language_found: "No se ha encontrado ning\u00fan idioma",
      },
      languages: "Idiomas",
      marital_status: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_marital_status: "Editar Marital Estado",
        marital_status: "Marital Estado",
        marital_status_detail: "Detalles del estado civil",
        new_marital_status: "Nueva Marital Estado",
        no_marital_status_available: "Sin estado civil disponible",
        no_marital_status_found: "No se encontr\u00f3 estado civil",
        show_marital_status: "Marital Estado",
      },
      marital_statuses: "Marital Estado",
      months: {
        apr: "Abr",
        aug: "Ago",
        dec: "Dic",
        feb: "Feb",
        jan: "Ene",
        jul: "Jul",
        jun: "Jun",
        mar: "Mar",
        may: "Mayo",
        nov: "Nov",
        oct: "Oct",
        sep: "Sep",
      },
      no_skills: "Sin habilidades",
      no_subscriber_available: "No hay suscriptores disponibles",
      no_subscriber_found: "No se encontr\u00f3 ning\u00fan suscriptor",
      noticeboard: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_noticeboard: "Editar Tabl\u00f3n de anuncios",
        is_active: "Est\u00e1 activo",
        new_noticeboard: "Nueva Tabl\u00f3n de anuncios",
        no_noticeboard_available: "No hay tabl\u00f3n de anuncios disponible",
        no_noticeboard_found:
          "No se encontr\u00f3 ning\u00fan tabl\u00f3n de anuncios",
        noticeboard: "Tabl\u00f3n de anuncios",
        noticeboard_detail: "Detalles del tabl\u00f3n de anuncios",
        title: "T\u00edtulo",
      },
      noticeboards: "Tablones de anuncios",
      notification: {
        company: "Empresa",
        company_marked_featured: "La empresa marcada como destacada por",
        empty_notifications: "No pudimos encontrar ninguna notificaci\u00f3n",
        job_application_rejected_message: "Su solicitud ha sido rechazada por",
        job_application_select_message: "Est\u00e1s seleccionado para",
        job_application_shortlist_message:
          "Su aplicaci\u00f3n est\u00e1 preseleccionada para",
        job_application_submitted: "Solicitud de trabajo enviada para",
        mark_all_as_read: "Marcar todo como leido",
        marked_as_featured: "Marcada como presentada",
        new_candidate_registered: "Nueva candidata registrada",
        new_employer_registered: "Nueva empleadora registrada",
        notifications: "Notificaciones",
        purchase: "compra",
        read_notification: "Notificaci\u00f3n le\u00edda con \u00e9xito",
        started_following: "comenz\u00f3 a seguir",
        started_following_you: "empec\u00e9 a seguirte.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "Cuando un candidato es rechazado para el trabajo",
        CANDIDATE_SELECTED_FOR_JOB:
          "Cuando un candidato es seleccionado para el trabajo",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "Cuando un candidato es preseleccionado para un trabajo",
        EMPLOYER_PURCHASE_PLAN:
          "Cuando un empleador compra un plan de suscripci\u00f3n",
        FOLLOW_COMPANY:
          "Cuando un candidato comienza a seguir a la Compa\u00f1\u00eda",
        FOLLOW_JOB: "Cuando un candidato comienza a seguir Trabajos",
        JOB_ALERT: "Cuando un empleador crea un trabajo",
        JOB_APPLICATION_SUBMITTED: "Al enviar una nueva solicitud de empleo",
        MARK_COMPANY_FEATURED: "Cuando marque la empresa como destacada",
        MARK_COMPANY_FEATURED_ADMIN:
          "Cuando el empleador marca a la empresa como destacada",
        MARK_JOB_FEATURED: "Cuando se marca el trabajo como destacado",
        MARK_JOB_FEATURED_ADMIN:
          "Cuando el empleador marca el trabajo como destacado",
        NEW_CANDIDATE_REGISTERED: "Cuando se registra un nuevo candidato",
        NEW_EMPLOYER_REGISTERED: "Cuando se registra un nuevo empleador",
        admin: "Administradora",
        blog_category: "Categor\u00eda del blog",
        candidate: "Candidata",
        employer: "Empleada",
      },
      ownership_type: {
        edit_ownership_type: "Editar Propiedad Tipo",
        new_ownership_type: "Nueva Propiedad Tipo",
        no_ownership_type_available: "No hay tipo de propiedad disponible",
        no_ownership_type_found:
          "No se ha encontrado ning\u00fan tipo de propiedad",
        ownership_type: "Tipo de Propiedad",
        ownership_type_detail: "Detalles del tipo de propiedad",
      },
      ownership_types: "Propiedad Tipos",
      phone: {
        invalid_country_code: "C\u00f3digo de pa\u00eds no v\u00e1lido",
        invalid_number: "N\u00famero invalido",
        too_long: "Demasiado largo",
        too_short: "Demasiado corto",
        valid_number: "N\u00famero v\u00e1lido",
      },
      plan: {
        active_subscription: "suscripci\u00f3n activa",
        allowed_jobs: "Trabajos permitidos",
        amount: "Cantidad",
        cancel_reason: "Cancelar motivo",
        cancel_subscription: "Cancelar suscripci\u00f3n",
        currency: "Divisa",
        current_plan: "Plan actual",
        edit_plan: "Editar plan",
        edit_subscription_plan: "editar plan de suscripci\u00f3n",
        ends_at: "Termina en",
        is_trial_plan: "Es plan de prueba",
        job_allowed: "Trabajo permitido",
        job_used: "Trabajo utilizado",
        jobs_allowed: "Trabajos permitidos",
        jobs_used: "Trabajos usados",
        new_plan: "Agregar plan",
        new_subscription_plan: "nuevo plan de suscripci\u00f3n",
        pay_with_manually: "Payer avec manuellement",
        pay_with_paypal: "Payer avec PayPal",
        pay_with_stripe: "Payer avec Stripe",
        per_month: "Por mes",
        plan: "Plan",
        plan_amount_cannot_be_changes:
          "Nota: - El monto del plan no se puede cambiar.",
        pricing: "Precios",
        processing: "Procesando",
        purchase: "Compra",
        renews_on: "Se renueva en",
        subscription_cancelled: "Suscripci\u00f3n cancelada",
        subscriptions: "suscripciones",
      },
      plans: "Planes",
      position: {
        edit_position: "Editar Posici\u00f3n",
        new_position: "Nueva Posici\u00f3n",
        position: "Posici\u00f3n",
      },
      positions: "Posiciones",
      post: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        blog: "Blog",
        comment: "Comentario",
        comments: "Comentarios",
        description: "Descripci\u00f3n",
        edit_post: "Editar post",
        image: "Imagen",
        new_post: "Nueva publicaci\u00f3n",
        no_posts_available: "No hay publicaciones disponibles",
        no_posts_found: "No hay publicaciones disponibles",
        post: "Enviar",
        post_a_comments: "Publicar un comentario",
        post_details: "Detalles de la publicaci\u00f3n",
        posts: "Publicaciones",
        select_post_categories: "Seleccionar categor\u00edas de publicaciones",
        show_post: "Enviar",
        title: "T\u00edtulo",
      },
      post_category: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_post_category: "Editar categor\u00eda de publicaci\u00f3n",
        name: "Nombre",
        new_post_category: "Categor\u00eda de publicaci\u00f3n nueva",
        no_post_category_available:
          "No hay categor\u00eda de publicaci\u00f3n disponible",
        no_post_category_found:
          "No se encontr\u00f3 ninguna categor\u00eda de publicaci\u00f3n",
        post_categories: "Categor\u00edas de publicaciones",
        post_category: "Categor\u00eda de publicaci\u00f3n",
        post_category_detail:
          "Detalles de la categor\u00eda de publicaci\u00f3n",
        show_post_category: "Categor\u00eda de publicaci\u00f3n",
      },
      post_comment: {
        post_comment: "publicar comentario",
        post_comment_details: "Detalles de la publicaci\u00f3n del comentario",
      },
      post_comments: "Publicar comentarios",
      pricing_table: { get_started: "Empezar" },
      pricings_table: "Tabla de precios",
      professional_skills: "Habilidades profesionales",
      profile: "Perfil",
      recent_blog: "Blog reciente",
      reported_jobs: "Reportada Trabajo",
      required_degree_level: {
        edit_required_degree_level: "Editar La licenciatura Nivel",
        name: "Nombre",
        new_required_degree_level: "Nueva La licenciatura Nivel",
        no_degree_level_available: "Ning\u00fan nivel de grado disponible",
        no_degree_level_found: "No se encontr\u00f3 el nivel de grado",
        show_required_degree_level: "licenciatura Nivel",
      },
      required_degree_levels: "La licenciatura Niveles",
      resumes: {
        candidate_name: "Nombre de la candidata",
        file: "Archivo",
        name: "Nombre",
        no_resume_available: "No hay curr\u00edculum disponible",
        no_resume_found: "No se encontr\u00f3 curr\u00edculum",
        resume_name: "Nombre del archivo",
      },
      salary_currencies: "Salario Monedas",
      salary_currency: {
        currency_code: "C\u00f3digo de moneda",
        currency_icon: "Icono de moneda",
        currency_name: "Moneda Nombre",
        edit_salary_currency: "Nueva moneda de salario",
        new_salary_currency: "Nueva moneda de salario",
        no_salary_currency_available: "No hay moneda de salario disponible",
        no_salary_currency_found: "No se encontr\u00f3 moneda de salario",
      },
      salary_period: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Descripci\u00f3n",
        edit_salary_period: "Editar Salario Per\u00edodo",
        new_salary_period: "Nueva Salario Per\u00edodo",
        no_salary_period_available: "No hay per\u00edodo de salario disponible",
        no_salary_period_found: "No se encontr\u00f3 per\u00edodo de salario",
        period: "Per\u00edodo",
        salary_period_detail: "Detalles del per\u00edodo salarial",
        size: "Talla",
      },
      salary_periods: "Salario Per\u00edodos",
      see_all_plans: "Ver todos los planes",
      selected_candidate: "Candidata seleccionada",
      setting: {
        about_us: "Acerca de Nosotras",
        address: "Habla a",
        application_name: "Solicitud Nombre",
        choose: "Escoger",
        company_description: "Company Descripci\u00f3n",
        company_url: "URL de la compa\u00f1\u00eda",
        configuration_update: "Actualizaci\u00f3n de configuraci\u00f3n",
        cookie: "Galleta",
        disable_cookie: "Desactivar cookie",
        disable_edit: "Desactivar Editar",
        email: "Email",
        enable_cookie: "Habilitar cookie",
        enable_edit: "Habilitar Editar",
        enable_google_recaptcha:
          "Habilite Google reCAPTCHA para empleadores, registro de candidatos y pantalla Cont\u00e1ctenos.",
        facebook: "Facebook",
        facebook_app_id: "ID de aplicaci\u00f3n de Facebook",
        facebook_app_secret: "Secreto de la aplicaci\u00f3n de Facebook",
        facebook_redirect: "Redirecci\u00f3n de Facebook",
        facebook_url: "Facebook URL",
        favicon: "Favicon",
        front_settings: "Delantera Configuraciones",
        general: "General",
        google: "Google",
        google_client_id: "ID de cliente de Google",
        google_client_secret: "Secreto de cliente de Google",
        google_plus_url: "Google M\u00e1s URL",
        google_redirect: "Google Redirect",
        image_validation: "La imagen debe ser de pixel 90 x 60.",
        linkedin: "LinkedIn",
        linkedin_client_id: "ID de LinkedIn",
        linkedin_client_secret: "Secreto del cliente de LinkedIn",
        linkedin_url: "URL de LinkedIn",
        logo: "Logo",
        mail: "Correo",
        mail__from_address: "Direcci\u00f3n de correo electr\u00f3nico",
        mail_host: "Host de correo",
        mail_mailer: "Correo Mailer",
        mail_password: "Contrase\u00f1a de correo",
        mail_port: "Puerto de correo",
        mail_username: "Nombre de usuario de correo",
        notification_settings: "Configuraci\u00f3n de las notificaciones",
        paypal: "Paypal",
        paypal_client_id: "ID de cliente de Paypal",
        paypal_secret: "Paypal Secret",
        phone: "Tel\u00e9fono",
        privacy_policy: "Pol\u00edtica de privacidad",
        pusher: "Empujador",
        pusher_app_cluster: "Cl\u00faster de aplicaciones de empuje",
        pusher_app_id: "ID de la aplicaci\u00f3n Pusher",
        pusher_app_key: "Pusher App Key",
        pusher_app_secret: "Secreto de la aplicaci\u00f3n Pusher",
        social_settings: "Social Configuraciones",
        stripe: "Rayas",
        stripe_key: "Clave de banda",
        stripe_secret_key: "Clave secreta de banda",
        stripe_webhook_key: "Clave de webhook de banda",
        terms_conditions: "T\u00e9rminos y Condiciones",
        twitter_url: "URL de Twitter",
        update_application_configuration:
          "Est\u00e1 a punto de actualizar los valores de configuraci\u00f3n de la aplicaci\u00f3n, \u00bfdesea continuar?",
      },
      settings: "Configuraciones",
      skill: {
        action: "Acci\u00f3n",
        add: "A\u00f1adir",
        description: "Description",
        edit_skill: "Editar  Habilidad",
        name: "Nombre",
        new_skill: "Nueva Habilidad",
        no_skill_available: "No hay habilidades disponibles",
        no_skill_found: "No se ha encontrado ninguna habilidad",
        show_skill: "Habilidad",
        skill_detail: "Detalles de la habilidad",
      },
      skills: "Habilidades",
      social_media: "Redes sociales",
      social_settings: "Social Configuraciones",
      state: {
        country_name: "En nombre del pais",
        edit_state: "Editar estado",
        new_state: "Nuevo estado",
        no_state_available: "No hay estado disponible",
        no_state_found: "No se encontr\u00f3 ning\u00fan estado",
        state_name: "Nombre del Estado",
        states: "Estados",
      },
      subscribers: "Suscriptoras",
      subscriptions_plans: "planes de suscripciones",
      testimonial: {
        customer_image: "Cliente Imagen",
        customer_name: "Cliente Nombre",
        description: "Descripci\u00f3n",
        edit_testimonial: "Editar Testimonial",
        new_testimonial: "Nueva Testimonial",
        no_testimonial_available: "No hay testimonios disponibles",
        no_testimonial_found: "No se encontr\u00f3 ning\u00fan testimonio",
        testimonial: "Testimonial",
        testimonial_detail: "Detalles testimoniales",
        testimonials: "Testimonials",
      },
      testimonials: "Testimonios",
      tooltip: {
        change_app_logo: "Cambiar el logotipo de la aplicaci\u00f3n",
        change_favicon: "Cambiar icono de favorito",
        change_home_banner: "Cambiar el banner de inicio",
        change_image: "Cambiar imagen",
        copy_preview_link: "Copiar enlace de vista previa",
      },
      transaction: {
        approved: "Aprobado",
        denied: "Denegado",
        invoice: "Factura",
        payment_approved: "Estado de pago",
        plan_name: "Nombre del plan",
        select_manual_payment: "Seleccionar pago manual",
        subscription_id: "Id. De suscripci\u00f3n",
        transaction_date: "Fecha de Transacci\u00f3n",
        type: "Tipo",
        user_name: "Nombre del empleador",
      },
      transactions: "Actas",
      translation_manager: "Gerente de traducci\u00f3n",
      user: {
        change_password: "Cambio Contrase\u00f1a",
        edit_profile: "Editar Perfil",
        email: "Email",
        first_name: "Primera First",
        last_name: "\u00daltima First",
        logout: "Cerrar sesi\u00f3n",
        name: "Primera",
        password: "Contrase\u00f1a",
        password_confirmation: "Confirmar Contrase\u00f1a",
        phone: "Tel\u00e9fono",
        required_field_messages:
          "Por favor complete todos los campos obligatorios.",
        user_name: "Nombre de usuario",
      },
      user_language: { change_language: "Cambio Idioma", language: "Idioma" },
      weekdays: {
        fri: "VIE",
        mon: "LUN",
        sat: "Se sent\u00f3",
        sun: "SOL",
        thu: "JUE",
        tue: "MAR",
        wed: "CASARSE",
      },
      your_cv: "Tu hoja de vida",
    },
    "es.pagination": {
      next: "Pr\u00f3xima &raquo;",
      previous: "&laquo; Previa",
    },
    "es.validation": {
      accepted: "El :attribute debe ser aceptado.",
      active_url: "El :attribute no es una URL v\u00e1lida.",
      after: "El :attribute debe ser una fecha despu\u00e9s de :date.",
      after_or_equal:
        "El :attribute debe ser una fecha posterior o igual a :date.",
      alpha: "El :attribute solo puede contener letras.",
      alpha_dash:
        "El :attribute solo puede contener letras, n\u00fameros, guiones y guiones bajos.",
      alpha_num: "El :attribute solo puede contener letras y n\u00fameros.",
      array: "El :attribute debe ser una matriz.",
      attributes: [],
      before: "El :attribute debe ser una fecha anterior a :date.",
      before_or_equal:
        "El :attribute debe ser una fecha anterior o igual a :date.",
      between: {
        array: "El :attribute debe tener entre :min y :art\u00edculos max.",
        file: "El :attribute debe estar entre :min y :max kilobytes.",
        numeric: "El :attribute debe estar entre :min y :max.",
        string: "El :attribute debe estar entre :min y :max caracteres.",
      },
      boolean: "El campo :attribute debe ser verdadero o falso.",
      confirmed: "La confirmaci\u00f3n de :attribute no coincide.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "El :attribute no es una fecha v\u00e1lida.",
      date_equals: "El :attribute debe ser una fecha igual a :date.",
      date_format: "El :attribute no coincide con el formato :format.",
      different: "El :attribute y :other deben ser diferentes.",
      digits: "El :attribute debe ser :digits d\u00edgitos.",
      digits_between:
        "El :attribute debe estar entre :min y :max d\u00edgitos.",
      dimensions: "El :attribute tiene dimensiones de imagen no v\u00e1lidas.",
      distinct: "El :attribute atributo tiene un valor duplicado.",
      email:
        "El :attribute debe ser una direcci\u00f3n de correo electr\u00f3nico v\u00e1lida.",
      ends_with:
        "El :attribute debe terminar con uno de los siguientes :values.",
      exists: "El :attribute seleccionado no es v\u00e1lido.",
      file: "El :attribute debe ser un archivo.",
      filled: "El campo :attribute debe tener un valor.",
      gt: {
        array: "El :attribute debe tener m\u00e1s de elementos de :value.",
        file: "El :attribute debe ser mayor que :value kilobytes.",
        numeric: "El :attribute debe ser mayor que :value.",
        string: "El :attribute debe ser mayor que caracteres de :value.",
      },
      gte: {
        array: "El :attribute debe tener elementos de :value o m\u00e1s.",
        file: "El :attribute debe ser mayor o igual :value kilobytes.",
        numeric: "El :attribute debe ser mayor o igual que :value.",
        string:
          "El :attribute debe ser mayor o igual que caracteres de :value.",
      },
      image: "El :attribute debe ser una imagen.",
      in: "El :attribute seleccionado no es v\u00e1lido.",
      in_array: "El campo :attribute no existe en :other.",
      integer: "El :attribute debe ser un entero.",
      ip: "El :attribute debe ser una direcci\u00f3n IP v\u00e1lida.",
      ipv4: "El :attribute debe ser una direcci\u00f3n IPv4 v\u00e1lida.",
      ipv6: "El :attribute debe ser una direcci\u00f3n IPv6 v\u00e1lida.",
      json: "El :attribute debe ser una cadena JSON v\u00e1lida.",
      lt: {
        array: "El :attribute debe tener menos de elementos de :value.",
        file: "El :attribute debe ser menor que :value kilobytes.",
        numeric: "El :attribute debe ser menor que :value.",
        string: "El :attribute debe ser menor que caracteres de :value.",
      },
      lte: {
        array: "El :attribute no debe tener m\u00e1s de elementos de :value.",
        file: "El :attribute debe ser menor o igual :value kilobytes.",
        numeric: "El :attribute debe ser menor o igual que :value.",
        string:
          "El :attribute debe ser menor o igual que caracteres de :value.",
      },
      max: {
        array: "El :attribute no puede tener m\u00e1s de elementos :max.",
        file: "El :attribute no puede ser mayor que kilobytes :max.",
        numeric: "El :attribute no puede ser mayor que :max.",
        string: "El :attribute no puede ser mayor que caracteres :max.",
      },
      mimes: "El :attribute debe ser un archivo de tipo: :values.",
      mimetypes: "El :attribute debe ser un archivo de tipo: :values.",
      min: {
        array: "El :attribute debe tener al menos elementos :min.",
        file: "El :attribute debe ser al menos :min kilobytes.",
        numeric: "El :attribute debe ser al menos :min.",
        string: "El :attribute debe tener al menos caracteres :min.",
      },
      not_in: "El :attribute seleccionado no es v\u00e1lido.",
      not_regex: "El formato del :attribute no es v\u00e1lido.",
      numeric: "El :attribute debe ser un n\u00famero.",
      password: "La contrase\u00f1a es incorrecta.",
      present: "El campo de :attribute debe estar presente.",
      regex: "El formato del :attribute no es v\u00e1lido.",
      required: "El campo de :attribute es obligatorio.",
      required_if:
        "El campo :attribute es obligatorio cuando :other es :value.",
      required_unless:
        "El campo :attribute es obligatorio a menos que :other est\u00e9 en :values.",
      required_with:
        "El campo :attribute es obligatorio cuando :values est\u00e1n presentes.",
      required_with_all:
        "El campo :attribute es obligatorio cuando los :values est\u00e1n presentes.",
      required_without:
        "El campo :attribute es obligatorio cuando los :values no est\u00e1n presentes.",
      required_without_all:
        "El campo :attribute es obligatorio cuando ninguno de los :values est\u00e1 presente.",
      same: "El :attribute y :other deben coincidir.",
      size: {
        array: "El :attribute debe contener elementos de :size.",
        file: "El :attribute debe ser :size kilobytes.",
        numeric: "El :attribute debe ser :size.",
        string: "El :attribute debe ser caracteres de :size.",
      },
      starts_with:
        "El :attribute debe comenzar con uno de los siguientes :values.",
      string: "El :attribute debe ser una cadena.",
      timezone: "El :attribute debe ser una zona v\u00e1lida.",
      unique: "El :attribute ya se ha tomado.",
      uploaded: "El :attribute no se pudo cargar.",
      url: "El formato del :attribute no es v\u00e1lido.",
      uuid: "El :attribute debe ser un UUID v\u00e1lido.",
    },
    "fr.messages": {
      about_us: "\u00c0 propos Nous",
      about_us_services: "\u00c0 propos de nous",
      admin_dashboard: {
        active_jobs: "Active Emplois",
        active_users: "Active Utilisatrices",
        featured_employers: "Employeurs en vedette",
        featured_employers_incomes: "Revenus des employeurs en vedette",
        featured_jobs: "En vedette Emplois",
        featured_jobs_incomes: "Revenus des emplois en vedette",
        post_statistics: "Statistiques des publications",
        recent_candidates: "Candidats r\u00e9cents",
        recent_employers: "Employeurs r\u00e9cents",
        recent_jobs: "R\u00e9cente Emplois",
        registered_candidates: "Inscrite Candidates",
        registered_employer: "Inscrite Employeurs",
        subscription_incomes: "Revenus d`abonnement",
        today_jobs: "Aujourd'hui Emplois",
        total_active_jobs: "Total des emplois actifs",
        total_candidates: "Nombre total de candidats",
        total_employers: "Nombre total d'employeurs",
        total_users: "Totale Utilisatrices",
        verified_users: "V\u00e9rifi\u00e9 Utilisatrices",
        weekly_users: "Utilisateurs hebdomadaires",
      },
      all_resumes: "Tous les CV",
      all_rights_reserved: "Tous les droits sont r\u00e9serv\u00e9s",
      applied_job: {
        applied_jobs: "Appliqu\u00e9e Emplois",
        companies: "Entreprises",
        job: "Emploi",
        notes: "Remarques",
      },
      apply_job: {
        apply_job: "Appliquer Emploi",
        notes: "Remarques",
        resume: "CV",
      },
      blog_categories: "Blog Cat\u00e9gories",
      blogs: "Blogs",
      branding_slider: {
        brand: "Marque",
        edit_branding_slider: "Modifier le curseur de marque",
        new_branding_slider: "Nouveau curseur de marque",
        no_branding_slider_available: "Aucun curseur de marque disponible",
        no_branding_slider_found: "Aucun curseur de marque trouv\u00e9",
      },
      branding_sliders: "Curseurs de marque",
      brands: "Marques",
      candidate: {
        address: "Adresse",
        admins: "Administrateurs",
        already_reported: "D\u00e9j\u00e0 signal\u00e9",
        available_at: "Disponible \u00e0",
        birth_date: "Naissance Date",
        candidate_details: "Candidate D\u00e9tails",
        candidate_language: "Langues",
        candidate_skill: "Comp\u00e9tence",
        candidates: "Candidates",
        career_level: "Carri\u00e8re Niveau",
        conform_password: "Confirmer Mot de passe",
        current_salary: "Actuelle Un salaire",
        dashboard: "Tableau de bord",
        edit_admin: "Modifier l'administrateur",
        edit_candidate: "\u00c9diter Candidate",
        edit_profile_information: "\u00c9diter Profil Information",
        education_not_found: "Aucune \u00e9ducation disponible.",
        email: "Email",
        employee: "Employ\u00e9e",
        expected_salary: "pr\u00e9tentions",
        experience: "Exp\u00e9rience",
        experience_not_found: "Aucune exp\u00e9rience disponible.",
        father_name: "P\u00e8re Nom",
        first_name: "Premi\u00e8re Nom",
        functional_area: "Fonctionnelle Zone",
        gender: "Le sexe",
        immediate_available: "Imm\u00e9diate Disponible",
        in_year: "Dans des ann\u00e9es",
        industry: "Industrie",
        is_active: "Est Active",
        is_verified: "Est V\u00e9rifi\u00e9",
        job_alert_message:
          "Avertissez-moi par e-mail lorsqu'une offre d'emploi correspondant \u00e0 mon choix est publi\u00e9e.",
        last_name: "Derni\u00e8re Nom",
        marital_status: "Matrimoniale Statut",
        national_id_card: "Nationale ID Carte",
        nationality: "Nationalit\u00e9",
        new_admin: "Nouvel administrateur",
        new_candidate: "Nouvelle Candidate",
        no_candidate_available: "Aucun candidat disponible",
        no_reported_candidates_available:
          "Aucun candidat signal\u00e9 disponible",
        no_reported_candidates_found: "Aucun candidat signal\u00e9 trouv\u00e9",
        not_immediate_available: "ne pas Imm\u00e9diate Disponible",
        password: "Mot de passe",
        phone: "T\u00e9l\u00e9phone",
        profile: "Profil",
        reporte_to_candidate: "Rapporter aux candidats",
        reported_candidate: "Candidat signal\u00e9",
        reported_candidate_detail: "D\u00e9tails du candidat signal\u00e9",
        reported_candidates: "Candidats signal\u00e9s",
        reported_employer: "Employeur d\u00e9clar\u00e9",
        resume_not_found: "Aucun CV disponible.",
        salary_currency: "Un salaire Actuelle",
        salary_per_month: "Salaire par mois.",
      },
      candidate_dashboard: {
        followings: "Suivi",
        location_information: "Emplacement Information ne pas disponible.",
        my_cv_list: "Ma CV liste",
        no_not_available: "Nombre ne pas disponible.",
        profile_views: "Profil Vues",
      },
      candidate_profile: {
        add_education: "Ajouter \u00c9ducation",
        add_experience: "Ajouter Exp\u00e9rience",
        age: "\u00c2ge",
        company: "Compagnie",
        currently_working: "Actuellement Travail",
        degree_level: "Degr\u00e9 Niveau",
        degree_title: "Degr\u00e9 Titre",
        description: "La description",
        edit_education: "\u00c9diter \u00c9ducation",
        edit_experience: "\u00c9diter Exp\u00e9rience",
        education: "\u00c9ducation",
        end_date: "Fin Date",
        experience: "Exp\u00e9rience",
        experience_title: "Exp\u00e9rience Titre",
        institute: "Institut",
        online_profile: "Profil en ligne",
        present: "Pr\u00e9sent",
        result: "R\u00e9sultat",
        select_year: "S\u00e9lectionnez l'ann\u00e9e",
        start_date: "D\u00e9but Date",
        title: "Titre",
        upload_resume: "T\u00e9l\u00e9charger CV",
        work_experience: "l'exp\u00e9rience professionnelle",
        year: "An",
        years: "Ann\u00e9es",
      },
      candidates: "Candidates",
      career_informations: "Carri\u00e8re Informations",
      career_level: {
        edit_career_level: "\u00c9diter Carri\u00e8re Niveau",
        level_name: "Niveau Nom",
        new_career_level: "Nouvelle Carri\u00e8re Niveau",
        no_career_level_available: "Aucun niveau de carri\u00e8re disponible",
        no_career_level_found: "Aucun niveau de carri\u00e8re trouv\u00e9",
      },
      career_levels: "Carri\u00e8re Les niveaux",
      city: {
        cities: "Villes",
        city_name: "Nom de Ville",
        edit_city: "Modifier la ville",
        new_city: "Nouvelle ville",
        no_city_available: "Aucune ville disponible",
        no_city_found: "Aucune ville trouv\u00e9e",
        state_name: "Nom d'\u00e9tat",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "\u00c0 propos de la premi\u00e8re description",
        about_desc_three: "\u00c0 propos de la description trois",
        about_desc_two: "\u00c0 propos de la description deux",
        about_image_one: "\u00c0 propos de l'image\u00a01",
        about_image_three: "\u00c0 propos de l'image trois",
        about_image_two: "\u00c0 propos de l'image deux",
        about_title_one: "\u00c0 propos du titre un",
        about_title_three: "\u00c0 propos du titre trois",
        about_title_two: "\u00c0 propos du titre deux",
      },
      cms_service: {
        choose: "Choisir",
        home_banner: "Banni\u00e8re Accueil",
        home_description: "Descriptif de la maison",
        home_title: "Titre de la maison",
      },
      cms_services: "Services CMS",
      cms_sliders: "Curseurs CMS",
      common: {
        action: "action",
        active: "Actif",
        add: "Ajouter",
        admin_name: "Nom de l'administrateur",
        all: "Toute",
        and_time: "et le temps",
        applied: "Appliqu\u00e9",
        applied_on: "Appliqu\u00e9 sur",
        apply: "Appliquer",
        approved_by: "Approuv\u00e9 par",
        are_you_sure: "Voulez-vous vraiment supprimer ce",
        are_you_sure_want_to_delete: "Voulez-vous vraiment supprimer ceci ",
        are_you_sure_want_to_reject: "Voulez-vous vraiment rejeter cela",
        are_you_sure_want_to_select:
          "Voulez-vous vraiment s\u00e9lectionner ce",
        back: "Arri\u00e8re",
        cancel: "Annuler",
        category_image: "Image de la cat\u00e9gorie",
        choose: "Choisir",
        choose_file: "Choisir fichier",
        close: "Fermer",
        completed: "Termin\u00e9",
        copyright: "droits d'auteur",
        created_date: "Date de cr\u00e9ation",
        created_on: "\u00c9tablie Sur",
        custom: "Personnalis\u00e9",
        de_active: "D\u00e9sactiver",
        decline: "Decline",
        declined: "Diminu\u00e9",
        default_country_code: "Code pays par d\u00e9faut",
        delete: "Supprimer",
        deleted: "Supprim\u00e9",
        description: "La description",
        design_by: "Conception Par",
        design_by_name: "InfyOm Laboratoires.",
        download: "T\u00e9l\u00e9charger",
        drafted: "R\u00e9dig\u00e9",
        edit: "\u00c9diter",
        email: "Email",
        error: "Erreur",
        expire: "Expirer",
        export_excel: "Exporter vers Excel",
        female: "Femme",
        filter_options: "Options de filtrage",
        filters: "Filtres",
        from: "De",
        has_been_deleted: "a \u00e9t\u00e9 supprim\u00e9.",
        has_been_rejected: "a \u00e9t\u00e9 refus\u00e9.",
        has_been_selected: "a \u00e9t\u00e9 s\u00e9lectionn\u00e9.",
        hello: "Bonjour",
        hi: "salut",
        hired: "Embauch\u00e9",
        image_aspect_ratio:
          "Le rapport hauteur/largeur de l`image doit \u00eatre de 1:1.",
        image_file_type:
          "L`image doit \u00eatre un fichier de type : jpeg, jpg, png.",
        last_change_by: "Derni\u00e8res modifications par",
        last_updated: "Derni\u00e8re Actualis\u00e9",
        live: "Vivre",
        login: "S'identifier",
        male: "M\u00e2le",
        "n/a": "N/A",
        name: "Nom",
        no: "Non",
        no_cancel: "Non, Annuler",
        not_verified: "ne pas V\u00e9rifi\u00e9",
        note: "Noter",
        note_message:
          "Veuillez saisir le code court de la langue. c'est-\u00e0-dire anglais = en.",
        ok: "D'accord",
        ongoing: "En cours",
        open: "ouverte",
        pause: "pause",
        paused: "En pause",
        preview: "Aper\u00e7u",
        print: "Impression",
        process: "Traitement...",
        reason: "Raison",
        register: "S'inscrire",
        rejected: "rejet\u00e9e",
        report: "rapport",
        resend_verification_mail: "Renvoyer le courrier de v\u00e9rification",
        reset: "R\u00e9initialiser",
        save: "sauver",
        save_as_draft: "Enregistrer comme brouillon",
        saved_successfully: " enregistr\u00e9 avec succ\u00e8s",
        search: "Chercher",
        select_job_stage: "S\u00e9lectionnez l'\u00e9tape du travail",
        selected: "Choisi",
        shortlist: "Liste restreinte",
        show: "Spectacle",
        status: "Statut",
        success: " Couronn\u00e9 de succ\u00e8s",
        to: "\u00c0",
        updated_successfully: " Mis \u00e0 jour avec succ\u00e9s",
        verified: "V\u00e9rifi\u00e9",
        view: "Vue",
        view_more: "Vue Plus",
        view_profile: "Afficher le nom",
        welcome: "Bienvenue",
        yes: "Oui",
        yes_delete: "Oui, supprimer!",
        you_cancel_slot_date: "Vous annulez ce cr\u00e9neau pour date",
      },
      companies: "Entreprises",
      company: {
        candidate_email: "Candidate Email",
        candidate_name: "Candidate Nom",
        candidate_phone: "Candidate T\u00e9l\u00e9phone",
        ceo: "Nom du PDG",
        ceo_name: "nom du PDG",
        city: "Ville",
        company_details: "Compagnie D\u00e9tails",
        company_listing: "Compagnie R\u00e9f\u00e9rencement",
        company_logo: "Logo",
        company_name: "Compagnie Nom",
        company_size: "Taille",
        confirm_password: "Confirmer Mot de passe",
        country: "Pays",
        current_password: "Mot de passe actuel",
        edit_company: "\u00c9diter Compagnie",
        edit_employer: "Modifier l'employeur",
        email: "Email",
        email_verified: "Email verifi\u00e9",
        employer: "Employeur",
        employer_ceo: "PDG employeur",
        employer_details: "D\u00e9tails de l'employeur",
        employer_name: "nom de l'employeur",
        employers: "Employeurs",
        enter_experience_year: "Entrez l'exp\u00e9rience dans l'ann\u00e9e",
        established_in: "\u00c9tablie Dans",
        established_year: "l'ann\u00e9e \u00e9tablie",
        facebook_url: "L'adresse URL de Facebook",
        fax: "Fax",
        followers: "Suiveuses",
        google_plus_url: "Google Plus d'URL",
        image: "Image",
        industry: "Industrie",
        is_active: "Est Actif",
        is_featured: "Est En vedette",
        linkedin_url: "URL Linkedin",
        location: "Emplacement",
        location2: "2\u00e8me emplacement de bureau",
        name: "Nom",
        new_company: "Nouvelle Compagnie",
        new_employer: "Nouvel employeur",
        new_password: "nouveau mot de passe",
        no_employee_found: "Aucun employ\u00e9 trouv\u00e9",
        no_employee_reported_available: "Aucun rapport employ\u00e9 disponible",
        no_employer_available: "Aucun employ\u00e9 disponible",
        no_of_offices: "Non de Des bureaux",
        no_reported_employer_found: "Aucun employeur signal\u00e9 trouv\u00e9",
        notes: "Remarques",
        offices: "Des bureaux",
        ownership_type: "La possession Type",
        password: "Mot de passe",
        pinterest_url: "URL Pinterest",
        report_to_company: "rapport \u00e0 Compagnie",
        reported_by: "Rapport\u00e9 par",
        reported_companies: "Signal\u00e9 Companies",
        reported_company: "Signal\u00e9 Compagnie",
        reported_employer_detail: "D\u00e9tails de employeur signal\u00e9s",
        reported_employers: "Employeurs d\u00e9clar\u00e9s",
        reported_on: "Rapport\u00e9 le",
        select_career_level: "S\u00e9lectionnez le niveau de carri\u00e8re",
        select_city: "S\u00e9lectionnez une ville",
        select_company: "S\u00e9lectionnez l'entreprise",
        select_company_size: "S\u00e9lectionnez la taille de l'entreprise",
        select_country: "Choisissez le pays",
        select_currency: "S\u00e9lectionnez la devise",
        select_degree_level: "S\u00e9lectionnez le niveau de dipl\u00f4me",
        select_employer_size: "S\u00e9lectionnez la taille de l'employeur",
        select_established_year: "S\u00e9lectionnez l'ann\u00e9e \u00e9tablie",
        select_functional_area: "S\u00e9lectionnez le domaine fonctionnel",
        select_gender: "S\u00e9lectionnez le sexe",
        select_industry: "S\u00e9lectionnez l'industrie",
        select_job_category: "S\u00e9lectionnez la cat\u00e9gorie d'emploi",
        select_job_shift: "S\u00e9lectionnez l'\u00e9quipe de travail",
        select_job_type: "S\u00e9lectionnez le type de travail",
        select_language: "Choisir la langue",
        select_marital_status: "S\u00e9lectionnez l'\u00e9tat civil",
        select_ownership_type: "S\u00e9lectionnez le type de propri\u00e9taire",
        select_position: "S\u00e9lectionnez le poste",
        select_salary_period: "S\u00e9lectionnez la p\u00e9riode de salaire",
        select_state: "S\u00e9lectionnez l'\u00e9tat",
        state: "Etat",
        title: "Titre d'emploi",
        twitter_url: "Twitter URL",
        website: "Site Internet",
      },
      company_size: {
        action: "action",
        add: "Ajouter",
        company_size: "Taille de l`entreprise",
        edit_company_size: "\u00c9diter Compagnie Taille",
        new_company_size: "Nouvelle Compagnie Taille",
        no_company_size_available: "Pas de taille d`entreprise disponible",
        no_company_size_found: "Pas de taille d`entreprise trouv\u00e9e",
        show_company_size: "Emploi Cat\u00e9gorie",
        size: "Taille",
      },
      company_sizes: "Compagnie Tailles",
      country: {
        countries: "Des pays",
        country_name: "Nom du pays",
        edit_country: "Modifier le pays",
        new_country: "Nouveau pays",
        no_country_available: "Aucun pays disponible",
        no_country_found: "Aucun pays trouv\u00e9",
        phone_code: "Code de t\u00e9l\u00e9phone",
        short_code: "Petit code",
      },
      cv_builder: "Cr\u00e9ateur de CV",
      dashboard: "Tableau de bord",
      datepicker: {
        last_month: "Le mois dernier",
        last_week: "La semaine derni\u00e8re",
        this_month: "Ce mois-ci",
        this_week: "Cette semaine",
        today: "Aujourd'hui",
      },
      email_template: {
        body: "Corps",
        edit_email_template: "Modifier le mod\u00e8le d`e-mail",
        short_code: "Code court",
        subject: "sujet",
        template_name: "Nom du mod\u00e8le",
      },
      email_templates: "Mod\u00e8les d`e-mails",
      employer: {
        job_stage: "\u00c9tapes du travail",
        job_stage_desc: "La description",
      },
      employer_dashboard: {
        dashboard: "Tableau de bord",
        followers: "Suiveuses",
        job_applications: "Emploi Applications",
        open_jobs: "Ouverte Emplois",
      },
      employer_menu: {
        closed_jobs: "emplois ferm\u00e9s",
        employer_details_field:
          "Le champ D\u00e9tails de l'employeur est obligatoire.",
        employer_profile: "Profil de l'employeur",
        enter_description: "Entrer le descriptif",
        enter_employer_details: "Saisir les coordonn\u00e9es de l'employeur",
        enter_industry_details: "Entrez les d\u00e9tails de l'industrie...",
        enter_ownership_details:
          "Entrez les d\u00e9tails de la propri\u00e9t\u00e9...",
        expired_job: "Emploi expir\u00e9",
        expires_on: "expire le",
        followers: "Suiveuses",
        general_dashboard: "G\u00e9n\u00e9rale Tableau de bord",
        jobs: "Emplois",
        manage_subscriptions: "G\u00e9rer l'abonnement",
        no_data_available: "pas de donn\u00e9es disponibles",
        paused_jobs: "travaux suspendus",
        recent_follower: "abonn\u00e9 r\u00e9cent",
        recent_jobs: "emplois r\u00e9cents",
        total_job_applications: "total des demandes d'emploi",
        total_jobs: "emplois totaux",
        transactions: "Transactions",
        valid_facebook_url: "Entrez une URL Facebook valide",
        valid_google_plus_url: "Entrez une URL Google Plus valide",
        valid_linkedin_url: "Veuillez saisir une URL Linkedin valide",
        valid_pinterest_url: "Entrez une URL Pinterest valide",
        valid_twitter_url: "Entrez une URL Twitter valide",
      },
      employers: "Employeurs",
      env: "Param\u00e8tres environnement",
      expired_jobs: "Emplois expir\u00e9s",
      faq: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_faq: "\u00c9diter FAQ",
        faq: "FAQ",
        faq_detail: "D\u00e9tails de la FAQ",
        new_faq: "Nouvelle FAQ",
        no_faq_available: "Aucune FAQ disponible",
        no_faq_found: "Aucune FAQ trouv\u00e9e",
        show_faq: "FAQ",
        title: "Titre",
      },
      favourite_companies: "Suivi",
      favourite_jobs: "Pr\u00e9f\u00e9r\u00e9e Emplois",
      filter_name: {
        closed: "Ferm\u00e9e",
        country: "Pays",
        digital: "NUM\u00c9RIQUE",
        drafted: "R\u00e9dig\u00e9",
        featured_company: "Entreprise en vedette",
        featured_job: "Emploi en vedette",
        freelancer_job: "Emploi de pigiste",
        immediate: "Imm\u00e9diate",
        job_status: "Statut du travail",
        live: "Vivre",
        manually: "MANUELLEMENT",
        paused: "En pause",
        select_featured_company: "S\u00e9lectionnez l'entreprise en vedette",
        select_featured_job: "S\u00e9lectionnez l'emploi en vedette",
        select_status: "S\u00e9lectionnez le statut",
        state: "\u00c9tat",
        status: "Statut",
        suspended_job: "Travail suspendu",
      },
      flash: {
        about_us_update:
          "\u00c0 propos de nous mis \u00e0 jour avec succ\u00e8s.",
        admin_cant_delete:
          "L'administrateur ne peut pas \u00eatre supprim\u00e9.",
        admin_delete: "Admin supprim\u00e9 avec succ\u00e8s.",
        admin_save: "Administrateur enregistr\u00e9 avec succ\u00e8s.",
        admin_update: "Admin mis \u00e0 jour avec succ\u00e8s.",
        all_notification_read:
          "Toutes les notifications ont \u00e9t\u00e9 lues avec succ\u00e8s.",
        are_you_sure_to_change_status:
          "Voulez-vous vraiment modifier le statut?",
        assigned_slot_not_delete:
          "L'emplacement attribu\u00e9 ne doit pas \u00eatre supprim\u00e9.",
        attention: "Attention",
        brand_delete: "Marque supprim\u00e9e avec succ\u00e8s.",
        brand_retrieved: "Marque r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        brand_save: "Marque enregistr\u00e9e avec succ\u00e8s.",
        brand_update: "Marque mise \u00e0 jour avec succ\u00e8s.",
        cancel_reason_require: "La raison de l'annulation est requise.",
        candidate_delete: "Candidat supprim\u00e9 avec succ\u00e8s.",
        candidate_education_delete:
          "Formation du candidat supprim\u00e9e avec succ\u00e8s.",
        candidate_education_retrieved:
          "L'\u00e9ducation du candidat a \u00e9t\u00e9 r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        candidate_education_save:
          "L'\u00e9ducation du candidat a \u00e9t\u00e9 ajout\u00e9e avec succ\u00e8s.",
        candidate_education_update:
          "La formation des candidats a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        candidate_experience_delete:
          "Exp\u00e9rience candidat supprim\u00e9e avec succ\u00e8s.",
        candidate_experience_retrieved:
          "Exp\u00e9rience candidat r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        candidate_experience_save:
          "Exp\u00e9rience candidat ajout\u00e9e avec succ\u00e8s.",
        candidate_experience_update:
          "Exp\u00e9rience candidat mise \u00e0 jour avec succ\u00e8s.",
        candidate_not_found: "Candidat introuvable",
        candidate_profile:
          "Le profil du candidat a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        candidate_reported: "Candidat rapport\u00e9 avec succ\u00e8s.",
        candidate_retrieved:
          "Candidat r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        candidate_save: "Candidat enregistr\u00e9 avec succ\u00e8s.",
        candidate_update: "Candidat mis \u00e0 jour avec succ\u00e8s.",
        career_level_cant_delete:
          "Le niveau de carri\u00e8re ne peut pas \u00eatre supprim\u00e9.",
        career_level_delete:
          "Niveau de carri\u00e8re supprim\u00e9 avec succ\u00e8s.",
        career_level_retrieved:
          "Niveau de carri\u00e8re r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        career_level_save:
          "Niveau de carri\u00e8re ajout\u00e9 avec succ\u00e8s.",
        career_level_update:
          "Niveau de carri\u00e8re mis \u00e0 jour avec succ\u00e8s.",
        city_cant_delete: "Impossible de supprimer la ville.",
        city_delete: "Ville supprim\u00e9e avec succ\u00e8s.",
        city_retrieved: "Ville r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        city_save: "Ville enregistr\u00e9e avec succ\u00e8s.",
        city_update: "Ville mise \u00e0 jour avec succ\u00e8s.",
        close_job: "Le travail ferm\u00e9 ne peut pas \u00eatre modifi\u00e9.",
        cms_service_update:
          "Les services CMS ont \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        comment_deleted: "Commentaire supprim\u00e9 avec succ\u00e8s.",
        comment_edit: "Commentaire modifi\u00e9 avec succ\u00e8s.",
        comment_saved: "Commentaire enregistr\u00e9 avec succ\u00e8s.",
        comment_updated: "Commentaire mis \u00e0 jour avec succ\u00e8s.",
        company_delete: "Entreprise supprim\u00e9e avec succ\u00e8s.",
        company_mark_feature:
          "Marque de l'entreprise comme pr\u00e9sent\u00e9e avec succ\u00e8s.",
        company_mark_unFeature:
          "Marquer l'entreprise comme non pr\u00e9sent\u00e9 avec succ\u00e8s.",
        company_save: "Entreprise enregistr\u00e9e avec succ\u00e8s.",
        company_size_cant_delete:
          "La taille de l'entreprise ne peut pas \u00eatre supprim\u00e9e.",
        company_size_delete:
          "Taille de l'entreprise supprim\u00e9e avec succ\u00e8s.",
        company_size_save:
          "Taille de l'entreprise enregistr\u00e9e avec succ\u00e8s.",
        company_size_update:
          "La taille de l'entreprise a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        company_update: "Entreprise mise \u00e0 jour avec succ\u00e8s.",
        country_cant_delete: "Le pays ne peut pas \u00eatre supprim\u00e9.",
        country_delete: "Pays supprim\u00e9 avec succ\u00e8s.",
        country_save: "Pays enregistr\u00e9 avec succ\u00e8s.",
        country_update: "Pays mis \u00e0 jour avec succ\u00e8s.",
        default_resume_already_upload:
          "Le CV par d\u00e9faut a d\u00e9j\u00e0 \u00e9t\u00e9 t\u00e9l\u00e9charg\u00e9.",
        degree_level_cant_delete:
          "Le niveau de dipl\u00f4me ne peut pas \u00eatre supprim\u00e9.",
        degree_level_delete:
          "Niveau de dipl\u00f4me supprim\u00e9 avec succ\u00e8s.",
        degree_level_retrieve:
          "Niveau de dipl\u00f4me r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        degree_level_save:
          "Niveau de dipl\u00f4me enregistr\u00e9 avec succ\u00e8s.",
        degree_level_update:
          "Niveau de dipl\u00f4me mis \u00e0 jour avec succ\u00e8s.",
        description_required: "Le champ Description est obligatoire.",
        email_template:
          "Mod\u00e8le d'e-mail mis \u00e0 jour avec succ\u00e8s.",
        email_verify: "E-mail v\u00e9rifi\u00e9 avec succ\u00e8s.",
        employer_profile:
          "Profil de l'employeur mis \u00e0 jour avec succ\u00e8s.",
        employer_update: "Employeur mis \u00e0 jour avec succ\u00e8s.",
        enter_cancel_reason: "Saisissez le motif d'annulation...",
        enter_description: "Entrez la description",
        enter_notes: "Saisir des remarques...",
        enter_post_description: "Entrez la description du poste",
        faqs_delete: "FAQ supprim\u00e9e avec succ\u00e8s.",
        faqs_save: "FAQ enregistr\u00e9e avec succ\u00e8s.",
        faqs_update: "FAQ mise \u00e0 jour avec succ\u00e8s.",
        fav_company_delete:
          "Entreprise favorite supprim\u00e9e avec succ\u00e8s.",
        fav_job_added: "Travail favori ajout\u00e9 avec succ\u00e8s.",
        fav_job_remove: "L'emploi favori a \u00e9t\u00e9 supprim\u00e9.",
        fav_job_removed: "Travail favori supprim\u00e9 avec succ\u00e8s.",
        feature_job_price:
          "Le prix des offres d'emploi en vedette doit \u00eatre sup\u00e9rieur \u00e0 0",
        feature_quota: "Le quota en vedette n'est pas disponible",
        featured_not_available: "Le quota en vedette n'est pas disponible.",
        file_type:
          "Le document doit \u00eatre un fichier de type : jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete:
          "Le domaine fonctionnel ne peut pas \u00eatre supprim\u00e9.",
        functional_area_delete:
          "Domaine fonctionnel supprim\u00e9 avec succ\u00e8s.",
        functional_area_save:
          "Domaine fonctionnel enregistr\u00e9 avec succ\u00e8s.",
        functional_area_update:
          "Le domaine fonctionnel a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        header_slider_deleted:
          "Le curseur d'en-t\u00eate a \u00e9t\u00e9 supprim\u00e9 avec succ\u00e8s.",
        header_slider_save:
          "Curseur d'en-t\u00eate enregistr\u00e9 avec succ\u00e8s.",
        header_slider_update:
          "Le curseur d'en-t\u00eate a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        image_slider_delete:
          "Le curseur d'image a \u00e9t\u00e9 supprim\u00e9 avec succ\u00e8s.",
        image_slider_retrieve:
          "Curseur d'image r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        image_slider_save:
          "Le curseur d'image a \u00e9t\u00e9 enregistr\u00e9 avec succ\u00e8s.",
        image_slider_update:
          "Le curseur d'image a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        industry_cant_delete:
          "L'industrie ne peut pas \u00eatre supprim\u00e9e.",
        industry_delete: "Industrie supprim\u00e9e avec succ\u00e8s",
        industry_save:
          "L'industrie a \u00e9t\u00e9 sauv\u00e9e avec succ\u00e8s.",
        industry_update:
          "L'industrie a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        inquiry_deleted: "Demande supprim\u00e9e avec succ\u00e8s.",
        inquiry_retrieve: "Demande r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        invoice_retrieve: "Facture r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        job_abuse_reported: "Job Abus signal\u00e9 avec succ\u00e8s.",
        job_alert: "Job Alert mis \u00e0 jour avec succ\u00e8s.",
        job_application_delete:
          "Demande d'emploi supprim\u00e9e avec succ\u00e8s.",
        job_application_draft:
          "Demande d'emploi r\u00e9dig\u00e9e avec succ\u00e8s",
        job_applied: "Emploi appliqu\u00e9 avec succ\u00e8s",
        job_apply_by_candidate:
          "L'offre d'emploi appliqu\u00e9e par le candidat ne peut pas \u00eatre supprim\u00e9e.",
        job_cant_delete: "Le travail ne peut pas \u00eatre supprim\u00e9",
        job_category_cant_delete:
          "La cat\u00e9gorie d'emploi ne peut pas \u00eatre supprim\u00e9e",
        job_category_delete:
          "Cat\u00e9gorie d'emploi supprim\u00e9e avec succ\u00e8s",
        job_category_save:
          "Cat\u00e9gorie d'emploi enregistr\u00e9e avec succ\u00e8s.",
        job_category_update:
          "Mise \u00e0 jour de la cat\u00e9gorie d'emploi r\u00e9ussie.",
        job_create_limit:
          "Limite de cr\u00e9ation d'emploi d\u00e9pass\u00e9e de votre compte, mettez \u00e0 jour votre plan d'abonnement.",
        job_delete: "Travail supprim\u00e9 avec succ\u00e8s.",
        job_draft:
          "Le brouillon de travail a \u00e9t\u00e9 enregistr\u00e9 avec succ\u00e8s.",
        job_emailed_to:
          "Emploi envoy\u00e9 par e-mail \u00e0 un ami avec succ\u00e8s.",
        job_make_featured: "Job Make pr\u00e9sent\u00e9 avec succ\u00e8s.",
        job_make_unfeatured: "Job Make UnFeatured r\u00e9ussi.",
        job_not_found: "Emploi introuvable.",
        job_notification:
          "Notification de t\u00e2che envoy\u00e9e avec succ\u00e8s.",
        job_save: "Travail enregistr\u00e9 avec succ\u00e8s.",
        job_schedule_send: "programme de travail envoy\u00e9 avec succ\u00e8s.",
        job_shift_cant_delete: "Job Shift ne peut pas \u00eatre supprim\u00e9.",
        job_shift_delete:
          "Job Shift a \u00e9t\u00e9 supprim\u00e9 avec succ\u00e8s.",
        job_shift_retrieve:
          "Le quart de travail a \u00e9t\u00e9 r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        job_shift_save: "Job Shift enregistr\u00e9 avec succ\u00e8s.",
        job_shift_update: "Job Shift mis \u00e0 jour avec succ\u00e8s.",
        job_stage_cant_delete:
          "L'\u00e9tape de travail ne peut pas \u00eatre supprim\u00e9e",
        job_stage_change:
          "L'\u00e9tape de la t\u00e2che a \u00e9t\u00e9 modifi\u00e9e avec succ\u00e8s.",
        job_stage_delete:
          "\u00c9tape de travail supprim\u00e9e avec succ\u00e8s.",
        job_stage_retrieve:
          "\u00c9tape de travail r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        job_stage_save:
          "L'\u00e9tape de la t\u00e2che a \u00e9t\u00e9 enregistr\u00e9e avec succ\u00e8s.",
        job_stage_update:
          "L'\u00e9tape de travail a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        job_tag_cant_delete: "Le Job Tag ne peut pas \u00eatre supprim\u00e9.",
        job_tag_delete: "Job Tag supprim\u00e9 avec succ\u00e8s.",
        job_tag_retrieve: "Job Tag r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        job_tag_save: "Job Tag enregistr\u00e9 avec succ\u00e8s.",
        job_tag_update: "Job Tag mis \u00e0 jour avec succ\u00e8s.",
        job_type_cant_delete:
          "Le type de t\u00e2che ne peut pas \u00eatre supprim\u00e9.",
        job_type_delete: "Type de travail supprim\u00e9 avec succ\u00e8s.",
        job_type_retrieve:
          "Type de travail r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        job_type_save: "Type de travail enregistr\u00e9 avec succ\u00e8s.",
        job_type_update: "Type de travail mis \u00e0 jour avec succ\u00e8s.",
        job_update: "Travail mis \u00e0 jour avec succ\u00e8s.",
        language_added: "Langue ajout\u00e9e avec succ\u00e8s.",
        language_changed: "Langue chang\u00e9e avec succ\u00e8s",
        language_delete: "Langue supprim\u00e9e avec succ\u00e8s.",
        language_retrieve: "Langue r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        language_save: "Langue Enregistr\u00e9 avec succ\u00e8s.",
        language_update: "Langue mise \u00e0 jour avec succ\u00e8s.",
        link_copy: "Lien copi\u00e9 avec succ\u00e8s.",
        manual_payment: "Paiement manuel approuv\u00e9 avec succ\u00e8s.",
        manual_payment_denied: "Paiement manuel refus\u00e9 avec succ\u00e8s.",
        marital_status_delete:
          "\u00c9tat civil supprim\u00e9 avec succ\u00e8s.",
        marital_status_retrieve:
          "\u00c9tat civil r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        marital_status_save:
          "\u00c9tat civil enregistr\u00e9 avec succ\u00e8s.",
        marital_status_update:
          "L'\u00e9tat civil a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        media_delete: "M\u00e9dia supprim\u00e9 avec succ\u00e8s.",
        newsletter_delete: "NewsLetter supprim\u00e9e avec succ\u00e8s.",
        no_record: "Aucun enregistrement trouv\u00e9.",
        not_deleted: "Non supprim\u00e9",
        noticeboard_retrieve:
          "Tableau d'affichage r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        noticeboard_save:
          "Le tableau d'affichage a \u00e9t\u00e9 enregistr\u00e9 avec succ\u00e8s.",
        noticeboard_update:
          "Le tableau d'affichage a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        notification_read: "Notification lue avec succ\u00e8s.",
        notification_setting_update:
          "Param\u00e8tres de notification mis \u00e0 jour avec succ\u00e8s.",
        ownership_type_cant_delete:
          "Le type de propri\u00e9taire ne peut pas \u00eatre supprim\u00e9.",
        ownership_type_delete:
          "Le type de propri\u00e9taire a \u00e9t\u00e9 supprim\u00e9 avec succ\u00e8s.",
        ownership_type_retrieve:
          "Le type de propri\u00e9taire a \u00e9t\u00e9 r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        ownership_type_save:
          "Type de propri\u00e9taire enregistr\u00e9 avec succ\u00e8s.",
        ownership_type_updated:
          "Le type de propri\u00e9taire a \u00e9t\u00e9 mis \u00e0 jour avec succ\u00e8s.",
        password_update: "Mot de passe mis \u00e0 jour avec succ\u00e8s.",
        payment_failed_try_again:
          "Pardon! Le paiement a \u00e9chou\u00e9, veuillez r\u00e9essayer plus tard.",
        payment_not_complete: "Votre paiement n'est pas termin\u00e9",
        payment_success: "Votre paiement est termin\u00e9 avec succ\u00e8s",
        plan_Save: "Plan enregistr\u00e9 avec succ\u00e8s.",
        plan_cant_delete:
          "Le plan ne peut pas \u00eatre supprim\u00e9, il contient un ou plusieurs abonnements actifs.",
        plan_cant_update:
          "Le plan ne peut pas \u00eatre mis \u00e0 jour. L'abonnement \u00e0 ce forfait existe d\u00e9j\u00e0",
        plan_delete: "Plan supprim\u00e9 avec succ\u00e8s.",
        plan_retrieve: "Plan r\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        plan_update: "Plan mis \u00e0 jour avec succ\u00e8s.",
        please_wait_for:
          "Veuillez attendre l'approbation de l'administrateur, vous avez d\u00e9j\u00e0 ajout\u00e9 le paiement manuel",
        please_wait_for_com:
          "Veuillez attendre l'approbation de l'administrateur pour terminer votre transaction",
        policy_update: "Strat\u00e9gie mise \u00e0 jour avec succ\u00e8s.",
        post_category_delete:
          "Cat\u00e9gorie de publication supprim\u00e9e avec succ\u00e8s.",
        post_category_retrieve:
          "Cat\u00e9gorie de publication R\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        post_category_save:
          "Cat\u00e9gorie de publication enregistr\u00e9e avec succ\u00e8s.",
        post_category_update:
          "Cat\u00e9gorie de publication mise \u00e0 jour avec succ\u00e8s.",
        post_comment:
          "Postez les commentaires r\u00e9cup\u00e9r\u00e9s avec succ\u00e8s.",
        post_delete: "Message supprim\u00e9 avec succ\u00e8s.",
        post_save: "Message enregistr\u00e9 avec succ\u00e8s.",
        post_update: "Message mis \u00e0 jour avec succ\u00e8s.",
        profile_update: "Mise \u00e0 jour du profil r\u00e9ussie.",
        reason_require: "Le motif d'annulation est obligatoire.",
        register_success_mail_active:
          "Vous vous \u00eates inscrit avec succ\u00e8s, activez votre compte par e-mail.",
        registration_done: "Inscription effectu\u00e9e avec succ\u00e8s.",
        report_to_company: "Signaler \u00e0 l'entreprise avec succ\u00e8s.",
        reported_candidate_delete:
          "Candidat signal\u00e9 supprim\u00e9 avec succ\u00e8s.",
        reported_job_delete:
          "Les travaux signal\u00e9s ont \u00e9t\u00e9 supprim\u00e9s avec succ\u00e8s.",
        resume_delete: "Reprendre la suppression avec succ\u00e8s.",
        resume_update: "CV mis \u00e0 jour avec succ\u00e8s.",
        retrieved: "R\u00e9cup\u00e9r\u00e9 avec succ\u00e8s.",
        salary_currency_cant_delete:
          "La moneda del salario no se puede eliminar.",
        salary_currency_destroy:
          "La devise du salaire a \u00e9t\u00e9 supprim\u00e9e avec succ\u00e8s.",
        salary_currency_edit:
          "La devise du salaire a \u00e9t\u00e9 r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        salary_currency_store:
          "La devise du salaire a \u00e9t\u00e9 enregistr\u00e9e avec succ\u00e8s.",
        salary_currency_update:
          "La devise du salaire a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        salary_period_cant_delete:
          "La p\u00e9riode de salaire ne peut pas \u00eatre supprim\u00e9e.",
        salary_period_delete:
          "P\u00e9riode de salaire supprim\u00e9e avec succ\u00e8s.",
        salary_period_retrieve:
          "P\u00e9riode de salaire r\u00e9cup\u00e9r\u00e9e avec succ\u00e8s.",
        salary_period_save:
          "P\u00e9riode de salaire enregistr\u00e9e avec succ\u00e8s.",
        salary_period_update:
          "La p\u00e9riode de salaire a \u00e9t\u00e9 mise \u00e0 jour avec succ\u00e8s.",
        select_employer: "S\u00e9lectionnez l'employeur",
        select_job: "S\u00e9lectionnez le travail",
        select_job_skill:
          "S\u00e9lectionnez la comp\u00e9tence professionnelle",
        select_job_tag: "S\u00e9lectionnez l'\u00e9tiquette d'emploi",
        select_post_category:
          "S\u00e9lectionnez la cat\u00e9gorie de publication",
        select_skill: "S\u00e9lectionnez la comp\u00e9tence",
        session_created: "Session cr\u00e9\u00e9e avec succ\u00e8s.",
        setting_update: "Param\u00e8tre mis \u00e0 jour avec succ\u00e8s.",
        skill_cant_delete:
          "La comp\u00e9tence ne peut pas \u00eatre supprim\u00e9e.",
        skill_delete: "Comp\u00e9tence supprim\u00e9e avec succ\u00e8s.",
        skill_save: "Comp\u00e9tence enregistr\u00e9e avec succ\u00e8s.",
        skill_update: "Comp\u00e9tence mise \u00e0 jour avec succ\u00e8s.",
        slot_already_taken:
          "Le cr\u00e9neau a d\u00e9j\u00e0 \u00e9t\u00e9 pris",
        slot_cancel: "Slot annul\u00e9 avec succ\u00e8s.",
        slot_choose: "Emplacement choisi avec succ\u00e8s",
        slot_create: "Machines \u00e0 sous cr\u00e9\u00e9es avec succ\u00e8s",
        slot_delete: "Emplacement supprim\u00e9 avec succ\u00e8s.",
        slot_preference_field:
          "Le champ de pr\u00e9f\u00e9rence d'emplacement est requis",
        slot_reject: "Machines \u00e0 sous rejet\u00e9es avec succ\u00e8s",
        slot_update: "Emplacement mis \u00e0 jour avec succ\u00e8s.",
        state_cant_delete: "L'\u00e9tat ne peut pas \u00eatre supprim\u00e9.",
        state_delete: "\u00c9tat supprim\u00e9 avec succ\u00e8s.",
        state_save: "\u00c9tat enregistr\u00e9 avec succ\u00e8s.",
        state_update: "\u00c9tat mis \u00e0 jour avec succ\u00e8s.",
        status_change:
          "Le statut a \u00e9t\u00e9 modifi\u00e9 avec succ\u00e8s.",
        status_update: "Statut mis \u00e0 jour avec succ\u00e8s.",
        subscribed: "Abonn\u00e9 avec succ\u00e8s.",
        subscription_cancel: "Abonnement annul\u00e9 avec succ\u00e8s.",
        subscription_resume: "L'abonnement a repris avec succ\u00e8s.",
        success_verify:
          "Vous avez v\u00e9rifi\u00e9 votre adresse e-mail avec succ\u00e8s. Veuillez vous connecter !",
        testimonial_delete: "T\u00e9moignages supprim\u00e9s avec succ\u00e8s.",
        testimonial_retrieve:
          "T\u00e9moignages r\u00e9cup\u00e9r\u00e9s avec succ\u00e8s.",
        testimonial_save: "T\u00e9moignage enregistr\u00e9 avec succ\u00e8s.",
        testimonial_update:
          "T\u00e9moignages mis \u00e0 jour avec succ\u00e8s.",
        the_name_has: "Le nom a d\u00e9j\u00e0 \u00e9t\u00e9 pris",
        there_are_no: "Il n'y a pas de CV t\u00e9l\u00e9charg\u00e9.",
        this_currency_is:
          "Cette devise n'est pas prise en charge par PayPal pour effectuer des paiements.",
        translation_update: "Traduction mise \u00e0 jour avec succ\u00e8s.",
        trial_plan_update: "Plan d'essai mis \u00e0 jour avec succ\u00e8s.",
        unfollow_company: "Ne plus suivre l'entreprise avec succ\u00e8s.",
        verification_mail:
          "L'e-mail de v\u00e9rification a \u00e9t\u00e9 renvoy\u00e9 avec succ\u00e8s.",
        your_are_not_author:
          "Vous n'\u00eates pas l'auteur de l'abonnement. vous n'\u00eates donc pas autoris\u00e9 \u00e0 annuler cet abonnement.",
        your_payment_comp: "Votre paiement est termin\u00e9 avec succ\u00e8s",
      },
      footer_settings: "Bas de page Param\u00e8tres",
      front_cms: "CMS avant",
      front_home: {
        candidates: "Candidates",
        companies: "Entreprises",
        jobs: "Emplois",
        resumes: "CV",
      },
      front_settings: {
        exipre_on: "Expire le",
        expires_on: "Expire le",
        featured: "En vedette",
        featured_companies_days: "Journ\u00e9es des entreprises en vedette",
        featured_companies_due_days:
          "Jours d`\u00e9ch\u00e9ance des entreprises par d\u00e9faut",
        featured_companies_enable: "Les entreprises en vedette permettent",
        featured_companies_price: "Prix des entreprises en vedette",
        featured_companies_quota: "Quota des entreprises en vedette",
        featured_employer_not_available: "employeur vedette non disponible",
        featured_job: "Emploi en vedette",
        featured_jobs_days: "Journ\u00e9es d emplois en vedette",
        featured_jobs_due_days:
          "Jours d`\u00e9ch\u00e9ance des travaux par d\u00e9faut",
        featured_jobs_enable: "Les emplois en vedette permettent",
        featured_jobs_price: "Prix des emplois en vedette",
        featured_jobs_quota: "Quota d emplois en vedette",
        featured_listing_currency: "Devise de l'annonce en vedette",
        latest_jobs_enable:
          "Afficher les derni\u00e8res offres d'emploi selon le pays de l'utilisateur connect\u00e9",
        latest_jobs_enable_message:
          "Il affichera les derni\u00e8res offres d'emploi du pays du candidat / employeur une fois connect\u00e9",
        make_feature: "faire fonction",
        make_featured: "Faire la vedette",
        make_featured_job: "Cr\u00e9er un emploi en vedette",
        pay_to_get: "Payer pour obtenir",
        remove_featured: "supprimer en vedette",
      },
      functional_area: {
        edit_functional_area: "\u00c9diter Fonctionnelle Zone",
        name: "Nom",
        new_functional_area: "Nouvelle Fonctionnelle Zone",
        no_functional_area_available: "Aucune zone fonctionnelle disponible",
        no_functional_area_found: "Aucune zone fonctionnelle trouv\u00e9e",
      },
      functional_areas: "Fonctionnelle Domaines",
      general: "G\u00e9n\u00e9rale",
      general_dashboard: "G\u00e9n\u00e9rale Tableau de bord",
      general_settings: "r\u00e9glages g\u00e9n\u00e9raux",
      go_to_homepage: "Aller \u00e0 la page d`accueil",
      header_slider: {
        edit_header_slider: "Modifier le curseur d'en-t\u00eate",
        header_slider: "Curseur d`en-t\u00eate",
        image_size_message:
          "L'image doit \u00eatre au pixel 1920 x 1080 pixels ou au-dessus.",
        image_title_text:
          "T\u00e9l\u00e9chargez une image de 1 920 x 1 080 pixels ou plus pour obtenir la meilleure exp\u00e9rience utilisateur.",
        new_header_slider: "Nouveau curseur d'en-t\u00eate",
        no_header_slider_available: "Aucun curseur d'en-t\u00eate disponible",
      },
      header_sliders: "Curseurs d`en-t\u00eate",
      image_slider: {
        action: "Action",
        add: "Ajouter",
        description: "La description",
        edit_image_slider: "Modifier le curseur d'image",
        image: "Image",
        image_extension_message:
          "L'image doit \u00eatre un fichier de type: png, jpg, jpeg.",
        image_size_message:
          "L'image doit \u00eatre au pixel 1140 x 500 pixels ou plus.",
        image_slider: "Curseur d`image",
        image_slider_details: "D\u00e9tails du curseur d'image",
        image_title_text:
          "T\u00e9l\u00e9chargez une image de 1140 x 500 pixels ou plus pour obtenir la meilleure exp\u00e9rience utilisateur.",
        is_active: "Statut",
        message: "D\u00e9sactiver la recherche d'emploi sur la page d'accueil",
        message_title:
          "Si cette bascule est d\u00e9sactiv\u00e9e, l'\u00e9cran de recherche par d\u00e9faut ne sera pas visible.",
        new_image_slider: "Nouveau curseur d'image",
        no_image_slider_available: "Aucun curseur d`image disponible",
        no_image_slider_found: "Aucun curseur d`image trouv\u00e9",
        select_status: "S\u00e9lectionnez le statut",
        slider: "Activez le curseur pleine largeur.",
        slider_active:
          "D\u00e9sactiver le curseur d'image de la page d'accueil",
        slider_active_title:
          "Si cette bascule est d\u00e9sactiv\u00e9e, l'\u00e9cran du curseur d'image par d\u00e9faut ne sera pas visible.",
        slider_title:
          "Si cette bascule est activ\u00e9e, le curseur d'image est un \u00e9cran pleine largeur.",
      },
      image_sliders: "Curseurs d'image",
      industries: "les industries",
      industry: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_industry: "\u00c9diter Industrie",
        industry_detail: "D\u00e9tails de l'industrie",
        name: "Nom",
        new_industry: "Nouvelle Industrie",
        no_industry_available: "Aucune industrie disponible",
        no_industry_found: "Aucune industrie trouv\u00e9e",
        size: "Taille",
      },
      inquires: "Demande",
      inquiry: {
        email: "Email",
        inquiry: "Enqu\u00eate",
        inquiry_date: "Enqu\u00eate Date",
        inquiry_details: "Enqu\u00eate D\u00e9tails",
        message: "Message",
        name: "Nom",
        no_inquiry_available: "Aucune enqu\u00eate disponible",
        no_inquiry_found: "Aucune enqu\u00eate trouv\u00e9e",
        phone_no: "T\u00e9l\u00e9phone Non",
        subject: "Mati\u00e8re",
      },
      job: {
        add_note: "Ajouter Remarque",
        applies_job_not_found: "Aucun emploi appliqu\u00e9 trouv\u00e9",
        career_level: "Carri\u00e8re Niveau",
        city: "Ville",
        country: "Pays",
        created_at: "\u00c9tablie \u00c0",
        currency: "Devise",
        degree_level: "Degr\u00e9 Niveau",
        description: "La description",
        edit_job: "\u00c9diter Emploi",
        email_to_friend: "Email \u00e0 Amie",
        expires_on: "Expire le",
        favourite_companies_not_found:
          "Entreprise pr\u00e9f\u00e9r\u00e9e introuvable",
        favourite_company: "Entreprise pr\u00e9f\u00e9r\u00e9e",
        favourite_job: "Travail pr\u00e9f\u00e9r\u00e9",
        favourite_job_not_found: "Aucun emploi favori trouv\u00e9",
        following_company_not_found: "Aucune entreprise suivante trouv\u00e9e",
        friend_email: "Amie Email",
        friend_name: "Amie Nom",
        functional_area: "Fonctionnelle Zone",
        hide_salary: "Cacher Un salaire",
        is_featured: "Est En vedette",
        is_freelance: "Est Free-lance",
        is_suspended: "Est Suspendue",
        job: "Emploi",
        job_alert: "Alerte emploi",
        job_details: "Emploi D\u00e9tails",
        job_expiry_date: "Emploi Expiration Date",
        job_shift: "Emploi D\u00e9calage",
        job_skill: "Emploi Comp\u00e9tence",
        job_title: "Emploi Titre",
        job_type: "Emploi Type",
        job_url: "Emploi URL",
        new_job: "Nouvelle Emploi",
        no_applied_job_found: "Aucun travail appliqu\u00e9 disponible",
        no_favourite_job_found: "Aucun emploi favori disponible",
        no_followers_available: "Aucun abonn\u00e9 disponible",
        no_followers_found: "Aucun abonn\u00e9 trouv\u00e9",
        no_following_companies_found: "Entreprise suivante non disponible",
        no_job_reported_available: "Aucun travail signal\u00e9 disponible",
        no_preference: "Non Pr\u00e9f\u00e9rence",
        no_reported_job_found: "Aucun travail signal\u00e9 trouv\u00e9",
        notes: "Remarques",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "Veuillez saisir la fourchette de salaire jusqu`\u00e0 sup\u00e9rieure \u00e0 la fourchette de salaire de.",
        position: "Position",
        remove_favourite_jobs: "Supprimer le travail favori",
        reported_job: "Emploi signal\u00e9",
        reported_jobs_detail: "D\u00e9tail du travail signal\u00e9",
        reported_user: "Signal\u00e9 Utilisatrice",
        salary_from: "Un salaire De",
        salary_period: "Un salaire P\u00e9riode",
        salary_to: "Un salaire \u00c0",
        state: "Etat",
        subscriber: "Abonn\u00e9e",
        view_notes: "Afficher les notes",
      },
      job_application: {
        application_date: "Application Date",
        candidate_name: "Candidate Nom",
        job_application: "Demande d`emploi",
      },
      job_applications: "Emploi Applications",
      job_categories: "Emploi Cat\u00e9gories",
      job_category: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_job_category: "\u00c9diter Emploi Cat\u00e9gorie",
        is_featured: "Est En vedette",
        job_category: "Emploi Cat\u00e9gorie",
        name: "Nom",
        new_job_category: "Nouvelle Emploi Cat\u00e9gorie",
        no_job_category_available: "Aucune cat\u00e9gorie d'emploi disponible",
        no_job_category_found: "Aucune cat\u00e9gorie d'emploi trouv\u00e9e",
        show_job_category: "D\u00e9tails de la cat\u00e9gorie d'emploi",
      },
      job_experience: {
        edit_job_experience: "\u00c9diter Emploi Exp\u00e9rience",
        is_active: "Est Active",
        is_default: "Est D\u00e9faut",
        job_experience: "Emploi Exp\u00e9rience",
        language: "Langue",
        new_job_experience: "Nouvelle Emploi Exp\u00e9rience",
      },
      job_experiences: "Emploi Exp\u00e9riences",
      job_notification: {
        job_notifications: "Notifications d'emploi",
        no_jobs_available: "Aucun emploi disponible",
        select_all_jobs: "S\u00e9lectionner tous les travaux",
      },
      job_shift: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_job_shift: "\u00c9diter Emploi D\u00e9calage",
        job_shift_detail: "D\u00e9tails du quart de travail",
        new_job_shift: "Nouvelle Emploi D\u00e9calage",
        no_job_shifts_available: "Aucun quart de travail disponible",
        no_job_shifts_found: "Aucun quart de travail trouv\u00e9",
        shift: "D\u00e9calage",
        show_job_shift: "Emploi D\u00e9calage",
        size: "Taille",
      },
      job_shifts: "Emploi Quarts de travail",
      job_skill: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_job_skill: "\u00c9diter Emploi Comp\u00e9tence",
        name: "Nom",
        new_job_skill: "Nouvelle Emploi Comp\u00e9tence",
        show_job_skill: "Emploi Comp\u00e9tence",
      },
      job_skills: "Emploi Comp\u00e9tences",
      job_stage: {
        add_slot: "Ajouter un emplacement",
        add_slots: "Ajouter des emplacements",
        batch: "Lot",
        cancel_slot: "Annuler l`emplacement",
        cancel_this_slot: "Annuler cet emplacement",
        cancel_your_selected_slot:
          "Annuler le cr\u00e9neau s\u00e9lectionn\u00e9",
        candidate_note: "Remarque du candidat",
        choose_slots: "Choisir un emplacement",
        date: "Date",
        edit_job_stage: "Modifier l`\u00e9tape du travail",
        edit_slot: "Modifier l'emplacement",
        history: "Historique",
        job_stage: "Job Stage",
        job_stage_detail: "D\u00e9tail de l`\u00e9tape de travail",
        new_job_stage: "Nouvelle \u00e9tape du travail",
        new_slot_send: "Envoi d`un nouvel emplacement",
        no_job_stage_available: "Aucune \u00e9tape de travail disponible",
        no_job_stage_found: "Aucune \u00e9tape de travail trouv\u00e9e",
        no_slot_available: "Aucun emplacement disponible",
        reject_all_slot: "Rejeter tous les emplacements",
        rejected_all_slots: "Rejected All Slots",
        send_slot: "Emplacement d'envoi",
        send_slots: "Envoyer des cr\u00e9neaux",
        slot: "Ins\u00e9rer",
        slot_preference: "Slot Preference",
        slots: "Slots",
        time: "Heure",
        you_cancel_this_slot: "Vous annulez cet emplacement",
        you_have_rejected_all_slot:
          "Vous avez rejet\u00e9 tous les emplacements",
        you_have_selected_this_slot:
          "Vous avez s\u00e9lectionn\u00e9 cet emplacement",
        your_note: "Votre remarque",
      },
      job_stages: "\u00c9tapes du travail",
      job_tag: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_job_tag: "\u00c9diter Emploi Marque",
        job_tag: "\u00c9tiquette d'emploi",
        job_tag_detail: "D\u00e9tails de l'\u00e9tiquette de travail",
        name: "Nom",
        new_job_tag: "Nouvelle Emploi Marque",
        no_job_tag_available: "Aucune \u00e9tiquette de travail disponible",
        no_job_tag_found: "Aucune \u00e9tiquette de poste trouv\u00e9e",
        show_job_tag: "Emploi Marque",
        size: "Taille",
      },
      job_tags: "Emploi Mots cl\u00e9s",
      job_type: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_job_type: "\u00c9diter Emploi Type",
        job_type: "Type d'emploi",
        job_type_detail: "D\u00e9tails du type de poste",
        name: "Nom",
        new_job_type: "Nouvelle Emploi Type",
        no_job_type_available: "Aucun type de travail disponible",
        no_job_type_found: "Aucun type de travail trouv\u00e9",
        show_job_type: "Emploi Type",
      },
      job_types: "Emploi Les types",
      jobs: "Emplois",
      language: {
        edit_language: "\u00c9diter Langue",
        is_active: "Est Active",
        is_default: "Est D\u00e9faut",
        is_rtl: "Est RTL",
        iso_code: "ISO Code",
        language: "Langue",
        native: "Originaire de",
        new_language: "Nouvelle Langue",
        no_language_available: "Aucune langue disponible",
        no_language_found: "Aucune langue trouv\u00e9e",
      },
      languages: "Langues",
      marital_status: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_marital_status: "\u00c9diter Matrimoniale Statut",
        marital_status: "Matrimoniale Statut",
        marital_status_detail: "D\u00e9tails de l'\u00e9tat matrimonial",
        new_marital_status: "Nouvelle Matrimoniale Statut",
        no_marital_status_available: "Aucun \u00e9tat matrimonial disponible",
        no_marital_status_found: "Aucun \u00e9tat matrimonial trouv\u00e9",
        show_marital_status: "Matrimoniale Statut",
      },
      marital_statuses: "Matrimoniale Statut",
      months: {
        apr: "Avr",
        aug: "Ao\u00fbt",
        dec: "D\u00e9c",
        feb: "F\u00e9v",
        jan: "Jan",
        jul: "Juil",
        jun: "Juin",
        mar: "Mar",
        may: "Peut",
        nov: "Nov",
        oct: "Oct",
        sep: "Sep",
      },
      no_skills: "Aucune comp\u00e9tence",
      no_subscriber_available: "Aucun abonn\u00e9 disponible",
      no_subscriber_found: "Aucun abonn\u00e9 trouv\u00e9",
      noticeboard: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_noticeboard: "\u00c9diter Tableau d'affichage",
        is_active: "C'est actif",
        new_noticeboard: "Nouvelle Tableau d'affichage",
        no_noticeboard_available: "Aucun tableau d`affichage disponible",
        no_noticeboard_found: "Aucun tableau d`affichage trouv\u00e9",
        noticeboard: "Tableau d'affichage",
        noticeboard_detail: "D\u00e9tails du tableau d'affichage",
        title: "Titre",
      },
      noticeboards: "Panneaux d'affichage",
      notification: {
        company: "Entreprise",
        company_marked_featured:
          "L'entreprise marqu\u00e9e comme pr\u00e9sent\u00e9e par",
        empty_notifications: "Nous n'avons trouv\u00e9 aucune notification",
        job_application_rejected_message: "Votre demande est rejet\u00e9e pour",
        job_application_select_message:
          "Vous \u00eates s\u00e9lectionn\u00e9 pour",
        job_application_shortlist_message:
          "Votre candidature est pr\u00e9s\u00e9lectionn\u00e9e pour",
        job_application_submitted: "Demande d'emploi soumise pour",
        mark_all_as_read: "Tout marquer comme lu",
        marked_as_featured: "marqu\u00e9 comme pr\u00e9sent\u00e9",
        new_candidate_registered: "Nouveau candidat inscrit",
        new_employer_registered: "Nouvel employeur inscrit",
        notifications: "Notifications",
        purchase: "achat",
        read_notification: "Notification lue avec succ\u00e8s",
        started_following: "commenc\u00e9 \u00e0 suivre",
        started_following_you: "commenc\u00e9 \u00e0 te suivre.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "Lorsqu'un candidat est rejet\u00e9 pour un poste",
        CANDIDATE_SELECTED_FOR_JOB:
          "Lorsqu'un candidat est s\u00e9lectionn\u00e9 pour un poste",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "Lorsqu'un candidat est pr\u00e9s\u00e9lectionn\u00e9 pour un poste",
        EMPLOYER_PURCHASE_PLAN:
          "Lorsqu'un employeur ach\u00e8te un plan d'abonnement",
        FOLLOW_COMPANY: "Lorsqu'un candidat commence \u00e0 suivre Entreprise",
        FOLLOW_JOB: "Lorsqu'un candidat commence \u00e0 suivre des emplois",
        JOB_ALERT: "Lorsqu'un employeur cr\u00e9e un emploi",
        JOB_APPLICATION_SUBMITTED:
          "Lors de la soumission d'une nouvelle demande d'emploi",
        MARK_COMPANY_FEATURED:
          "Lorsque vous marquez la soci\u00e9t\u00e9 comme En vedette",
        MARK_COMPANY_FEATURED_ADMIN: "When employer mark Company as Featured",
        MARK_JOB_FEATURED:
          "Lorsque le job est marqu\u00e9 comme pr\u00e9sent\u00e9",
        MARK_JOB_FEATURED_ADMIN:
          "Lorsque l'employeur marque l'entreprise comme vedette",
        NEW_CANDIDATE_REGISTERED: "Lorsqu'un nouveau candidat est inscrit",
        NEW_EMPLOYER_REGISTERED: "Lorsqu'un nouvel employeur est inscrit",
        admin: "Administratrice",
        blog_category: "Cat\u00e9gorie de blogue",
        candidate: "Candidat",
        employer: "Employ\u00e9e",
      },
      ownership_type: {
        edit_ownership_type: "\u00c9diter La possession Type",
        new_ownership_type: "Nouvelle La possession Type",
        no_ownership_type_available:
          "Aucun type de propri\u00e9t\u00e9 disponible",
        no_ownership_type_found:
          "Aucun type de propri\u00e9t\u00e9 trouv\u00e9",
        ownership_type: "Type de propri\u00e9t\u00e9",
        ownership_type_detail: "D\u00e9tails du type de propri\u00e9t\u00e9",
      },
      ownership_types: "La possession Les types",
      phone: {
        invalid_country_code: "Code pays invalide",
        invalid_number: "Num\u00e9ro invalide",
        too_long: "Trop long",
        too_short: "Trop court",
        valid_number: "Nombre valide",
      },
      plan: {
        active_subscription: "abonnement actif",
        allowed_jobs: "Emplois autoris\u00e9s",
        amount: "Montant",
        cancel_reason: "Annuler la raison",
        cancel_subscription: "Annuler l abonnement",
        currency: "Devise",
        current_plan: "Plan actuel",
        edit_plan: "Modifier le plan",
        edit_subscription_plan: "modifier le plan d'abonnement",
        ends_at: "Fini \u00e0",
        is_trial_plan: "Est-ce un plan d essai",
        job_allowed: "Travail autoris\u00e9",
        job_used: "Emplois utilis\u00e9s",
        jobs_allowed: "Emplois autoris\u00e9s",
        jobs_used: "Emploi utilis\u00e9",
        new_plan: "Ajouter un plan",
        new_subscription_plan: "nouveau plan d'abonnement",
        pay_with_manually: "Payer avec manuellement",
        pay_with_paypal: "Payer avec PayPal",
        pay_with_stripe: "Payer avec Stripe",
        per_month: "Par mois",
        plan: "Plan",
        plan_amount_cannot_be_changes:
          "Remarque: - Le montant du plan ne peut pas \u00eatre modifi\u00e9.",
        pricing: "Tarification",
        processing: "Traitement",
        purchase: "Achat",
        renews_on: "Renouvelle le",
        subscription_cancelled: "Abonnement annul\u00e9",
        subscriptions: "abonnements",
      },
      plans: "Des plans",
      position: {
        edit_position: "\u00c9diter Position",
        new_position: "Nouvelle Position",
        position: "Position",
      },
      positions: "Positions",
      post: {
        action: "action",
        add: "Ajouter",
        blog: "Blog",
        comment: "Commenter",
        comments: "commentaires",
        description: "La description",
        edit_post: "Modifier le message",
        image: "Image",
        new_post: "Nouveau poste",
        no_posts_available: "Aucun message disponible",
        no_posts_found: "Aucun article trouv\u00e9",
        post: "Publier",
        post_a_comments: "Poste un commentaire",
        post_details: "D\u00e9tails de l'article",
        posts: "Des postes",
        select_post_categories:
          "S\u00e9lectionnez les cat\u00e9gories d'articles",
        show_post: "Publier",
        title: "Titre",
      },
      post_category: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_post_category: "Modifier la cat\u00e9gorie d'article",
        name: "Nom",
        new_post_category: "Nouvelle cat\u00e9gorie de message",
        no_post_category_available:
          "Aucune cat\u00e9gorie de publication disponible",
        no_post_category_found:
          "Aucune cat\u00e9gorie de publication trouv\u00e9e",
        post_categories: "Cat\u00e9gories d'articles",
        post_category: "Cat\u00e9gorie de poste",
        post_category_detail:
          "D\u00e9tails de la cat\u00e9gorie de publication",
        show_post_category: "Cat\u00e9gorie de poste",
      },
      post_comment: {
        post_comment_details: "D\u00e9tails de la publication du commentaire",
      },
      post_comments: "Poster des commentaires",
      pricing_table: { get_started: "Commencer" },
      pricings_table: "Tableau des prix",
      professional_skills: "comp\u00e9tences professionnelles",
      profile: "Profil",
      recent_blog: "Blog r\u00e9cent",
      reported_jobs: "Signal\u00e9 Emplois",
      required_degree_level: {
        edit_required_degree_level: "\u00c9diter Degr\u00e9 Niveau",
        name: "Nom",
        new_required_degree_level: "Nouvelle Degr\u00e9 Niveau",
        no_degree_level_available: "Aucun niveau de dipl\u00f4me disponible",
        no_degree_level_found: "Aucun niveau de dipl\u00f4me trouv\u00e9",
        show_required_degree_level: "Degr\u00e9 Niveau",
      },
      required_degree_levels: "Degr\u00e9 Les niveaux",
      resumes: {
        candidate_name: "nom du candidat",
        file: "D\u00e9poser",
        name: "Nom",
        no_resume_available: "Aucun CV disponible",
        no_resume_found: "Aucun CV trouv\u00e9",
        resume_name: "Nom de fichier",
      },
      salary_currencies: "Un salaire Devises",
      salary_currency: {
        currency_code: "Code de devise",
        currency_icon: "Ic\u00f4ne de devise",
        currency_name: "Devise Nom",
        edit_salary_currency: "Changer la devise du salaire",
        new_salary_currency: "Nouvelle devise de salaire",
        no_salary_currency_available: "Aucune devise de salaire disponible",
        no_salary_currency_found: "Aucune devise de salaire trouv\u00e9e",
      },
      salary_period: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_salary_period: "\u00c9diter Un salaire P\u00e9riode",
        new_salary_period: "Nouvelle Un salaire P\u00e9riode",
        no_salary_period_available: "Aucune p\u00e9riode de salaire disponible",
        no_salary_period_found: "Aucune p\u00e9riode de salaire trouv\u00e9e",
        period: "P\u00e9riode",
        salary_period_detail: "D\u00e9tails de la p\u00e9riode de salaire",
        size: "Taille",
      },
      salary_periods: "Un salaire P\u00e9riodes",
      see_all_plans: "Voir tous les forfaits",
      selected_candidate: "Candidat s\u00e9lectionn\u00e9",
      setting: {
        about_us: "\u00c0 propos Nous",
        address: "Adresse",
        application_name: "Application Nom",
        choose: "Choisir",
        company_description: "Compagnie La description",
        company_url: "URL de l'entreprise",
        configuration_update: "Mise \u00e0 jour de la configuration",
        cookie: "Biscuit",
        disable_cookie: "D\u00e9sactiver le cookie",
        disable_edit: "D\u00e9sactiver la modification",
        email: "Email",
        enable_cookie: "Activer le cookie",
        enable_edit: "Activer la modification",
        enable_google_recaptcha:
          "Activez Google reCAPTCHA pour les employeurs, l'inscription des candidats et l'\u00e9cran Contactez-nous.",
        facebook: "Facebook",
        facebook_app_id: "ID application Facebook",
        facebook_app_secret: "Secret application Facebook",
        facebook_redirect: "Redirection Facebook",
        facebook_url: "L'adresse URL de Facebook",
        favicon: "Favicon",
        front_settings: "De face Param\u00e8tres",
        general: "G\u00e9n\u00e9rale",
        google: "Google",
        google_client_id: "Identifiant client Google",
        google_client_secret: "Secret client Google",
        google_plus_url: "URL Google+",
        google_redirect: "Google Redirect",
        image_validation: "L'image doit \u00eatre de pixel 90 x 60.",
        linkedin: "LinkedIn",
        linkedin_client_id: "Identifiant LinkedIn",
        linkedin_client_secret: "Secret client LinkedIn",
        linkedin_url: "URL Linkedin",
        logo: "Logo",
        mail: "Poster",
        mail__from_address: "Adresse de messagerie",
        mail_host: "H\u00f4te de messagerie",
        mail_mailer: "Mail Mailer",
        mail_password: "Mot de passe de messagerie",
        mail_port: "Port de messagerie",
        mail_username: "Nom dutilisateur de messagerie",
        notification_settings: "Param\u00e8tres de notification",
        paypal: "Paypal",
        paypal_client_id: "Identifiant client Paypal",
        paypal_secret: "Paypal Secret",
        phone: "T\u00e9l\u00e9phone",
        privacy_policy: "Politique de confidentialit\u00e9",
        pusher: "Pusher",
        pusher_app_cluster: "Cluster applications Pusher",
        pusher_app_id: "ID de application Pusher",
        pusher_app_key: "Cl\u00e9 de application Pusher",
        pusher_app_secret: "Secret application Pusher",
        social_settings: "Sociale Param\u00e8tres",
        stripe: "Rayure",
        stripe_key: "Cl\u00e9 de bande",
        stripe_secret_key: "Cl\u00e9 secr\u00e8te Stripe",
        stripe_webhook_key: "Cl\u00e9 Webhook Stripe",
        terms_conditions: "Termes et conditions",
        twitter_url: "Twitter URL",
        update_application_configuration:
          "Vous \u00eates sur le point de mettre \u00e0 jour les valeurs de configuration de l`application, vous souhaitez continuer ?",
      },
      settings: "Param\u00e8tres",
      skill: {
        action: "action",
        add: "Ajouter",
        description: "La description",
        edit_skill: "\u00c9diter  Comp\u00e9tence",
        name: "Nom",
        new_skill: "Nouvelle Comp\u00e9tence",
        no_skill_available: "Aucune comp\u00e9tence disponible",
        no_skill_found: "Aucune comp\u00e9tence trouv\u00e9e",
        show_skill: "Comp\u00e9tence",
        skill_detail: "D\u00e9tails de la comp\u00e9tence",
      },
      skills: "Comp\u00e9tences",
      social_media: "Des m\u00e9dias sociaux",
      social_settings: "Sociale Param\u00e8tres",
      state: {
        country_name: "Au nom du pays",
        edit_state: "Modifier l'\u00e9tat",
        new_state: "Nouvel \u00e9tat",
        no_state_available: "Aucun \u00e9tat disponible",
        no_state_found: "Aucun \u00e9tat trouv\u00e9",
        state_name: "Nom d'\u00e9tat",
        states: "\u00c9tats",
      },
      subscribers: "Les abonn\u00e9s",
      subscriptions_plans: "plans d'abonnements",
      testimonial: {
        customer_image: "Cliente Image",
        customer_name: "Cliente Nom",
        description: "La description",
        edit_testimonial: "\u00c9diter T\u00e9moignage",
        new_testimonial: "Nouvelle T\u00e9moignage",
        no_testimonial_available: "Aucun t\u00e9moignage disponible",
        no_testimonial_found: "Aucun t\u00e9moignage trouv\u00e9",
        testimonial: "T\u00e9moignage",
        testimonial_detail: "D\u00e9tails du t\u00e9moignage",
        testimonials: "T\u00e9moignages",
      },
      testimonials: "T\u00e9moignages",
      tooltip: {
        change_app_logo: "Changer le logo de l'application",
        change_favicon: "Changer de favicon",
        change_home_banner: "Changer la banni\u00e8re d'accueil",
        change_image: "Changer l'image",
        copy_preview_link: "Copier le lien d'aper\u00e7u",
      },
      transaction: {
        approved: "Approuv\u00e9",
        denied: "Refus\u00e9",
        invoice: "Facture d achat",
        payment_approved: "Statut de paiement",
        plan_name: "Nom du plan",
        select_manual_payment: "S\u00e9lectionnez Paiement manuel",
        subscription_id: "Identifiant d abonnement",
        transaction_date: "Date de la transaction",
        type: "Taper",
        user_name: "nom de l'employeur",
      },
      transactions: "Transactions",
      translation_manager: "Responsable traduction",
      user: {
        change_password: "Changement Mot de passe",
        edit_profile: "\u00c9diter Profil",
        email: "Email",
        first_name: "Premi\u00e8re Nom",
        last_name: "Derni\u00e8re Nom",
        logout: "Se d\u00e9connecter",
        name: "Nom",
        password: "Mot de passe",
        password_confirmation: "Confirmer Mot de passe",
        phone: "T\u00e9l\u00e9phone",
        required_field_messages:
          "Veuillez remplir tous les champs obligatoires.",
        user_name: "Nom d'utilisateur",
      },
      user_language: {
        change_language: "Changement Langue",
        language: "Langue",
      },
      weekdays: {
        fri: "VEN",
        mon: "LUN",
        sat: "Assis",
        sun: "SOLEIL",
        thu: "JEU",
        tue: "MAR",
        wed: "\u00c9POUSER",
      },
      your_cv: "Votre CV",
    },
    "fr.pagination": {
      next: "Prochain &raquo;",
      previous: "&laquo; Pr\u00e9c\u00e9dente",
    },
    "fr.validation": {
      accepted: "L':attribute doit \u00eatre accept\u00e9.",
      active_url: "L':attribute n'est pas une URL valide.",
      after:
        "L':attribute doit \u00eatre une date post\u00e9rieure \u00e0 :date.",
      after_or_equal:
        "L':attribute doit \u00eatre une date post\u00e9rieure ou \u00e9gale \u00e0 :date.",
      alpha: "L':attribute ne peut contenir que des lettres.",
      alpha_dash:
        "L':attribute ne peut contenir que des lettres, des chiffres, des tirets et des traits de soulignement.",
      alpha_num:
        "L':attribute ne peut contenir que des lettres et des chiffres.",
      array: "L':attribute doit \u00eatre un tableau.",
      attributes: [],
      before:
        "L':attribute doit \u00eatre une date ant\u00e9rieure \u00e0 :date.",
      before_or_equal:
        "L':attribute doit \u00eatre une date ant\u00e9rieure ou \u00e9gale \u00e0 :date.",
      between: {
        array: "L':attribute doit avoir entre :min et :max \u00e9l\u00e9ments.",
        file: "L':attribute doit \u00eatre compris entre :min et :max kilo-octets.",
        numeric: "L':attribute doit \u00eatre compris entre :min et :max.",
        string:
          "L':attribute doit \u00eatre compris entre :min et :max caract\u00e8res.",
      },
      boolean: "Le champ :attribute doit \u00eatre vrai ou faux.",
      confirmed: "La confirmation d':attribute ne correspond pas.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "L':attribute n'est pas une date valide.",
      date_equals:
        "L':attribute doit \u00eatre une date \u00e9gale \u00e0 :date.",
      date_format: "L':attribute ne correspond pas au format :format.",
      different:
        "Les :attribute attribut et :other doivent \u00eatre diff\u00e9rents.",
      digits: "L':attribute doit \u00eatre :digits chiffres.",
      digits_between:
        "L':attribute doit \u00eatre compris entre :min et :max chiffres.",
      dimensions: "L':attribute a des dimensions d'image non valides.",
      distinct: "Le champ :attribute a une valeur en double.",
      email: "L':attribute doit \u00eatre une adresse e-mail valide.",
      ends_with:
        "L':attribute doit se terminer par l'un des \u00e9l\u00e9ments suivants: :values.",
      exists: "L' :attribute selected n'est pas valide.",
      file: "L':attribute doit \u00eatre un fichier.",
      filled: "Le champ :attribute doit avoir une valeur.",
      gt: {
        array: "L':attribute doit avoir plus de \u00e9l\u00e9ments de :value.",
        file: "L':attribute doit \u00eatre sup\u00e9rieur \u00e0 :value kilo-octets.",
        numeric: ".L':attribute doit \u00eatre sup\u00e9rieur \u00e0 :value.",
        string:
          "L':attribute doit \u00eatre sup\u00e9rieur \u00e0 :value caract\u00e8res.",
      },
      gte: {
        array: "L':attribute doit avoir \u00e9l\u00e9ments de :value ou plus.",
        file: "L':attribute doit \u00eatre sup\u00e9rieur ou \u00e9gal \u00e0 :value kilo-octets.",
        numeric:
          "L':attribute doit \u00eatre sup\u00e9rieur ou \u00e9gal \u00e0 :value.",
        string:
          "L':attribute doit \u00eatre sup\u00e9rieur ou \u00e9gal \u00e0 :value caract\u00e8res.",
      },
      image: "L':attribute doit \u00eatre une image.",
      in: "L' :attribute selected n'est pas valide.",
      in_array: "Le champ :attribute n'existe pas dans :other.",
      integer: "L':attribute doit \u00eatre un entier.",
      ip: "L':attribute doit \u00eatre une adresse IP valide.",
      ipv4: "L':attribute doit \u00eatre une adresse IPv4 valide.",
      ipv6: "L':attribute doit \u00eatre une adresse IPv6 valide.",
      json: "L':attribute doit \u00eatre une cha\u00eene JSON valide.",
      lt: {
        array: "L':attribute doit avoir moins de :value items.",
        file: "L':attribute doit \u00eatre inf\u00e9rieur \u00e0 :value kilo-octets.",
        numeric: "L':attribute doit \u00eatre inf\u00e9rieur \u00e0 :value.",
        string:
          "L':attribute doit \u00eatre inf\u00e9rieur \u00e0 :value caract\u00e8res.",
      },
      lte: {
        array:
          "L':attribute ne doit pas avoir plus de \u00e9l\u00e9ments de :value.",
        file: "L':attribute doit \u00eatre inf\u00e9rieur ou \u00e9gal \u00e0 :value kilo-octets.",
        numeric:
          "L':attribute doit \u00eatre inf\u00e9rieur ou \u00e9gal \u00e0 :value.",
        string:
          "L':attribute doit \u00eatre inf\u00e9rieur ou \u00e9gal \u00e0 :value caract\u00e8res.",
      },
      max: {
        array:
          "L':attribute ne peut pas avoir plus de :max \u00e9l\u00e9ments.",
        file: "L':attribute ne peut pas \u00eatre sup\u00e9rieur \u00e0 :max kilo-octets.",
        numeric:
          "L':attribute ne doit pas \u00eatre sup\u00e9rieur \u00e0 :max.",
        string:
          "L':attribute ne peut pas \u00eatre sup\u00e9rieur \u00e0 :max caract\u00e8res.",
      },
      mimes: "L':attribute doit \u00eatre un fichier de type: :values.",
      mimetypes: "L':attribute doit \u00eatre un fichier de type: :values.",
      min: {
        array: "L':attribute doit avoir au moins \u00e9l\u00e9ments :min.",
        file: "L':attribute doit \u00eatre d'au moins :min kilo-octets.",
        numeric: "L':attribute doit \u00eatre au moins :min.",
        string: "L':attribute doit contenir au moins :min caract\u00e8res.",
      },
      not_in: "L':attribute selected n'est pas valide.",
      not_regex: "Le format d':attribute n'est pas valide.",
      numeric: "L':attribute doit \u00eatre un nombre.",
      password: "Le mot de passe est incorrect.",
      present: "Le champ :attribute doit \u00eatre pr\u00e9sent.",
      regex: "Le format d':attribute n'est pas valide.",
      required: "Le champ :attribute est obligatoire.",
      required_if:
        "Le champ :attribute est obligatoire lorsque :other est :value.",
      required_unless:
        "Le champ :attribute est obligatoire sauf si :other est dans :values.",
      required_with:
        "Le champ :attribute est obligatoire lorsque :values est pr\u00e9sent.",
      required_with_all:
        "Le champ :attribute est obligatoire lorsque des :values sont pr\u00e9sentes.",
      required_without:
        "Le champ :attribute est obligatoire lorsque :values n'est pas pr\u00e9sent.",
      required_without_all:
        "Le champ :attribute est obligatoire lorsqu'aucune des :values n'est pr\u00e9sente.",
      same: "Les :attribute et :other doivent correspondre.",
      size: {
        array: "L':attribute doit contenir des \u00e9l\u00e9ments :size.",
        file: "L':attribute doit \u00eatre :size kilo-octets.",
        numeric: "L':attribute doit \u00eatre :size.",
        string: "L':attribute doit \u00eatre :size caract\u00e8res.",
      },
      starts_with:
        "L':attribute doit commencer par l'une des valeurs suivantes: :values.",
      string: "L':attribute doit \u00eatre une cha\u00eene.",
      timezone: "L':attribute doit \u00eatre une zone valide.",
      unique: "L':attribute a d\u00e9j\u00e0 \u00e9t\u00e9 pris.",
      uploaded: "L':attribute n'a pas pu \u00eatre t\u00e9l\u00e9charg\u00e9.",
      url: "Le format d':attribute n'est pas valide.",
      uuid: "L':attribute doit \u00eatre un UUID valide.",
    },
    "pt.messages": {
      about_us: "Sobre n\u00f3s",
      about_us_services: "Sobre n\u00f3s Servi\u00e7os",
      admin_dashboard: {
        active_jobs: "Ativa Empregos",
        active_users: "Ativa Comercial",
        feature_employers: "Featured Employers",
        feature_employers_incomes: "Rendas dos empregadores em destaque",
        feature_jobs_incomes: "Rendas de empregos em destaque",
        featured_jobs: "Destaque Empregos",
        post_statistics: "Estat\u00edsticas de postagens",
        recent_candidates: "Candidatos Recentes",
        recent_employers: "Empregadores recentes",
        recent_jobs: "Recente Destaque",
        registered_candidates: "Registrada Candidatas",
        registered_employer: "Registrada Empregadores",
        subscription_incomes: "Receitas de assinatura",
        today_jobs: "Hoje Empregos",
        total_active_jobs: "Total de empregos ativos",
        total_candidates: "Total de candidatos",
        total_employers: "Empregadores totais",
        total_users: "Total Comercial",
        verified_users: "Verificada Comercial",
        weekly_users: "Usu\u00e1rios semanais",
      },
      all_resumes: "Todos os curr\u00edculos",
      all_rights_reserved: "Todos os direitos reservados",
      applied_job: {
        applied_jobs: "Aplicada Empregos",
        companies: "Empresas",
        job: "Trabalho",
        notes: "Notas",
      },
      apply_job: {
        apply_job: "Aplicar trabalho",
        notes: "Notes",
        resume: "Resume",
      },
      blog_categories: "Categorias do blog",
      blogs: "Blogs",
      branding_slider: {
        brand: "Marca",
        edit_branding_slider: "Editar controle deslizante de marca",
        new_branding_slider: "Novo controle deslizante de marca",
        no_branding_slider_available:
          "Nenhum controle deslizante de marca dispon\u00edvel",
        no_branding_slider_found:
          "Nenhum controle deslizante de marca encontrado",
      },
      branding_sliders: "Sliders de marca",
      brands: "Marcas",
      candidate: {
        address: "Endere\u00e7o",
        admins: "Administradores",
        already_reported: "J\u00e1 reportado",
        available_at: "Dispon\u00edvel em",
        birth_date: "Data de nascimento",
        candidate_details: "Detalhes do Candidato",
        candidate_language: "l\u00ednguas",
        candidate_skill: "Habilidade",
        candidates: "Candidatas",
        career_level: "n\u00edvel de carreira",
        conform_password: "confirme Senha",
        current_salary: "Sal\u00e1rio atual",
        dashboard: "painel de controle",
        edit_admin: "Editar administrador",
        edit_candidate: "Editar candidato",
        edit_profile_information: "Editar informa\u00e7\u00f5es do perfil",
        education_not_found: "Nenhuma educa\u00e7\u00e3o dispon\u00edvel.",
        email: "O email",
        email_verified: "email verificado",
        employee: "Empregada",
        expected_salary: "sal\u00e1rio esperado",
        experience: "Experi\u00eancia",
        experience_not_found: "Nenhuma experi\u00eancia dispon\u00edvel.",
        expired_job: "Trabalho expirado",
        father_name: "Nome do pai",
        first_name: "Primeiro nome",
        functional_area: "Funcional \u00c1rea",
        gender: "G\u00eanero",
        immediate_available: "Dispon\u00edvel Imediato",
        in_year: "Em anos",
        industry: "Ind\u00fastria",
        is_active: "\u00c9 Ativa",
        is_verified: "\u00c9 Verificada",
        job_alert_message:
          "Notifique-me por e-mail quando um trabalho for publicado que seja relevante para a minha escolha.",
        last_name: "\u00daltimo nome",
        marital_status: "Estado civil",
        national_id_card: "Nacional EU IRIA Cart\u00e3o",
        nationality: "Nacionalidade",
        new_admin: "Novo administrador",
        new_candidate: "Novo candidato",
        no_candidate_available: "Nenhum candidato dispon\u00edvel",
        no_candidate_found: "Nenhum candidato encontrado",
        no_reported_candidates_available:
          "Nenhum candidato informado dispon\u00edvel",
        no_reported_candidates_found: "Nenhum candidato relatado encontrado",
        not_immediate_available: "N\u00e3o Dispon\u00edvel Imediato",
        password: "Senha",
        phone: "telefone",
        profile: "Perfil",
        reporte_to_candidate: "Reporte para candidatos",
        reported_candidate: "Candidato Relatado",
        reported_candidate_detail: "Detalhe do candidato relatado",
        reported_candidates: "Candidatos relatados",
        reported_employer: "Empregador Relatado",
        resume_not_found: "Nenhum curr\u00edculo dispon\u00edvel.",
        salary_currency: "Moeda do sal\u00e1rio",
        salary_per_month: "Sal\u00e1rio por m\u00eas.",
        select_candidate: "Selecionar candidato",
      },
      candidate_dashboard: {
        followings: "Seguimentos",
        location_information:
          "Informa\u00e7\u00f5es de localiza\u00e7\u00e3o n\u00e3o dispon\u00edveis.",
        my_cv_list: "Minha lista de CV",
        no_not_available: "N\u00famero n\u00e3o dispon\u00edvel.",
        profile_views: "Visualizac\u00f5es de perfil",
      },
      candidate_profile: {
        add_education: "Adicionar Educa\u00e7\u00e3o",
        add_experience: "Adicionar Experi\u00eancia",
        age: "Era",
        company: "Companhia",
        currently_working: "Atualmente trabalhando",
        degree_level: "Grau N\u00edvel",
        degree_title: "T\u00edtulo do grau",
        description: "Descri\u00e7\u00e3o",
        edit_education: "Editar Educa\u00e7\u00e3o",
        edit_experience: "Editar Experi\u00eancia",
        education: "Educa\u00e7\u00e3o",
        end_date: "Data final",
        experience: "Experi\u00eancia",
        experience_title: "T\u00edtulo da experi\u00eancia",
        institute: "Instituto",
        online_profile: "Perfil Online",
        present: "Presente",
        result: "Resultado",
        select_year: "Selecione o ano",
        start_date: "Data de in\u00edcio",
        title: "T\u00edtulo",
        upload_resume: "Carregar curr\u00edculo",
        work_experience: "experi\u00eancia de trabalho",
        year: "Ano",
        years: "Anos",
      },
      candidatos: "Candidatos",
      career_informations: "Informa\u00e7\u00f5es sobre carreira",
      career_level: {
        edit_career_level: "Editar Carreira N\u00edvel",
        level_name: "N\u00edvel Nome",
        new_career_level: "Nova Carreira N\u00edvel",
        no_career_level_available:
          "Nenhum n\u00edvel de carreira dispon\u00edvel",
        no_career_level_found: "Nenhum n\u00edvel de carreira encontrado",
      },
      career_levels: "N\u00edveis de carreira",
      city: {
        cities: "Cidades",
        city_name: "Nome da Cidade",
        edit_city: "Editar Cidade",
        new_city: "Nova cidade",
        no_city_available: "Nenhuma cidade dispon\u00edvel",
        no_city_found: "Nenhuma cidade encontrada",
        state_name: "Nome do Estado",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "Sobre Descri\u00e7\u00e3o Um",
        about_desc_three: "Sobre Descri\u00e7\u00e3o Tr\u00eas",
        about_desc_two: "Sobre Descri\u00e7\u00e3o Dois",
        about_image_one: "Sobre a Imagem Um",
        about_image_three: "Sobre a imagem tr\u00eas",
        about_image_two: "Sobre a imagem dois",
        about_title_one: "Sobre o t\u00edtulo um",
        about_title_three: "Sobre o t\u00edtulo tr\u00eas",
        about_title_two: "Sobre o t\u00edtulo dois",
      },
      cms_service: {
        choose: "Escolher",
        home_banner: "Faixa inicial",
        home_description: "Descri\u00e7\u00e3o inicial",
        home_title: "T\u00edtulo inicial",
      },
      cms_services: "Servi\u00e7os CMS",
      cms_sliders: "Controles deslizantes do CMS",
      common: {
        action: "A\u00e7ao",
        active: "Ativa",
        add: "Adicionar",
        admin_name: "Nome do administrador",
        all: "Tudo",
        and_time: "e tempo",
        applied: "Aplicado",
        applied_on: "Aplicado em",
        apply: "Aplicar",
        approved_by: "Aprovado por",
        are_you_sure: "Tem certeza que deseja excluir isso",
        are_you_sure_want_to_delete: "Tem certeza que deseja deletar isto",
        are_you_sure_want_to_reject: "Tem certeza que deseja rejeitar isto",
        are_you_sure_want_to_select: "Tem certeza que deseja selecionar isto",
        back: "Costas",
        cancel: "Cancelar",
        category_image: "Imagem da categoria",
        choose: "Escolher",
        choose_file: "Escolher Arquivo",
        close: "Perto",
        completed: "Conclu\u00edda",
        copyright: "direito autoral",
        created_date: "Data de cria\u00e7\u00e3o",
        created_on: "Criada Em",
        custom: "Personalizado",
        de_active: "Desativada",
        decline: "Decl\u00ednio",
        declined: "Recusado",
        default_country_code: "C\u00f3digo de pa\u00eds padr\u00e3o",
        delete: "Excluir",
        deleted: "Exclu\u00eddo",
        description: "Descri\u00e7\u00e3o",
        design_by: "Projeto De",
        design_by_name: "InfyOm Labs.",
        download: "Baixar",
        drafted: "Redigido",
        edit: "Editar",
        email: "O email",
        error: "Erro",
        expire: "Expirar",
        export_excel: "Exportar para Excel",
        female: "F\u00eamea",
        filter_options: "Op\u00e7\u00f5es de filtro",
        filters: "Filtros",
        from: "A partir de",
        has_been_deleted: "foi exclu\u00eddo.",
        has_been_rejected: "foi rejeitado.",
        has_been_selected: "foi selecionado.",
        hello: "Ol\u00e1",
        hi: "Oi",
        hired: "Contratado",
        image_aspect_ratio: "A propor\u00e7\u00e3o da imagem deve ser 1: 1.",
        image_file_type:
          "A imagem deve ser um arquivo do tipo: jpeg, jpg, png.",
        last_change_by: "\u00daltimas altera\u00e7\u00f5es por",
        last_updated: "\u00daltima Atualizada",
        live: "Viver",
        login: "Conecte-se",
        male: "Masculina",
        "n/a": "N/A",
        name: "Nome",
        no: "N\u00e3o",
        no_cancel: "N\u00e3o, Cancelar",
        not_verified: "N\u00e3o Verificada",
        note: "Observa\u00e7\u00e3o",
        note_message:
          "Insira o c\u00f3digo curto do idioma. ou seja, ingl\u00eas = en.",
        ok: "OK",
        ongoing: "Em andamento",
        open: "abrir",
        pause: "pausa",
        paused: "Em pausa",
        preview: "Antevis\u00e3o",
        print: "Impress\u00e3o",
        process: "Em processamento...",
        reason: "Raz\u00e3o",
        register: "Registro",
        rejected: "rejeitada",
        report: "Relat\u00f3rio",
        resend_verification_mail: "Reenviar mensagem de verifica\u00e7\u00e3o",
        reset: "Redefinir",
        save: "Salve",
        save_as_draft: "Salvar como rascunho",
        saved_successfully: " Salvo com sucesso",
        search: "Procurar",
        select_job_stage: "Selecionar est\u00e1gio do trabalho",
        selected: "Selecionado",
        shortlist: "Lista curta",
        show: "mostrar",
        status: "Status",
        success: " Bem-sucedido",
        to: "Para",
        updated_successfully: " Atualizado com sucesso",
        verified: "Verificada",
        view: "Vis\u00e3o",
        view_more: "Veja mais",
        view_profile: "Ver Nomee",
        welcome: "Bem-vinda",
        yes: "sim",
        yes_delete: "Sim, Excluir!",
        you_cancel_slot_date: "Voc\u00ea cancela este espa\u00e7o para a data",
      },
      companies: "Empresas",
      company: {
        candidate_email: "Candidato O email",
        candidate_name: "Candidato Nome",
        candidate_phone: "Candidato telefone",
        ceo: "Nome do CEO",
        ceo_name: "nome do ceo",
        city: "Cidade",
        company_details: "Companhia Detalhes",
        company_listing: "Companhia Listagem",
        company_logo: "Logotipo",
        company_name: "Companhia Nome",
        company_size: "Tamanho",
        confirm_password: "confirme Senha",
        country: "Pa\u00eds",
        current_password: "Senha atual",
        edit_company: "Editar Companhia",
        edit_employer: "Editar empregador",
        email: "O email",
        email_verified: "email verificado",
        employer: "Empregador",
        employer_ceo: "CEO empregador",
        employer_details: "Dados do empregador",
        employer_name: "Nome do Empregador",
        employers: "Empregadores",
        enter_experience_year: "Insira a experi\u00eancia no ano",
        established_in: "Estabelecida No",
        established_year: "o ano de funda\u00e7\u00e3o",
        facebook_url: "URL Facebook",
        fax: "Fax",
        followers: "Seguidoras",
        google_plus_url: "URL do Google+",
        image: "Imagem",
        industry: "Ind\u00fastria",
        is_active: "\u00c9 Ativa",
        is_featured: "\u00c9 Destaque",
        linkedin_url: "URL do Linkedin",
        location: "Localiza\u00e7\u00e3o",
        location2: "2\u00ba local do escrit\u00f3rio",
        name: "Nome",
        new_company: "Nova Companhia",
        new_employer: "Novo Empregador",
        new_password: "Nova Senha",
        no_employee_found: "Nenhum funcion\u00e1rio encontrado",
        no_employee_reported_available:
          "Nenhum relat\u00f3rio de funcion\u00e1rio dispon\u00edvel",
        no_employer_available: "Nenhum funcion\u00e1rio dispon\u00edvel",
        no_of_offices: "N\u00ba de escrit\u00f3rios",
        no_reported_employer_found: "Nenhum empregador relatado encontrado",
        notes: "Notas",
        offices: "Escrit\u00f3rios",
        ownership_type: "Propriedade Tipo",
        password: "Senha",
        pinterest_url: "URL do Pinterest",
        report_to_company: "Relat\u00f3rio para Companhia",
        reported_by: "Reportado por",
        reported_companies: "Reported Empresas",
        reported_company: "Relatada Companhia",
        reported_employer_detail: "Detalhe do empregador relatado",
        reported_employers: "Empregadores relatados",
        reported_on: "Relatado em",
        select_career_level: "Selecione o n\u00edvel de carreira",
        select_city: "Selecione a cidade",
        select_company: "Selecionar empresa",
        select_company_size: "Selecione o tamanho da empresa",
        select_country: "Selecione o pais",
        select_currency: "Escolha a moeda",
        select_degree_level: "Selecione o n\u00edvel de gradua\u00e7\u00e3o",
        select_employer_size: "Selecione o tamanho do empregador",
        select_established_year: "Selecione o ano de funda\u00e7\u00e3o",
        select_functional_area: "Selecione a \u00e1rea funcional",
        select_gender: "Selecionar sexo",
        select_industry: "Selecionar setor",
        select_job_category: "Selecione a categoria de trabalho",
        select_job_shift: "Selecionar turno de trabalho",
        select_job_type: "Selecione o tipo de trabalho",
        select_language: "Selecione o idioma",
        select_marital_status: "Selecione o estado civil",
        select_ownership_type: "Selecione o tipo de propriedade",
        select_position: "Selecionar posi\u00e7\u00e3o",
        select_salary_period: "Selecione o per\u00edodo salarial",
        select_state: "Selecionar estado",
        state: "Estado",
        title: "Cargo",
        twitter_url: "URL do Twitter",
        website: "Local na rede Internet",
      },
      company_size: {
        action: "A\u00e7ao",
        add: "Adicionar",
        company_size: "Tamanho da empresa",
        edit_company_size: "Editar Companhia Tamanho",
        new_company_size: "Nova Companhia Tamanho",
        no_company_size_available: "Nenhum tamanho de empresa dispon\u00edvel",
        no_company_size_found: "Nenhum tamanho de empresa encontrado",
        show_company_size: "Trabalho Categoria",
        size: "Tamanho",
      },
      company_sizes: "Tamanhos da empresa",
      country: {
        countries: "Pa\u00edses",
        country_name: "Nome do pa\u00eds",
        edit_country: "Editar Pa\u00eds",
        new_country: "Novo pa\u00eds",
        no_country_available: "Nenhum pa\u00eds dispon\u00edvel",
        no_country_found: "Nenhum pa\u00eds encontrado",
        phone_code: "C\u00f3digo do telefone",
        short_code: "C\u00f3digo curto",
      },
      cv_builder: "Construtor de CV",
      dashboard: "Painel",
      datepicker: {
        last_month: "M\u00eas passado",
        last_week: "Semana passada",
        this_month: "Este m\u00eas",
        this_week: "Essa semana",
        today: "Hoje",
      },
      email_template: {
        body: "Corpo",
        edit_email_template: "Editar modelo de email",
        short_code: "C\u00f3digo curto",
        subject: "Assunto",
        template_name: "Nome do modelo",
      },
      email_templates: "Modelos de Email",
      employer: {
        job_stage: "Est\u00e1gios de Trabalho",
        job_stage_desc: "Descri\u00e7\u00e3o",
      },
      employer_dashboard: {
        dashboard: "Painel",
        followers: "Seguidores",
        job_applications: "Solicita\u00e7\u00f5es de emprego",
        open_jobs: "Abrir trabalhos",
      },
      employer_menu: {
        closed_jobs: "trabalhos fechados",
        employer_details_field:
          "O campo Detalhes do Empregador \u00e9 obrigat\u00f3rio.",
        employer_profile: "Perfil do Empregador",
        enter_description: "Digite a descri\u00e7\u00e3o",
        enter_employer_details: "Digite os dados do empregador",
        enter_industry_details: "Inserir detalhes do setor...",
        enter_ownership_details: "Digite os detalhes da propriedade...",
        expires_on: "expira em",
        followers: "Seguidores",
        general_dashboard: "Painel geral",
        jobs: "Jobs",
        manage_subscriptions: "Gerenciar assinatura",
        no_data_available: "nenhum dado dispon\u00edvel",
        paused_jobs: "trabalhos pausados",
        recent_follower: "seguidor recente",
        recent_jobs: "empregos recentes",
        total_job_applications: "total de pedidos de emprego",
        total_jobs: "empregos totais",
        transactions: "Transa\u00e7\u00f5es",
        valid_facebook_url: "Digite um URL v\u00e1lido do Facebook",
        valid_google_plus_url: "Digite um URL v\u00e1lido do Google Plus",
        valid_linkedin_url: "Por favor, insira um URL v\u00e1lido do Linkedin",
        valid_pinterest_url: "Digite um URL v\u00e1lido do Pinterest",
        valid_twitter_url: "Digite um URL v\u00e1lido do Twitter",
      },
      employers: "Empregadores",
      env: "Configura\u00e7\u00f5es de ambiente",
      expired_jobs: "Vagas Vencidas",
      faq: {
        action: "A\u00e7\u00e3o",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_faq: "Editar FAQ",
        faq: "Perguntas frequentes",
        faq_detail: "Detalhes de FAQs",
        new_faq: "Nova FAQ",
        no_faq_available: "N\u00e3o h\u00e1 FAQs dispon\u00edveis",
        no_faq_found: "Nenhum FAQ encontrado",
        show_faq: "Perguntas frequentes",
        title: "Title",
      },
      favourite_companies: "Seguidoras",
      favourite_jobs: "Trabalhos favoritos",
      filter_name: {
        closed: "Fechadas",
        country: "Pa\u00eds",
        digital: "DIGITAL",
        drafted: "Redigida",
        featured_company: "Empresa em destaque",
        featured_job: "Trabalho em destaque",
        freelancer_job: "Trabalho de freelancer",
        immediate: "Imediata",
        job_status: "Job Status",
        live: "Viver",
        manually: "MANUALMENTE",
        paused: "Pausada",
        select_featured_company: "Selecione a empresa em destaque",
        select_featured_job: "Selecione o trabalho em destaque",
        select_status: "Selecionar status",
        state: "Estada",
        status: "Status",
        suspended_job: "Trabalho suspenso",
      },
      flash: {
        about_us_update: "Sobre n\u00f3s atualizado com sucesso.",
        admin_cant_delete: "O administrador n\u00e3o pode ser exclu\u00eddo.",
        admin_delete: "Administrador exclu\u00eddo com sucesso.",
        admin_save: "Administrador salvo com sucesso.",
        admin_update: "Administrador atualizado com sucesso.",
        all_notification_read:
          "Todas as notifica\u00e7\u00f5es foram lidas com sucesso.",
        are_you_sure_to_change_status:
          "Tem certeza que deseja alterar o status?",
        assigned_slot_not_delete:
          "O slot atribu\u00eddo n\u00e3o deve ser exclu\u00eddo.",
        attention: "Aten\u00e7\u00e3o",
        brand_delete: "Marca exclu\u00edda com sucesso.",
        brand_retrieved: "Marca recuperada com sucesso.",
        brand_save: "Marca salva com sucesso.",
        brand_update: "Marca atualizada com sucesso.",
        cancel_reason_require:
          "O motivo do cancelamento \u00e9 obrigat\u00f3rio.",
        candidate_delete: "Candidato exclu\u00eddo com sucesso.",
        candidate_education_delete:
          "Educa\u00e7\u00e3o do Candidato exclu\u00edda com sucesso.",
        candidate_education_retrieved:
          "Educa\u00e7\u00e3o do candidato recuperada com sucesso.",
        candidate_education_save:
          "Educa\u00e7\u00e3o do Candidato adicionada com sucesso.",
        candidate_education_update:
          "Educa\u00e7\u00e3o do Candidato atualizada com sucesso.",
        candidate_experience_delete:
          "Experi\u00eancia do candidato exclu\u00edda com sucesso.",
        candidate_experience_retrieved:
          "Experi\u00eancia do candidato recuperada com sucesso.",
        candidate_experience_save:
          "Experi\u00eancia do Candidato adicionada com sucesso.",
        candidate_experience_update:
          "Experi\u00eancia do Candidato atualizada com sucesso.",
        candidate_not_found: "Candidato n\u00e3o encontrado",
        candidate_profile: "Perfil do candidato atualizado com sucesso.",
        candidate_reported: "Candidato reportado com sucesso.",
        candidate_retrieved: "Candidato recuperado com sucesso.",
        candidate_save: "Candidato salvo com sucesso.",
        candidate_update: "Candidato atualizado com sucesso.",
        career_level_cant_delete:
          "O n\u00edvel de carreira n\u00e3o pode ser exclu\u00eddo.",
        career_level_delete:
          "N\u00edvel de carreira exclu\u00eddo com sucesso.",
        career_level_retrieved:
          "N\u00edvel de carreira recuperado com sucesso.",
        career_level_save: "N\u00edvel de carreira adicionado com sucesso.",
        career_level_update: "N\u00edvel de carreira atualizado com sucesso.",
        city_cant_delete: "A cidade n\u00e3o pode ser exclu\u00edda.",
        city_delete: "Cidade exclu\u00edda com sucesso.",
        city_retrieved: "Cidade recuperada com sucesso.",
        city_save: "Cidade salva com sucesso.",
        city_update: "Cidade atualizada com sucesso.",
        close_job: "O trabalho fechado n\u00e3o pode ser editado.",
        cms_service_update: "Servi\u00e7os CMS atualizados com sucesso.",
        comment_deleted: "Coment\u00e1rio exclu\u00eddo com sucesso.",
        comment_edit: "Coment\u00e1rio editado com sucesso.",
        comment_saved: "Coment\u00e1rio salvo com sucesso.",
        comment_updated: "Coment\u00e1rio atualizado com sucesso.",
        company_delete: "Empresa exclu\u00edda com sucesso.",
        company_mark_feature:
          "Marca\u00e7\u00e3o da empresa como destaque com sucesso.",
        company_mark_unFeature:
          "Marca\u00e7\u00e3o da empresa como sem destaque com sucesso.",
        company_save: "Empresa salva com sucesso.",
        company_size_cant_delete:
          "O tamanho da empresa n\u00e3o pode ser exclu\u00eddo.",
        company_size_delete: "Tamanho da empresa exclu\u00eddo com sucesso.",
        company_size_save: "Tamanho da empresa salvo com sucesso.",
        company_size_update: "Tamanho da empresa atualizado com sucesso.",
        company_update: "Empresa atualizada com sucesso.",
        country_cant_delete: "O pa\u00eds n\u00e3o pode ser exclu\u00eddo.",
        country_delete: "Pa\u00eds exclu\u00eddo com sucesso.",
        country_save: "Pa\u00eds salvo com sucesso.",
        country_update: "Pa\u00eds atualizado com sucesso.",
        default_resume_already_upload:
          "O curr\u00edculo padr\u00e3o j\u00e1 foi carregado.",
        degree_level_cant_delete:
          "N\u00edvel de gradua\u00e7\u00e3o n\u00e3o pode ser exclu\u00eddo.",
        degree_level_delete:
          "N\u00edvel de gradua\u00e7\u00e3o exclu\u00eddo com sucesso.",
        degree_level_retrieve: "N\u00edvel de grau recuperado com sucesso.",
        degree_level_save:
          "N\u00edvel de gradua\u00e7\u00e3o salvo com sucesso.",
        degree_level_update:
          "N\u00edvel de gradua\u00e7\u00e3o atualizado com sucesso.",
        description_required:
          "O campo Descri\u00e7\u00e3o \u00e9 obrigat\u00f3rio.",
        email_template: "Modelo de e-mail atualizado com sucesso.",
        email_verify: "E-mail verificado com sucesso.",
        employer_profile: "Perfil do empregador atualizado com sucesso.",
        employer_update: "Empregador atualizado com sucesso.",
        enter_cancel_reason: "Insira o motivo do cancelamento...",
        enter_description: "Digite a descri\u00e7\u00e3o",
        enter_notes: "Digite notas...",
        enter_post_description: "Insira a descri\u00e7\u00e3o da postagem",
        faqs_delete: "Perguntas frequentes exclu\u00eddas com sucesso.",
        faqs_save: "Perguntas frequentes salvas com sucesso.",
        faqs_update: "Perguntas frequentes atualizadas com sucesso.",
        fav_company_delete: "Empresa favorita exclu\u00edda com sucesso.",
        fav_job_added: "Trabalho favorito adicionado com sucesso.",
        fav_job_remove: "O trabalho favorito foi removido.",
        fav_job_removed: "Trabalho favorito removido com sucesso.",
        feature_job_price:
          "O pre\u00e7o dos trabalhos em destaque deve ser maior que 0",
        feature_quota: "A cota em destaque n\u00e3o est\u00e1 dispon\u00edvel",
        featured_not_available:
          "A cota em destaque n\u00e3o est\u00e1 dispon\u00edvel.",
        file_type:
          "O documento deve ser um arquivo do tipo: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete:
          "\u00c1rea funcional n\u00e3o pode ser exclu\u00edda.",
        functional_area_delete:
          "\u00c1rea funcional exclu\u00edda com sucesso.",
        functional_area_save: "\u00c1rea funcional salva com sucesso.",
        functional_area_update: "\u00c1rea funcional atualizada com sucesso.",
        header_slider_deleted:
          "Slider de cabe\u00e7alho exclu\u00eddo com sucesso.",
        header_slider_save: "Slider de cabe\u00e7alho salvo com sucesso.",
        header_slider_update:
          "Slider de cabe\u00e7alho atualizado com sucesso.",
        image_slider_delete: "Slider de imagem exclu\u00eddo com sucesso.",
        image_slider_retrieve: "Slider de imagem recuperado com sucesso.",
        image_slider_save: "Slider de imagem salvo com sucesso.",
        image_slider_update: "Slider de imagem atualizado com sucesso.",
        industry_cant_delete:
          "A ind\u00fastria n\u00e3o pode ser exclu\u00edda.",
        industry_delete: "Ind\u00fastria exclu\u00edda com sucesso.",
        industry_save: "Ind\u00fastria salva com sucesso.",
        industry_update: "Ind\u00fastria atualizada com sucesso.",
        inquiry_deleted: "Consulta exclu\u00edda com sucesso.",
        inquiry_retrieve: "Consulta recuperada com sucesso.",
        invoice_retrieve: "Fatura recuperada com sucesso.",
        job_abuse_reported: "Job Abuse reportado com sucesso.",
        job_alert: "Alerta de trabalho atualizado com sucesso.",
        job_application_delete:
          "Aplicativo de trabalho exclu\u00eddo com sucesso.",
        job_application_draft: "Aplicativo de trabalho elaborado com sucesso",
        job_applied: "Trabalho aplicado com sucesso",
        job_apply_by_candidate:
          "O trabalho solicitado pelo candidato n\u00e3o pode ser exclu\u00eddo.",
        job_cant_delete: "O trabalho n\u00e3o pode ser exclu\u00eddo",
        job_category_cant_delete:
          "A categoria de trabalho n\u00e3o pode ser exclu\u00edda.",
        job_category_delete: "Categoria de trabalho exclu\u00edda com sucesso.",
        job_category_save: "Categoria de trabalho salva com sucesso.",
        job_category_update:
          "Atualiza\u00e7\u00e3o de categoria de trabalho com sucesso.",
        job_create_limit:
          "Limite de cria\u00e7\u00e3o de vagas excedido de sua conta, atualize seu plano de assinatura.",
        job_delete: "Trabalho exclu\u00eddo com sucesso.",
        job_draft: "Rascunho de trabalho salvo com sucesso.",
        job_emailed_to: "Job enviado por e-mail para um amigo com sucesso.",
        job_make_featured: "Job Make em destaque com sucesso.",
        job_make_unfeatured: "Job Make UnFeatured com sucesso.",
        job_not_found: "Trabalho n\u00e3o encontrado.",
        job_notification:
          "Notifica\u00e7\u00e3o de trabalho enviada com sucesso.",
        job_save: "Trabalho salvo com sucesso.",
        job_schedule_send: "agenda de trabalho enviada com sucesso.",
        job_shift_cant_delete:
          "O turno de trabalho n\u00e3o pode ser exclu\u00eddo.",
        job_shift_delete: "Deslocamento de trabalho exclu\u00eddo com sucesso.",
        job_shift_retrieve: "Mudan\u00e7a de trabalho recuperada com sucesso.",
        job_shift_save: "Turno de trabalho salvo com sucesso.",
        job_shift_update: "Job Shift atualizado com sucesso.",
        job_stage_cant_delete:
          "O est\u00e1gio de trabalho n\u00e3o pode ser exclu\u00eddo.",
        job_stage_change: "Fase de trabalho alterada com sucesso.",
        job_stage_delete: "Fase de trabalho exclu\u00edda com sucesso.",
        job_stage_retrieve: "Fase de trabalho recuperada com sucesso.",
        job_stage_save: "Fase de trabalho salva com sucesso.",
        job_stage_update: "Fase de trabalho atualizada com sucesso.",
        job_tag_cant_delete:
          "A etiqueta de trabalho n\u00e3o pode ser exclu\u00edda.",
        job_tag_delete: "Etiqueta de trabalho exclu\u00edda com sucesso.",
        job_tag_retrieve: "Etiqueta de trabalho recuperada com sucesso.",
        job_tag_save: "Etiqueta de trabalho salva com sucesso.",
        job_tag_update: "Etiqueta de trabalho atualizada com sucesso.",
        job_type_cant_delete:
          "O tipo de trabalho n\u00e3o pode ser exclu\u00eddo.",
        job_type_delete: "Tipo de trabalho exclu\u00eddo com sucesso.",
        job_type_retrieve: "Tipo de trabalho recuperado com sucesso.",
        job_type_save: "Tipo de trabalho salvo com sucesso.",
        job_type_update: "Tipo de trabalho atualizado com sucesso.",
        job_update: "Trabalho atualizado com sucesso.",
        language_added: "Idioma adicionado com sucesso.",
        language_changed: "Idioma alterado com sucesso",
        language_delete: "Idioma exclu\u00eddo com sucesso.",
        language_retrieve: "Idioma recuperado com sucesso.",
        language_save: "Idioma salvo com sucesso.",
        language_update: "Idioma atualizado com sucesso.",
        link_copy: "Link copiado com sucesso.",
        manual_payment: "Pagamento manual aprovado com sucesso.",
        manual_payment_denied: "Pagamento manual negado com sucesso.",
        marital_status_delete: "Estado civil exclu\u00eddo com sucesso.",
        marital_status_retrieve: "Estado civil recuperado com sucesso.",
        marital_status_save: "Estado civil salvo com sucesso.",
        marital_status_update: "Estado civil atualizado com sucesso.",
        media_delete: "M\u00eddia exclu\u00edda com sucesso.",
        newsletter_delete: "NewsLetter exclu\u00eddo com sucesso.",
        no_record: "Nenhum registro foi encontrado.",
        not_deleted: "N\u00e3o exclu\u00eddo",
        noticeboard_retrieve: "Quadro de avisos recuperado com sucesso.",
        noticeboard_save: "Quadro de avisos salvo com sucesso.",
        noticeboard_update: "Quadro de avisos atualizado com sucesso.",
        notification_read: "Notifica\u00e7\u00e3o lida com sucesso.",
        notification_setting_update:
          "Configura\u00e7\u00f5es de notifica\u00e7\u00e3o atualizadas com sucesso.",
        ownership_type_cant_delete:
          "O tipo de propriet\u00e1rio n\u00e3o pode ser exclu\u00eddo.",
        ownership_type_delete:
          "Tipo de Propriet\u00e1rio exclu\u00eddo com sucesso.",
        ownership_type_retrieve: "OwnerShip Type recuperado com sucesso.",
        ownership_type_save: "Tipo de Propriet\u00e1rio salvo com sucesso.",
        ownership_type_updated: "OwnerShip Type atualizado com sucesso.",
        password_update: "Senha atualizada com sucesso.",
        payment_failed_try_again:
          "desculpe! Falha no pagamento. Tente novamente mais tarde.",
        payment_not_complete: "Seu pagamento n\u00e3o foi conclu\u00eddo",
        payment_success: "Seu pagamento foi conclu\u00eddo com sucesso",
        plan_Save: "Plano salvo com sucesso.",
        plan_cant_delete:
          "O plano n\u00e3o pode ser exclu\u00eddo, cont\u00e9m uma ou mais assinaturas ativas.",
        plan_cant_update:
          "O plano n\u00e3o pode ser atualizado. A assinatura deste plano j\u00e1 existe",
        plan_delete: "Plano exclu\u00eddo com sucesso.",
        plan_retrieve: "Plano recuperado com sucesso.",
        plan_update: "Plano atualizado com sucesso.",
        please_wait_for:
          "Aguarde a aprova\u00e7\u00e3o do administrador, voc\u00ea j\u00e1 adicionou o pagamento manual",
        please_wait_for_com:
          "Aguarde a aprova\u00e7\u00e3o do administrador para concluir sua transa\u00e7\u00e3o",
        policy_update: "Pol\u00edtica atualizada com sucesso.",
        post_category_delete:
          "Categoria de postagem exclu\u00edda com sucesso.",
        post_category_retrieve: "Categoria de postagem recuperada com sucesso.",
        post_category_save: "Categoria de postagem salva com sucesso.",
        post_category_update: "Categoria de postagem atualizada com sucesso.",
        post_comment: "Coment\u00e1rios de postagem recuperados com sucesso.",
        post_delete: "Post deletado com sucesso.",
        post_save: "Post salvo com sucesso.",
        post_update: "Post atualizado com sucesso.",
        profile_update: "Perfil atualizado com sucesso.",
        reason_require: "O motivo do cancelamento \u00e9 obrigat\u00f3rio.",
        register_success_mail_active:
          "Voc\u00ea se registrou com sucesso, ative sua conta do e-mail.",
        registration_done: "Cadastro realizado com sucesso.",
        report_to_company: "Relatar para a empresa com sucesso.",
        reported_candidate_delete:
          "Candidato denunciado exclu\u00eddo com sucesso.",
        reported_job_delete: "Trabalhos reportados exclu\u00eddos com sucesso.",
        resume_delete: "Retomar exclus\u00e3o com sucesso.",
        resume_update: "Curr\u00edculo atualizado com sucesso.",
        retrieved: "Recuperado com sucesso.",
        salary_currency_cant_delete:
          "A moeda do sal\u00e1rio n\u00e3o pode ser exclu\u00edda.",
        salary_currency_destroy:
          "Moeda do sal\u00e1rio exclu\u00edda com sucesso.",
        salary_currency_edit: "Moeda do sal\u00e1rio recuperada com sucesso.",
        salary_currency_store: "Moeda do sal\u00e1rio salva com sucesso.",
        salary_currency_update: "Moeda do sal\u00e1rio atualizada com sucesso.",
        salary_period_cant_delete:
          "Per\u00edodo de sal\u00e1rio n\u00e3o pode ser exclu\u00eddo.",
        salary_period_delete:
          "Per\u00edodo de sal\u00e1rio exclu\u00eddo com sucesso.",
        salary_period_retrieve:
          "Per\u00edodo de sal\u00e1rio recuperado com sucesso.",
        salary_period_save: "Per\u00edodo de sal\u00e1rio salvo com sucesso.",
        salary_period_update: "Per\u00edodo salarial atualizado com sucesso.",
        select_employer: "Selecionar Empregador",
        select_job: "Selecionar trabalho",
        select_job_skill: "Selecionar habilidade de trabalho",
        select_job_tag: "Selecionar etiqueta de trabalho",
        select_post_category: "Selecionar categoria de postagem",
        select_skill: "Selecionar habilidade",
        session_created: "Sess\u00e3o criada com sucesso.",
        setting_update: "Configura\u00e7\u00e3o atualizada com sucesso.",
        skill_cant_delete: "A habilidade n\u00e3o pode ser exclu\u00edda.",
        skill_delete: "Habilidade exclu\u00edda com sucesso.",
        skill_save: "Habilidade salva com sucesso.",
        skill_update: "Habilidade atualizada com sucesso.",
        slot_already_taken: "Slot j\u00e1 foi ocupado",
        slot_cancel: "Slot Cancelar com Sucesso.",
        slot_choose: "Slot escolhido com sucesso",
        slot_create: "Slots criados com sucesso",
        slot_delete: "Slot exclu\u00eddo com sucesso.",
        slot_preference_field:
          "O campo de prefer\u00eancia de slot \u00e9 obrigat\u00f3rio",
        slot_reject: "Slots rejeitados com sucesso",
        slot_update: "Slot atualizado com sucesso.",
        state_cant_delete: "O estado n\u00e3o pode ser exclu\u00eddo.",
        state_delete: "Estado exclu\u00eddo com sucesso.",
        state_save: "Estado salvo com sucesso.",
        state_update: "Estado atualizado com sucesso.",
        status_change: "Status alterado com sucesso.",
        status_update: "Status atualizado com sucesso.",
        subscribed: "Inscrito com sucesso.",
        subscription_cancel: "Assinatura cancelada com sucesso.",
        subscription_resume: "Assinatura retomada com sucesso.",
        success_verify:
          "Voc\u00ea verificou seu e-mail com sucesso. Por favor entre !",
        testimonial_delete: "Depoimentos deletados com sucesso.",
        testimonial_retrieve: "Testemunhos recuperados com sucesso.",
        testimonial_save: "Depoimento salvo com sucesso.",
        testimonial_update: "Depoimentos atualizados com sucesso.",
        the_name_has: "O nome j\u00e1 foi escolhido",
        there_are_no: "N\u00e3o h\u00e1 curr\u00edculos enviados.",
        this_currency_is:
          "Esta moeda n\u00e3o \u00e9 suportada pelo PayPal para fazer pagamentos.",
        translation_update: "Tradu\u00e7\u00e3o atualizada com sucesso.",
        trial_plan_update: "Plano de teste atualizado com sucesso.",
        unfollow_company: "Parar de seguir a empresa com sucesso.",
        verification_mail:
          "E-mail de verifica\u00e7\u00e3o reenviado com sucesso.",
        your_are_not_author:
          "Voc\u00ea n\u00e3o \u00e9 autor de assinatura. ent\u00e3o voc\u00ea n\u00e3o tem permiss\u00e3o para cancelar esta assinatura.",
        your_payment_comp: "Seu pagamento foi conclu\u00eddo com sucesso",
      },
      footer_settings: "Configura\u00e7\u00f5es do rodap\u00e9",
      front_cms: "CMS frontal",
      front_home: {
        candidates: "Candidatas",
        companies: "Empresas",
        jobs: "Empregos",
        resumes: "Curr\u00edculos",
      },
      front_settings: {
        exipre_on: "Expira em",
        expires_on: "Expira em",
        featured: "Destaque",
        featured_companies_days: "Dias de empresas em destaque",
        featured_companies_due_days:
          "Dias de vencimento de empresas inadimplentes",
        featured_companies_enable: "As empresas apresentadas permitem",
        featured_companies_price: "Pre\u00e7o das empresas em destaque",
        featured_companies_quota: "Quota de empresas apresentadas",
        featured_employer_not_available:
          "empregador em destaque n\u00e3o dispon\u00edvel",
        featured_job: "Trabalho em destaque",
        featured_jobs_days: "Dias de empregos em destaque",
        featured_jobs_due_days: "Dias de vencimento de trabalhos padr\u00e3o",
        featured_jobs_enable: "Trabalhos em destaque permitem",
        featured_jobs_price: "Pre\u00e7o de empregos em destaque",
        featured_jobs_quota: "Cota de empregos em destaque",
        featured_listing_currency: "Moeda da listagem em destaque",
        latest_jobs_enable:
          "Mostrar empregos mais recentes de acordo com o pa\u00eds do usu\u00e1rio conectado",
        latest_jobs_enable_message:
          "Ele mostrar\u00e1 os empregos mais recentes do pa\u00eds do candidato / empregador quando eles estiverem logados",
        make_feature: "fazer recurso",
        make_featured: "Destaque",
        make_featured_job: "Fa\u00e7a um trabalho em destaque",
        pay_to_get: "Pague para obter",
        remove_featured: "remover destaque",
      },
      functional_area: {
        edit_functional_area: "Editar Funcional \u00c1rea",
        name: "Nome",
        new_functional_area: "Nova Funcional \u00c1rea",
        no_functional_area_available:
          "Nenhuma \u00e1rea funcional dispon\u00edvel",
        no_functional_area_found: "Nenhuma \u00e1rea funcional encontrada",
      },
      functional_areas: "\u00c1reas funcionais",
      general: "Geral",
      general_dashboard: "Painel geral",
      general_settings: "Configura\u00e7\u00f5es Gerais",
      go_to_homepage: "V\u00e1 para a p\u00e1gina inicial",
      header_slider: {
        edit_header_slider: "Editar cabe\u00e7alho do slider",
        header_slider: "Slider de cabe\u00e7alho",
        image_size_message:
          "A imagem deve ser de pixel 1920 x 1080 ou pixel superior.",
        image_title_text:
          "Fa\u00e7a upload da imagem de 1920 x 1080 pixels ou pixels acima para obter a melhor experi\u00eancia do usu\u00e1rio.",
        new_header_slider: "Novo cabe\u00e7alho deslizante",
        no_header_slider_available:
          "Nenhum controle deslizante de cabe\u00e7alho dispon\u00edvel",
      },
      header_sliders: "Sliders de cabe\u00e7alho",
      image_slider: {
        action: "A\u00e7\u00e3o",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_image_slider: "Editar controle deslizante de imagem",
        image: "Imagem",
        image_extension_message:
          "A imagem deve ser um arquivo do tipo: png, jpg, jpeg.",
        image_size_message:
          "A imagem deve ser de pixel 1140 x 500 ou acima de pixel.",
        image_slider: "Controle deslizante de imagem",
        image_slider_details: "Detalhes do controle deslizante da imagem",
        image_title_text:
          "Carregue 1140 x 500 pixels ou imagem acima de pixels para obter a melhor experi\u00eancia do usu\u00e1rio.",
        is_active: "Status",
        message: "Desactivar a pesquisa de emprego da p\u00e1gina inicial",
        message_title:
          "Se esta op\u00e7\u00e3o estiver desabilitada, a tela de pesquisa padr\u00e3o n\u00e3o ficar\u00e1 vis\u00edvel.",
        new_image_slider: "Novo controle deslizante de imagem",
        no_image_slider_available:
          "Nenhum controle deslizante de imagem dispon\u00edvel",
        no_image_slider_found:
          "Nenhum controle deslizante de imagem encontrado",
        select_status: "Selecione Status",
        slider: "Ative o controle deslizante de largura total.",
        slider_active:
          "Desative o controle deslizante da imagem da p\u00e1gina inicial",
        slider_active_title:
          "Se esta chave estiver desabilitada, a tela do controle deslizante da imagem padr\u00e3o n\u00e3o ficar\u00e1 vis\u00edvel.",
        slider_title:
          "Se esta altern\u00e2ncia estiver habilitada, o controle deslizante de imagem ficar\u00e1 em tela cheia..",
      },
      image_sliders: "Sliders de imagem",
      industries: "ind\u00fastrias",
      industry: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_industry: "Editar Ind\u00fastria",
        industry_detail: "Detalhes da Ind\u00fastria",
        name: "Nome",
        new_industry: "Nova Ind\u00fastria",
        no_industry_available: "Nenhuma ind\u00fastria dispon\u00edvel",
        no_industry_found: "Nenhuma ind\u00fastria encontrada",
        size: "Tamanho",
      },
      inquires: "inqu\u00e9ritos",
      inquiry: {
        email: "Email",
        inquiry: "Investiga\u00e7\u00e3o",
        inquiry_date: "Data da consulta",
        inquiry_details: "Detalhes da consulta",
        message: "Mensagem",
        name: "Nome",
        no_inquiry_available: "Nenhum inqu\u00e9rito dispon\u00edvel",
        no_inquiry_found: "Nenhum inqu\u00e9rito encontrado",
        phone_no: "Telefone n\u00e3o",
        subject: "Sujeita",
      },
      job: {
        add_note: "Adicionar Note",
        applies_job_not_found: "Nenhum trabalho aplicado encontrado",
        career_level: "Carreira N\u00edvel",
        city: "Cidade",
        country: "Pa\u00eds",
        created_at: "Criada At",
        currency: "Moeda",
        degree_level: "Grau N\u00edvel",
        description: "Descri\u00e7\u00e3o",
        edit_job: "Editar Trabalho",
        email_to_friend: "O email para Amiga",
        expires_on: "Expira em",
        favourite_companies_not_found: "Empresa favorita n\u00e3o encontrada",
        favourite_company: "Empresa Favorita",
        favourite_job: "Trabalho favorito",
        favourite_job_not_found: "Nenhum emprego favorito encontrado",
        following_company_not_found: "Nenhuma seguinte empresa encontrada",
        friend_email: "Amiga O email",
        friend_name: "Amiga Nome",
        functional_area: "Funcional \u00c1rea",
        hide_salary: "ocultar Sal\u00e1rio",
        is_featured: "\u00c9 Destaque",
        is_freelance: "\u00c9 Freelance",
        is_suspended: "\u00c9 Suspensa",
        job: "Trabalho",
        job_alert: "Alerta de emprego",
        job_details: "Trabalho Detalhes",
        job_expiry_date: "Trabalho Termo Encontro",
        job_shift: "Trabalho Mudan\u00e7a",
        job_skill: "Trabalho Habilidade",
        job_title: "Trabalho T\u00edtulo",
        job_type: "Trabalho Tipo",
        job_url: "Trabalho URL",
        new_job: "Nova Trabalho",
        no_applied_job_found: "Nenhum trabalho aplicado dispon\u00edvel",
        no_favourite_job_found: "Nenhum emprego favorito dispon\u00edvel",
        no_followers_available: "Nenhum seguidor dispon\u00edvel",
        no_followers_found: "Nenhum seguidor encontrado",
        no_following_companies_found:
          "Empresa a seguir n\u00e3o dispon\u00edvel",
        no_job_reported_available: "Nenhum trabalho relatado dispon\u00edvel",
        no_preference: "N\u00e3o Prefer\u00eancia",
        no_reported_job_found: "Nenhum trabalho relatado encontrado",
        notes: "Notas",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "Por favor, insira a Faixa Salarial para um valor maior que a Faixa Salarial de.",
        position: "Posi\u00e7\u00e3o",
        remove_favourite_jobs: "Remover trabalho favorito",
        reported_job: "Trabalho relatado",
        reported_jobs_detail: "Detalhe do trabalho relatado",
        reported_user: "Relatada Do utilizador",
        salary_from: "Sal\u00e1rio De",
        salary_period: "Sal\u00e1rio Per\u00edodo",
        salary_to: "Sal\u00e1rio Para",
        state: "Estado",
        subscriber: "Assinante",
        view_notes: "Ver notas",
      },
      job_application: {
        application_date: "Data da inscri\u00e7\u00e3o",
        candidate_name: "Nome do candidato",
        job_application: "Candidatura de Trabalho",
      },
      job_applications: "Solicita\u00e7\u00f5es de emprego",
      job_categories: "Categorias de trabalho",
      job_category: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_job_category: "Editar Trabalho Categoria",
        is_featured: "\u00c9 Destaque",
        job_category: "Trabalho Categoria",
        name: "Nome",
        new_job_category: "Nova Trabalho Categoria",
        no_job_category_available:
          "Nenhuma categoria de trabalho dispon\u00edvel",
        no_job_category_found: "Nenhuma categoria de trabalho encontrada",
        show_job_category: "Detalhes da categoria de trabalho",
      },
      job_experience: {
        edit_job_experience: "Editar Trabalho Experi\u00eancia",
        is_active: "\u00c9 Ativa",
        is_default: "\u00c9 Padr\u00e3o",
        job_experience: "Trabalho Experi\u00eancia",
        language: "L\u00edngua",
        new_job_experience: "Nova Trabalho Experi\u00eancia",
      },
      job_experiences: "Experi\u00eancias profissionais",
      job_notification: {
        job_notifications: "Notifica\u00e7\u00f5es de trabalho",
        no_jobs_available: "Sem empregos dispon\u00edveis",
        select_all_jobs: "Selecionar todos os trabalhos",
      },
      job_shift: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_job_shift: "Editar Trabalho Mudan\u00e7a",
        job_shift_detail: "Detalhes de turno de trabalho",
        new_job_shift: "Nova Trabalho Mudan\u00e7a",
        no_job_shifts_available: "Nenhum turno de trabalho dispon\u00edvel",
        no_job_shifts_found: "Nenhum turno de trabalho encontrado",
        shift: "Mudan\u00e7a",
        show_job_shift: "Trabalho Mudan\u00e7a",
        size: "Tamanho",
      },
      job_shifts: "Turnos de trabalho",
      job_skill: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_job_skill: "Editar Trabalho Habilidade",
        name: "Nome",
        new_job_skill: "Nova Trabalho Habilidade",
        show_job_skill: "Trabalho Habilidade",
      },
      job_skills: "Habilidades profissionais",
      job_stage: {
        add_slot: "Adicionar slot",
        add_slots: "Adicionar Slots",
        batch: "Batch",
        cancel_slot: "Cancelar Slot",
        cancel_this_slot: "Cancelar este slot",
        cancel_your_selected_slot: "Cancelar seu slot selecionado",
        candidate_note: "Nota do Candidato",
        choose_slots: "Choose Slot",
        date: "Data",
        edit_job_stage: "Editar Est\u00e1gio de Trabalho",
        edit_slot: "Editar slot",
        history: "Hist\u00f3ria",
        job_stage: "Est\u00e1gio de trabalho",
        job_stage_detail: "Detalhe da etapa do trabalho",
        new_job_stage: "Novo est\u00e1gio de trabalho",
        new_slot_send: "Envio de novo slot",
        no_job_stage_available:
          "Nenhum est\u00e1gio de trabalho dispon\u00edvel",
        no_job_stage_found: "Nenhum est\u00e1gio de trabalho encontrado",
        no_slot_available: "Nenhum slot dispon\u00edvel",
        reject_all_slot: "Rejeitar todos os slots",
        rejected_all_slots: "Todos os slots rejeitados",
        send_slot: "Slot de envio",
        send_slots: "Enviar slots",
        slot: "Ranhura",
        slot_preference: "Prefer\u00eancia de slot",
        slots: "Slots",
        time: "Time",
        you_cancel_this_slot: "Voc\u00ea cancela este slot",
        you_have_rejected_all_slot: "Voc\u00ea rejeitou todos os slots",
        you_have_selected_this_slot: "Voc\u00ea selecionou este slot",
        your_note: "Sua Nota",
      },
      job_stages: "Est\u00e1gios de trabalho",
      job_tag: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_job_tag: "Editar Trabalho Tag",
        job_tag: "Etiqueta de trabalho",
        job_tag_detail: "Detalhes da etiqueta de trabalho",
        name: "Nome",
        new_job_tag: "Nova Trabalho Tag",
        no_job_tag_available: "Nenhuma etiqueta de trabalho dispon\u00edvel",
        no_job_tag_found: "Nenhuma etiqueta de trabalho encontrada",
        show_job_tag: "Trabalho Tag",
        size: "Tamanho",
      },
      job_tags: "Etiquetas de trabalho",
      job_type: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_job_type: "Editar Trabalho Tipo",
        job_type: "Tipo de emprego",
        job_type_detail: "Detalhes do tipo de trabalho",
        name: "Nome",
        new_job_type: "Nova Trabalho Tipo",
        no_job_type_available: "Nenhum tipo de trabalho dispon\u00edvel",
        no_job_type_found: "Nenhum tipo de trabalho encontrado",
        show_job_type: "Trabalho Tipo",
      },
      job_types: "Tipos de trabalho",
      jobs: "Empregos",
      language: {
        edit_language: "Editar L\u00edngua",
        is_active: "\u00c9 Ativa",
        is_default: "\u00c9 Padr\u00e3o",
        is_rtl: "\u00c9 RTL",
        iso_code: "ISO C\u00f3digo",
        language: "L\u00edngua",
        native: "Nativa",
        new_language: "Nova L\u00edngua",
        no_language_available: "Nenhum idioma dispon\u00edvel",
        no_language_found: "Nenhum idioma encontrado",
      },
      languages: "l\u00ednguas",
      marital_status: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_marital_status: "Editar Conjugal Status",
        marital_status: "Conjugal Status",
        marital_status_detail: "Detalhes do estado civil",
        new_marital_status: "Nova Conjugal Status",
        no_marital_status_available: "Nenhum estado civil dispon\u00edvel",
        no_marital_status_found: "Nenhum estado civil encontrado",
        show_marital_status: "Conjugal Status",
      },
      marital_statuses: "Estado civil",
      months: {
        apr: "abril",
        aug: "agosto",
        dec: "dezembro",
        feb: "fevereiro",
        jan: "janeiro",
        jul: "julho",
        jun: "junho",
        mar: "mar\u00e7o",
        may: "Poderia",
        nov: "novembro",
        oct: "Outubro",
        sep: "setembro",
      },
      no_skills: "Sem Habilidades",
      no_subscriber_available: "Nenhum assinante dispon\u00edvel",
      no_subscriber_found: "Nenhum assinante encontrado",
      noticeboard: {
        action: "A\u00e7\u00e3o",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_noticeboard: "Editar quadro de avisos",
        is_active: "Est\u00e1 ativo",
        new_noticeboard: "Novo aviso",
        no_noticeboard_available: "Nenhum quadro de avisos dispon\u00edvel",
        no_noticeboard_found: "Nenhum quadro de avisos encontrado",
        noticeboard: "Quadro de avisos",
        noticeboard_detail: "Detalhes do Quadro de Avisos",
        title: "Title",
      },
      noticeboards: "Avisos",
      notification: {
        company: "Empresa",
        company_marked_featured: "A empresa marcada como apresentada por",
        empty_notifications:
          "N\u00e3o foi poss\u00edvel encontrar nenhuma notifica\u00e7\u00e3o",
        job_application_rejected_message:
          "Sua inscri\u00e7\u00e3o foi rejeitada por",
        job_application_select_message: "Voc\u00ea foi selecionado para",
        job_application_shortlist_message:
          "Seu aplicativo foi selecionado para",
        job_application_submitted: "Candidatura de emprego enviada para",
        mark_all_as_read: "Marcar tudo como lido",
        marked_as_featured: "marcado como destaque",
        new_candidate_registered: "Novo candidato registrado",
        new_employer_registered: "Novo empregador registrado",
        notifications: "Notifica\u00e7\u00f5es",
        purchase: "compra",
        read_notification: "Notifica\u00e7\u00e3o lida com sucesso",
        started_following: "come\u00e7ou a seguir",
        started_following_you: "come\u00e7ou a seguir Voc\u00ea.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "Quando um candidato \u00e9 rejeitado para o trabalho",
        CANDIDATE_SELECTED_FOR_JOB:
          "Quando um candidato \u00e9 selecionado para o trabalho",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "Quando um candidato \u00e9 selecionado para o trabalho",
        EMPLOYER_PURCHASE_PLAN:
          "Quando um empregador adquire um plano de assinatura",
        FOLLOW_COMPANY: "Quando um candidato come\u00e7a a seguir a Empresa",
        FOLLOW_JOB: "Quando um candidato come\u00e7a a seguir empregos",
        JOB_ALERT: "Quando um empregador cria um emprego",
        JOB_APPLICATION_SUBMITTED:
          "Ao enviar um novo Formul\u00e1rio de Candidatura",
        MARK_COMPANY_FEATURED: "Quando marcar a empresa como destaque",
        MARK_COMPANY_FEATURED_ADMIN:
          "Lorsque l'employeur marque l'entreprise comme vedette",
        MARK_JOB_FEATURED: "Quando marcar trabalho como destaque",
        MARK_JOB_FEATURED_ADMIN:
          "Lorsque l'employeur marque l'emploi comme pr\u00e9sent\u00e9",
        NEW_CANDIDATE_REGISTERED: "Quando um novo candidato \u00e9 registrado",
        NEW_EMPLOYER_REGISTERED: "Quando um novo empregador se registrou",
        admin: "Admin",
        blog_category: "Categoria do blog",
        candidate: "Candidato",
        employer: "Empregada",
      },
      ownership_type: {
        edit_ownership_type: "Editar Propriedade Tipo",
        new_ownership_type: "Nova Propriedade Tipo",
        no_ownership_type_available:
          "Nenhum tipo de propriedade dispon\u00edvel",
        no_ownership_type_found: "Nenhum tipo de propriedade encontrado",
        ownership_type: "Tipo de propriedade",
        ownership_type_detail: "Detalhes do tipo de propriedade",
      },
      ownership_types: "Tipos de propriedade",
      phone: {
        invalid_country_code: "C\u00f3digo de pa\u00eds inv\u00e1lido",
        invalid_number: "N\u00famero inv\u00e1lido",
        too_long: "Demasiado longo",
        too_short: "Curto demais",
        valid_number: "N\u00famero v\u00e1lido",
      },
      plan: {
        active_subscription: "assinatura ativa",
        allowed_jobs: "Trabalhos Permitidos",
        amount: "Montante",
        cancel_reason: "Cancelar motivo",
        cancel_subscription: "Cancelar assinatura",
        currency: "Moeda",
        current_plan: "Plano atual",
        edit_plan: "Editar plano",
        edit_subscription_plan: "editar plano de assinatura",
        ends_at: "Termina em",
        is_trial_plan: "\u00c9 plano de teste",
        job_allowed: "Trabalho Permitido",
        job_used: "Trabalho Usado",
        jobs_allowed: "Trabalhos Permitidos",
        jobs_used: "Empregos usados",
        new_plan: "Adicionar Plano",
        new_subscription_plan: "novo plano de assinatura",
        pay_with_manually: "Pague com manualmente",
        pay_with_paypal: "Pague com Paypal",
        pay_with_stripe: "Pague com Stripe",
        per_month: "Por m\u00eas",
        plan: "Plano",
        plan_amount_cannot_be_changes:
          "Nota: - O valor do plano n\u00e3o pode ser alterado.",
        pricing: "Pre\u00e7os",
        processing: "Em processamento",
        purchase: "Compra",
        renews_on: "Renova em",
        subscription_cancelled: "Assinatura cancelada",
        subscriptions: "assinaturas",
      },
      plans: "Planos",
      position: {
        edit_position: "Editar Posi\u00e7\u00e3o",
        new_position: "Nova Posi\u00e7\u00e3o",
        position: "Posi\u00e7\u00e3o",
      },
      positions: "Posi\u00e7\u00f5es",
      post: {
        action: "A\u00e7ao",
        add: "Adicionar",
        blog: "Blog",
        comment: "Comente",
        comments: "Coment\u00e1rios",
        description: "Descri\u00e7\u00e3o",
        edit_post: "Editar post",
        image: "Imagem",
        new_post: "Nova postagem",
        no_posts_available: "Nenhuma postagem dispon\u00edvel",
        no_posts_found: "Nenhuma postagem encontrada",
        post: "Postar",
        post_a_comments: "Poste um Coment\u00e1rio",
        post_details: "Detalhes da postagem",
        posts: "Postagens",
        select_post_categories: "Selecione Categorias de Postagem",
        show_post: "Postar",
        title: "T\u00edtulo",
      },
      post_category: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_post_category: "Editar categoria de postagem",
        name: "Nome",
        new_post_category: "Nova categoria de postagem",
        no_post_category_available:
          "Nenhuma categoria de postagem dispon\u00edvel",
        no_post_category_found: "Nenhuma categoria de postagem encontrada",
        post_categories: "Categorias de postagem",
        post_category: "Categoria de postagem",
        post_category_detail: "Detalhes da categoria de postagem",
        show_post_category: "Categoria de postagem",
      },
      post_comment: {
        post_comment: "Postar Coment\u00e1rio",
        post_comment_details: "Detalhes do coment\u00e1rio da postagem",
      },
      post_comments: "Postar coment\u00e1rios",
      pricing_table: { get_started: "iniciar" },
      pricings_table: "Tabela de Pre\u00e7os",
      professional_skills: "habilidades profissionais",
      profile: "Perfil",
      recent_blog: "Blog recente",
      reported_jobs: "Trabalhos reportados",
      required_degree_level: {
        edit_required_degree_level: "Editar Grau N\u00edvel",
        name: "Nome",
        new_required_degree_level: "Nova Grau N\u00edvel",
        no_degree_level_available:
          "Nenhum n\u00edvel de gradua\u00e7\u00e3o dispon\u00edvel",
        no_degree_level_found:
          "Nenhum n\u00edvel de gradua\u00e7\u00e3o encontrado",
        show_required_degree_level: "Grau N\u00edvel",
      },
      required_degree_levels: "N\u00edveis de gradua\u00e7\u00e3o",
      resume: "Curr\u00edculos",
      resumes: {
        candidate_name: "nome do candidato",
        file: "Arquivo",
        name: "Nome",
        no_resume_available: "Nenhum curr\u00edculo dispon\u00edvel",
        no_resume_found: "Nenhum curr\u00edculo encontrado",
        resume_name: "Nome do arquivo",
      },
      salary_currencies: "Sal\u00e1rio Moedas",
      salary_currency: {
        currency_code: "C\u00f3digo da moeda",
        currency_icon: "\u00cdcone de moeda",
        currency_name: "Moeda Nome",
        edit_salary_currency: "Alterar moeda de sal\u00e1rio",
        new_salary_currency: "Nova moeda salarial",
        no_salary_currency_available: "Sem Sal\u00e1rio Moeda Dispon\u00edvel",
        no_salary_currency_found: "Nenhuma moeda salarial encontrada",
      },
      salary_period: {
        action: "A\u00e7ao",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_salary_period: "Editar Sal\u00e1rio Per\u00edodo",
        new_salary_period: "Nova Sal\u00e1rio Per\u00edodo",
        no_salary_period_available:
          "Nenhum per\u00edodo salarial dispon\u00edvel",
        no_salary_period_found: "Nenhum per\u00edodo salarial encontrado",
        period: "Per\u00edodo",
        salary_period_detail: "Detalhes do per\u00edodo salarial",
        size: "Tamanho",
      },
      salary_periods: "Per\u00edodos salariais",
      see_all_plans: "Ver todos os planos",
      selected_candidate: "Candidato Selecionado",
      setting: {
        about_us: "Sobre Nas",
        address: "Endere\u00e7o",
        application_name: "Nome da Aplica\u00e7\u00e3o",
        choose: "Escolher",
        company_description: "Companhia Descri\u00e7\u00e3o",
        company_url: "url da empresa",
        configuration_update: "Atualiza\u00e7\u00e3o de configura\u00e7\u00e3o",
        cookie: "Biscoito",
        disable_cookie: "Desativar Cookie",
        disable_edit: "Desativar edi\u00e7\u00e3o",
        email: "O email",
        enable_cookie: "Habilitar Cookie",
        enable_edit: "Habilitar Editar",
        enable_google_recaptcha:
          "Ative o Google reCAPTCHA for Employers, o registro de candidatos e a tela Fale conosco.",
        facebook: "Facebook",
        facebook_app_id: "Facebook App ID",
        facebook_app_secret: "Segredo do aplicativo do Facebook",
        facebook_redirect: "Redirecionamento do Facebook",
        facebook_url: "URL Facebook",
        favicon: "Favicon",
        front_settings: "Frente Configura\u00e7\u00f5es",
        general: "Geral",
        google: "Google",
        google_client_id: "ID do cliente do Google",
        google_client_secret: "Segredo do cliente Google",
        google_plus_url: "URL do Google+",
        google_redirect: "Redirecionamento do Google",
        image_validation: "A imagem deve ser de pixel 90 x 60.",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Id",
        linkedin_client_secret: "Segredo do cliente LinkedIn",
        linkedin_url: "URL do Linkedin",
        logo: "Logotipo",
        mail: "Correspond\u00eancia",
        mail__from_address: "Endere\u00e7o de correio",
        mail_host: "Host de correio",
        mail_mailer: "Mail Mailer",
        mail_password: "Senha de correio",
        mail_port: "Mail Port",
        mail_username: "Nome de usu\u00e1rio do correio",
        notification_settings:
          "Configura\u00e7\u00f5es de notifica\u00e7\u00e3o",
        paypal: "Paypal",
        paypal_client_id: "ID do cliente Paypal",
        paypal_secret: "Segredo do Paypal",
        phone: "telefone",
        privacy_policy: "Pol\u00edtica de Privacidade",
        pusher: "Empurrador",
        pusher_app_cluster: "Pusher App Cluster",
        pusher_app_id: "ID do aplicativo Pusher",
        pusher_app_key: "Chave do aplicativo Pusher",
        pusher_app_secret: "Segredo do aplicativo Pusher",
        social_settings: "Social Configura\u00e7\u00f5es",
        stripe: "Listra",
        stripe_key: "Stripe Key",
        stripe_secret_key: "Chave secreta Stripe",
        stripe_webhook_key: "Chave Stripe Webhook",
        terms_conditions: "TTermos e Condi\u00e7\u00f5es",
        twitter_url: "URL do Twitter",
        update_application_configuration:
          "Voc\u00ea est\u00e1 prestes a atualizar os valores de configura\u00e7\u00e3o do aplicativo, deseja continuar?",
      },
      settings: "Configura\u00e7\u00f5es",
      skill: {
        action: "A\u00e7\u00e3o",
        add: "Adicionar",
        description: "Descri\u00e7\u00e3o",
        edit_skill: "Editar habilidade",
        name: "Nome",
        new_skill: "Nova habilidade",
        no_skill_available: "Nenhuma habilidade dispon\u00edvel",
        no_skill_found: "Nenhuma habilidade encontrada",
        show_skill: "Habilidade",
        skill_detail: "Detalhes de habilidade",
      },
      skills: "Habilidades",
      social_media: "M\u00eddia social",
      social_settings: "Configura\u00e7\u00f5es sociais",
      state: {
        country_name: "Em nome do pais",
        edit_state: "Editar Estado",
        new_state: "Novo Estado",
        no_state_available: "Nenhum estado dispon\u00edvel",
        no_state_found: "Nenhum estado encontrado",
        state_name: "Nome do Estado",
        states: "Estados",
      },
      subscribers: "Assinantes",
      subscriptions_plans: "planos de assinaturas",
      testimonial: {
        customer_image: "Imagem do cliente",
        customer_name: "Nome do cliente",
        description: "Descri\u00e7\u00e3o",
        edit_testimonial: "Editar depoimento",
        new_testimonial: "Novo depoimento",
        no_testimonial_available: "Nenhum depoimento dispon\u00edvel",
        no_testimonial_found: "Nenhum testemunho encontrado",
        testimonial: "Depoimento",
        testimonial_detail: "Detalhes de depoimento",
        testimonials: "Depoimentos",
      },
      testimonials: "Depoimentos",
      tooltip: {
        change_app_logo: "Alterar logotipo do aplicativo",
        change_favicon: "Alterar favicon",
        change_home_banner: "Alterar banner inicial",
        change_image: "Alterar imagem",
        change_profile: "alterar arquivo de configura\u00e7\u00e3o",
        copy_preview_link: "Copiar link de visualiza\u00e7\u00e3o",
      },
      transaction: {
        approved: "Aprovado",
        denied: "Negado",
        invoice: "Fatura",
        payment_approved: "Status do pagamento",
        plan_name: "Nome do Plano",
        select_manual_payment: "Selecione o pagamento manual",
        subscription_id: "ID de Inscri\u00e7\u00e3o",
        transaction_date: "Data de Transa\u00e7\u00e3o",
        type: "Modelo",
        user_name: "Nome do Empregador",
      },
      transactions: "Transa\u00e7\u00f5es",
      translation_manager: "Gerente de Tradu\u00e7\u00e3o",
      user: {
        change_password: "mudan\u00e7a Senha",
        edit_profile: "Editar Perfil",
        email: "O email",
        first_name: "Primeira Nome",
        last_name: "\u00daltima Nome",
        logout: "Sair",
        name: "Nome",
        password: "Senha",
        password_confirmation: "confirme Senha",
        phone: "telefone",
        required_field_messages:
          "Por favor, preencha todos os campos obrigat\u00f3rios.",
        user_name: "Nome do usu\u00e1rio",
      },
      user_language: {
        change_language: "mudan\u00e7a L\u00edngua",
        language: "L\u00edngua",
      },
      weekdays: {
        fri: "SEX",
        mon: "SEG",
        sat: "Sentado",
        sun: "SOL",
        thu: "QUI",
        tue: "TER",
        wed: "QUA",
      },
      your_cv: "Seu curr\u00edculo",
    },
    "pt.pagination": {
      next: "Pr\u00f3xima &raquo;",
      previous: "&laquo; Anterior",
    },
    "pt.validation": {
      accepted: "O :attribute deve ser aceito.",
      active_url: "O :attribute n\u00e3o \u00e9 um URL v\u00e1lido.",
      after: "O :attribute deve ser uma data depois :date.",
      after_or_equal:
        "O :attribute deve ser uma data posterior ou igual a :date.",
      alpha: "O :attribute pode conter apenas letras.",
      alpha_dash:
        "O :attribute pode conter apenas letras, n\u00fameros, tra\u00e7os e sublinhados.",
      alpha_num: "O :attribute pode conter apenas letras e n\u00fameros.",
      array: "O :attribute deve ser uma matriz.",
      attributes: [],
      before: "O :attribute deve ser uma data antes :date.",
      before_or_equal:
        "O :attribute deve ser uma data anterior ou igual a :date.",
      between: {
        array: "O :attribute deve estar entre :min e :max Itens.",
        file: "O :attribute deve estar entre :min e :max kilobytes.",
        numeric: "O :attribute deve estar entre :min e :max.",
        string: "O :attribute deve estar entre :min e :max personagens.",
      },
      boolean: "O :attribute O campo deve ser verdadeiro ou falso.",
      confirmed: "O :attribute confirma\u00e7\u00e3o n\u00e3o corresponde.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "O :attribute n\u00e3o \u00e9 uma data v\u00e1lida.",
      date_equals: "O :attribute deve ser uma data igual a :date.",
      date_format: "O :attribute n\u00e3o corresponde ao formato :format.",
      different: "O :attribute e :other deve ser diferente.",
      digits: "O :attribute devemos ser :digits d\u00edgitos.",
      digits_between: "O :attribute deve estar entre :min e :max d\u00edgitos.",
      dimensions: "O :attribute tem dimens\u00f5es de imagem inv\u00e1lidas.",
      distinct: "O :attribute campo tem um valor duplicado.",
      email: "O :attribute Deve ser um endere\u00e7o de e-mail v\u00e1lido.",
      ends_with: "O :attribute deve terminar com um dos seguintes: :values.",
      exists: "O selecionada :attribute \u00e9 inv\u00e1lido.",
      file: "O :attribute deve ser um arquivo",
      filled: "O :attribute O campo deve ter um valor.",
      gt: {
        array: "O :attribute deve ser maior que :value Itens.",
        file: "O :attribute deve ser maior que :value kilobytes.",
        numeric: "O :attribute deve ser maior que :value.",
        string: "O :attribute deve ser maior que :value personagens.",
      },
      gte: {
        array: "O :attribute deve ter :value itens ou mais.",
        file: "O :attribute deve ser maior ou igual :value kilobytes.",
        numeric: "O :attribute deve ser maior ou igual :value.",
        string: "O :attribute deve ser maior ou igual :value personagens.",
      },
      image: "O :attribute deve ser uma imagem.",
      in: "O selecionada :attribute \u00e9 inv\u00e1lido.",
      in_array: "O :attribute campo n\u00e3o existe em :other.",
      integer: "O :attribute deve ser um n\u00famero inteiro.",
      ip: "O :attribute deve ser um endere\u00e7o IP v\u00e1lido.",
      ipv4: "O :attribute deve ser um endere\u00e7o IPv4 v\u00e1lido.",
      ipv6: "O :attribute deve ser um endere\u00e7o IPv6 v\u00e1lido.",
      json: "O :attribute deve ser uma sequ\u00eancia JSON v\u00e1lida.",
      lt: {
        array: "O :attribute deve ser menor que :value Itens.",
        file: "O :attribute deve ser menor que :value kilobytes.",
        numeric: "O :attribute deve ser menor que :value.",
        string: "O :attribute deve ser menor que :value personagens.",
      },
      lte: {
        array: "O :attribute deve ser menor ou igual :value Itens.",
        file: "O :attribute deve ser menor ou igual :value kilobytes.",
        numeric: "O :attribute deve ser menor ou igual :value.",
        string: "O :attribute deve ser menor ou igual :value personagens.",
      },
      max: {
        array: "O :attribute n\u00e3o pode ser maior que :max Itens.",
        file: "O :attribute n\u00e3o pode ser maior que :max kilobytes.",
        numeric: "O :attribute n\u00e3o pode ser maior que :max.",
        string: "O :attribute n\u00e3o pode ser maior que :max personagens.",
      },
      mimes: "O :attribute deve ser um arquivo do tipo: :values.",
      mimetypes: "O :attribute deve ser um arquivo do tipo: :values.",
      min: {
        array: "O :attribute deve ter pelo menos :min Itens.",
        file: "O :attribute deve ser pelo menos :min kilobytes.",
        numeric: "O :attribute deve ser pelo menos :min.",
        string: "O :attribute deve ser pelo menos :min personagens.",
      },
      not_in: "O selecionada :attribute \u00e9 inv\u00e1lido.",
      not_regex: "O :attribute formato \u00e9 inv\u00e1lido.",
      numeric: "O :attribute deve ser um n\u00famero.",
      password: "O password est\u00e1 incorreto.",
      present: "O :attribute campo deve estar presente.",
      regex: "O :attribute formato inv\u00e1lido.",
      required: "O :attribute campo \u00e9 obrigat\u00f3rio.",
      required_if:
        "O :attribute campo \u00e9 obrigat\u00f3rio quando :other \u00e9 :value.",
      required_unless:
        "O :attribute campo \u00e9 obrigat\u00f3rio, a menos que :other \u00e9 no :values.",
      required_with:
        "O :attribute campo \u00e9 obrigat\u00f3rio quando :values \u00e9 presente.",
      required_with_all:
        "O :attribute campo \u00e9 obrigat\u00f3rio quando :values est\u00e3o presentes.",
      required_without:
        "O :attribute campo \u00e9 obrigat\u00f3rio quando :values \u00e9 n\u00e3o presente.",
      required_without_all:
        "O :attribute campo \u00e9 obrigat\u00f3rio quando nenhum dos :values est\u00e3o presentes.",
      same: "O :attribute e :other deve combinar.",
      size: {
        array: "O :attribute deve conter :size Itens.",
        file: "O :attribute devemos ser :size kilobytes.",
        numeric: "O :attribute devemos ser :size.",
        string: "O :attribute devemos ser :size personagens.",
      },
      starts_with:
        "O :attribute deve come\u00e7ar com um dos seguintes: :values.",
      string: "O :attribute deve ser uma string.",
      timezone: "O :attribute deve ser uma zona v\u00e1lida.",
      unique: "O :attribute j\u00e1 foi tomada.",
      uploaded: "O :attribute falha ao carregar.",
      url: "O :attribute formato inv\u00e1lido.",
      uuid: "O :attribute deve ser um UUID v\u00e1lido.",
    },
    "ru.messages": {
      about_us: "\u041e \u043d\u0430\u0441",
      about_us_services:
        "\u041e \u043d\u0430\u0441 \u0423\u0441\u043b\u0443\u0433\u0438",
      admin_dashboard: {
        Feature_employers:
          "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        active_jobs:
          "\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u044b",
        active_users:
          "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
        feature_employers_incomes:
          "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435 \u0434\u043e\u0445\u043e\u0434\u044b \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435\u0439",
        featured_employers:
          "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        featured_jobs:
          "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u044b",
        featured_jobs_incomes:
          "\u0414\u043e\u0445\u043e\u0434\u044b \u043e\u0442 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        post_statistics:
          "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        recent_candidates:
          "\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
        recent_employers:
          "\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        recent_jobs:
          "\u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0440\u0430\u0431\u043e\u0442\u044b",
        registered_candidates:
          "\u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
        registered_employer:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        subscription_incomes:
          "\u0414\u043e\u0445\u043e\u0434\u044b \u043e\u0442 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438",
        today_jobs:
          "C\u0435\u0433\u043e\u0434\u043d\u044f \u0440\u0430\u0431\u043e\u0442\u044b",
        total_active_jobs:
          "\u0412\u0441\u0435\u0433\u043e \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        total_candidates:
          "\u0412\u0441\u0435\u0433\u043e \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432",
        total_employers:
          "\u0412\u0441\u0435\u0433\u043e \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435\u0439",
        total_users:
          "\u041e\u0431\u0449\u0435\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439",
        verified_users:
          "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439",
        weekly_users:
          "\u0415\u0436\u0435\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
      },
      all_resumes: "\u0412\u0441\u0435 \u0440\u0435\u0437\u044e\u043c\u0435",
      all_rights_reserved: "Todos os direitos reservados",
      applied_job: {
        applied_jobs:
          "\u043f\u0440\u0438\u043a\u043b\u0430\u0434\u043d\u043e\u0439 \u0440\u0430\u0431\u043e\u0442\u044b",
        companies: "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        job: "\u0440\u0430\u0431\u043e\u0442\u0430",
        notes: "\u041d\u043e\u0442\u044b",
      },
      apply_job: {
        apply_job:
          "\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0443",
        notes: "\u041d\u043e\u0442\u044b",
        resume: "\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c",
      },
      blog_categories:
        "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0431\u043b\u043e\u0433\u043e\u0432",
      blogs: "Blogs",
      branding_slider: {
        brand: "\u041c\u0430\u0440\u043a\u0430",
        edit_branding_slider:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0431\u0440\u0435\u043d\u0434\u0438\u043d\u0433\u0430",
        new_branding_slider:
          "\u041d\u043e\u0432\u044b\u0439 \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0431\u0440\u0435\u043d\u0434\u0438\u043d\u0433\u0430",
        no_branding_slider_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u0430 \u0431\u0440\u0435\u043d\u0434\u0438\u043d\u0433\u0430",
        no_branding_slider_found:
          "\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0431\u0440\u0435\u043d\u0434\u0438\u043d\u0433\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
      },
      branding_sliders:
        "\u0411\u0440\u0435\u043d\u0434\u043e\u0432\u044b\u0435 \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u044b ",
      brands: "\u0411\u0440\u0435\u043d\u0434\u044b",
      candidate: {
        address: "\u0410\u0434\u0440\u0435\u0441",
        admins: "\u0410\u0434\u043c\u0438\u043d\u044b",
        already_reported:
          "\u0423\u0436\u0435 \u0441\u043e\u043e\u0431\u0449\u0430\u043b\u043e\u0441\u044c",
        available_at:
          "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u043d\u0430",
        birth_date:
          "\u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u0414\u0430\u0442\u0430",
        candidate_details:
          "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438",
        candidate_language: "\u042f\u0437\u044b\u043a\u0438",
        candidate_skill: "\u0423\u043c\u0435\u043d\u0438\u0435",
        candidates: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
        career_level:
          "\u041a\u0430\u0440\u044c\u0435\u0440\u0430 \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        conform_password:
          "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u044c",
        current_salary:
          "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430",
        dashboard:
          "\u041f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u0438\u0431\u043e\u0440\u043e\u0432",
        edit_admin:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430",
        edit_candidate:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        edit_profile_information:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f",
        education_not_found:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f.",
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        email_verified:
          "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0430\u044f \u043f\u043e\u0447\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430",
        employee: "\u0420\u0430\u0431\u043e\u0442\u043d\u0438\u043a",
        expected_salary:
          "\u041e\u0436\u0438\u0434\u0430\u0435\u043c\u0430\u044f \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430",
        experience: "\u041e\u043f\u044b\u0442",
        experience_not_found:
          "\u041d\u0435\u0442 \u043e\u043f\u044b\u0442\u0430.",
        expired_job:
          "\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f \u0441 \u0438\u0441\u0442\u0435\u043a\u0448\u0438\u043c \u0441\u0440\u043e\u043a\u043e\u043c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f",
        father_name:
          "\u041e\u0442\u0435\u0446 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        first_name:
          "\u041f\u0435\u0440\u0432\u044b\u0439 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        functional_area:
          "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u041f\u043b\u043e\u0449\u0430\u0434\u044c",
        gender: "\u041f\u043e\u043b",
        immediate_available:
          "\u043d\u0435\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u044b\u0439 \u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0439",
        in_year: "\u0413\u043e\u0434\u0430\u043c\u0438",
        industry:
          "\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
        is_active:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
        is_verified:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439",
        job_alert_message:
          "\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u0435 \u043c\u043d\u0435 \u043f\u043e \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u0435, \u043a\u043e\u0433\u0434\u0430 \u0431\u0443\u0434\u0443\u0442 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u044b \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438, \u0438\u043c\u0435\u044e\u0449\u0438\u0435 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a \u043c\u043e\u0435\u043c\u0443 \u0432\u044b\u0431\u043e\u0440\u0443.",
        last_name:
          "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        marital_status:
          "\u0441\u0443\u043f\u0440\u0443\u0436\u0435\u0441\u043a\u0438\u0439 \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
        national_id_card:
          "\u043d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u041c\u041d\u0415 \u0411\u042b \u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0430",
        nationality:
          "\u041d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
        new_admin:
          "\u041d\u043e\u0432\u044b\u0439 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440",
        new_candidate:
          "\u043d\u043e\u0432\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        no_candidate_available:
          "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442",
        no_candidate_found:
          "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        no_reported_candidates_available:
          "\u041d\u0435\u0442 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u043e \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0435",
        no_reported_candidates_found:
          "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0435 \u043e\u0431\u043d\u0430\u0440\u0443\u0436\u0435\u043d",
        not_immediate_available:
          "\u041d\u0435 \u043d\u0435\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u044b\u0439 \u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0439",
        password: "\u043f\u0430\u0440\u043e\u043b\u044c",
        phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
        profile: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c",
        reporte_to_candidate:
          "\u0414\u043e\u043a\u043b\u0430\u0434 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430\u043c",
        reported_candidate:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        reported_candidate_detail:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u043d\u043e\u043c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0435",
        reported_candidates:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
        reported_employer:
          "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c",
        resume_not_found:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0440\u0435\u0437\u044e\u043c\u0435.",
        salary_currency:
          "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u0432\u0430\u043b\u044e\u0442\u0430",
        salary_per_month:
          "\u0417\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u0430\u044f \u043f\u043b\u0430\u0442\u0430 \u0432 \u043c\u0435\u0441\u044f\u0446.",
      },
      candidate_dashboard: {
        followings: "\u041f\u043e\u0434\u043f\u0438\u0441\u043e\u043a",
        location_information:
          "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u043c\u0435\u0441\u0442\u043e\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0438 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.",
        my_cv_list:
          "\u041c\u043e\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0440\u0435\u0437\u044e\u043c\u0435",
        no_not_available:
          "\u041d\u043e\u043c\u0435\u0440 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d.",
        profile_views:
          "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b \u043f\u0440\u043e\u0444\u0438\u043b\u044f",
      },
      candidate_profile: {
        add_education:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435",
        add_experience:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u041e\u043f\u044b\u0442",
        age: "\u0412\u043e\u0437\u0440\u0430\u0441\u0442",
        company: "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        currently_working:
          "\u0412 \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0420\u0430\u0431\u043e\u0442\u0430\u0435\u0442",
        degree_level:
          "\u0421\u0442\u0435\u043f\u0435\u043d\u044c \u0423\u0440\u043e\u0432\u0435\u043d\u044c",
        degree_title:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0441\u0442\u0435\u043f\u0435\u043d\u0438",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_education:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435",
        edit_experience:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041e\u043f\u044b\u0442",
        education:
          "\u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435",
        end_date: "\u041a\u043e\u043d\u0435\u0446 \u0414\u0430\u0442\u0430",
        experience: "\u041e\u043f\u044b\u0442",
        experience_title:
          "\u041e\u043f\u044b\u0442 \u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
        institute: "\u0438\u043d\u0441\u0442\u0438\u0442\u0443\u0442",
        online_profile:
          "\u041e\u043d\u043b\u0430\u0439\u043d-\u043f\u0440\u043e\u0444\u0438\u043b\u044c",
        present:
          "\u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0435\u0435 \u0432\u0440\u0435\u043c\u044f",
        result: "\u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442",
        select_year:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043e\u0434",
        start_date:
          "\u041d\u0430\u0447\u0430\u043b\u043e \u0414\u0430\u0442\u0430",
        title: "\u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
        upload_resume:
          "\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0435\u0437\u044e\u043c\u0435",
        work_experience:
          "\u043e\u043f\u044b\u0442 \u0440\u0430\u0431\u043e\u0442\u044b",
        year: "\u0413\u043e\u0434",
        years: "\u0413\u043e\u0434\u044b",
      },
      candidates: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
      career_informations:
        "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u043a\u0430\u0440\u044c\u0435\u0440\u0435",
      career_level: {
        edit_career_level:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041a\u0430\u0440\u044c\u0435\u0440\u0430 \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        level_name:
          "\u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_career_level:
          "\u043d\u043e\u0432\u044b\u0439 \u041a\u0430\u0440\u044c\u0435\u0440\u0430 \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        no_career_level_available:
          "\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_career_level_found:
          "\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
      },
      career_levels:
        "\u0423\u0440\u043e\u0432\u043d\u0438 \u043a\u0430\u0440\u044c\u0435\u0440\u044b",
      city: {
        cities: "\u0413\u043e\u0440\u043e\u0434\u0430",
        city_name:
          "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0433\u043e\u0440\u043e\u0434\u0430",
        edit_city:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0433\u043e\u0440\u043e\u0434",
        new_city:
          "\u041d\u043e\u0432\u044b\u0439 \u0433\u043e\u0440\u043e\u0434",
        no_city_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0433\u043e\u0440\u043e\u0434\u043e\u0432",
        no_city_found:
          "\u0413\u043e\u0440\u043e\u0434 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        state_name:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0448\u0442\u0430\u0442\u0430",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one:
          "\u041e \u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u041e\u0434\u0438\u043d",
        about_desc_three:
          "\u041e \u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0422\u0440\u0438",
        about_desc_two:
          "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0414\u0432\u0430",
        about_image_one:
          "\u041e \u043f\u0435\u0440\u0432\u043e\u043c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0438",
        about_image_three:
          "\u041e\u0431 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0438 \u0442\u0440\u0438",
        about_image_two:
          "\u041e\u0431 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0438 \u0434\u0432\u0430",
        about_title_one:
          "\u041e \u043f\u0435\u0440\u0432\u043e\u043c \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0435",
        about_title_three:
          "\u041e \u0442\u0440\u0435\u0442\u044c\u0435\u043c \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0435",
        about_title_two:
          "\u041e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0438 \u0434\u0432\u0430",
      },
      cms_service: {
        choose: "\u0412\u044b\u0431\u0438\u0440\u0430\u0442\u044c",
        home_banner:
          "\u0414\u043e\u043c\u0430\u0448\u043d\u0438\u0439 \u0431\u0430\u043d\u043d\u0435\u0440",
        home_description:
          "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        home_title:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0434\u043e\u043c\u0430",
      },
      cms_services: "CMS-\u0441\u0435\u0440\u0432\u0438\u0441\u044b",
      cms_sliders: "\u0421\u043b\u0430\u0439\u0434\u0435\u0440\u044b CMS",
      common: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        active: "\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        admin_name:
          "\u0418\u043c\u044f \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430",
        all: "\u0412\u0441\u0435",
        and_time: "\u0438 \u0432\u0440\u0435\u043c\u044f",
        applied:
          "\u041f\u0440\u0438\u043c\u0435\u043d\u044f\u0435\u043c\u044b\u0439",
        applied_on: "\u041f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u043e",
        apply:
          "\u041f\u043e\u0434\u0430\u0442\u044c \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435",
        approved_by:
          "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e",
        are_you_sure:
          "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e",
        are_you_sure_want_to_delete:
          "\u0412\u044b \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e?",
        are_you_sure_want_to_reject:
          "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c \u044d\u0442\u043e",
        are_you_sure_want_to_select:
          "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u044d\u0442\u043e",
        back: "\u043d\u0430\u0437\u0430\u0434",
        cancel: "\u041e\u0442\u043c\u0435\u043d\u0430",
        category_image:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
        choose: "\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435",
        choose_file:
          "\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043b",
        close: "\u0431\u043b\u0438\u0437\u043a\u043e",
        completed:
          "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u044b\u0439",
        copyright:
          "\u0430\u0432\u0442\u043e\u0440\u0441\u043a\u043e\u0435 \u043f\u0440\u0430\u0432\u043e",
        created_date:
          "\u0414\u0430\u0442\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044f",
        created_on:
          "\u0441\u043e\u0437\u0434\u0430\u043d\u043d\u044b\u0439 \u041d\u0430",
        custom: "\u041e\u0431\u044b\u0447\u0430\u0439",
        de_active: "\u0412\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430",
        decline: "\u0441\u043d\u0438\u0436\u0435\u043d\u0438\u0435",
        declined:
          "\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043d\u044b\u0439",
        default_country_code:
          "\u041a\u043e\u0434 \u0441\u0442\u0440\u0430\u043d\u044b \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e",
        delete: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
        deleted: "\u0423\u0434\u0430\u043b\u0435\u043d\u043e",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        design_by: "\u0434\u0438\u0437\u0430\u0439\u043d \u041f\u043e",
        design_by_name: "InfyOm Labs.",
        download: "\u0421\u043a\u0430\u0447\u0430\u0442\u044c",
        drafted: "\u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e",
        edit: "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        error: "\u041e\u0448\u0438\u0431\u043a\u0430",
        expire:
          "\u0421\u0440\u043e\u043a \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f",
        export_excel: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0432 Excel",
        female: "\u0436\u0435\u043d\u0441\u043a\u0438\u0439",
        filter_options:
          "\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u0444\u0438\u043b\u044c\u0442\u0440\u0430",
        filters: "\u0424\u0438\u043b\u044c\u0442\u0440\u044b",
        from: "\u0418\u0437",
        has_been_deleted: "\u0443\u0434\u0430\u043b\u0435\u043d.",
        has_been_rejected:
          "\u0431\u044b\u043b\u0430 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0430.",
        has_been_selected:
          "\u0431\u044b\u043b \u0432\u044b\u0431\u0440\u0430\u043d.",
        hello: "\u041f\u0440\u0438\u0432\u0435\u0442",
        hi: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439",
        hired: "\u041d\u0430\u0435\u043c\u043d\u044b\u0439",
        image_aspect_ratio:
          "\u0421\u043e\u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u0441\u0442\u043e\u0440\u043e\u043d \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c 1: 1.",
        image_file_type:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b\u043e\u043c \u0442\u0438\u043f\u0430: jpeg, jpg, png.",
        last_change_by:
          "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f",
        last_updated:
          "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0439",
        live: "\u0416\u0438\u0442\u044c",
        login:
          "\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u0442\u044c\u0441\u044f",
        male: "\u043c\u0443\u0436\u0447\u0438\u043d\u0430",
        "n/a": "N/A",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        no: "\u043d\u0435\u0442",
        no_cancel:
          "\u041d\u0435\u0442, \u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c",
        not_verified:
          "\u041d\u0435 \u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439",
        note: "\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435",
        note_message:
          "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u0440\u0430\u0442\u043a\u0438\u0439 \u043a\u043e\u0434 \u044f\u0437\u044b\u043a\u0430. \u0442\u043e \u0435\u0441\u0442\u044c \u0430\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 = en.",
        ok: "OK",
        ongoing:
          "\u041d\u0435\u043f\u0440\u0435\u0440\u044b\u0432\u043d\u044b\u0439",
        open: "\u043e\u0442\u043a\u0440\u044b\u0442\u043e",
        pause: "\u041f\u0430\u0443\u0437\u0430",
        paused:
          "\u041f\u0440\u0438\u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043e",
        preview:
          "\u041f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
        print:
          "\u0420\u0430\u0441\u043f\u0435\u0447\u0430\u0442\u0430\u0442\u044c",
        process: "\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430...",
        reason: "\u041f\u0440\u0438\u0447\u0438\u043d\u0430",
        register: "\u0440\u0435\u0433\u0438\u0441\u0442\u0440",
        rejected:
          "\u043e\u0442\u0432\u0435\u0440\u0433\u043d\u0443\u0442\u043e",
        report: "\u043e\u0442\u0447\u0435\u0442",
        resend_verification_mail:
          "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u0438\u0441\u044c\u043c\u043e \u0441 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435\u043c \u0435\u0449\u0435 \u0440\u0430\u0437",
        reset:
          "\u0421\u0431\u0440\u043e\u0441 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043a",
        save: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c",
        save_as_draft:
          "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043a\u0430\u043a \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a",
        saved_successfully:
          " \u0423\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e",
        search: "\u041f\u043e\u0438\u0441\u043a",
        select_job_stage:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u044d\u0442\u0430\u043f \u0440\u0430\u0431\u043e\u0442\u044b",
        selected: "\u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439",
        shortlist: "\u0428\u043e\u0440\u0442",
        show: "\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c",
        status:
          "\u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
        success: " \u0423\u0441\u043f\u0435\u0448\u043d\u044b\u0439",
        to: "\u041a",
        updated_successfully:
          " \u0423\u0441\u043f\u0435\u0448\u043d\u043e \u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e",
        verified:
          "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439",
        view: "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c",
        view_more:
          "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0435\u0449\u0451",
        view_profile:
          "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0438\u043c\u0435\u043d\u0438",
        welcome: "\u0436\u0435\u043b\u0430\u043d\u043d\u044b\u0439",
        yes: "\u0434\u0430",
        yes_delete: "\u0414\u0430, \u0443\u0434\u0430\u043b\u0438\u0442\u044c!",
        you_cancel_slot_date:
          "\u0412\u044b \u043e\u0442\u043c\u0435\u043d\u044f\u0435\u0442\u0435 \u044d\u0442\u043e\u0442 \u0441\u043b\u043e\u0442 \u043d\u0430 \u0434\u0430\u0442\u0443",
      },
      companies: "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
      company: {
        candidate_email:
          "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        candidate_name:
          "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        candidate_phone:
          "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0422\u0435\u043b\u0435\u0444\u043e\u043d",
        ceo: "\u0418\u043c\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u0430",
        ceo_name:
          "\u0438\u043c\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u0430",
        city: "\u0433\u043e\u0440\u043e\u0434",
        company_details:
          "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438",
        company_listing:
          "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u041b\u0438\u0441\u0442\u0438\u043d\u0433",
        company_logo: "\u043b\u043e\u0433\u043e\u0442\u0438\u043f",
        company_name:
          "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        company_size: "\u0420\u0430\u0437\u043c\u0435\u0440",
        confirm_password:
          "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u044c",
        country: "\u0421\u0442\u0440\u0430\u043d\u0430",
        current_password:
          "\u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043f\u0430\u0440\u043e\u043b\u044c",
        edit_company:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        edit_employer:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        email_verified:
          "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0430\u044f \u043f\u043e\u0447\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430",
        employer:
          "\u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c",
        employer_ceo:
          "\u0413\u0435\u043d\u0435\u0440\u0430\u043b\u044c\u043d\u044b\u0439 \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        employer_details:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435",
        employer_name:
          "\u0418\u043c\u044f \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        employers:
          "\u0420\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        enter_experience_year:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u043f\u044b\u0442 \u0432 \u0433\u043e\u0434\u0443",
        established_in:
          "\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0439 \u0412",
        established_year:
          "\u0433\u043e\u0434 \u043e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u044f",
        facebook_url: "URL-\u0430\u0434\u0440\u0435\u0441 Facebook",
        fax: "\u0444\u0430\u043a\u0441",
        followers: "\u0427\u0438\u0442\u0430\u044e\u0442",
        google_plus_url:
          "URL-\u0430\u0434\u0440\u0435\u0441 Google \u041f\u043b\u044e\u0441",
        image:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
        industry:
          "\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
        is_active:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
        is_featured:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435",
        linkedin_url: "URL-\u0430\u0434\u0440\u0435\u0441 LinkedIn",
        location:
          "\u0420\u0430\u0441\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435",
        location2:
          "\u0420\u0430\u0441\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 2-\u0433\u043e \u043e\u0444\u0438\u0441\u0430",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_company:
          "\u043d\u043e\u0432\u044b\u0439 \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        new_employer:
          "\u041d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c",
        new_password:
          "\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c",
        no_employee_found:
          "\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        no_employee_reported_available:
          "\u041d\u0435\u0442 \u043e\u0442\u0447\u0435\u0442\u043e\u0432 \u043e \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430\u0445",
        no_employer_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432",
        no_of_offices:
          "\u041d\u0435\u0442 \u043e\u0444\u0438\u0441\u043e\u0432",
        no_reported_employer_found:
          "\u0420\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c, \u043e \u043a\u043e\u0442\u043e\u0440\u043e\u043c \u0441\u043e\u043e\u0431\u0449\u0430\u044e\u0442, \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        notes: "\u0417\u0430\u043c\u0435\u0442\u043a\u0438",
        offices: "\u041e\u0444\u0438\u0441\u044b",
        ownership_type:
          "\u0412\u043b\u0430\u0434\u0435\u043d\u0438\u0435 \u0422\u0438\u043f",
        password: "\u043f\u0430\u0440\u043e\u043b\u044c",
        pinterest_url: "URL-\u0430\u0434\u0440\u0435\u0441 Pinterest",
        report_to_company:
          "\u043e\u0442\u0447\u0435\u0442 \u043e\u0442\u0447\u0435\u0442 \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        reported_by: "\u0421\u043e\u043e\u0431\u0449\u0430\u0435\u0442",
        reported_companies:
          "\u0441\u043e\u043e\u0431\u0449\u0430\u0435\u0442\u0441\u044f \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        reported_company:
          "\u0441\u043e\u043e\u0431\u0449\u0430\u0435\u0442\u0441\u044f \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        reported_employer_detail:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u043e\u043c \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435",
        reported_employers:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
        reported_on: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043e",
        select_career_level:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b",
        select_city:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043e\u0440\u043e\u0434",
        select_company:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e",
        select_company_size:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        select_country:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0443",
        select_currency:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0430\u043b\u044e\u0442\u0443",
        select_degree_level:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438",
        select_employer_size:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        select_established_year:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043e\u0434 \u043e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u044f",
        select_functional_area:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0443\u044e \u0437\u043e\u043d\u0443",
        select_gender:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u043b",
        select_industry:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043e\u0442\u0440\u0430\u0441\u043b\u044c",
        select_job_category:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044e \u0440\u0430\u0431\u043e\u0442\u044b",
        select_job_shift:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043c\u0435\u043d\u0443 \u0440\u0430\u0431\u043e\u0442\u044b",
        select_job_type:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043f \u0440\u0430\u0431\u043e\u0442\u044b",
        select_language:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u044f\u0437\u044b\u043a",
        select_marital_status:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435",
        select_ownership_type:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043f \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
        select_position:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0437\u0438\u0446\u0438\u044e",
        select_salary_period:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b",
        select_state:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0448\u0442\u0430\u0442",
        state:
          "\u0433\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043e",
        title:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0442\u044b",
        twitter_url: "URL-\u0430\u0434\u0440\u0435\u0441 Twitter",
        website:
          "\u0418\u043d\u0442\u0435\u0440\u043d\u0435\u0442 \u0441\u0430\u0439\u0442",
      },
      company_size: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        company_size:
          "\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        edit_company_size:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0420\u0430\u0437\u043c\u0435\u0440",
        new_company_size:
          "\u043d\u043e\u0432\u044b\u0439 \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0420\u0430\u0437\u043c\u0435\u0440",
        no_company_size_available:
          "\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_company_size_found:
          "\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        show_company_size:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f",
        size: "\u0420\u0430\u0437\u043c\u0435\u0440",
      },
      company_sizes:
        "\u0420\u0430\u0437\u043c\u0435\u0440\u044b \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
      country: {
        countries: "\u0421\u0442\u0440\u0430\u043d\u044b",
        country_name: "\u0418\u043c\u044f \u0441\u0442\u0440\u0430\u043d\u044b",
        edit_country:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u0442\u0440\u0430\u043d\u0443",
        new_country:
          "\u041d\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0430",
        no_country_available:
          "\u0421\u0442\u0440\u0430\u043d\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_country_found:
          "\u0421\u0442\u0440\u0430\u043d\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        phone_code:
          "\u0422\u0435\u043b\u0435\u0444\u043e\u043d\u043d\u044b\u0439 \u043a\u043e\u0434",
        short_code:
          "\u041a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u043a\u043e\u0434",
      },
      cv_builder:
        "\u0421\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043b\u044c \u0440\u0435\u0437\u044e\u043c\u0435",
      dashboard:
        "\u041f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u0438\u0431\u043e\u0440\u043e\u0432",
      datepicker: {
        last_month:
          "\u041f\u0440\u043e\u0448\u043b\u044b\u0439 \u043c\u0435\u0441\u044f\u0446",
        last_week:
          "\u041f\u0440\u043e\u0448\u043b\u0430\u044f \u043d\u0435\u0434\u0435\u043b\u044f",
        this_month: "\u042d\u0442\u043e\u0442 \u043c\u0435\u0441\u044f\u0446",
        this_week:
          "\u041d\u0430 \u044d\u0442\u043e\u0439 \u043d\u0435\u0434\u0435\u043b\u0435",
        today: "\u0421\u0435\u0433\u043e\u0434\u043d\u044f",
      },
      email_template: {
        body: "\u0422\u0435\u043b\u043e",
        edit_email_template:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0448\u0430\u0431\u043b\u043e\u043d \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u044b",
        short_code:
          "\u0421\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u043d\u044b\u0439 \u043a\u043e\u0434",
        subject: "\u0422\u0435\u043c\u0430",
        template_name:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0448\u0430\u0431\u043b\u043e\u043d\u0430",
      },
      email_templates:
        "\u0428\u0430\u0431\u043b\u043e\u043d\u044b \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u044b",
      employer: {
        job_stage:
          "\u042d\u0442\u0430\u043f\u044b \u0440\u0430\u0431\u043e\u0442\u044b",
        job_stage_desc: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
      },
      employer_dashboard: {
        dashboard:
          "\u041f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u0438\u0431\u043e\u0440\u043e\u0432",
        followers: "\u0427\u0438\u0442\u0430\u044e\u0442",
        job_applications:
          "\u0417\u0430\u044f\u0432\u043a\u0438 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443",
        open_jobs:
          "\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      },
      employer_menu: {
        closed_jobs:
          "\u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        employer_details_field:
          "\u041f\u043e\u043b\u0435 \u00ab\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435\u00bb \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f.",
        employer_profile:
          "\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        enter_description:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        enter_employer_details:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        enter_industry_details:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e\u0431 \u043e\u0442\u0440\u0430\u0441\u043b\u0438...",
        enter_ownership_details:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e \u043e\u0431 \u043e\u0431\u044a\u0435\u043a\u0442\u0435...",
        expires_on: "\u0438\u0441\u0442\u0435\u043a\u0430\u0435\u0442",
        followers: "\u0427\u0438\u0442\u0430\u044e\u0442",
        general_dashboard:
          "\u041e\u0431\u0449\u0435\u0435 \u041f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u0438\u0431\u043e\u0440\u043e\u0432",
        jobs: "\u0440\u0430\u0431\u043e\u0442\u044b",
        manage_subscriptions:
          "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0430\u043c\u0438",
        no_data_available:
          "\u0434\u0430\u043d\u043d\u044b\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b",
        paused_jobs:
          "\u043f\u0440\u0438\u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        recent_follower:
          "\u043d\u0435\u0434\u0430\u0432\u043d\u0438\u0439 \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u0442\u0435\u043b\u044c",
        recent_jobs:
          "\u043d\u0435\u0434\u0430\u0432\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        total_job_applications:
          "\u043e\u0431\u0449\u0435\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u043e \u043f\u0440\u0438\u0435\u043c\u0435 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443",
        total_jobs:
          "\u0432\u0441\u0435\u0433\u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        transactions: "\u0421\u0434\u0435\u043b\u043a\u0438",
        valid_facebook_url:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 URL-\u0430\u0434\u0440\u0435\u0441 Facebook",
        valid_google_plus_url:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 URL-\u0430\u0434\u0440\u0435\u0441 Google Plus",
        valid_linkedin_url:
          "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 URL-\u0430\u0434\u0440\u0435\u0441 Linkedin",
        valid_pinterest_url:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 URL-\u0430\u0434\u0440\u0435\u0441 Pinterest",
        valid_twitter_url:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 URL-\u0430\u0434\u0440\u0435\u0441 Twitter",
      },
      employers:
        "\u0420\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0438",
      env: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0441\u0440\u0435\u0434\u044b",
      expired_jobs:
        "\u041f\u0440\u043e\u0441\u0440\u043e\u0447\u0435\u043d\u043d\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      faq: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_faq:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c FAQ",
        faq: "\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b",
        faq_detail:
          "\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438",
        new_faq: "\u043d\u043e\u0432\u044b\u0439 FAQ",
        no_faq_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0447\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0445 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432",
        no_faq_found:
          "\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b",
        show_faq: "FAQ",
        title: "\u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
      },
      favourite_companies: "\u041f\u043e\u0434\u043f\u0438\u0441\u043e\u043a",
      favourite_jobs:
        "\u041b\u044e\u0431\u0438\u043c\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      filter_name: {
        closed: "\u0417\u0430\u043a\u0440\u044b\u0442\u043e",
        country: "\u0421\u0442\u0440\u0430\u043d\u0430",
        digital: "\u0426\u0418\u0424\u0420\u041e\u0412\u041e\u0419",
        drafted: "\u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e",
        featured_company:
          "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        featured_job:
          "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430",
        freelancer_job:
          "\u0420\u0430\u0431\u043e\u0442\u0430 \u0444\u0440\u0438\u043b\u0430\u043d\u0441\u0435\u0440\u043e\u043c",
        immediate:
          "\u041d\u0435\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u044b\u0439",
        job_status:
          "\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441",
        live: "\u0416\u0438\u0442\u044c",
        manually: "\u0412\u0420\u0423\u0427\u041d\u0423\u042e",
        paused:
          "\u041f\u0440\u0438\u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043e",
        select_featured_company:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u0443\u044e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e",
        select_featured_job:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u0443\u044e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
        select_status:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441",
        state: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",
        status: "\u0421\u0442\u0430\u0442\u0443\u0441",
        suspended_job:
          "\u041f\u0440\u0438\u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u043e\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u0435",
      },
      flash: {
        about_us_update:
          "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u043d\u0430\u0441 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430",
        admin_cant_delete:
          "\u0410\u0434\u043c\u0438\u043d \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.",
        admin_delete:
          "\u0410\u0434\u043c\u0438\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.",
        admin_save:
          "\u0410\u0434\u043c\u0438\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.",
        admin_update:
          "\u0410\u0434\u043c\u0438\u043d \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.",
        all_notification_read:
          " '\u0412\u0441\u0435 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u044b.'",
        are_you_sure_to_change_status:
          "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441?",
        assigned_slot_not_delete:
          "'\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044b\u0439 \u0441\u043b\u043e\u0442 \u043d\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0443\u0434\u0430\u043b\u044f\u0442\u044c\u0441\u044f.'",
        attention: "\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435",
        brand_delete:
          "'\u0411\u0440\u0435\u043d\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        brand_retrieved:
          " '\u0411\u0440\u0435\u043d\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        brand_save:
          "   '\u0411\u0440\u0435\u043d\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        brand_update:
          "'\u0411\u0440\u0435\u043d\u0434 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        cancel_reason_require:
          "'\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u043f\u0440\u0438\u0447\u0438\u043d\u0430 \u043e\u0442\u043c\u0435\u043d\u044b.'",
        candidate_delete:
          " '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        candidate_education_delete:
          "'\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        candidate_education_retrieved:
          " '\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043e.'",
        candidate_education_save:
          "   '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d.'",
        candidate_education_update:
          "'\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        candidate_experience_delete:
          "'\u041e\u043f\u044b\u0442 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        candidate_experience_retrieved:
          " '\u041e\u043f\u044b\u0442 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        candidate_experience_save:
          " '\u041e\u043f\u044b\u0442 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d.'",
        candidate_experience_update:
          "'\u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        candidate_not_found:
          " \u00ab\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u00bb",
        candidate_profile:
          " '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        candidate_reported:
          " '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d.'",
        candidate_retrieved:
          " '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        candidate_save:
          " '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        candidate_update:
          " '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        career_level_cant_delete:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        career_level_delete:
          "'\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        career_level_retrieved:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        career_level_save:
          "   '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d.'",
        career_level_update:
          "'\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043a\u0430\u0440\u044c\u0435\u0440\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        city_cant_delete:
          " '\u0413\u043e\u0440\u043e\u0434 \u043d\u0435\u043b\u044c\u0437\u044f \u0443\u0434\u0430\u043b\u0438\u0442\u044c.'",
        city_delete:
          "'\u0413\u043e\u0440\u043e\u0434 \u0443\u0434\u0430\u043b\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        city_retrieved:
          " '\u0413\u043e\u0440\u043e\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        city_save:
          "   '\u0413\u043e\u0440\u043e\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        city_update:
          "'\u0413\u043e\u0440\u043e\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        close_job:
          " '\u0417\u0430\u043a\u0440\u044b\u0442\u0430\u044f \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044f \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043e\u0442\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0430.'",
        cms_service_update:
          " '\u0421\u043b\u0443\u0436\u0431\u044b CMS \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b.'",
        comment_deleted:
          " '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        comment_edit:
          "  '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0438\u0437\u043c\u0435\u043d\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        comment_saved:
          " '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        comment_updated:
          "  '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        company_delete:
          " '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        company_mark_feature:
          " '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u043a\u0430\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043d\u0430\u044f.'",
        company_mark_unFeature:
          " '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u043a\u0430\u043a \u043d\u0435\u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043d\u0430\u044f.'",
        company_save:
          " '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        company_size_cant_delete:
          " '\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        company_size_delete:
          " '\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        company_size_save:
          " '\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        company_size_update:
          " '\u0420\u0430\u0437\u043c\u0435\u0440 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        company_update:
          " '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        country_cant_delete:
          " '\u0421\u0442\u0440\u0430\u043d\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        country_delete:
          " '\u0421\u0442\u0440\u0430\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        country_save:
          " '\u0421\u0442\u0440\u0430\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        country_update:
          " '\u0421\u0442\u0440\u0430\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        default_resume_already_upload:
          "\u0420\u0435\u0437\u044e\u043c\u0435 \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u0443\u0436\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e.",
        degree_level_cant_delete:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        degree_level_delete:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        degree_level_retrieve:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        degree_level_save:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        degree_level_update:
          " '\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        description_required:
          "\u041f\u043e\u043b\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e.",
        email_template:
          " '\u0428\u0430\u0431\u043b\u043e\u043d \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        email_verify:
          " '\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0430\u044f \u043f\u043e\u0447\u0442\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430.'",
        employer_profile:
          " '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        employer_update:
          " '\u0420\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        enter_cancel_reason:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0442\u043c\u0435\u043d\u044b...",
        enter_description:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        enter_notes:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u044f...",
        enter_post_description:
          "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f",
        faqs_delete:
          " '\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u044b.'",
        faqs_save:
          " '\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b.'",
        faqs_update:
          " '\u0427\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b.'",
        fav_company_delete:
          " '\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        fav_job_added:
          " '\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e.'",
        fav_job_remove:
          " '\u041b\u044e\u0431\u0438\u043c\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        fav_job_removed:
          " '\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        feature_job_price:
          " \u00ab\u0426\u0435\u043d\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439 \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 0\u00bb",
        feature_quota:
          " \u00ab\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u043a\u0432\u043e\u0442\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430\u00bb",
        featured_not_available:
          "  '\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u043a\u0432\u043e\u0442\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.'",
        file_type:
          "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b\u043e\u043c \u0442\u0438\u043f\u0430: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete:
          "'\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        functional_area_delete:
          "'\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        functional_area_save:
          "'\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        functional_area_update:
          "'\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        header_slider_deleted:
          "'\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        header_slider_save:
          "'\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        header_slider_update:
          "'\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        image_slider_delete:
          " '\u0421\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        image_slider_retrieve:
          " '\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        image_slider_save:
          " '\u0421\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        image_slider_update:
          " '\u0421\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        industry_cant_delete:
          " '\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        industry_delete:
          " '\u041e\u0442\u0440\u0430\u0441\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        industry_save:
          " '\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043f\u0430\u0441\u0435\u043d\u0430.'",
        industry_update:
          " '\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        inquiry_deleted:
          " '\u0417\u0430\u043f\u0440\u043e\u0441 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        inquiry_retrieve:
          " '\u0417\u0430\u043f\u0440\u043e\u0441 \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        invoice_retrieve:
          " '\u0421\u0447\u0435\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        job_abuse_reported:
          " \u00ab\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043e \u0437\u043b\u043e\u0443\u043f\u043e\u0442\u0440\u0435\u0431\u043b\u0435\u043d\u0438\u0438 \u0441\u043b\u0443\u0436\u0435\u0431\u043d\u044b\u043c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u043c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e\u00bb",
        job_alert:
          " '\u041f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435 \u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        job_application_delete:
          " '\u0417\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u043e \u043f\u0440\u0438\u0435\u043c\u0435 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        job_application_draft:
          " \u00ab\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443 \u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0430 \u200b\u200b\u0443\u0441\u043f\u0435\u0448\u043d\u043e\u00bb",
        job_applied:
          " \u00ab\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u0434\u0430\u043d\u0430\u00bb",
        job_apply_by_candidate:
          " '\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f, \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u043d\u0430\u044f \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u043c, \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        job_cant_delete:
          "\u0420\u0430\u0431\u043e\u0442\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430",
        job_category_cant_delete:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044e \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0435\u043b\u044c\u0437\u044f \u0443\u0434\u0430\u043b\u0438\u0442\u044c.'",
        job_category_delete:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        job_category_save:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        job_category_update:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        job_create_limit:
          " '\u041f\u0440\u0435\u0432\u044b\u0448\u0435\u043d\u043e \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0435 \u043d\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439 \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0439 \u0443\u0447\u0435\u0442\u043d\u043e\u0439 \u0437\u0430\u043f\u0438\u0441\u0438, \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u0435 \u043f\u043b\u0430\u043d \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438.'",
        job_delete:
          " '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        job_draft:
          " '\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        job_emailed_to:
          " '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u0434\u0440\u0443\u0433\u0443 \u043f\u043e \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0439 \u043f\u043e\u0447\u0442\u0435.'",
        job_make_featured:
          "  '\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430 \u200b\u200b\u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435.'",
        job_make_unfeatured:
          "  '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        job_not_found:
          " '\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430.'",
        job_notification:
          " '\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u043e \u0437\u0430\u0434\u0430\u043d\u0438\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_save:
          " '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e.'",
        job_schedule_send:
          "'\u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e.'",
        job_shift_cant_delete:
          " '\u0421\u043c\u0435\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        job_shift_delete:
          " '\u0421\u043c\u0435\u043d\u0430 \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        job_shift_retrieve:
          "  '\u0421\u043c\u0435\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_shift_save:
          "  '\u0421\u043c\u0435\u043d\u0430 \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        job_shift_update:
          "  '\u0421\u043c\u0435\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        job_stage_cant_delete:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        job_stage_change:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d.'",
        job_stage_delete:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        job_stage_retrieve:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_stage_save:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        job_stage_update:
          "'\u042d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        job_tag_cant_delete:
          " '\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0442\u0435\u0433 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        job_tag_delete:
          " '\u0422\u0435\u0433 \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        job_tag_retrieve:
          " '\u0422\u0435\u0433 \u0440\u0430\u0431\u043e\u0442\u044b \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_tag_save:
          " '\u0422\u0435\u0433 \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        job_tag_update:
          " '\u0422\u0435\u0433 \u0440\u0430\u0431\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        job_type_cant_delete:
          " '\u0422\u0438\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u043d\u0435\u043b\u044c\u0437\u044f \u0443\u0434\u0430\u043b\u0438\u0442\u044c.'",
        job_type_delete:
          " '\u0422\u0438\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0434\u0430\u043b\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_type_retrieve:
          " '\u0422\u0438\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        job_type_save:
          " '\u0422\u0438\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        job_type_update:
          " '\u0422\u0438\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        job_update:
          " '\u0417\u0430\u0434\u0430\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        language_added:
          " '\u042f\u0437\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d.'",
        language_changed:
          " '\u042f\u0437\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d'",
        language_delete:
          " '\u042f\u0437\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        language_retrieve:
          " '\u042f\u0437\u044b\u043a \u043f\u043e\u043b\u0443\u0447\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        language_save:
          " '\u042f\u0437\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        language_update:
          " '\u042f\u0437\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        link_copy:
          "\u0421\u0441\u044b\u043b\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0430.",
        manual_payment:
          " \u00ab\u041f\u043b\u0430\u0442\u0435\u0436 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u043e\u0434\u043e\u0431\u0440\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.\u00bb",
        manual_payment_denied:
          " '\u041f\u043b\u0430\u0442\u0435\u0436 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        marital_status_delete:
          " '\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        marital_status_retrieve:
          " '\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        marital_status_save:
          " '\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e.'",
        marital_status_update:
          " '\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        media_delete:
          " '\u041c\u0443\u043b\u044c\u0442\u0438\u043c\u0435\u0434\u0438\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        newsletter_delete:
          " '\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u043e\u043d\u043d\u043e\u0435 \u043f\u0438\u0441\u044c\u043c\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        no_record:
          "\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e.",
        not_deleted: "\u041d\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u043e",
        noticeboard_retrieve:
          " '\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430.'",
        noticeboard_save:
          " '\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        noticeboard_update:
          " '\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        notification_read:
          " '\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043e.'",
        notification_setting_update:
          " '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b.'",
        ownership_type_cant_delete:
          " '\u0422\u0438\u043f OwnerShip \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        ownership_type_delete:
          " '\u0422\u0438\u043f OwnerShip \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        ownership_type_retrieve:
          " '\u0422\u0438\u043f OwnerShip \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        ownership_type_save:
          " '\u0422\u0438\u043f OwnerShip \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        ownership_type_updated:
          " '\u0422\u0438\u043f \u043a\u043e\u0440\u0430\u0431\u043b\u044f-\u0432\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        password_update:
          " '\u041f\u0430\u0440\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        payment_failed_try_again:
          "\u0418\u0437\u0432\u0438\u043d\u0438\u0442\u0435! \u041f\u043b\u0430\u0442\u0435\u0436 \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d, \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435 \u043f\u043e\u043f\u044b\u0442\u043a\u0443 \u043f\u043e\u0437\u0436\u0435.",
        payment_not_complete:
          " \u00ab\u0412\u0430\u0448 \u043f\u043b\u0430\u0442\u0435\u0436 \u043d\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u00bb",
        payment_success:
          " \u00ab\u0412\u0430\u0448 \u043f\u043b\u0430\u0442\u0435\u0436 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u00bb",
        plan_Save:
          " '\u041f\u043b\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        plan_cant_delete:
          " '\u041f\u043b\u0430\u043d \u043d\u0435\u043b\u044c\u0437\u044f \u0443\u0434\u0430\u043b\u0438\u0442\u044c, \u043e\u043d \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u0442 \u043e\u0434\u043d\u0443 \u0438\u043b\u0438 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u043f\u043e\u0434\u043f\u0438\u0441\u043e\u043a.'",
        plan_cant_update:
          " '\u041f\u043b\u0430\u043d \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d. \u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430 \u043d\u0430 \u044d\u0442\u043e\u0442 \u043f\u043b\u0430\u043d \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442'",
        plan_delete:
          " '\u041f\u043b\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        plan_retrieve:
          " '\u041f\u043b\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        plan_update:
          " '\u041f\u043b\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        please_wait_for:
          " '\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0434\u043e\u0436\u0434\u0438\u0442\u0435\u0441\u044c \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u044f \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430, \u0432\u044b \u0443\u0436\u0435 \u0434\u043e\u0431\u0430\u0432\u0438\u043b\u0438 \u043e\u043f\u043b\u0430\u0442\u0443 \u0432\u0440\u0443\u0447\u043d\u0443\u044e'",
        please_wait_for_com:
          " \u00ab\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0434\u043e\u0436\u0434\u0438\u0442\u0435\u0441\u044c \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u044f \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430 \u0434\u043b\u044f \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u0438\u00bb",
        policy_update:
          " '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        post_category_delete:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.'",
        post_category_retrieve:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        post_category_save:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.'",
        post_category_update:
          " '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        post_comment:
          " '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        post_delete:
          " '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        post_save:
          " '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e.'",
        post_update:
          " '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        profile_update:
          " '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        reason_require:
          "\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u0443\u043a\u0430\u0437\u0430\u0442\u044c \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0442\u043c\u0435\u043d\u044b.",
        register_success_mail_active:
          "\u0412\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043b\u0438\u0441\u044c, \u0410\u043a\u0442\u0438\u0432\u0438\u0440\u0443\u0439\u0442\u0435 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u0441 \u043f\u043e\u0447\u0442\u044b.",
        registration_done:
          "  '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        report_to_company:
          " '\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        reported_candidate_delete:
          " '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        reported_job_delete:
          " '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u044b\u0435 \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u044b.'",
        resume_delete:
          " '\u0412\u043e\u0437\u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        resume_update:
          " '\u0420\u0435\u0437\u044e\u043c\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        retrieved:
          " '\u0423\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u043e.'",
        salary_currency_cant_delete:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430.",
        salary_currency_destroy:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0430.",
        salary_currency_edit:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430.",
        salary_currency_store:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.",
        salary_currency_update:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.",
        salary_period_cant_delete:
          " '\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        salary_period_delete:
          " '\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        salary_period_retrieve:
          " '\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d.'",
        salary_period_save:
          " '\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        salary_period_update:
          " '\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        select_employer:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        select_job:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0431\u043e\u0442\u0443",
        select_job_skill:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u044e",
        select_job_tag:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0431\u043e\u0447\u0438\u0439 \u0442\u0435\u0433",
        select_post_category:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044e \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
        select_skill:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043d\u0430\u0432\u044b\u043a",
        session_created:
          "  '\u0421\u0435\u0430\u043d\u0441 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d.'",
        setting_update:
          " '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430.'",
        skill_cant_delete:
          " '\u041d\u0430\u0432\u044b\u043a \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d.'",
        skill_delete:
          " '\u041d\u0430\u0432\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        skill_save:
          " '\u041d\u0430\u0432\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        skill_update:
          " '\u041d\u0430\u0432\u044b\u043a \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        slot_already_taken:
          "\u00ab\u0421\u043b\u043e\u0442 \u0443\u0436\u0435 \u0437\u0430\u043d\u044f\u0442\u00bb",
        slot_cancel:
          "'\u0421\u043b\u043e\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043c\u0435\u043d\u0435\u043d.'",
        slot_choose:
          " '\u0421\u043b\u043e\u0442 \u0432\u044b\u0431\u0440\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e'",
        slot_create:
          "\u00ab\u0421\u043b\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u044b\u00bb",
        slot_delete:
          "'\u0421\u043b\u043e\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d.'",
        slot_preference_field:
          "\u041f\u043e\u043b\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0435\u043d\u0438\u044f \u0441\u043b\u043e\u0442\u0430 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e",
        slot_reject:
          " \u00ab\u0421\u043b\u043e\u0442\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u044b\u00bb",
        slot_update:
          "'\u0421\u043b\u043e\u0442 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        state_cant_delete:
          " '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        state_delete:
          " '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e.'",
        state_save:
          " '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e.'",
        state_update:
          " '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e.'",
        status_change:
          " '\u0421\u0442\u0430\u0442\u0443\u0441 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d.'",
        status_update:
          " '\u0421\u0442\u0430\u0442\u0443\u0441 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        subscribed:
          "  '\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        subscription_cancel:
          " '\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430.'",
        subscription_resume:
          " '\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430 \u0432\u043e\u0437\u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0430 \u200b\u200b\u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        success_verify:
          "\u00ab\u0412\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043b\u0438 \u0441\u0432\u043e\u044e \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0443\u044e \u043f\u043e\u0447\u0442\u0443. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u043e\u0439\u0434\u0438\u0442\u0435 !'",
        testimonial_delete:
          " '\u041e\u0442\u0437\u044b\u0432\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u044b.'",
        testimonial_retrieve:
          " \u00ab\u041e\u0442\u0437\u044b\u0432\u044b \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e.\u00bb",
        testimonial_save:
          " '\u041e\u0442\u0437\u044b\u0432 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.'",
        testimonial_update:
          " '\u041e\u0442\u0437\u044b\u0432\u044b \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b.'",
        the_name_has:
          " \u00ab\u0418\u043c\u044f \u0443\u0436\u0435 \u0437\u0430\u043d\u044f\u0442\u043e\u00bb",
        there_are_no:
          " '\u041d\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u044b\u0445 \u0440\u0435\u0437\u044e\u043c\u0435.'",
        this_currency_is:
          " '\u042d\u0442\u0430 \u0432\u0430\u043b\u044e\u0442\u0430 \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044f PayPal \u0434\u043b\u044f \u043e\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u043b\u0435\u043d\u0438\u044f \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439.'",
        translation_update:
          "'\u041f\u0435\u0440\u0435\u0432\u043e\u0434 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        trial_plan_update:
          " '\u041f\u0440\u043e\u0431\u043d\u044b\u0439 \u043f\u043b\u0430\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.'",
        unfollow_company:
          " '\u041e\u0442\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.'",
        verification_mail:
          " '\u041f\u0438\u0441\u044c\u043c\u043e \u0441 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435\u043c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u043e.'",
        your_are_not_author:
          " \u00ab\u0412\u044b \u043d\u0435 \u044f\u0432\u043b\u044f\u0435\u0442\u0435\u0441\u044c \u0430\u0432\u0442\u043e\u0440\u043e\u043c \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438. \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0432\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u044d\u0442\u0443 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0443.'",
        your_payment_comp:
          " \u00ab\u0412\u0430\u0448 \u043f\u043b\u0430\u0442\u0435\u0436 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u00bb",
      },
      footer_settings:
        "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043d\u0438\u0436\u043d\u0435\u0433\u043e \u043a\u043e\u043b\u043e\u043d\u0442\u0438\u0442\u0443\u043b\u0430",
      front_cms: "\u041f\u0435\u0440\u0435\u0434\u043d\u044f\u044f CMS",
      front_home: {
        candidates: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
        companies: "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        jobs: "\u0440\u0430\u0431\u043e\u0442\u044b",
        resumes: "\u0420\u0435\u0437\u044e\u043c\u0435",
      },
      front_settings: {
        exipre_on: "Expira em",
        expires_on: "\u0418\u0441\u0442\u0435\u043a\u0430\u0435\u0442",
        featured: "Destaque",
        featured_companies_days: "Dias de empresas em destaque",
        featured_companies_due_days:
          "\u0421\u0440\u043e\u043a \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f \u0434\u0435\u0444\u043e\u043b\u0442\u043d\u044b\u0445 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0439",
        featured_companies_enable:
          "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043f\u043e\u0437\u0432\u043e\u043b\u044f\u044e\u0442",
        featured_companies_price: "Pre\u00e7o das empresas em destaque",
        featured_companies_quota: "Quota de empresas apresentadas",
        featured_employer_not_available:
          "\u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        featured_job: "Trabalho em destaque",
        featured_jobs_days: "Dias de empregos em destaque",
        featured_jobs_due_days:
          "\u0421\u0440\u043e\u043a\u0438 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u0437\u0430\u0434\u0430\u043d\u0438\u0439 \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e",
        featured_jobs_enable: "Trabalhos em destaque permitem",
        featured_jobs_price: "Pre\u00e7o de empregos em destaque",
        featured_jobs_quota: "Cota de empregos em destaque",
        featured_listing_currency:
          "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u0430\u044f \u0432\u0430\u043b\u044e\u0442\u0430 \u043b\u0438\u0441\u0442\u0438\u043d\u0433\u0430",
        latest_jobs_enable:
          "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u0432 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0438 \u0441\u043e \u0441\u0442\u0440\u0430\u043d\u043e\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f, \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u0432\u0448\u0435\u0433\u043e \u0432\u0445\u043e\u0434",
        latest_jobs_enable_message:
          "\u041e\u043d \u043f\u043e\u043a\u0430\u0436\u0435\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u0441\u0442\u0440\u0430\u043d\u044b \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 / \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f, \u043a\u043e\u0433\u0434\u0430 \u043e\u043d\u0438 \u0432\u043e\u0448\u043b\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443",
        make_feature:
          "\u0441\u0434\u0435\u043b\u0430\u0442\u044c \u043e\u0441\u043e\u0431\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
        make_featured: "Destaque",
        make_featured_job: "Fa\u00e7a um trabalho em destaque",
        pay_to_get:
          "\u041f\u043b\u0430\u0442\u0438, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c",
        remove_featured:
          "\u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0435",
      },
      functional_area: {
        edit_functional_area:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u041f\u043b\u043e\u0449\u0430\u0434\u044c",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_functional_area:
          "\u043d\u043e\u0432\u044b\u0439 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u041f\u043b\u043e\u0449\u0430\u0434\u044c",
        no_functional_area_available:
          "\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_functional_area_found:
          "\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
      },
      functional_areas:
        "\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0435 \u043e\u0431\u043b\u0430\u0441\u0442\u0438",
      general: "\u041e\u0431\u0449\u0435\u0435",
      general_dashboard:
        "\u041e\u0431\u0449\u0430\u044f \u043f\u0430\u043d\u0435\u043b\u044c \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432",
      general_settings:
        "\u043e\u0431\u0449\u0438\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      go_to_homepage:
        "\u041f\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043d\u0430 \u0434\u043e\u043c\u0430\u0448\u043d\u044e\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443",
      header_slider: {
        edit_header_slider:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430",
        header_slider:
          "\u0421\u043b\u0430\u0439\u0434\u0435\u0440 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430",
        image_size_message:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0438\u043c\u0435\u0442\u044c \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435 1920 x 1080 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439 \u0438\u043b\u0438 \u0431\u043e\u043b\u044c\u0448\u0435.",
        image_title_text:
          "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0441 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435\u043c 1920 x 1080 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439 \u0438\u043b\u0438 \u0431\u043e\u043b\u0435\u0435 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u0443\u043b\u0443\u0447\u0448\u0438\u0442\u044c \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u043c.",
        new_header_slider:
          "\u041d\u043e\u0432\u044b\u0439 \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430",
        no_header_slider_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u0430 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430",
      },
      header_sliders:
        "\u041f\u043e\u043b\u0437\u0443\u043d\u043a\u0438 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u043e\u0432",
      image_slider: {
        action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_image_slider:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f",
        image:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
        image_extension_message:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b\u043e\u043c \u0442\u0438\u043f\u0430: png, jpg, jpeg.",
        image_size_message:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0438\u043c\u0435\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440 1140 x 500 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439 \u0438\u043b\u0438 \u0431\u043e\u043b\u044c\u0448\u0435.",
        image_slider:
          "\u0421\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",
        image_slider_details:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",
        image_title_text:
          "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u043c 1140 x 500 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439 \u0438\u043b\u0438 \u0431\u043e\u043b\u0435\u0435 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u043c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0443\u0434\u043e\u0431\u0441\u0442\u0432\u043e \u0434\u043b\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439.",
        is_active: "\u0421\u0442\u0430\u0442\u0443\u0441",
        message:
          "\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435",
        message_title:
          "\u0415\u0441\u043b\u0438 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d, \u044d\u043a\u0440\u0430\u043d \u043f\u043e\u0438\u0441\u043a\u0430 \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u0435\u043d.",
        new_image_slider:
          "\u041d\u043e\u0432\u044b\u0439 \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",
        no_image_slider_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",
        no_image_slider_found:
          "\u041f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        select_status:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441",
        slider:
          "\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u043f\u043e\u043b\u043d\u043e\u0439 \u0448\u0438\u0440\u0438\u043d\u044b.",
        slider_active:
          "\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u0434\u043e\u043c\u0430\u0448\u043d\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b",
        slider_active_title:
          "\u0415\u0441\u043b\u0438 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d, \u044d\u043a\u0440\u0430\u043d \u0441\u043b\u0430\u0439\u0434\u0435\u0440\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u0435\u043d.",
        slider_title:
          "\u0415\u0441\u043b\u0438 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0442\u0435\u043b\u044c \u0432\u043a\u043b\u044e\u0447\u0435\u043d, \u043f\u043e\u043b\u0437\u0443\u043d\u043e\u043a \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043e\u0442\u043e\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0441\u044e \u0448\u0438\u0440\u0438\u043d\u0443 \u044d\u043a\u0440\u0430\u043d\u0430.",
      },
      image_sliders:
        "\u0421\u043b\u0430\u0439\u0434\u0435\u0440\u044b \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",
      industries:
        "\u043f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
      industry: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_industry:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
        industry_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u043e\u0442\u0440\u0430\u0441\u043b\u0438",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_industry:
          "\u043d\u043e\u0432\u044b\u0439 \u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
        no_industry_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043e\u0442\u0440\u0430\u0441\u043b\u0435\u0439",
        no_industry_found:
          "\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        size: "\u0420\u0430\u0437\u043c\u0435\u0440",
      },
      inquires:
        "\u0437\u0430\u043f\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u0442",
      inquiry: {
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        inquiry:
          "\u0420\u0430\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435",
        inquiry_date:
          "\u0437\u0430\u043f\u0440\u043e\u0441 \u0414\u0430\u0442\u0430",
        inquiry_details:
          "\u0437\u0430\u043f\u0440\u043e\u0441 \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438",
        message: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        no_inquiry_available:
          "\u0417\u0430\u043f\u0440\u043e\u0441 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_inquiry_found:
          "\u0417\u0430\u043f\u0440\u043e\u0441 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        phone_no:
          "\u0422\u0435\u043b\u0435\u0444\u043e\u043d\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440",
        subject: "\u0422\u0435\u043c\u0430",
      },
      job: {
        add_note:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0417\u0430\u043c\u0435\u0442\u043a\u0430",
        applies_job_not_found:
          "\u041f\u043e\u0434\u0430\u043d\u043d\u043e\u0439 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        career_level:
          "\u041a\u0430\u0440\u044c\u0435\u0440\u043d\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        city: "\u0433\u043e\u0440\u043e\u0434",
        country: "\u0421\u0442\u0440\u0430\u043d\u0430",
        created_at:
          "\u0441\u043e\u0437\u0434\u0430\u043d\u043d\u044b\u0439 \u0412",
        currency: "\u0432\u0430\u043b\u044e\u0442\u0430",
        degree_level:
          "\u0441\u0442\u0435\u043f\u0435\u043d\u044c \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430",
        email_to_friend:
          "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441 \u0432 \u0434\u0440\u0443\u0433",
        expires_on: "\u0418\u0441\u0442\u0435\u043a\u0430\u0435\u0442",
        favourite_companies_not_found:
          "\u041b\u044e\u0431\u0438\u043c\u0430\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        favourite_company:
          "\u041b\u044e\u0431\u0438\u043c\u0430\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        favourite_job:
          "\u041b\u044e\u0431\u0438\u043c\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430",
        favourite_job_not_found:
          "\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e \u043b\u044e\u0431\u0438\u043c\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        following_company_not_found:
          "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0439 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        friend_email:
          "\u0434\u0440\u0443\u0433 \u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        friend_name:
          "\u0434\u0440\u0443\u0433 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        functional_area:
          "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u041f\u043b\u043e\u0449\u0430\u0434\u044c",
        hide_salary:
          "\u0421\u043f\u0440\u044f\u0442\u0430\u0442\u044c \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430",
        is_featured:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435",
        is_freelance:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432\u043d\u0435\u0448\u0442\u0430\u0442\u043d\u043e",
        is_suspended:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043f\u043e\u0434\u0432\u0435\u0448\u0435\u043d\u043d\u044b\u0439",
        job: "\u0420\u0430\u0431\u043e\u0442\u0430",
        job_alert:
          "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        job_details:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438",
        job_expiry_date:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0438\u0441\u0442\u0435\u0447\u0435\u043d\u0438\u0435 \u0414\u0430\u0442\u0430",
        job_shift:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0441\u0434\u0432\u0438\u0433",
        job_skill:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0423\u043c\u0435\u043d\u0438\u0435",
        job_title:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
        job_type: "\u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0438\u043f",
        job_url:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0412\u0435\u0431-\u0441\u0430\u0439\u0442",
        new_job:
          "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u0440\u0430\u0431\u043e\u0442\u0430",
        no_applied_job_found:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        no_favourite_job_found:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043b\u044e\u0431\u0438\u043c\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        no_followers_available:
          "\u041d\u0435\u0442 \u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432",
        no_followers_found:
          "\u041f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        no_following_companies_found:
          "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_job_reported_available:
          "\u041d\u0435\u0442 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u043e \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044f\u0445",
        no_preference:
          "\u043d\u0435\u0442 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0435\u043d\u0438\u0435",
        no_reported_job_found:
          "\u0420\u0430\u0431\u043e\u0442\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        notes: "\u0417\u0430\u043c\u0435\u0442\u043a\u0438",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d \u043e\u043a\u043b\u0430\u0434\u043e\u0432 \u0434\u043e \u0431\u043e\u043b\u044c\u0448\u0435, \u0447\u0435\u043c \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d \u043e\u043a\u043b\u0430\u0434\u043e\u0432 \u043e\u0442.",
        position: "\u041f\u043e\u0437\u0438\u0446\u0438\u044f",
        remove_favourite_jobs:
          "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043b\u044e\u0431\u0438\u043c\u0443\u044e \u0440\u0430\u0431\u043e\u0442\u0443",
        reported_job:
          "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430",
        reported_jobs_detail:
          "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        reported_user:
          "\u0441\u043e\u043e\u0431\u0449\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c",
        salary_from:
          "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u0418\u0437",
        salary_period:
          "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u043f\u0435\u0440\u0438\u043e\u0434",
        salary_to: "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u043a",
        state:
          "\u0433\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043e",
        subscriber: "\u041f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a",
        view_notes:
          "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0437\u0430\u043c\u0435\u0442\u043e\u043a",
      },
      job_application: {
        application_date:
          "\u0437\u0430\u044f\u0432\u043a\u0430 \u0414\u0430\u0442\u0430",
        candidate_name:
          "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        job_application:
          "\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443",
      },
      job_applications:
        "\u0440\u0430\u0431\u043e\u0442\u0430 \u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f",
      job_categories:
        "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
      job_category: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job_category:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f",
        is_featured:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435",
        job_category:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_job_category:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f",
        no_job_category_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        no_job_category_found:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        show_job_category:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
      },
      job_experience: {
        edit_job_experience:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u041e\u043f\u044b\u0442",
        is_active:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
        is_default:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e",
        job_experience:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u041e\u043f\u044b\u0442",
        language: "\u044f\u0437\u044b\u043a",
        new_job_experience:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u041e\u043f\u044b\u0442",
      },
      job_experiences:
        "\u041e\u043f\u044b\u0442 \u0440\u0430\u0431\u043e\u0442\u044b",
      job_notification: {
        job_notifications:
          "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044f\u0445",
        no_jobs_available:
          "\u041d\u0435\u0442 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        select_all_jobs:
          "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0432\u0441\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      },
      job_shift: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job_shift:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u0441\u0434\u0432\u0438\u0433",
        job_shift_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u0441\u043c\u0435\u043d\u044b \u0440\u0430\u0431\u043e\u0442\u044b",
        new_job_shift:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u0441\u0434\u0432\u0438\u0433",
        no_job_shifts_available:
          "\u0421\u043c\u0435\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_job_shifts_found:
          "\u0421\u043c\u0435\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        shift: "\u0441\u0434\u0432\u0438\u0433",
        show_job_shift:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0441\u0434\u0432\u0438\u0433",
        size: "\u0420\u0430\u0437\u043c\u0435\u0440",
      },
      job_shifts:
        "\u0440\u0430\u0431\u043e\u0442\u0430 \u0421\u0434\u0432\u0438\u0433\u0438",
      job_skill: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job_skill:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u0423\u043c\u0435\u043d\u0438\u0435",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_job_skill:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u0423\u043c\u0435\u043d\u0438\u0435",
        show_job_skill:
          "\u0440\u0430\u0431\u043e\u0442\u0430 \u0423\u043c\u0435\u043d\u0438\u0435",
      },
      job_skills:
        "\u041d\u0430\u0432\u044b\u043a\u0438 \u0440\u0430\u0431\u043e\u0442\u044b",
      job_stage: {
        add_slot:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u043b\u043e\u0442",
        add_slots:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u043b\u043e\u0442\u044b",
        batch: "\u041f\u0430\u043a\u0435\u0442\u043d\u044b\u0439",
        cancel_slot:
          "\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u043b\u043e\u0442",
        cancel_this_slot:
          "\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u044d\u0442\u043e\u0442 \u0441\u043b\u043e\u0442",
        cancel_your_selected_slot:
          "\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u0441\u043b\u043e\u0442",
        candidate_note:
          "\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430",
        choose_slots:
          "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0441\u043b\u043e\u0442",
        date: "\u0414\u0430\u0442\u0430",
        edit_job_stage:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u044d\u0442\u0430\u043f \u0437\u0430\u0434\u0430\u043d\u0438\u044f",
        edit_slot:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u043b\u043e\u0442",
        history: "\u0418\u0441\u0442\u043e\u0440\u0438\u044f",
        job_stage:
          "\u042d\u0442\u0430\u043f \u0440\u0430\u0431\u043e\u0442\u044b",
        job_stage_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u044d\u0442\u0430\u043f\u0430 \u0440\u0430\u0431\u043e\u0442\u044b",
        new_job_stage:
          "\u041d\u043e\u0432\u044b\u0439 \u044d\u0442\u0430\u043f \u0440\u0430\u0431\u043e\u0442\u044b",
        new_slot_send:
          "\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u043d\u043e\u0432\u043e\u0433\u043e \u0441\u043b\u043e\u0442\u0430",
        no_job_stage_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u044d\u0442\u0430\u043f\u043e\u0432 \u0440\u0430\u0431\u043e\u0442\u044b",
        no_job_stage_found:
          "\u042d\u0442\u0430\u043f \u0440\u0430\u0431\u043e\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        no_slot_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u0441\u043b\u043e\u0442\u0430",
        reject_all_slot:
          "\u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c \u0432\u0441\u0435 \u0441\u043b\u043e\u0442\u044b",
        rejected_all_slots:
          "\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u044b \u0432\u0441\u0435 \u0441\u043b\u043e\u0442\u044b",
        send_slot:
          "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043b\u043e\u0442",
        send_slots:
          "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043b\u043e\u0442\u044b",
        slot: "\u0421\u043b\u043e\u0442",
        slot_preference:
          "\u041f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0435\u043d\u0438\u0435 \u0441\u043b\u043e\u0442\u0430",
        slots: "\u0421\u043b\u043e\u0442\u044b",
        time: "\u0412\u0440\u0435\u043c\u044f",
        you_cancel_this_slot:
          "\u0412\u044b \u043e\u0442\u043c\u0435\u043d\u044f\u0435\u0442\u0435 \u044d\u0442\u043e\u0442 \u0441\u043b\u043e\u0442",
        you_have_rejected_all_slot:
          "\u0412\u044b \u043e\u0442\u043a\u043b\u043e\u043d\u0438\u043b\u0438 \u0432\u0441\u0435 \u0441\u043b\u043e\u0442\u044b",
        you_have_selected_this_slot:
          "\u0412\u044b \u0432\u044b\u0431\u0440\u0430\u043b\u0438 \u044d\u0442\u043e\u0442 \u0441\u043b\u043e\u0442",
        your_note:
          "\u0412\u0430\u0448\u0430 \u0437\u0430\u043c\u0435\u0442\u043a\u0430",
      },
      job_stages:
        "\u042d\u0442\u0430\u043f\u044b \u0440\u0430\u0431\u043e\u0442\u044b",
      job_tag: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job_tag:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0435\u0433",
        job_tag: "\u0422\u0435\u0433 \u0440\u0430\u0431\u043e\u0442\u044b",
        job_tag_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u0442\u0435\u0433\u0430 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_job_tag:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0435\u0433",
        no_job_tag_available:
          "\u0422\u0435\u0433 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_job_tag_found:
          "\u0422\u0435\u0433 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        show_job_tag: "\u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0435\u0433",
        size: "\u0420\u0430\u0437\u043c\u0435\u0440",
      },
      job_tags: "\u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0435\u0433\u0438",
      job_type: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_job_type:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0438\u043f",
        job_type:
          "\u0422\u0438\u043f \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        job_type_detail:
          "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0442\u0438\u043f\u0435 \u0440\u0430\u0431\u043e\u0442\u044b",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_job_type:
          "\u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u0430 \u0422\u0438\u043f",
        no_job_type_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0442\u0438\u043f\u043e\u0432 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
        no_job_type_found:
          "\u0422\u0438\u043f \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        show_job_type: "\u0440\u0430\u0431\u043e\u0442\u0430 Type",
      },
      job_types: "\u0422\u0438\u043f\u044b \u0440\u0430\u0431\u043e\u0442",
      jobs: "\u0440\u0430\u0431\u043e\u0442\u044b",
      language: {
        edit_language:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u044f\u0437\u044b\u043a",
        is_active:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
        is_default:
          "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e",
        is_rtl: "\u042f\u0432\u043b\u044f\u0435\u0442\u0441\u044f RTL",
        iso_code: "ISO \u041a\u043e\u0434",
        language: "\u044f\u0437\u044b\u043a",
        native: "\u0420\u043e\u0434\u043d\u043e\u0439",
        new_language: "\u043d\u043e\u0432\u044b\u0439 \u044f\u0437\u044b\u043a",
        no_language_available:
          "\u042f\u0437\u044b\u043a \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_language_found:
          "\u042f\u0437\u044b\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
      },
      languages: "\u042f\u0437\u044b\u043a\u0438",
      marital_status: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_marital_status:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0443\u043f\u0440\u0443\u0436\u0435\u0441\u043a\u0438\u0439 \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
        marital_status:
          "\u0441\u0443\u043f\u0440\u0443\u0436\u0435\u0441\u043a\u0438\u0439 \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
        marital_status_detail:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u0441\u0435\u043c\u0435\u0439\u043d\u043e\u043c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0438",
        new_marital_status:
          "\u043d\u043e\u0432\u044b\u0439 \u0441\u0443\u043f\u0440\u0443\u0436\u0435\u0441\u043a\u0438\u0439 \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
        no_marital_status_available:
          "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u043e \u0441\u0435\u043c\u0435\u0439\u043d\u043e\u043c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0438",
        no_marital_status_found:
          "\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        show_marital_status:
          "\u0441\u0443\u043f\u0440\u0443\u0436\u0435\u0441\u043a\u0438\u0439 \u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043b",
      },
      marital_statuses:
        "\u0421\u0435\u043c\u0435\u0439\u043d\u043e\u0435 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435",
      months: {
        apr: "\u0430\u043f\u0440",
        aug: "\u0430\u0432\u0433",
        dec: "\u0434\u0435\u043a\u0430\u0431\u0440\u044c",
        feb: "\u0444\u0435\u0432\u0440\u0430\u043b\u044c",
        jan: "\u042f\u043d",
        jul: "\u0438\u044e\u043b\u044c",
        jun: "\u0438\u044e\u043d\u044c",
        mar: "\u043c\u0430\u0440\u0442",
        may: "\u041c\u0430\u0439",
        nov: "\u043d\u043e\u044f\u0431\u0440\u044c",
        oct: "\u043e\u043a\u0442\u044f\u0431\u0440\u044c",
        sep: "\u0441\u0435\u043d",
      },
      no_skills:
        "\u041d\u0435\u0442 \u043d\u0430\u0432\u044b\u043a\u043e\u0432",
      no_subscriber_available:
        "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432",
      no_subscriber_found:
        "\u041f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
      noticeboard: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_noticeboard:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439",
        is_active: "\u0410\u043a\u0442\u0438\u0432\u0435\u043d",
        new_noticeboard:
          "\u043d\u043e\u0432\u044b\u0439 \u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439",
        no_noticeboard_available:
          "\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_noticeboard_found:
          "\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
        noticeboard:
          "\u0414\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439",
        noticeboard_detail:
          "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0434\u043e\u0441\u043a\u0435 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439",
        title: "\u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
      },
      noticeboards:
        "\u0434\u043e\u0441\u043a\u0430 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439",
      notification: {
        company: "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",
        company_marked_featured:
          "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u043a\u0430\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u043d\u043d\u0430\u044f",
        empty_notifications:
          "\u041c\u044b \u043d\u0435 \u0441\u043c\u043e\u0433\u043b\u0438 \u043d\u0430\u0439\u0442\u0438 \u043d\u0438\u043a\u0430\u043a\u0438\u0445 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439",
        job_application_rejected_message:
          "\u0412\u0430\u0448\u0430 \u0437\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0430 \u0437\u0430",
        job_application_select_message:
          "\u0412\u0430\u0441 \u0432\u044b\u0431\u0440\u0430\u043b\u0438 \u0434\u043b\u044f",
        job_application_shortlist_message:
          "\u0412\u0430\u0448\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0432\u043e\u0448\u043b\u043e \u0432 \u0448\u043e\u0440\u0442-\u043b\u0438\u0441\u0442",
        job_application_submitted:
          "\u0417\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u043e \u043f\u0440\u0438\u0435\u043c\u0435 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443 \u043f\u043e\u0434\u0430\u043d\u043e \u0434\u043b\u044f",
        mark_all_as_read:
          "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0432\u0441\u0435 \u043a\u0430\u043a \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043d\u043e\u0435",
        marked_as_featured:
          "\u043e\u0442\u043c\u0435\u0447\u0435\u043d \u043a\u0430\u043a \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0439",
        new_candidate_registered:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d \u043d\u043e\u0432\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        new_employer_registered:
          "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d \u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c",
        notifications:
          "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f",
        purchase: "\u043f\u043e\u043a\u0443\u043f\u043a\u0430",
        read_notification:
          "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043e",
        started_following:
          "\u043d\u0430\u0447\u0430\u043b \u0447\u0438\u0442\u0430\u0442\u044c",
        started_following_you:
          "\u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043b\u0441\u044f \u043d\u0430 \u0432\u0430\u0441.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "\u041a\u043e\u0433\u0434\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d \u043d\u0430 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
        CANDIDATE_SELECTED_FOR_JOB:
          "\u041a\u043e\u0433\u0434\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u0432\u044b\u0431\u0440\u0430\u043d \u043d\u0430 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "\u041a\u043e\u0433\u0434\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043f\u043e\u043f\u0430\u043b \u0432 \u0448\u043e\u0440\u0442-\u043b\u0438\u0441\u0442 \u043d\u0430 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
        EMPLOYER_PURCHASE_PLAN:
          "\u041a\u043e\u0433\u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u043f\u0440\u0438\u043e\u0431\u0440\u0435\u0442\u0430\u0435\u0442 \u043f\u043b\u0430\u043d \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438",
        FOLLOW_COMPANY:
          "\u041a\u043e\u0433\u0434\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442 \u043f\u043e\u0434\u043f\u0438\u0441\u044b\u0432\u0430\u0442\u044c\u0441\u044f \u043d\u0430 \u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044e",
        FOLLOW_JOB:
          "\u041a\u043e\u0433\u0434\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442 \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442 \u043f\u043e\u0434\u043f\u0438\u0441\u044b\u0432\u0430\u0442\u044c\u0441\u044f \u043d\u0430 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        JOB_ALERT:
          "\u041a\u043e\u0433\u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u0441\u043e\u0437\u0434\u0430\u0435\u0442 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
        JOB_APPLICATION_SUBMITTED:
          "\u041f\u0440\u0438 \u043f\u043e\u0434\u0430\u0447\u0435 \u043d\u043e\u0432\u043e\u0433\u043e \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u044f \u043e \u043f\u0440\u0438\u0435\u043c\u0435 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443",
        MARK_COMPANY_FEATURED:
          "\u041f\u0440\u0438 \u043e\u0442\u043c\u0435\u0442\u043a\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u043a\u0430\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u043d\u043d\u043e\u0439",
        MARK_COMPANY_FEATURED_ADMIN:
          "\u041a\u043e\u0433\u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043c\u0435\u0447\u0430\u0435\u0442 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e \u043a\u0430\u043a \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u0443\u044e",
        MARK_JOB_FEATURED:
          "\u041f\u0440\u0438 \u043e\u0442\u043c\u0435\u0442\u043a\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043a\u0430\u043a \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u043e\u0432\u0430\u043d\u043d\u043e\u0439",
        MARK_JOB_FEATURED_ADMIN:
          "\u041a\u043e\u0433\u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043c\u0435\u0447\u0430\u0435\u0442 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e \u043a\u0430\u043a \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u0443\u044e",
        NEW_CANDIDATE_REGISTERED:
          "\u041a\u043e\u0433\u0434\u0430 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d \u043d\u043e\u0432\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        NEW_EMPLOYER_REGISTERED:
          "\u041f\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043d\u043e\u0432\u043e\u0433\u043e \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
        admin: "\u0410\u0434\u043c\u0438\u043d",
        blog_category:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0431\u043b\u043e\u0433\u0430",
        candidate: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
        employer: "\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a",
      },
      ownership_type: {
        edit_ownership_type:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0412\u043b\u0430\u0434\u0435\u043d\u0438\u0435 \u0422\u0438\u043f",
        new_ownership_type:
          "\u043d\u043e\u0432\u044b\u0439 \u0412\u043b\u0430\u0434\u0435\u043d\u0438\u0435 \u0422\u0438\u043f",
        no_ownership_type_available:
          "\u0422\u0438\u043f \u0432\u043b\u0430\u0434\u0435\u043d\u0438\u044f \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_ownership_type_found:
          "\u0422\u0438\u043f \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        ownership_type:
          "\u0422\u0438\u043f \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
        ownership_type_detail:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u0442\u0438\u043f\u0435 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
      },
      ownership_types:
        "\u0422\u0438\u043f\u044b \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
      phone: {
        invalid_country_code:
          "\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u043a\u043e\u0434 \u0441\u0442\u0440\u0430\u043d\u044b",
        invalid_number:
          "\u041d\u0435\u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440",
        too_long:
          "\u0421\u043b\u0438\u0448\u043a\u043e\u043c \u0434\u043e\u043b\u0433\u043e",
        too_short:
          "\u0421\u043b\u0438\u0448\u043a\u043e\u043c \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439",
        valid_number:
          "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440",
      },
      plan: {
        "active subscription":
          "\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0430",
        allowed_jobs:
          "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u043d\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        amount: "\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e",
        cancel_reason: "Motivo de cancelamento",
        cancel_subscription: "Cancelar assinatura",
        currency: "\u0412\u0430\u043b\u044e\u0442\u0430",
        current_plan: "Plano atual",
        edit_plan:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043b\u0430\u043d",
        edit_subscription_plan:
          "\u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043b\u0430\u043d \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438",
        ends_at: "Termina em",
        is_trial_plan:
          "\u041f\u0440\u043e\u0431\u043d\u044b\u0439 \u043f\u043b\u0430\u043d",
        job_allowed: "Trabalho Permitido",
        job_used:
          "\u0420\u0430\u0431\u043e\u0442\u0430 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f",
        jobs_allowed: "Empregos permitidos",
        jobs_used:
          "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
        new_plan:
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043b\u0430\u043d",
        new_subscription_plan:
          "\u043d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u043d \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438",
        pay_with_manually:
          "\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c \u0432\u0440\u0443\u0447\u043d\u0443\u044e",
        pay_with_paypal: "\u041e\u043f\u043b\u0430\u0442\u0430 \u0441 PayPal",
        pay_with_stripe:
          "\u041f\u043b\u0430\u0442\u0438\u0442\u0435 \u043f\u043e\u043b\u043e\u0441\u043e\u0439",
        per_month: "Por m\u00eas",
        plan: "\u0421\u0442\u0440\u043e\u0438\u0442\u044c \u043f\u043b\u0430\u043d\u044b",
        plan_amount_cannot_be_changes:
          "\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435: - \u0421\u0443\u043c\u043c\u0430 \u043f\u043b\u0430\u043d\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0430.",
        pricing: "Pre\u00e7os",
        processing: "\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430",
        purchase: "Compra",
        renews_on: "Renova em",
        subscription_cancelled: "Assinatura cancelada",
        subscriptions: "\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0438",
      },
      plans: "Planos",
      position: {
        edit_position:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041f\u043e\u0437\u0438\u0446\u0438\u044f",
        new_position:
          "\u043d\u043e\u0432\u044b\u0439 \u041f\u043e\u0437\u0438\u0446\u0438\u044f",
        position: "\u041f\u043e\u0437\u0438\u0446\u0438\u044f",
      },
      positions: "\u041f\u043e\u0437\u0438\u0446\u0438\u0438",
      post: {
        action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        blog: "\u0411\u043b\u043e\u0433",
        comment:
          "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
        comments:
          "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_post:
          "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435",
        image: "\u041e\u0431\u0440\u0430\u0437",
        new_post: "\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u0441\u0442",
        no_posts_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        no_posts_found:
          "\u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        post: "\u041f\u043e\u0447\u0442\u0430",
        post_a_comments:
          "\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
        post_details:
          "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
        posts: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f",
        select_post_categories:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        show_post: "\u041f\u043e\u0447\u0442\u0430",
        title: "\u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435",
      },
      post_category: {
        action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_post_category:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_post_category:
          "\u041d\u043e\u0432\u0430\u044f \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        no_post_category_available:
          "Nenhuma categoria de postagem dispon\u00edvel",
        no_post_category_found: "Nenhuma categoria de postagem encontrada",
        post_categories:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        post_category:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
        post_category_detail:
          "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439",
        show_post_category:
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
      },
      post_comment: {
        post_comment:
          "\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
        post_comment_details:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u044f",
      },
      post_comments:
        "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438",
      pricing_table: { get_started: "\u043d\u0430\u0447\u0430\u0442\u044c" },
      pricings_table:
        "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0446\u0435\u043d",
      professional_skills:
        "\u043f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0435 \u043d\u0430\u0432\u044b\u043a\u0438",
      profile: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c",
      recent_blog:
        "\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0439 \u0431\u043b\u043e\u0433",
      reported_jobs:
        "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u043d\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      required_degree_level: {
        edit_required_degree_level:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u044c \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_required_degree_level:
          "\u043d\u043e\u0432\u044b\u0439 \u0441\u0442\u0435\u043f\u0435\u043d\u044c \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
        no_degree_level_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f \u0441\u0442\u0435\u043f\u0435\u043d\u0438",
        no_degree_level_found:
          "\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        show_required_degree_level:
          "\u0441\u0442\u0435\u043f\u0435\u043d\u044c \u0443\u0440\u043e\u0432\u0435\u043d\u044c",
      },
      required_degree_levels:
        "\u0423\u0440\u043e\u0432\u043d\u0438 \u0441\u0442\u0435\u043f\u0435\u043d\u0438",
      resumes: {
        candidate_name:
          "\u0418\u043c\u044f \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430",
        file: "\u0424\u0430\u0439\u043b",
        name: "\u0418\u043c\u044f",
        no_resume_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0440\u0435\u0437\u044e\u043c\u0435",
        no_resume_found:
          "\u0420\u0435\u0437\u044e\u043c\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        resume_name: "\u0418\u043c\u044f \u0444\u0430\u0439\u043b\u0430",
      },
      salary_currencies:
        "\u0412\u0430\u043b\u044e\u0442\u044b \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b",
      salary_currency: {
        currency_code:
          "\u041a\u043e\u0434 \u0432\u0430\u043b\u044e\u0442\u044b",
        currency_icon:
          "\u0417\u043d\u0430\u0447\u043e\u043a \u0432\u0430\u043b\u044e\u0442\u044b",
        currency_name:
          "\u0432\u0430\u043b\u044e\u0442\u0430 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        edit_salary_currency:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0432\u0430\u043b\u044e\u0442\u0443 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b",
        new_salary_currency:
          "\u041d\u043e\u0432\u0430\u044f \u0432\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b",
        no_salary_currency_available:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
        no_salary_currency_found:
          "\u0412\u0430\u043b\u044e\u0442\u0430 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430",
      },
      salary_period: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_salary_period:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u043f\u0435\u0440\u0438\u043e\u0434",
        new_salary_period:
          "\u043d\u043e\u0432\u044b\u0439 \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 \u043f\u0435\u0440\u0438\u043e\u0434",
        no_salary_period_available:
          "\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_salary_period_found:
          "\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        period: "\u043f\u0435\u0440\u0438\u043e\u0434",
        salary_period_detail:
          "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0435 \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u043d\u043e\u0439 \u043f\u043b\u0430\u0442\u044b",
        size: "\u0420\u0430\u0437\u043c\u0435\u0440",
      },
      salary_periods:
        "\u041f\u0435\u0440\u0438\u043e\u0434\u044b \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b",
      see_all_plans:
        "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0432\u0441\u0435 \u043f\u043b\u0430\u043d\u044b",
      selected_candidate:
        "\u0412\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442",
      setting: {
        about_us: "\u041e\u043a\u043e\u043b\u043e \u041d\u0430\u0441",
        address: "\u0410\u0434\u0440\u0435\u0441",
        application_name:
          "\u0437\u0430\u044f\u0432\u043a\u0430 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        choose: "\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435",
        company_description:
          "\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        company_url: "URL \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438",
        configuration_update:
          "\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
        cookie: "Cookie-\u0444\u0430\u0439\u043b\u044b",
        disable_cookie:
          "\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u0443\u043a\u0438",
        disable_edit:
          "\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        enable_cookie:
          "\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u0443\u043a\u0438",
        enable_edit:
          "\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435",
        enable_google_recaptcha:
          "\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u0435 Google reCAPTCHA \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u0435\u0439, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044e \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432 \u0438 \u044d\u043a\u0440\u0430\u043d \u00ab\u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438\u00bb.",
        facebook: "Facebook",
        facebook_app_id:
          "\u0418\u0434\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Facebook",
        facebook_app_secret:
          "\u0421\u0435\u043a\u0440\u0435\u0442 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Facebook",
        facebook_redirect:
          "\u041f\u0435\u0440\u0435\u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 Facebook",
        facebook_url: "URL-\u0430\u0434\u0440\u0435\u0441 Facebook",
        favicon: "Favicon",
        front_settings:
          "\u0424\u0440\u043e\u043d\u0442 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
        general: "\u041e\u0431\u0449\u0435\u0435",
        google: "Google",
        google_client_id:
          "\u0418\u0434\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 Google",
        google_client_secret:
          "\u0421\u0435\u043a\u0440\u0435\u0442 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 Google",
        google_plus_url:
          "URL-\u0430\u0434\u0440\u0435\u0441 Google \u041f\u043b\u044e\u0441",
        google_redirect: "Google Redirect",
        image_validation:
          "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u043c 90 x 60 \u043f\u0438\u043a\u0441\u0435\u043b\u0435\u0439.",
        linkedIn_url: "LinkedIn",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Id",
        linkedin_client_secret:
          "\u0421\u0435\u043a\u0440\u0435\u0442 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 LinkedIn",
        linkedin_url: "URL-\u0430\u0434\u0440\u0435\u0441 LinkedIn",
        logo: "Logo",
        mail: "\u041f\u043e\u0447\u0442\u0430",
        mail__from_address:
          "\u041f\u043e\u0447\u0442\u0430 \u0441 \u0430\u0434\u0440\u0435\u0441\u0430",
        mail_host:
          "\u041f\u043e\u0447\u0442\u043e\u0432\u044b\u0439 \u0445\u043e\u0441\u0442",
        mail_mailer:
          "\u041f\u043e\u0447\u0442\u043e\u0432\u044b\u0439 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c",
        mail_password:
          "\u0418\u043c\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u043f\u043e\u0447\u0442\u044b",
        mail_port:
          "\u041f\u043e\u0447\u0442\u043e\u0432\u044b\u0439 \u043f\u043e\u0440\u0442",
        mail_username:
          "\u0418\u043c\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u043f\u043e\u0447\u0442\u044b",
        notification_settings:
          "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439",
        paypal: "Paypal",
        paypal_client_id:
          "\u0418\u0434\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 Paypa",
        paypal_secret: "\u0421\u0435\u043a\u0440\u0435\u0442 Paypal",
        phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
        privacy_policy:
          "\u043f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438",
        pusher: "\u0422\u043e\u043b\u043a\u0430\u0442\u0435\u043b\u044c",
        pusher_app_cluster:
          "\u041a\u043b\u0430\u0441\u0442\u0435\u0440 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0439 Pusher",
        pusher_app_id:
          "\u0418\u0434\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Pusher",
        pusher_app_key:
          "\u041a\u043b\u044e\u0447 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Pusher",
        pusher_app_secret:
          "\u0421\u0435\u043a\u0440\u0435\u0442 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Pusher",
        social_settings:
          "\u0421\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
        stripe: "\u041f\u043e\u043b\u043e\u0441\u0430",
        stripe_key: "Stripe Key",
        stripe_secret_key:
          "\u0421\u0435\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u043a\u043b\u044e\u0447 Stripe",
        stripe_webhook_key: "\u041a\u043b\u044e\u0447 Stripe Webhook",
        terms_conditions:
          "\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0438 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u044f",
        twitter_url: "URL-\u0430\u0434\u0440\u0435\u0441 Twitter",
        update_application_configuration:
          "\u0412\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442\u0435\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f, \u0445\u043e\u0442\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c?",
      },
      settings: "\u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      skill: {
        action: "\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_skill:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c  \u0423\u043c\u0435\u043d\u0438\u0435",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        new_skill:
          "\u043d\u043e\u0432\u044b\u0439 \u0423\u043c\u0435\u043d\u0438\u0435",
        no_skill_available:
          "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043d\u0430\u0432\u044b\u043a\u043e\u0432",
        no_skill_found:
          "\u041d\u0430\u0432\u044b\u043a\u043e\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        show_skill: "v",
        skill_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u043d\u0430\u0432\u044b\u043a\u043e\u0432",
      },
      skills:
        "\u041d\u0430\u0432\u044b\u043a\u0438 \u0438 \u0443\u043c\u0435\u043d\u0438\u044f",
      social_media:
        "\u0421\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0435 \u043c\u0435\u0434\u0438\u0430",
      social_settings:
        "\u0421\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      state: {
        country_name:
          "\u0412\u043e \u0438\u043c\u044f \u0441\u0442\u0440\u0430\u043d\u044b",
        edit_state:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",
        new_state:
          "\u041d\u043e\u0432\u043e\u0435 \u0433\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043e",
        no_state_available:
          "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e",
        no_state_found:
          "\u0413\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
        state_name:
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0448\u0442\u0430\u0442\u0430",
        states: "\u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f",
      },
      subscribers:
        "\u041f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u0438",
      subscriptions_plans:
        "\u043f\u043b\u0430\u043d\u044b \u043f\u043e\u0434\u043f\u0438\u0441\u043e\u043a",
      testimonial: {
        customer_image:
          "\u041a\u043b\u0438\u0435\u043d\u0442 \u041e\u0431\u0440\u0430\u0437",
        customer_name:
          "\u041a\u043b\u0438\u0435\u043d\u0442 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
        edit_testimonial:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e",
        new_testimonial:
          "\u043d\u043e\u0432\u044b\u0439 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e",
        no_testimonial_available:
          "\u041e\u0442\u0437\u044b\u0432 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d",
        no_testimonial_found:
          "\u041e\u0442\u0437\u044b\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d",
        testimonial:
          "\u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e",
        testimonial_detail:
          "\u0414\u0435\u0442\u0430\u043b\u0438 \u043e\u0442\u0437\u044b\u0432\u0430",
        testimonials: "\u041e\u0442\u0437\u044b\u0432\u044b",
      },
      testimonials: "\u041e\u0442\u0437\u044b\u0432\u044b",
      tooltip: {
        change_app_logo:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043b\u043e\u0433\u043e\u0442\u0438\u043f \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f",
        change_favicon:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u043d\u0430\u0447\u043e\u043a",
        change_home_banner:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0434\u043e\u043c\u0430\u0448\u043d\u0438\u0439 \u0431\u0430\u043d\u043d\u0435\u0440",
        change_image:
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
        copy_preview_link:
          "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443 \u0434\u043b\u044f \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430",
      },
      transaction: {
        approved:
          "\u041e\u0434\u043e\u0431\u0440\u0435\u043d\u043d\u044b\u0439",
        denied: "\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d",
        invoice: "Fatura",
        payment_approved:
          "\u0421\u0442\u0430\u0442\u0443\u0441 \u043f\u043b\u0430\u0442\u0435\u0436\u0430",
        plan_name: "Nome do Plano",
        select_manual_payment:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043b\u0430\u0442\u0435\u0436 \u0432\u0440\u0443\u0447\u043d\u0443\u044e",
        subscription_id: "ID de Inscri\u00e7\u00e3o",
        transaction_date: "Data de Transa\u00e7\u00e3o",
        type: "\u0422\u0438\u043f",
        user_name:
          "\u0418\u043c\u044f \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b\u044f",
      },
      transactions: "Transa\u00e7\u00f5es",
      translation_manager:
        "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u043e\u0432",
      user: {
        change_password:
          "+ \u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u0430\u0440\u043e\u043b\u044c",
        edit_profile:
          "\u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u041f\u0440\u043e\u0444\u0438\u043b\u044c",
        email: "\u042d\u043b. \u0430\u0434\u0440\u0435\u0441",
        first_name:
          "\u041f\u0435\u0440\u0432\u044b\u0439 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        last_name:
          "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        logout: "\u0412\u044b\u0439\u0442\u0438",
        name: "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
        password: "\u043f\u0430\u0440\u043e\u043b\u044c",
        password_confirmation:
          "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u044c",
        phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
        required_field_messages:
          "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0437\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0432\u0441\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044f.",
        user_name:
          "\u0438\u043c\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f",
      },
      user_language: {
        change_language:
          "+ \u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u044f\u0437\u044b\u043a",
        language: "\u044f\u0437\u044b\u043a",
      },
      weekdays: {
        fri: "\u041f\u0422",
        mon: "\u041f\u041d",
        sat: "\u0421\u0438\u0434\u0435\u043b",
        sun: "\u0421\u041e\u041b\u041d\u0426\u0415",
        thu: "\u0427\u0422",
        tue: "\u0412\u0422",
        wed: "\u041c\u042b \u0411",
      },
      your_cv: "\u0412\u0430\u0448\u0435 \u0440\u0435\u0437\u044e\u043c\u0435",
    },
    "ru.pagination": {
      next: "\u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 &raquo;",
      previous:
        "&laquo; \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0439",
    },
    "ru.validation": {
      accepted:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043f\u0440\u0438\u043d\u044f\u0442.",
      active_url:
        "The :attribute \u043d\u0435 \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c URL",
      after:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u0430\u0442\u0430 \u043f\u043e\u0441\u043b\u0435 :date.",
      after_or_equal:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u0430\u0442\u0430 \u043f\u043e\u0441\u043b\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u0430 :date.",
      alpha:
        "The :attribute \u043c\u043e\u0436\u0435\u0442 \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b.",
      alpha_dash:
        "The :attribute \u043c\u043e\u0436\u0435\u0442 \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b, \u0446\u0438\u0444\u0440\u044b, \u0442\u0438\u0440\u0435 \u0438 \u043f\u043e\u0434\u0447\u0435\u0440\u043a\u0438\u0432\u0430\u043d\u0438\u044f.",
      alpha_num:
        "The :attribute \u043c\u043e\u0436\u0435\u0442 \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b \u0438 \u0446\u0438\u0444\u0440\u044b.",
      array:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0430\u0441\u0441\u0438\u0432\u043e\u043c.",
      attributes: [],
      before:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0434\u0430\u0442\u0430 \u0434\u043e :date.",
      before_or_equal:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u0430\u0442\u0430 \u0434\u043e \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u0430 :date.",
      between: {
        array:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u0436\u0434\u0443 :min \u0438 :max \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0435\u0436\u0434\u0443 :min \u0438 :max \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0435\u0436\u0434\u0443 :min \u0438 :max.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0435\u0436\u0434\u0443 :min \u0438 :max \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      boolean:
        "The :attribute \u043f\u043e\u043b\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0438\u0441\u0442\u0438\u043d\u043d\u044b\u043c \u0438\u043b\u0438 \u043b\u043e\u0436\u043d\u044b\u043c.",
      confirmed:
        "The :attribute \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0435 \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u0435\u0442.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "The :attribute \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0434\u0430\u0442\u0430",
      date_equals:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u0430\u0442\u0430, \u0440\u0430\u0432\u043d\u0430\u044f :date.",
      date_format:
        "The :attribute \u043d\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0444\u043e\u0440\u043c\u0430\u0442\u0443 :format.",
      different:
        "The :attribute \u0438 :other \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0440\u0443\u0433\u0438\u043c.",
      digits:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c :digits \u0446\u0438\u0444\u0440\u044b.",
      digits_between:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043c\u0435\u0436\u0434\u0443 :min \u0438 :max \u0446\u0438\u0444\u0440\u044b.",
      dimensions:
        "The :attribute \u0438\u043c\u0435\u0435\u0442 \u043d\u0435\u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u044b\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u044b \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f.",
      distinct:
        "The :attribute \u043f\u043e\u043b\u0435 \u0438\u043c\u0435\u0435\u0442 \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u044e\u0449\u0435\u0435\u0441\u044f \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435.",
      email:
        "The :attribute \u0410\u0434\u0440\u0435\u0441 \u044d\u043b. \u043f\u043e\u0447\u0442\u044b \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c.",
      ends_with:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0437\u0430\u043a\u0430\u043d\u0447\u0438\u0432\u0430\u0442\u044c\u0441\u044f \u043e\u0434\u043d\u0438\u043c \u0438\u0437 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0445: :values.",
      exists:
        "The \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 :attribute \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c.",
      file: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b.",
      filled:
        "The :attribute \u043f\u043e\u043b\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0438\u043c\u0435\u0442\u044c \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435.",
      gt: {
        array:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0438\u043c\u0435\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435, \u0447\u0435\u043c :value \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0447\u0435\u043c :value \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0447\u0435\u043c :value.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0447\u0435\u043c :value \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      gte: {
        array:
          "The :attribute must have :value \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u0438\u043b\u0438 \u0431\u043e\u043b\u044c\u0448\u0435.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      image:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435.",
      in: "The \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 :attribute \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c.",
      in_array:
        "The :attribute \u043f\u043e\u043b\u0435 \u043d\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 :other.",
      integer:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0446\u0435\u043b\u044b\u043c \u0447\u0438\u0441\u043b\u043e\u043c",
      ip: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 IP-\u0430\u0434\u0440\u0435\u0441.",
      ipv4: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c \u0430\u0434\u0440\u0435\u0441\u043e\u043c IPv4.",
      ipv6: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c \u0430\u0434\u0440\u0435\u0441\u043e\u043c IPv6.",
      json: "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u043e\u0439 \u0441\u0442\u0440\u043e\u043a\u043e\u0439 JSON.",
      lt: {
        array:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0447\u0435\u043c :value \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0447\u0435\u043c :value \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0447\u0435\u043c :value.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0447\u0435\u043c :value \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      lte: {
        array:
          "The :attribute must not have more than :value \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043c\u0435\u043d\u044c\u0448\u0435 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e :value \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      max: {
        array:
          "The :attribute may not have more than :max \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0447\u0435\u043c :max \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u0447\u0435\u043c :max.",
        string:
          "The :attribute may not be greater than :max \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      mimes:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b \u0442\u0438\u043f\u0430: :values.",
      mimetypes:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0444\u0430\u0439\u043b \u0442\u0438\u043f\u0430: :values.",
      min: {
        array:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0438\u043c\u0435\u0442\u044c \u043f\u043e \u043a\u0440\u0430\u0439\u043d\u0435\u0439 \u043c\u0435\u0440\u0435 :min \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 :min \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 :min.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 :min \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      not_in:
        "The \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 :attribute \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c.",
      not_regex:
        "The :attribute \u0424\u043e\u0440\u043c\u0430\u0442 \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u0435\u043d.",
      numeric:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0447\u0438\u0441\u043b\u043e\u043c.",
      password:
        "\u041f\u0430\u0440\u043e\u043b\u044c \u043d\u0435\u0432\u0435\u0440\u0435\u043d.",
      present:
        "The :attribute \u043f\u043e\u043b\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u043f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u043e\u0432\u0430\u0442\u044c.",
      regex:
        "The :attribute \u0424\u043e\u0440\u043c\u0430\u0442 \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u0435\u043d.",
      required:
        "The :attribute \u041f\u043e\u043b\u0435, \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f.",
      required_if:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u043a\u043e\u0433\u0434\u0430 :other \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f :value.",
      required_unless:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u0435\u0441\u043b\u0438 :other \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 :values.",
      required_with:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u043a\u043e\u0433\u0434\u0430 :values \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f present.",
      required_with_all:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u043a\u043e\u0433\u0434\u0430 :values \u043f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442.",
      required_without:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u043a\u043e\u0433\u0434\u0430 :values \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0435 \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0435\u0435 \u0432\u0440\u0435\u043c\u044f.",
      required_without_all:
        "The :attribute \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f, \u043a\u043e\u0433\u0434\u0430 \u043d\u0438 \u043e\u0434\u0438\u043d \u0438\u0437 :values \u043f\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442.",
      same: "The :attribute \u0438 :other \u0434\u043e\u043b\u0436\u0435\u043d \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u0442\u044c.",
      size: {
        array:
          "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0441\u043e\u0434\u0435\u0440\u0436\u0430\u0442\u044c :size \u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b.",
        file: "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c :size \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442.",
        numeric:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c :size.",
        string:
          "The :attribute \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c :size \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438.",
      },
      starts_with:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u043d\u0430\u0447\u0438\u043d\u0430\u0442\u044c\u0441\u044f \u0441 \u043e\u0434\u043d\u043e\u0433\u043e \u0438\u0437 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0445: :values.",
      string:
        "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u043e\u0439.",
      timezone:
        "The :attribute \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0439 \u0437\u043e\u043d\u043e\u0439.",
      unique:
        "The :attribute \u0443\u0436\u0435 \u0437\u0430\u043d\u044f\u0442.",
      uploaded:
        "The :attribute \u043d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c.",
      url: "The :attribute \u0424\u043e\u0440\u043c\u0430\u0442 \u043d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u0435\u043d.",
      uuid: "The :attribute \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c UUID.",
    },
    "tr.messages": {
      about_us: "Hakk\u0131m\u0131zda",
      about_us_services: "Hakk\u0131m\u0131zda Hizmetler",
      admin_dashboard: {
        active_jobs: "Aktif \u0130\u015fler",
        active_users: "Aktif Kullan\u0131c\u0131lar",
        featured_employers: "\u00d6ne \u00c7\u0131kan \u0130\u015fverenler",
        featured_employers_incomes:
          "\u00d6ne \u00c7\u0131kan \u0130\u015fveren Gelirleri",
        featured_jobs: "\u00d6ne \u00c7\u0131kan \u0130\u015fler",
        featured_jobs_incomes:
          "\u00d6ne \u00c7\u0131kan \u0130\u015fler Gelirleri",
        post_statistics: "Mesaj \u0130statistikleri",
        recent_candidates: "Son Adaylar",
        recent_employers: "Son \u0130\u015fverenler",
        recent_jobs: "Son \u0130\u015fler",
        registered_candidates: "Kay\u0131tl\u0131 Adaylar",
        registered_employer: "Kay\u0131tl\u0131 \u0130\u015fverenler",
        subscription_incomes: "Abonelik Gelirleri",
        today_jobs: "Bug\u00fcn \u0130\u015fleri",
        total_active_jobs: "Toplam Aktif \u0130\u015fler",
        total_candidates: "Toplam Aday",
        total_employers: "Toplam \u0130\u015fverenler",
        total_users: "Toplam Kullan\u0131c\u0131lar",
        verified_users: "Do\u011frulanm\u0131\u015f Kullan\u0131c\u0131lar",
        weekly_users: "Haftal\u0131k kullan\u0131c\u0131lar",
      },
      all_resumes: "T\u00fcm \u00d6zge\u00e7mi\u015fler",
      all_rights_reserved: "Her hakk\u0131 sakl\u0131d\u0131r",
      applied_job: {
        applied_jobs: "Uygulamal\u0131 \u0130\u015fler",
        companies: "\u015eirketler",
        job: "\u0130\u015f",
        notes: "Notlar",
      },
      apply_job: {
        apply_job: "\u0130\u015f ba\u015fvurusu",
        notes: "Notlar",
        resume: "Devam et",
      },
      blog_categories: "Blog Kategorileri",
      blogs: "Bloglar",
      branding_slider: {
        brand: "Marka",
        edit_branding_slider:
          "Marka Kayd\u0131r\u0131c\u0131s\u0131n\u0131 D\u00fczenle",
        new_branding_slider: "Yeni Marka Kayd\u0131r\u0131c\u0131s\u0131",
        no_branding_slider_available:
          "Markalama Kayd\u0131r\u0131c\u0131s\u0131 Yok",
        no_branding_slider_found:
          "Markalama Kayd\u0131r\u0131c\u0131s\u0131 Bulunamad\u0131",
      },
      branding_sliders: "Marka Kayd\u0131r\u0131c\u0131lar\u0131",
      brands: "Markalar",
      candidate: {
        address: "Adres",
        admins: "Y\u00f6neticiler",
        already_reported: "Zaten Bildirildi",
        available_at: "Mevcut",
        birth_date: "Do\u011fum g\u00fcn\u00fc",
        candidate_details: "Aday Ayr\u0131nt\u0131lar\u0131",
        candidate_language: "Diller",
        candidate_skill: "Beceri",
        candidates: "Adaylar",
        career_level: "Kariyer Seviyesi",
        conform_password: "\u015eifreyi Onayla",
        current_salary: "Mevcut Maa\u015f",
        dashboard: "G\u00f6sterge Paneli",
        edit_admin: "Y\u00f6neticiyi D\u00fczenle",
        edit_candidate: "Aday\u0131 D\u00fczenle",
        edit_profile_information: "Profil Bilgilerini D\u00fczenle",
        education_not_found: "Mevcut E\u011fitim Yok.",
        email: "Email",
        email_verified: "E-posta Do\u011fruland\u0131",
        employee: "\u00e7al\u0131\u015fan",
        expected_salary: "Beklenen Maa\u015f",
        experience: "Deneyim",
        experience_not_found: "Mevcut Deneyim Yok.",
        expired_job: "S\u00fcresi dolmu\u015f i\u015f",
        father_name: "Baba ad\u0131",
        first_name: "\u0130sim",
        functional_area: "Fonksiyonel B\u00f6lge",
        gender: "Cinsiyet",
        immediate_available: "Hemen Mevcut",
        in_year: "Y\u0131llar i\u00e7inde",
        industry: "Sanayi",
        is_active: "Aktif",
        is_verified: "Do\u011fruland\u0131",
        job_alert_message:
          "Se\u00e7imimle alakal\u0131 bir i\u015f ilan\u0131 yay\u0131nland\u0131\u011f\u0131nda beni E-posta ile bilgilendir.",
        last_name: "Soyad\u0131",
        marital_status: "Medeni hal",
        national_id_card: "Ulusal kimlik kart\u0131",
        nationality: "Milliyet",
        new_admin: "Yeni Y\u00f6netici",
        new_candidate: "Yeni Aday",
        no_candidate_available: "Aday Yok",
        no_candidate_found: "Aday bulunamad\u0131",
        no_reported_candidates_available: "Hi\u00e7bir Aday Rapor Edilmedi",
        no_reported_candidates_found: "Rapor Edilen Aday Bulunamad\u0131",
        not_immediate_available: "Hemen Mevcut De\u011fil",
        password: "Parola",
        phone: "Telefon",
        profile: "Profil",
        reporte_to_candidate: "Adaylara Bildir",
        reported_candidate: "Bildirilen Aday",
        reported_candidate_detail: "Bildirilen Aday Ayr\u0131nt\u0131lar\u0131",
        reported_candidates: "Bildirilen Adaylar",
        reported_employer: "Bildirilen \u0130\u015fveren",
        resume_not_found: "Kullan\u0131labilir \u00d6zge\u00e7mi\u015f Yok.",
        salary_currency: "Maa\u015f Para Birimi",
        salary_per_month: "Ayl\u0131k maa\u015f.",
        select_candidate: "Aday\u0131 Se\u00e7in",
      },
      candidate_dashboard: {
        followings: "A\u015fa\u011f\u0131dakilerden",
        location_information: "Konum Bilgisi mevcut de\u011fil.",
        my_cv_list: "CV Listem",
        no_not_available: "Numara mevcut de\u011fil.",
        profile_views: "Profilin g\u00f6r\u00fcnt\u00fclenme say\u0131s\u0131",
      },
      candidate_profile: {
        add_education: "E\u011fitim Ekle",
        add_experience: "Deneyim Ekle",
        age: "Ya\u015f",
        company: "\u015eirket",
        currently_working: "\u015euan \u00e7al\u0131\u015f\u0131yor",
        degree_level: "Lisans d\u00fczeyinde",
        degree_title: "Derece \u00fcnvan\u0131",
        description: "A\u00e7\u0131klama",
        edit_education: "E\u011fitimi D\u00fczenle",
        edit_experience: "Deneyimi D\u00fczenle",
        education: "E\u011fitim",
        end_date: "Biti\u015f tarihi",
        experience: "Deneyim",
        experience_title: "Deneyim Ba\u015fl\u0131\u011f\u0131",
        institute: "Enstit\u00fc",
        online_profile: "\u00c7evrimi\u00e7i Profil",
        present: "Mevcut",
        result: "Sonu\u00e7",
        select_year: "Y\u0131l Se\u00e7",
        start_date: "Ba\u015flang\u0131\u00e7 tarihi",
        title: "Ba\u015fl\u0131k",
        upload_resume: "Y\u00fcklemeye devam",
        work_experience: "i\u015f deneyimi",
        year: "Y\u0131l",
        years: "y\u0131llar",
      },
      candidates: "Adaylar",
      career_informations: "Kariyer Bilgileris",
      career_level: {
        edit_career_level: "Kariyer Seviyesini D\u00fczenle",
        level_name: "Seviye Ad\u0131",
        new_career_level: "Yeni Kariyer Seviyesi",
        no_career_level_available: "Kariyer Seviyesi Yok",
        no_career_level_found: "Kariyer Seviyesi Bulunamad\u0131",
      },
      career_levels: "Kariyer Seviyeleri",
      city: {
        cities: "\u015eehirler",
        city_name: "\u015eehir \u0130smi",
        edit_city: "\u015eehri D\u00fczenle",
        new_city: "Yeni \u015fehir",
        no_city_available: "\u015eehir Yok",
        no_city_found: "\u015eehir Bulunamad\u0131",
        state_name: "Devlet ad\u0131",
      },
      cms: "CMS",
      cms_about: {
        about_desc_one: "A\u00e7\u0131klama Bir Hakk\u0131nda",
        about_desc_three: "A\u00e7\u0131klama \u00dc\u00e7 Hakk\u0131nda",
        about_desc_two: "A\u00e7\u0131klama \u0130ki Hakk\u0131nda",
        about_image_one: "Resim Bir Hakk\u0131nda",
        about_image_three: "Resim \u00dc\u00e7 Hakk\u0131nda",
        about_image_two: "Resim \u0130ki Hakk\u0131nda",
        about_title_one: "Ba\u015fl\u0131k Bir Hakk\u0131nda",
        about_title_three: "Ba\u015fl\u0131k \u00dc\u00e7 Hakk\u0131nda",
        about_title_two: "Ba\u015fl\u0131k \u0130ki Hakk\u0131nda",
      },
      cms_service: {
        choose: "Se\u00e7mek",
        home_banner: "Ana Sayfa Banner",
        home_description: "Ev A\u00e7\u0131klama",
        home_title: "Ana Ba\u015fl\u0131k",
      },
      cms_services: "\u0130YS Hizmetleri",
      cms_sliders: "Kayd\u0131r\u0131c\u0131lar\u0131",
      common: {
        action: "Aksiyon",
        active: "Aktif",
        add: "Ekle",
        admin_name: "Y\u00f6netici Ad\u0131",
        all: "Her\u015fey",
        and_time: "ve zaman",
        applied: "Uygulamal\u0131",
        applied_on: "\u00dczerine uygulanm\u0131\u015f",
        apply: "Uygulamak",
        approved_by: "Taraf\u0131ndan onayland\u0131",
        are_you_sure: "Bunu silmek istedi\u011finizden emin misiniz?",
        are_you_sure_want_to_delete:
          "Bunu silmek istedi\u011finizden emin misiniz",
        are_you_sure_want_to_reject:
          "Bunu reddetmek istedi\u011finizden emin misiniz?",
        are_you_sure_want_to_select:
          "Bunu se\u00e7mek istedi\u011finizden emin misiniz?",
        back: "Geri",
        cancel: "\u0130ptal etmek",
        category_image: "Kategori Resmi",
        choose: "Se\u00e7",
        choose_file: "Dosya se\u00e7in",
        close: "Kapat",
        completed: "Tamamland\u0131",
        copyright: "Telif Hakk\u0131",
        created_date: "Olu\u015fturulma Tarihi",
        created_on: "Olu\u015fturulma Tarihi",
        custom: "Gelenek",
        de_active: "Deactive",
        decline: "Reddet",
        declined: "reddedildi",
        default_country_code: "Varsay\u0131lan \u00dclke Kodu",
        delete: "Sil",
        deleted: "Silindi",
        description: "A\u00e7\u0131klama",
        design_by: "Taraf\u0131ndan dizayn edildi",
        design_by_name: "InfyOm Labs.",
        download: "\u0130ndir",
        drafted: "Taslak",
        edit: "D\u00fczenle",
        email: "Email",
        error: "Hata",
        expire: "sona erme",
        export_excel: "Excel'e Aktar",
        female: "Kad\u0131n",
        filter_options: "Filtre se\u00e7enekleri",
        filters: "Filtreler",
        from: "\u0130tibaren",
        has_been_deleted: " silindi.",
        has_been_rejected: "reddedildi.",
        has_been_selected: "se\u00e7ilmi\u015f.",
        hello: "Merhaba",
        hi: "Selam",
        hired: "i\u015fe al\u0131nd\u0131",
        image_aspect_ratio:
          "G\u00f6r\u00fcnt\u00fc en boy oran\u0131 1:1 olmal\u0131d\u0131r.",
        image_file_type:
          "G\u00f6r\u00fcnt\u00fc, jpeg, jpg, png t\u00fcr\u00fcnde bir dosya olmal\u0131d\u0131r.",
        last_change_by: "Son De\u011fi\u015fiklikler",
        last_updated: "Son g\u00fcncelleme",
        live: "Canl\u0131",
        login: "Oturum a\u00e7",
        male: "Erkek",
        "n/a": "N / A",
        name: "Ad",
        no: "Hay\u0131r",
        no_cancel: "Hay\u0131r, \u0130ptal",
        not_verified: "Do\u011frulanmad\u0131",
        note: "Not",
        note_message:
          "L\u00fctfen dil k\u0131sa kodunu girin. yani \u0130ngilizce = tr.",
        ok: "Tamam",
        ongoing: "devam ediyor",
        open: "A\u00e7\u0131k",
        pause: "Duraklat",
        paused: "Durduruldu",
        preview: "\u00d6n izleme",
        print: "Yazd\u0131r",
        process: "\u0130\u015fleme...",
        reason: "Sebep",
        register: "Kay\u0131t ol",
        rejected: "reddedildi",
        report: "Bildiri",
        resend_verification_mail:
          "Do\u011frulama Postas\u0131n\u0131 Tekrar G\u00f6nder",
        reset: "S\u0131f\u0131rla",
        save: "Kay\u0131t etmek",
        save_as_draft: "Taslak olarak kaydet",
        saved_successfully: " Ba\u015far\u0131yla kaydedildi",
        search: "Arama",
        select_job_stage: "\u0130\u015f A\u015famas\u0131n\u0131 Se\u00e7in",
        selected: "se\u00e7ilmi\u015f",
        shortlist: "K\u0131sa liste",
        show: "G\u00f6stermek",
        status: "Durum",
        success: " Ba\u015far\u0131l\u0131",
        to: "\u0130le",
        updated_successfully: " ba\u015far\u0131yla g\u00fcncellendi",
        verified: "Do\u011fruland\u0131",
        view: "G\u00f6r\u00fcn\u00fcm",
        view_more: "Daha fazla g\u00f6ster",
        view_profile: "Ad\u0131 G\u00f6r\u00fcnt\u00fcle",
        welcome: "Ho\u015fgeldiniz",
        yes: "Evet",
        yes_delete: "Evet, Sil!",
        you_cancel_slot_date: "Bu yuvay\u0131 tarih i\u00e7in iptal ettiniz",
      },
      companies: "\u015firketler",
      company: {
        candidate_email: "Aday E-postas\u0131",
        candidate_name: "Aday \u0130smi",
        candidate_phone: "Aday Telefon",
        ceo: "CEO Ad\u0131",
        ceo_name: "CEO`nun ad\u0131",
        city: "Kent",
        company_details: "\u015eirket Detaylar\u0131",
        company_listing: "\u015eirket Listesi",
        company_logo: "Logosu",
        company_name: "\u015eirket Ad\u0131",
        company_size: "Boyut",
        confirm_password: "\u015eifreyi Onayla",
        country: "\u00dclke",
        current_password: "Mevcut \u015eifre",
        edit_company: "\u015eirketi D\u00fczenle",
        edit_employer: "\u0130\u015fvereni D\u00fczenle",
        email: "E-postas\u0131",
        email_verified: "E-posta Do\u011fruland\u0131",
        employer: "\u0130\u015fveren",
        employer_ceo: "\u0130\u015fveren CEO",
        employer_details: "\u0130\u015fveren Ayr\u0131nt\u0131lar\u0131",
        employer_name: "\u0130\u015fveren Ad\u0131",
        employers: "\u0130\u015fverenler",
        enter_experience_year: "Y\u0131ldaki Deneyimi Girin",
        established_in: "Kuruldu",
        established_year: "Y\u0131l\u0131 Se\u00e7in",
        facebook_url: "Facebook URL",
        fax: "Faks",
        followers: "Takip\u00e7iler",
        google_plus_url: "Google Art\u0131 URL'si",
        image: "resim",
        industry: "Sanayi",
        is_active: "Aktif",
        is_featured: "\u00d6zellikli",
        linkedin_url: "Linkedin URL'si",
        location: "Yer",
        location2: "2. ofis konumu",
        name: "Ad\u0131",
        new_company: "Yeni \u015eirket",
        new_employer: "Yeni \u0130\u015fveren",
        new_password: "Yeni \u015eifre",
        no_employee_found: "\u00c7al\u0131\u015fan Bulunamad\u0131",
        no_employee_reported_available: "\u00c7al\u0131\u015fan Raporu Yok",
        no_employer_available: "\u00c7al\u0131\u015fan Yok",
        no_of_offices: "Ofis Say\u0131s\u0131",
        no_reported_employer_found:
          "Bildirilen \u0130\u015fveren Bulunamad\u0131",
        notes: "Notlar",
        offices: "Ofisler",
        ownership_type: "M\u00fclkiyet T\u00fcr\u00fc",
        password: "Parola",
        pinterest_url: "Pinterest URL'si",
        report_to_company: "\u015eirkete Rapor Ver",
        reported_by: "Taraf\u0131ndan rapor edildi",
        reported_companies: "Rapor Edilen \u015eirketler",
        reported_company: "Bildirilen \u015eirket",
        reported_employer_detail:
          "Bildirilen \u0130\u015fveren Ayr\u0131nt\u0131s\u0131",
        reported_employers: "Bildirilen \u0130\u015fverenler",
        reported_on: "Rapor Edilme Tarihi",
        select_career_level: "Kariyer Seviyesini Se\u00e7in",
        select_city: "\u015eehir se\u00e7",
        select_company: "\u015eirket Se\u00e7in",
        select_company_size:
          "\u015eirket B\u00fcy\u00fckl\u00fc\u011f\u00fcn\u00fc Se\u00e7in",
        select_country: "\u00dclke Se\u00e7",
        select_currency: "Para birimini se\u00e7in",
        select_degree_level: "Derece Seviyesini Se\u00e7in",
        select_employer_size: "\u0130\u015fveren Boyutunu Se\u00e7in",
        select_established_year: "Kurulu\u015f Y\u0131l\u0131 Se\u00e7in",
        select_functional_area: "\u0130\u015flevsel Alan\u0131 Se\u00e7in",
        select_gender: "Cinsiyet se\u00e7",
        select_industry: "Sekt\u00f6r Se\u00e7in",
        select_job_category: "\u0130\u015f Kategorisini Se\u00e7in",
        select_job_shift: "\u0130\u015f Vardiyas\u0131n\u0131 Se\u00e7in",
        select_job_type: "\u0130\u015f T\u00fcr\u00fcn\u00fc Se\u00e7in",
        select_language: "Dil Se\u00e7in",
        select_marital_status: "Medeni Durum Se\u00e7iniz",
        select_ownership_type: "Sahiplik T\u00fcr\u00fcn\u00fc Se\u00e7in",
        select_position: "Konum Se\u00e7",
        select_salary_period: "Maa\u015f D\u00f6nemi Se\u00e7in",
        select_state: "Eyalet Se\u00e7",
        state: "Durum",
        title: "\u0130\u015f ismi",
        twitter_url: "Twitter URL'si",
        website: "\u0130nternet sitesi",
      },
      company_size: {
        action: "Aksiyon",
        add: "Ekle",
        company_size: "\u015eirket b\u00fcy\u00fckl\u00fc\u011f\u00fc",
        edit_company_size:
          "\u015eirket B\u00fcy\u00fckl\u00fc\u011f\u00fcn\u00fc D\u00fczenle",
        new_company_size: "Yeni \u015eirket B\u00fcy\u00fckl\u00fc\u011f\u00fc",
        no_company_size_available:
          "Mevcut \u015eirket B\u00fcy\u00fckl\u00fc\u011f\u00fc Yok",
        no_company_size_found:
          "\u015eirket B\u00fcy\u00fckl\u00fc\u011f\u00fc Bulunamad\u0131",
        show_company_size: "\u0130\u015f kategorisi",
        size: "Boyut",
      },
      company_sizes: "\u015eirket B\u00fcy\u00fckl\u00fckleri",
      country: {
        countries: "\u00dclkeler",
        country_name: "\u00dclke ad\u0131",
        edit_country: "\u00dclkeyi D\u00fczenle",
        new_country: "Yeni \u00fclke",
        no_country_available: "\u00dclke Yok",
        no_country_found: "\u00dclke Bulunamad\u0131",
        phone_code: "Telefon Kodu",
        short_code: "K\u0131sa kod",
      },
      cv_builder: "CV Olu\u015fturucu",
      dashboard: "G\u00f6sterge Paneli",
      datepicker: {
        last_month: "Ge\u00e7en ay",
        last_week: "Ge\u00e7en hafta",
        this_month: "Bu ay",
        this_week: "Bu hafta",
        today: "Bug\u00fcn",
      },
      email_template: {
        body: "G\u00f6vde",
        edit_email_template: "E-posta \u015eablonunu D\u00fczenle",
        short_code: "K\u0131sa Kod",
        subject: "Konu",
        template_name: "\u015eablon Ad\u0131",
      },
      email_templates: "E-posta \u015eablonlar\u0131",
      employer: {
        job_stage: "\u0130\u015f A\u015famalar\u0131",
        job_stage_desc: "Tan\u0131m",
      },
      employer_dashboard: {
        dashboard: "G\u00f6sterge Paneli",
        followers: "Takip\u00e7iler",
        job_applications: "\u0130\u015f ba\u015fvurular\u0131",
        open_jobs: "A\u00e7\u0131k \u0130\u015fler",
      },
      employer_menu: {
        closed_jobs: "kapal\u0131 i\u015fler",
        employer_details_field:
          "\u0130\u015fveren Ayr\u0131nt\u0131lar\u0131 alan\u0131 zorunludur.",
        employer_profile: "\u0130\u015fveren Profili",
        enter_description: "A\u00e7\u0131klama girin",
        enter_employer_details: "\u0130\u015fveren bilgilerini girin",
        enter_industry_details:
          "Sekt\u00f6r ayr\u0131nt\u0131lar\u0131n\u0131 girin...",
        enter_ownership_details:
          "M\u00fclk ayr\u0131nt\u0131lar\u0131n\u0131 girin...",
        expires_on: "tarihinde sona eriyor",
        followers: "Takip\u00e7iler",
        general_dashboard: "Genel G\u00f6sterge Tablosu",
        jobs: "Meslekler",
        manage_subscriptions: "Abonelikleri Y\u00f6net",
        no_data_available: "uygun veri yok",
        paused_jobs: "duraklat\u0131lan i\u015fler",
        recent_follower: "son takip\u00e7i",
        recent_jobs: "son i\u015fler",
        total_job_applications: "toplam i\u015f ba\u015fvurular\u0131",
        total_jobs: "toplam i\u015f",
        transactions: "\u0130\u015flemler",
        valid_facebook_url: "Ge\u00e7erli bir Facebook URL'si girin",
        valid_google_plus_url: "Ge\u00e7erli bir Google Plus URL'si girin",
        valid_linkedin_url:
          "L\u00fctfen ge\u00e7erli bir Linkedin URL'si girin",
        valid_pinterest_url: "Ge\u00e7erli bir Pinterest URL'si girin",
        valid_twitter_url: "Ge\u00e7erli bir Twitter URL'si girin",
      },
      employers: "\u0130\u015fverenler",
      env: "Ortam ayarlar\u0131",
      expired_jobs: "S\u00fcresi Dolmu\u015f \u0130\u015fler",
      faq: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_faq: "SSS'yi d\u00fczenle",
        faq: "SSS",
        faq_detail: "SSS Ayr\u0131nt\u0131lar\u0131",
        new_faq: "Yeni SSS",
        no_faq_available: "Mevcut SSS Yok",
        no_faq_found: "SSS Bulunamad\u0131",
        show_faq: "SSS",
        title: "Ba\u015fl\u0131k",
      },
      favourite_companies: "A\u015fa\u011f\u0131dakilerden",
      favourite_jobs: "Favori \u0130\u015fler",
      filter_name: {
        closed: "Kapal\u0131",
        country: "\u00dclke",
        digital: "D\u0130J\u0130TAL",
        drafted: "Taslak",
        featured_company: "\u00d6ne \u00c7\u0131kan \u015eirket",
        featured_job: "\u00d6ne \u00c7\u0131kan \u0130\u015f",
        freelancer_job: "Serbest Meslek",
        immediate: "acil",
        job_status: "\u0130\u015f durumu",
        live: "Live",
        manually: "MANUEL OLARAK",
        paused: "duraklat\u0131ld\u0131",
        select_featured_company:
          "\u00d6ne \u00c7\u0131kan \u015eirketi Se\u00e7in",
        select_featured_job: "\u00d6ne \u00c7\u0131kan \u0130\u015fi Se\u00e7",
        select_status: "Select Status",
        state: "Durum",
        status: "Durum",
        suspended_job: "Ask\u0131ya Al\u0131nan \u0130\u015f",
      },
      flash: {
        about_us_update:
          "Hakk\u0131m\u0131zda ba\u015far\u0131yla g\u00fcncellendi.",
        admin_cant_delete: "Y\u00f6netici silinemez.",
        admin_delete: "Y\u00f6netici ba\u015far\u0131yla silindi.",
        admin_save: "Y\u00f6netici ba\u015far\u0131yla kaydedildi.",
        admin_update: "Y\u00f6netici ba\u015far\u0131yla g\u00fcncellendi.",
        all_notification_read:
          "T\u00fcm Bildirimler ba\u015far\u0131yla okundu.",
        are_you_sure_to_change_status:
          "Durumu de\u011fi\u015ftirmek istedi\u011finizden emin misiniz?",
        assigned_slot_not_delete: "Atanan yuva silinmemelidir.",
        attention: "Dikkat",
        brand_delete: "Marka ba\u015far\u0131yla silindi.",
        brand_retrieved: "Marka ba\u015far\u0131yla al\u0131nd\u0131.",
        brand_save: "Marka ba\u015far\u0131yla kaydedildi.",
        brand_update: "Marka ba\u015far\u0131yla g\u00fcncellendi.",
        cancel_reason_require: "\u0130ptal nedeni gerekli.",
        candidate_delete: "Aday ba\u015far\u0131yla silindi.",
        candidate_education_delete:
          "Aday E\u011fitimi ba\u015far\u0131yla silindi.",
        candidate_education_retrieved:
          "Aday E\u011fitimi ba\u015far\u0131yla al\u0131nd\u0131.",
        candidate_education_save:
          "Aday E\u011fitimi ba\u015far\u0131yla eklendi.",
        candidate_education_update:
          "Aday E\u011fitimi ba\u015far\u0131yla g\u00fcncellendi.",
        candidate_experience_delete:
          "Aday Deneyimi ba\u015far\u0131yla silindi.",
        candidate_experience_retrieved:
          "Aday Deneyimi ba\u015far\u0131yla al\u0131nd\u0131.",
        candidate_experience_save: "Aday Deneyimi ba\u015far\u0131yla eklendi.",
        candidate_experience_update:
          "Aday Deneyimi ba\u015far\u0131yla g\u00fcncellendi.",
        candidate_not_found: "Aday bulunamad\u0131",
        candidate_profile: "Aday profili ba\u015far\u0131yla g\u00fcncellendi.",
        candidate_reported: "Aday ba\u015far\u0131yla bildirildi.",
        candidate_retrieved: "Aday ba\u015far\u0131yla al\u0131nd\u0131.",
        candidate_save: "Aday ba\u015far\u0131yla kaydedildi.",
        candidate_update: "Aday ba\u015far\u0131yla g\u00fcncellendi.",
        career_level_cant_delete: "Kariyer Seviyesi silinemez.",
        career_level_delete: "Kariyer Seviyesi ba\u015far\u0131yla silindi.",
        career_level_retrieved:
          "Kariyer Seviyesi ba\u015far\u0131yla al\u0131nd\u0131.",
        career_level_save: "Kariyer Seviyesi ba\u015far\u0131yla eklendi.",
        career_level_update:
          "Kariyer Seviyesi ba\u015far\u0131yla g\u00fcncellendi.",
        city_cant_delete: "\u015eehir silinemez.",
        city_delete: "\u015eehir ba\u015far\u0131yla silindi.",
        city_retrieved: "\u015eehir ba\u015far\u0131yla al\u0131nd\u0131.",
        city_save: "\u015eehir ba\u015far\u0131yla kaydedildi.",
        city_update: "\u015eehir ba\u015far\u0131yla g\u00fcncellendi.",
        close_job: "Kapat\u0131lan i\u015f d\u00fczenlenemez.",
        cms_service_update:
          "CMS Hizmetleri ba\u015far\u0131yla g\u00fcncellendi.",
        comment_deleted: "Yorum ba\u015far\u0131yla silindi.",
        comment_edit: "Yorum ba\u015far\u0131yla d\u00fczenlendi.",
        comment_saved: "Yorum ba\u015far\u0131yla kaydedildi.",
        comment_updated: "Yorum ba\u015far\u0131yla g\u00fcncellendi.",
        company_delete: "\u015eirket ba\u015far\u0131yla silindi.",
        company_mark_feature:
          "\u015eirket ba\u015far\u0131yla \u00f6ne \u00e7\u0131kt\u0131 olarak i\u015faretlendi.",
        company_mark_unFeature:
          "\u015eirket ba\u015far\u0131yla \u00f6ne \u00e7\u0131kmad\u0131 olarak i\u015faretlendi.",
        company_save: "\u015eirket ba\u015far\u0131yla kaydedildi.",
        company_size_cant_delete: "\u015eirket Boyutu silinemez.",
        company_size_delete: "\u015eirket Boyutu ba\u015far\u0131yla silindi.",
        company_size_save: "\u015eirket Boyutu ba\u015far\u0131yla kaydedildi.",
        company_size_update:
          "\u015eirket Boyutu ba\u015far\u0131yla g\u00fcncellendi.",
        company_update: "\u015eirket ba\u015far\u0131yla g\u00fcncellendi.",
        country_cant_delete: "\u00dclke silinemez.",
        country_delete: "\u00dclke ba\u015far\u0131yla silindi.",
        country_save: "\u00dclke ba\u015far\u0131yla kaydedildi.",
        country_update: "\u00dclke ba\u015far\u0131yla g\u00fcncellendi.",
        default_resume_already_upload:
          "Varsay\u0131lan \u00d6zge\u00e7mi\u015f zaten y\u00fcklendi.",
        degree_level_cant_delete: "Derece D\u00fczeyi silinemez.",
        degree_level_delete: "Derece D\u00fczeyi ba\u015far\u0131yla silindi.",
        degree_level_retrieve:
          "Derece D\u00fczeyi Ba\u015far\u0131yla Al\u0131nd\u0131.",
        degree_level_save: "Derece D\u00fczeyi ba\u015far\u0131yla kaydedildi.",
        degree_level_update:
          "Derece D\u00fczeyi ba\u015far\u0131yla g\u00fcncellendi.",
        description_required: "A\u00e7\u0131klama alan\u0131 zorunludur.",
        email_template:
          "E-posta \u015eablonu ba\u015far\u0131yla g\u00fcncellendi.",
        email_verify: "E-posta ba\u015far\u0131yla do\u011fruland\u0131.",
        employer_profile:
          "\u0130\u015fveren Profili ba\u015far\u0131yla g\u00fcncellendi.",
        employer_update:
          "\u0130\u015fveren ba\u015far\u0131yla g\u00fcncellendi.",
        enter_cancel_reason: "\u0130ptal Nedenini Girin...",
        enter_description: "A\u00e7\u0131klama girin",
        enter_notes: "Notlar\u0131 Girin...",
        enter_post_description:
          "G\u00f6nderi A\u00e7\u0131klamas\u0131n\u0131 Girin",
        faqs_delete: "SSS ba\u015far\u0131yla silindi.",
        faqs_save: "SSS ba\u015far\u0131yla kaydedildi.",
        faqs_update: "SSS ba\u015far\u0131yla g\u00fcncellendi.",
        fav_company_delete: "Favori \u015eirket ba\u015far\u0131yla silindi.",
        fav_job_added: "Favori \u0130\u015f ba\u015far\u0131yla eklendi.",
        fav_job_remove: "Favori \u0130\u015f kald\u0131r\u0131ld\u0131.",
        fav_job_removed:
          "Favori \u0130\u015f ba\u015far\u0131yla kald\u0131r\u0131ld\u0131.",
        feature_job_price:
          "\u00d6ne \u00e7\u0131kan i\u015flerin fiyat\u0131 0'dan b\u00fcy\u00fck olmal\u0131d\u0131r",
        feature_quota: "\u00d6ne \u00c7\u0131kan Kota mevcut de\u011fil",
        featured_not_available:
          "\u00d6ne \u00c7\u0131kan Kota mevcut de\u011fil.",
        file_type:
          "Belge \u015fu t\u00fcrde bir dosya olmal\u0131d\u0131r: jpeg, jpg, pdf, doc, docx.",
        functional_area_cant_delete: "\u0130\u015flevsel Alan silinemez.",
        functional_area_delete:
          "\u0130\u015flevsel Alan ba\u015far\u0131yla silindi.",
        functional_area_save:
          "\u0130\u015flevsel Alan ba\u015far\u0131yla kaydedildi.",
        functional_area_update:
          "\u0130\u015flevsel Alan ba\u015far\u0131yla g\u00fcncellendi.",
        header_slider_deleted:
          "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla silindi.",
        header_slider_save:
          "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla kaydedildi.",
        header_slider_update:
          "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        image_slider_delete:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla silindi.",
        image_slider_retrieve:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 Ba\u015far\u0131yla Al\u0131nd\u0131.",
        image_slider_save:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla kaydedildi.",
        image_slider_update:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        industry_cant_delete: "Sekt\u00f6r silinemez.",
        industry_delete: "Sekt\u00f6r ba\u015far\u0131yla silindi.",
        industry_save: "Sekt\u00f6r ba\u015far\u0131yla kaydedildi.",
        industry_update: "Sekt\u00f6r ba\u015far\u0131yla g\u00fcncellendi.",
        inquiry_deleted: "Sorgu ba\u015far\u0131yla silindi.",
        inquiry_retrieve:
          "Soru\u015fturma Ba\u015far\u0131yla Al\u0131nd\u0131.",
        invoice_retrieve: "Fatura Ba\u015far\u0131yla Al\u0131nd\u0131.",
        job_abuse_reported:
          "\u0130\u015f Suistimali ba\u015far\u0131yla bildirildi.",
        job_alert:
          "\u0130\u015f Uyar\u0131s\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        job_application_delete:
          "\u0130\u015f Ba\u015fvurusu ba\u015far\u0131yla silindi.",
        job_application_draft:
          "\u0130\u015f Ba\u015fvurusu Ba\u015far\u0131yla Haz\u0131rland\u0131",
        job_applied: "\u0130\u015f Ba\u015far\u0131yla Uyguland\u0131",
        job_apply_by_candidate:
          "Aday\u0131n ba\u015fvurdu\u011fu i\u015f silinemez.",
        job_cant_delete: "\u0130\u015f Sil olamazd",
        job_category_cant_delete: "\u0130\u015f Kategorisi silinemez.",
        job_category_delete:
          "\u0130\u015f Kategorisi Ba\u015far\u0131yla Silindi.",
        job_category_save:
          "\u0130\u015f Kategorisi ba\u015far\u0131yla kaydedildi.",
        job_category_update:
          "\u0130\u015f Kategorisi G\u00fcncellemesi ba\u015far\u0131yla yap\u0131ld\u0131.",
        job_create_limit:
          "Hesab\u0131n\u0131z\u0131n i\u015f yaratma limiti a\u015f\u0131ld\u0131, Abonelik plan\u0131n\u0131z\u0131 g\u00fcncelleyin.",
        job_delete: "\u0130\u015f ba\u015far\u0131yla silindi.",
        job_draft:
          "\u0130\u015f Tasla\u011f\u0131 ba\u015far\u0131yla kaydedildi.",
        job_emailed_to:
          "\u0130\u015f arkada\u015f\u0131na ba\u015far\u0131yla e-postayla g\u00f6nderildi.",
        job_make_featured:
          "\u0130\u015f Yapma Ba\u015far\u0131yla \u00d6ne \u00c7\u0131kt\u0131.",
        job_make_unfeatured:
          "Job Make UnFeatured ba\u015far\u0131yla yap\u0131ld\u0131.",
        job_not_found: "\u0130\u015f Bulunamad\u0131.",
        job_notification:
          "\u0130\u015f Bildirimi ba\u015far\u0131yla g\u00f6nderildi.",
        job_save: "\u0130\u015f ba\u015far\u0131yla kaydedildi.",
        job_schedule_send:
          "i\u015f program\u0131 ba\u015far\u0131yla g\u00f6nderildi.",
        job_shift_cant_delete: "\u0130\u015f Vardiyas\u0131 silinemez.",
        job_shift_delete:
          "\u0130\u015f Vardiyas\u0131 ba\u015far\u0131yla silindi.",
        job_shift_retrieve:
          "\u0130\u015f De\u011fi\u015fimi Ba\u015far\u0131yla Al\u0131nd\u0131.",
        job_shift_save:
          "\u0130\u015f Vardiyas\u0131 ba\u015far\u0131yla kaydedildi.",
        job_shift_update:
          "\u0130\u015f Vardiyas\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        job_stage_cant_delete: "\u0130\u015f A\u015famas\u0131 silinemez.",
        job_stage_change:
          "\u0130\u015f A\u015famas\u0131 ba\u015far\u0131yla de\u011fi\u015ftirildi.",
        job_stage_delete:
          "\u0130\u015f A\u015famas\u0131 ba\u015far\u0131yla silindi.",
        job_stage_retrieve:
          "\u0130\u015f A\u015famas\u0131 Ba\u015far\u0131yla Al\u0131nd\u0131.",
        job_stage_save:
          "\u0130\u015f A\u015famas\u0131 ba\u015far\u0131yla kaydedildi.",
        job_stage_update: "Job Stage ba\u015far\u0131yla g\u00fcncellendi.",
        job_tag_cant_delete: "\u0130\u015f Etiketi silinemez.",
        job_tag_delete: "\u0130\u015f Etiketi ba\u015far\u0131yla silindi.",
        job_tag_retrieve:
          "\u0130\u015f Etiketi Ba\u015far\u0131yla Al\u0131nd\u0131.",
        job_tag_save: "\u0130\u015f Etiketi ba\u015far\u0131yla kaydedildi.",
        job_tag_update:
          "\u0130\u015f Etiketi ba\u015far\u0131yla g\u00fcncellendi.",
        job_type_cant_delete: "\u0130\u015f T\u00fcr\u00fc silinemez.",
        job_type_delete:
          "\u0130\u015f T\u00fcr\u00fc ba\u015far\u0131yla silindi.",
        job_type_retrieve:
          "\u0130\u015f T\u00fcr\u00fc Ba\u015far\u0131yla Al\u0131nd\u0131.",
        job_type_save:
          "\u0130\u015f T\u00fcr\u00fc ba\u015far\u0131yla kaydedildi.",
        job_type_update:
          "\u0130\u015f T\u00fcr\u00fc ba\u015far\u0131yla g\u00fcncellendi.",
        job_update: "\u0130\u015f ba\u015far\u0131yla g\u00fcncellendi.",
        language_added: "Dil ba\u015far\u0131yla eklendi.",
        language_changed: "Dil ba\u015far\u0131yla de\u011fi\u015ftirildi",
        language_delete: "Dil Ba\u015far\u0131yla Silindi.",
        language_retrieve: "Dil Ba\u015far\u0131yla Al\u0131nd\u0131.",
        language_save: "Dil ba\u015far\u0131yla kaydedildi.",
        language_update: "Dil Ba\u015far\u0131yla G\u00fcncellendi.",
        link_copy: "Ba\u011flant\u0131 Ba\u015far\u0131yla Kopyaland\u0131.",
        manual_payment: "Manuel \u00d6deme Ba\u015far\u0131yla Onayland\u0131.",
        manual_payment_denied:
          "Manuel \u00d6deme Ba\u015far\u0131yla Reddedildi.",
        marital_status_delete: "Medeni Durum ba\u015far\u0131yla silindi.",
        marital_status_retrieve:
          "Medeni Durum Ba\u015far\u0131yla Al\u0131nd\u0131.",
        marital_status_save: "Medeni Durum ba\u015far\u0131yla kaydedildi.",
        marital_status_update:
          "Medeni Durum ba\u015far\u0131yla g\u00fcncellendi.",
        media_delete: "Medya ba\u015far\u0131yla silindi.",
        newsletter_delete: "B\u00fclten ba\u015far\u0131yla silindi.",
        no_record: "Kay\u0131t bulunamad\u0131.",
        not_deleted: "Silinmedi",
        noticeboard_retrieve:
          "Bildiri Panosu Ba\u015far\u0131yla Al\u0131nd\u0131.",
        noticeboard_save: "Bildiri panosu ba\u015far\u0131yla kaydedildi.",
        noticeboard_update:
          "Bildiri panosu ba\u015far\u0131yla g\u00fcncellendi.",
        notification_read: "Bildirim ba\u015far\u0131yla okundu.",
        notification_setting_update:
          "Bildirim ayarlar\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        ownership_type_cant_delete: "SahipShip T\u00fcr\u00fc silinemez.",
        ownership_type_delete: "SahipShip Type ba\u015far\u0131yla silindi.",
        ownership_type_retrieve:
          "OwnerShip Type ba\u015far\u0131yla al\u0131nd\u0131.",
        ownership_type_save: "OwnerShip Type ba\u015far\u0131yla kaydedildi.",
        ownership_type_updated:
          "OwnerShip Type ba\u015far\u0131yla g\u00fcncellendi.",
        password_update: "\u015eifre ba\u015far\u0131yla g\u00fcncellendi.",
        payment_failed_try_again:
          "\u00dczg\u00fcn\u00fcm! \u00d6deme ba\u015far\u0131s\u0131z oldu, l\u00fctfen daha sonra tekrar deneyin.",
        payment_not_complete: "\u00d6demeniz tamamlanmad\u0131",
        payment_success: "\u00d6demeniz ba\u015far\u0131yla tamamland\u0131",
        plan_Save: "Plan ba\u015far\u0131yla kaydedildi.",
        plan_cant_delete:
          "Plan silinemez, bir veya daha fazla aktif abonelik i\u00e7erir.",
        plan_cant_update:
          "Plan g\u00fcncellenemez. Bu plan i\u00e7in abonelik zaten var",
        plan_delete: "Plan ba\u015far\u0131yla silindi.",
        plan_retrieve: "Plan Ba\u015far\u0131yla Al\u0131nd\u0131.",
        plan_update: "Plan ba\u015far\u0131yla g\u00fcncellendi.",
        please_wait_for:
          "L\u00fctfen y\u00f6netici onay\u0131n\u0131 bekleyin, zaten manuel \u00f6deme eklediniz",
        please_wait_for_com:
          "\u0130\u015fleminizi tamamlamak i\u00e7in l\u00fctfen Y\u00f6netici onay\u0131n\u0131 bekleyin",
        policy_update: "Politika ba\u015far\u0131yla g\u00fcncellendi.",
        post_category_delete:
          "Yaz\u0131 kategorisi ba\u015far\u0131yla silindi.",
        post_category_retrieve:
          "Yaz\u0131 kategorisi Ba\u015far\u0131yla Al\u0131nd\u0131.",
        post_category_save:
          "Yaz\u0131 kategorisi ba\u015far\u0131yla kaydedildi.",
        post_category_update:
          "Yaz\u0131 kategorisi ba\u015far\u0131yla g\u00fcncellendi.",
        post_comment: "Yorumlar Ba\u015far\u0131yla Al\u0131nd\u0131.",
        post_delete: "G\u00f6nderi ba\u015far\u0131yla silindi.",
        post_save: "G\u00f6nderi ba\u015far\u0131yla kaydedildi.",
        post_update: "G\u00f6nderi ba\u015far\u0131yla g\u00fcncellendi.",
        profile_update: "Profil ba\u015far\u0131yla g\u00fcncellendi.",
        reason_require: "\u0130ptal Nedeni gereklidir.",
        register_success_mail_active:
          "Ba\u015far\u0131yla kay\u0131t oldunuz, Hesab\u0131n\u0131z\u0131 postadan etkinle\u015ftirin.",
        registration_done: "Kay\u0131t ba\u015far\u0131yla tamamland\u0131.",
        report_to_company: "\u015eirkete ba\u015far\u0131yla rapor verin.",
        reported_candidate_delete:
          "Bildirilen Aday ba\u015far\u0131yla silindi.",
        reported_job_delete:
          "Bildirilen \u0130\u015fler ba\u015far\u0131yla silindi.",
        resume_delete:
          "Silme i\u015flemini ba\u015far\u0131yla s\u00fcrd\u00fcr\u00fcn.",
        resume_update: "Devam ba\u015far\u0131yla g\u00fcncellendi.",
        retrieved: "Ba\u015far\u0131yla al\u0131nd\u0131.",
        salary_currency_cant_delete: "Maa\u015f para birimi silinemez.",
        salary_currency_destroy:
          "Maa\u015f Para Birimi ba\u015far\u0131yla silindi.",
        salary_currency_edit:
          "Maa\u015f Para Birimi ba\u015far\u0131yla al\u0131nd\u0131.",
        salary_currency_store:
          "Maa\u015f Para Birimi ba\u015far\u0131yla kaydedildi.",
        salary_currency_update:
          "Maa\u015f Para Birimi ba\u015far\u0131yla g\u00fcncellendi.",
        salary_period_cant_delete: "Maa\u015f D\u00f6nemi silinemez.",
        salary_period_delete:
          "Maa\u015f D\u00f6nemi ba\u015far\u0131yla silindi.",
        salary_period_retrieve:
          "Maa\u015f D\u00f6nemi Ba\u015far\u0131yla Al\u0131nd\u0131.",
        salary_period_save:
          "Maa\u015f D\u00f6nemi ba\u015far\u0131yla kaydedildi.",
        salary_period_update:
          "Maa\u015f D\u00f6nemi ba\u015far\u0131yla g\u00fcncellendi.",
        select_employer: "\u0130\u015fveren Se\u00e7inr",
        select_job: "\u0130\u015f Se\u00e7",
        select_job_skill: "\u0130\u015f Becerisini Se\u00e7in",
        select_job_tag: "\u0130\u015f Etiketini Se\u00e7in",
        select_post_category: "G\u00f6nderi Kategorisini Se\u00e7in",
        select_skill:
          "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043d\u0430\u0432\u044b\u043a",
        session_created: "Oturum ba\u015far\u0131yla olu\u015fturuldu.",
        setting_update: "Ayar ba\u015far\u0131yla g\u00fcncellendi.",
        skill_cant_delete: "Beceri silinemez.",
        skill_delete: "Beceri ba\u015far\u0131yla silindi.",
        skill_save: "Beceri ba\u015far\u0131yla kaydedildi.",
        skill_update: "Beceri ba\u015far\u0131yla g\u00fcncellendi.",
        slot_already_taken: "Slot zaten al\u0131nm\u0131\u015f",
        slot_cancel: "Slot Ba\u015far\u0131yla \u0130ptal Edildi.",
        slot_choose: "Slot se\u00e7imi ba\u015far\u0131yla",
        slot_create: "Slotlar Ba\u015far\u0131yla Olu\u015fturuldu",
        slot_delete: "Slot ba\u015far\u0131yla silindi.",
        slot_preference_field: "Yuva Tercihi Alan\u0131 gerekli",
        slot_reject: "Slotlar ba\u015far\u0131yla reddedildi",
        slot_update: "Slot Ba\u015far\u0131yla G\u00fcncellendi.",
        state_cant_delete: "Durum silinemez.",
        state_delete: "Durum ba\u015far\u0131yla silindi.",
        state_save: "Durum ba\u015far\u0131yla kaydedildi.",
        state_update: "Durum ba\u015far\u0131yla g\u00fcncellendi.",
        status_change: "Durum ba\u015far\u0131yla de\u011fi\u015ftirildi.",
        status_update: "Durum ba\u015far\u0131yla g\u00fcncellendi.",
        subscribed: "Ba\u015far\u0131yla abone olundu.",
        subscription_cancel: "Abonelik ba\u015far\u0131yla iptal edildi.",
        subscription_resume: "Abonelik ba\u015far\u0131yla devam ettirildi.",
        success_verify:
          "E-postan\u0131z\u0131 ba\u015far\u0131yla do\u011frulad\u0131n\u0131z. L\u00fctfen giri\u015f yap\u0131n !",
        testimonial_delete:
          "G\u00f6r\u00fc\u015fler ba\u015far\u0131yla silindi.",
        testimonial_retrieve:
          "G\u00f6r\u00fc\u015fler Ba\u015far\u0131yla Al\u0131nd\u0131.",
        testimonial_save:
          "G\u00f6r\u00fc\u015f ba\u015far\u0131yla kaydedildi.",
        testimonial_update:
          "G\u00f6r\u00fc\u015fler ba\u015far\u0131yla g\u00fcncellendi.",
        the_name_has: "Ad zaten al\u0131nd\u0131",
        there_are_no: "Y\u00fcklenen \u00f6zge\u00e7mi\u015f yok.",
        this_currency_is:
          "Bu para birimi PayPal taraf\u0131ndan \u00f6deme yapmak i\u00e7in desteklenmiyor.",
        translation_update: "\u00c7eviri ba\u015far\u0131yla g\u00fcncellendi.",
        trial_plan_update:
          "Deneme Plan\u0131 ba\u015far\u0131yla g\u00fcncellendi.",
        unfollow_company:
          "\u015eirketi ba\u015far\u0131yla takip etmeyi b\u0131rak\u0131n.",
        verification_mail:
          "Do\u011frulama postas\u0131 ba\u015far\u0131yla yeniden g\u00f6nderildi.",
        your_are_not_author:
          "Yor aboneli\u011fin yazar\u0131 de\u011filsiniz. bu y\u00fczden bu aboneli\u011fi iptal etme izniniz yok.",
        your_payment_comp: "\u00d6demeniz ba\u015far\u0131yla tamamland\u0131",
      },
      footer_settings: "Alt Bilgi Ayarlar\u0131",
      front_cms: "\u00d6n CMS",
      front_home: {
        candidates: "Adaylar",
        companies: "\u015eirketler",
        jobs: "Meslekler",
        resumes: "\u00d6zge\u00e7mi\u015fler",
      },
      front_settings: {
        exipre_on: "Exipre A\u00e7\u0131k",
        expires_on: "Tarihinde sona eriyor",
        featured: "\u00d6ne \u00e7\u0131kan",
        featured_companies_days:
          "\u00d6ne \u00c7\u0131kan \u015eirketler G\u00fcnleri",
        featured_companies_due_days:
          "Varsay\u0131lan \u015eirketler Vade G\u00fcnleri",
        featured_companies_enable:
          "\u00d6ne \u00c7\u0131kan \u015eirketler etkinle\u015ftirir",
        featured_companies_price:
          "\u00d6ne \u00c7\u0131kan \u015eirketler Fiyat\u0131",
        featured_companies_quota:
          "\u00d6ne \u00c7\u0131kan \u015eirketler Kotas\u0131",
        featured_employer_not_available:
          "\u00f6ne \u00e7\u0131kan i\u015fveren mevcut de\u011fil",
        featured_job: "\u00d6ne \u00c7\u0131kan \u0130\u015f",
        featured_jobs_days:
          "\u00d6ne \u00c7\u0131kan \u0130\u015f G\u00fcnleri",
        featured_jobs_due_days:
          "Varsay\u0131lan \u0130\u015fler Son G\u00fcnler",
        featured_jobs_enable:
          "\u00d6ne \u00e7\u0131kan i\u015fler etkinle\u015ftirir",
        featured_jobs_price:
          "\u00d6ne \u00c7\u0131kan \u0130\u015fler Fiyat\u0131",
        featured_jobs_quota:
          "\u00d6ne \u00c7\u0131kan \u0130\u015fler Kotas\u0131",
        featured_listing_currency: "\u00d6ne \u00c7\u0131kan Liste Para Birimi",
        latest_jobs_enable:
          "Oturum a\u00e7an kullan\u0131c\u0131n\u0131n \u00fclkesine g\u00f6re en son i\u015fleri g\u00f6ster",
        latest_jobs_enable_message:
          "Giri\u015f yapt\u0131klar\u0131nda aday\u0131n / i\u015fverenin \u00fclkesinin en son i\u015flerini g\u00f6sterecektir.",
        make_feature: "\u00f6zellik yapmak",
        make_featured: "\u00d6ne \u00c7\u0131k\u0131n",
        make_featured_job: "\u00d6ne \u00c7\u0131kan \u0130\u015f Yap",
        pay_to_get: "Almak i\u00e7in \u00f6de",
        remove_featured:
          "\u00f6ne \u00e7\u0131kar\u0131lanlar\u0131 kald\u0131r",
      },
      functional_area: {
        edit_functional_area: "Fonksiyonel Alan\u0131 D\u00fczenle",
        name: "Ad",
        new_functional_area: "Yeni Fonksiyonel Alan",
        no_functional_area_available:
          "Kullan\u0131labilir \u0130\u015flevsel Alan Yok",
        no_functional_area_found: "\u0130\u015flevsel Alan Bulunamad\u0131",
      },
      functional_areas: "Fonksiyonel Alanlar",
      general: "Genel",
      general_dashboard: "Genel G\u00f6sterge Tablosu",
      general_settings: "Genel Ayarlar",
      go_to_homepage: "Ana sayfaya git",
      header_slider: {
        edit_header_slider:
          "\u00dcst Bilgi Kayd\u0131r\u0131c\u0131s\u0131n\u0131 D\u00fczenle",
        header_slider: "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131",
        image_size_message:
          "G\u00f6r\u00fcnt\u00fc piksel 1920 x 1080 piksel veya \u00fczerinde olmal\u0131d\u0131r.",
        image_title_text:
          "En iyi kullan\u0131c\u0131 deneyimini elde etmek i\u00e7in 1920 x 1080 piksel veya \u00fczeri piksel resmi y\u00fckleyin.",
        new_header_slider:
          "Yeni Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131",
        no_header_slider_available:
          "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131s\u0131 Yok",
      },
      header_sliders: "Ba\u015fl\u0131k Kayd\u0131r\u0131c\u0131lar\u0131",
      image_slider: {
        action: "Eylem",
        description: "A\u00e7\u0131klama",
        edit_image_slider:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131n\u0131 D\u00fczenle",
        image: "Resim",
        image_extension_message:
          "Resim, png, jpg, jpeg t\u00fcr\u00fcnde bir dosya olmal\u0131d\u0131r.",
        image_size_message:
          "Resim 1140 x 500 piksel veya \u00fczeri piksel olmal\u0131d\u0131r.",
        image_slider: "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131",
        image_slider_details:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131 Ayr\u0131nt\u0131lar\u0131",
        image_title_text:
          "En iyi kullan\u0131c\u0131 deneyimini elde etmek i\u00e7in 1140 x 500 piksel veya \u00fczeri piksel resmi y\u00fckleyin.",
        is_active: "Ekle",
        message:
          "Ana sayfadaki i\u015f aramas\u0131n\u0131 devre d\u0131\u015f\u0131 b\u0131rak\u0131n",
        message_title:
          "Bu ge\u00e7i\u015f devre d\u0131\u015f\u0131 b\u0131rak\u0131l\u0131rsa, varsay\u0131lan arama ekran\u0131 g\u00f6r\u00fcnmeyecektir.",
        new_image_slider: "Yeni Resim Kayd\u0131r\u0131c\u0131s\u0131",
        no_image_slider_available:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 Yok",
        no_image_slider_found:
          "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131s\u0131 Bulunamad\u0131",
        select_status: "Durum Se\u00e7in",
        slider:
          "Tam geni\u015flik kayd\u0131r\u0131c\u0131s\u0131n\u0131 etkinle\u015ftirin.",
        slider_active:
          "Ana sayfa resim kayd\u0131r\u0131c\u0131s\u0131n\u0131 devre d\u0131\u015f\u0131 b\u0131rak\u0131n",
        slider_active_title:
          "Bu ge\u00e7i\u015f devre d\u0131\u015f\u0131 b\u0131rak\u0131l\u0131rsa, varsay\u0131lan g\u00f6r\u00fcnt\u00fc kayd\u0131r\u0131c\u0131 ekran\u0131 g\u00f6r\u00fcnmez.",
        slider_title:
          "Bu ge\u00e7i\u015f etkinle\u015ftirilirse, g\u00f6r\u00fcnt\u00fc kayd\u0131r\u0131c\u0131s\u0131 tam geni\u015flikte ekrand\u0131r.",
      },
      image_sliders: "G\u00f6r\u00fcnt\u00fc Kayd\u0131r\u0131c\u0131lar",
      industries: "Sekt\u00f6rler",
      industry: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_industry: "Sekt\u00f6r\u00fc D\u00fczenle",
        industry_detail: "Sekt\u00f6r Ayr\u0131nt\u0131lar\u0131",
        name: "Ad",
        new_industry: "Yeni Sanayi",
        no_industry_available: "Sekt\u00f6r Yok",
        no_industry_found: "Sekt\u00f6r Bulunamad\u0131",
        size: "Boyut",
      },
      inquires: "Sorgular",
      inquiry: {
        email: "Email",
        inquiry: "soru\u015fturma",
        inquiry_date: "Sorgulama Tarihi",
        inquiry_details: "Soru\u015fturma detaylar\u0131",
        message: "\u0130leti",
        name: "Ad",
        no_inquiry_available: "Soru\u015fturma Yok",
        no_inquiry_found: "Soru\u015fturma Bulunamad\u0131",
        phone_no: "Telefon yok",
        subject: "Konu",
      },
      job: {
        add_note: "Not ekle",
        applies_job_not_found: "Uygulanan \u0130\u015f Bulunamad\u0131",
        career_level: "Kariyer Seviyesi",
        city: "Kent",
        country: "\u00dclke",
        created_at: "Olu\u015fturulma Tarihi",
        currency: "Para birimi",
        degree_level: "Lisans d\u00fczeyinde",
        description: "A\u00e7\u0131klama",
        edit_job: "\u0130\u015fi D\u00fczenle",
        email_to_friend: "Arkada\u015fa E-posta G\u00f6nder",
        expires_on: "Tarihinde sona eriyor",
        favourite_companies_not_found: "Favori \u015eirket Bulunamad\u0131",
        favourite_company: "Favori \u015eirket",
        favourite_job: "Favori \u0130\u015f",
        favourite_job_not_found: "Favori \u0130\u015f Bulunamad\u0131",
        following_company_not_found: "Takip Edilen \u015eirket Bulunamad\u0131",
        friend_email: "Arkada\u015f E-postas\u0131",
        friend_name: "Arkada\u015f ismi",
        functional_area: "Fonksiyonel B\u00f6lge",
        hide_salary: "Maa\u015f\u0131 Gizle",
        is_featured: "\u00d6zellikli",
        is_freelance: "Serbest mi",
        is_suspended: "Ask\u0131ya Al\u0131nd\u0131",
        job: "\u0130\u015f",
        job_alert: "Alerta de emprego",
        job_details: "\u0130\u015f Detaylar\u0131",
        job_expiry_date: "\u0130\u015fin Biti\u015f Tarihi",
        job_shift: "\u0130\u015f Vardiyas\u0131",
        job_skill: "\u0130\u015f yetene\u011fi",
        job_title: "\u0130\u015f ismi",
        job_type: "Meslek t\u00fcr\u00fc",
        job_url: "\u0130\u015f URL'si",
        new_job: "Yeni i\u015f",
        no_applied_job_found: "Uygulanan \u0130\u015f Yok",
        no_favourite_job_found: "Kullan\u0131labilir Favori \u0130\u015f Yok",
        no_followers_available: "\u0130zleyici Yok",
        no_followers_found: "Takip\u00e7i bulunamad\u0131",
        no_following_companies_found:
          "A\u015fa\u011f\u0131daki \u015eirket M\u00fcsait De\u011fil",
        no_job_reported_available: "Rapor Edilmemi\u015f \u0130\u015f Yok",
        no_preference: "Tercih yok",
        no_reported_job_found:
          "Rapor Edilmi\u015f \u0130\u015f Bulunamad\u0131",
        notes: "Notlar",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "L\u00fctfen Maa\u015f Aral\u0131\u011f\u0131n\u0131 Giren Maa\u015f Aral\u0131\u011f\u0131ndan daha b\u00fcy\u00fck girin.",
        position: "Durum",
        remove_favourite_jobs: "Favori \u0130\u015fi Kald\u0131r",
        reported_job: "Bildirilen \u0130\u015f",
        reported_jobs_detail:
          "Bildirilen \u0130\u015f Ayr\u0131nt\u0131s\u0131",
        reported_user: "Bildirilen Kullan\u0131c\u0131",
        salary_from: "Maa\u015f",
        salary_period: "Maa\u015f D\u00f6nemi",
        salary_to: "Maa\u015f",
        state: "Durum",
        subscriber: "Abone",
        view_drafted_job: "Taslak \u0130\u015fi G\u00f6r\u00fcnt\u00fcle",
        view_notes: "Notlar\u0131 G\u00f6r\u00fcnt\u00fcle",
      },
      job_application: {
        application_date: "Ba\u015fvuru tarihi",
        candidate_name: "Aday \u0130smi",
        job_application: "\u0130\u015f ba\u015fvurusu",
      },
      job_applications: "\u0130\u015f ba\u015fvurular\u0131",
      job_categories: "\u0130\u015f Kategorileri",
      job_category: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_job_category: "\u0130\u015f Kategorisini D\u00fczenle",
        is_featured: "\u00d6zellikli",
        job_category: "\u0130\u015f kategorisi",
        name: "Ad",
        new_job_category: "Yeni \u0130\u015f Kategorisi",
        no_job_category_available: "\u0130\u015f Kategorisi Yok",
        no_job_category_found: "\u0130\u015f Kategorisi Bulunamad\u0131",
        show_job_category: "\u0130\u015f Kategorisi Ayr\u0131nt\u0131lar\u0131",
      },
      job_experience: {
        edit_job_experience: "\u0130\u015f Deneyimini D\u00fczenle",
        is_active: "Aktif",
        is_default: "Varsay\u0131lan",
        job_experience: "\u0130\u015f tecr\u00fcbesi",
        language: "Dil",
        new_job_experience: "Yeni \u0130\u015f Deneyimi",
      },
      job_experiences: "\u0130\u015f Deneyimleri",
      job_notification: {
        job_notifications: "\u0130\u015f Bildirimleri",
        no_jobs_available: "Mevcut i\u015f yok",
        select_all_jobs: "T\u00fcm \u0130\u015fleri Se\u00e7",
      },
      job_shift: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_job_shift: "\u0130\u015f Vardiyas\u0131n\u0131 D\u00fczenle",
        job_shift_detail: "\u0130\u015f Vardiya Ayr\u0131nt\u0131lar\u0131",
        new_job_shift: "Yeni \u0130\u015f Vardiyas\u0131",
        no_job_shifts_available: "Mevcut \u0130\u015f Vardiya Yok",
        no_job_shifts_found: "\u0130\u015f Vardiya Bulunamad\u0131",
        shift: "Vardiya",
        show_job_shift: "\u0130\u015f Vardiyas\u0131",
        size: "Boyut",
      },
      job_shifts: "\u0130\u015f Vardiyalar\u0131",
      job_skill: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_job_skill: "\u0130\u015f Becerisini D\u00fczenle",
        name: "Ad",
        new_job_skill: "Yeni \u0130\u015f Becerisi",
        show_job_skill: "\u0130\u015f yetene\u011fi",
      },
      job_skills: "\u0130\u015f yetenekleri",
      job_stage: {
        add_slot: "Yuva Ekle",
        add_slots: "Yuva Ekle",
        batch: "Toplu",
        cancel_slot: "Yuvay\u0131 \u0130ptal Et",
        cancel_this_slot: "Bu slotu iptal et",
        cancel_your_selected_slot: "Se\u00e7ti\u011finiz slotu iptal edin",
        candidate_note: "Aday Notu",
        choose_slots: "Slot Se\u00e7",
        date: "Tarih",
        edit_job_stage: "\u0130\u015f A\u015famas\u0131n\u0131 D\u00fczenle",
        edit_slot: "Yuvay\u0131 D\u00fczenle",
        history: "Tarih",
        job_stage: "\u0130\u015f A\u015famas\u0131",
        job_stage_detail: "\u0130\u015f A\u015famas\u0131 Detay\u0131",
        new_job_stage: "Yeni \u0130\u015f A\u015famas\u0131",
        new_slot_send: "Yeni Yuva G\u00f6nderimi",
        no_job_stage_available: "Mevcut \u0130\u015f A\u015famas\u0131 Yok",
        no_job_stage_found: "\u0130\u015f A\u015famas\u0131 Bulunamad\u0131",
        no_slot_available: "Kullan\u0131labilir Yuva Yok",
        reject_all_slot: "T\u00fcm Yuvay\u0131 Reddet",
        rejected_all_slots: "T\u00fcm Yuvalar Reddedildi",
        send_slot: "Yuva G\u00f6nder",
        send_slots: "Slot G\u00f6nder",
        slot: "yuva",
        slot_preference: "Slot Tercihi",
        slots: "Yuvalar",
        time: "Zaman",
        you_cancel_this_slot: "Bu slotu iptal edersiniz",
        you_have_rejected_all_slot: "T\u00fcm Yuvalar\u0131 Reddettiniz",
        you_have_selected_this_slot: "Bu Yuvay\u0131 Se\u00e7tiniz",
        your_note: "Notunuz",
      },
      job_stages: "\u0130\u015f A\u015famalar\u0131",
      job_tag: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_job_tag: "\u0130\u015f Etiketini D\u00fczenle",
        job_tag: "\u0130\u015f Etiketi",
        job_tag_detail: "\u0130\u015f Etiketi Ayr\u0131nt\u0131lar\u0131",
        name: "Ad",
        new_job_tag: "Yeni \u0130\u015f Etiketi",
        no_job_tag_available: "\u0130\u015f Etiketi Yok",
        no_job_tag_found: "\u0130\u015f Etiketi Bulunamad\u0131",
        show_job_tag: "\u0130\u015f Etiketi",
        size: "Boyut",
      },
      job_tags: "\u0130\u015f Etiketleri",
      job_type: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_job_type: "\u0130\u015f T\u00fcr\u00fcn\u00fc D\u00fczenle",
        job_type: "Meslek t\u00fcr\u00fc",
        job_type_detail:
          "\u0130\u015f T\u00fcr\u00fc Ayr\u0131nt\u0131lar\u0131",
        name: "Ad",
        new_job_type: "Yeni \u0130\u015f T\u00fcr\u00fc",
        no_job_type_available: "Mevcut \u0130\u015f T\u00fcr\u00fc Yok",
        no_job_type_found: "\u0130\u015f T\u00fcr\u00fc Bulunamad\u0131",
        show_job_type: "Meslek t\u00fcr\u00fc",
      },
      job_types: "\u0130\u015f T\u00fcrleri",
      jobs: "Meslekler",
      language: {
        edit_language: "Dili D\u00fczenle",
        is_active: "Aktif",
        is_default: "Varsay\u0131lan",
        is_rtl: "RTL",
        iso_code: "ISO Kodu",
        language: "Dil",
        native: "Yerli",
        new_language: "Yeni dil",
        no_language_available: "Mevcut Dil Yok",
        no_language_found: "Dil Bulunamad\u0131",
      },
      languages: "Diller",
      marital_status: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_marital_status: "Medeni Durumunu D\u00fczenle",
        marital_status: "Medeni hal",
        marital_status_detail: "Medeni Durum Ayr\u0131nt\u0131lar\u0131",
        new_marital_status: "Yeni Medeni Durum",
        no_marital_status_available: "Medeni Durum Yok",
        no_marital_status_found: "Medeni Durum Bulunamad\u0131",
        show_marital_status: "Medeni hal",
      },
      marital_statuses: "Medeni hal",
      months: {
        apr: "Nisan",
        aug: "a\u011fustos",
        dec: "Aral\u0131k",
        feb: "\u015eubat",
        jan: "Ocak",
        jul: "Temmuz",
        jun: "Haziran",
        mar: "Mart",
        may: "May\u0131s",
        nov: "kas\u0131m",
        oct: "Ekim",
        sep: "Eyl\u00fcl",
      },
      no_skills: "Beceri Yok",
      no_subscriber_available: "Abone Yok",
      no_subscriber_found: "Abone Bulunamad\u0131",
      noticeboard: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_noticeboard: "Bildirim Panosunu D\u00fczenle",
        is_active: "Aktif",
        new_noticeboard: "Yeni Duyuru Panosu",
        no_noticeboard_available: "Bildiri Panosu Yok",
        no_noticeboard_found: "Bildiri Panosu Bulunamad\u0131",
        noticeboard: "Noticeboard",
        noticeboard_detail: "Duyuru Panosu Ayr\u0131nt\u0131lar\u0131",
        title: "Ba\u015fl\u0131k",
      },
      noticeboards: "Noticeboards",
      notification: {
        company: "\u015firket",
        company_marked_featured:
          "\u00d6ne \u00e7\u0131kan \u015firket olarak i\u015faretlenmi\u015f",
        empty_notifications: "Herhangi bir bildirim bulamad\u0131k",
        job_application_rejected_message: "Ba\u015fvurunuz Reddedildi",
        job_application_select_message: "\u015eunun i\u00e7in se\u00e7ildiniz",
        job_application_shortlist_message:
          "Ba\u015fvurunuz i\u00e7in K\u0131sa Listede",
        job_application_submitted:
          "\u0130\u015f Ba\u015fvurusu g\u00f6nderildi",
        mark_all_as_read:
          "T\u00fcm\u00fcn\u00fc Okundu Olarak \u0130\u015faretle",
        marked_as_featured:
          "\u00f6ne \u00e7\u0131kar\u0131ld\u0131 olarak i\u015faretlendi",
        new_candidate_registered: "Yeni Kay\u0131tl\u0131 Aday",
        new_employer_registered: "Yeni \u0130\u015fveren Kay\u0131tl\u0131",
        notifications: "Bildirimler",
        purchase: "sat\u0131n alma",
        read_notification: "Bildirim ba\u015far\u0131yla okundu",
        started_following: "takibe ba\u015flad\u0131m",
        started_following_you: "Sizi takip etmeye ba\u015flad\u0131m.",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "Bir aday \u0130\u015f i\u00e7in reddedildi\u011finde",
        CANDIDATE_SELECTED_FOR_JOB:
          "\u0130\u015f i\u00e7in bir aday se\u00e7ildi\u011finde",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "Bir aday \u0130\u015f i\u00e7in k\u0131sa listeye al\u0131nd\u0131\u011f\u0131nda",
        EMPLOYER_PURCHASE_PLAN:
          "Bir i\u015fveren bir abonelik plan\u0131 sat\u0131n ald\u0131\u011f\u0131nda",
        FOLLOW_COMPANY:
          "Bir aday \u015eirketi takip etmeye ba\u015flad\u0131\u011f\u0131nda",
        FOLLOW_JOB:
          "Bir aday Jobs'u takip etmeye ba\u015flad\u0131\u011f\u0131nda",
        JOB_ALERT:
          "Bir i\u015fveren bir \u0130\u015f yaratt\u0131\u011f\u0131nda",
        JOB_APPLICATION_SUBMITTED:
          "Yeni bir \u0130\u015f Ba\u015fvurusu g\u00f6nderirken",
        MARK_COMPANY_FEATURED:
          "\u015eirketi \u00d6ne \u00c7\u0131kanlar olarak i\u015faretledi\u011finde",
        MARK_COMPANY_FEATURED_ADMIN:
          "\u0130\u015fveren, \u015eirketi \u00d6ne \u00c7\u0131kan olarak i\u015faretledi\u011finde",
        MARK_JOB_FEATURED:
          "\u0130\u015fi \u00d6ne \u00c7\u0131kanlar olarak i\u015faretledi\u011finde",
        MARK_JOB_FEATURED_ADMIN:
          "\u0130\u015fveren, \u0130\u015fi \u00d6ne \u00c7\u0131kan olarak i\u015faretledi\u011finde",
        NEW_CANDIDATE_REGISTERED: "Yeni bir aday Kay\u0131t Oldu\u011funda",
        NEW_EMPLOYER_REGISTERED:
          "Yeni bir i\u015fveren Kay\u0131t Oldu\u011funda",
        admin: "y\u00f6netici",
        blog_category: "Blog Kategorisi",
        candidate: "Aday",
        employee: "\u00c7al\u0131\u015fan",
      },
      ownership_type: {
        edit_ownership_type: "Sahiplik T\u00fcr\u00fcn\u00fc D\u00fczenle",
        new_ownership_type: "Yeni Sahiplik T\u00fcr\u00fc",
        no_ownership_type_available: "Mevcut Sahiplik T\u00fcr\u00fc Yok",
        no_ownership_type_found: "Sahiplik T\u00fcr\u00fc Bulunamad\u0131",
        ownership_type: "M\u00fclkiyet T\u00fcr\u00fc",
        ownership_type_detail:
          "Sahiplik T\u00fcr\u00fc Ayr\u0131nt\u0131lar\u0131",
      },
      ownership_types: "Sahiplik T\u00fcrleri",
      phone: {
        invalid_country_code: "Ge\u00e7ersiz \u00fclke kodu",
        invalid_number: "Ge\u00e7ersiz numara",
        too_long: "\u00c7ok uzun",
        too_short: "\u00c7ok k\u0131sa",
        valid_number: "Ge\u00e7erli numara",
      },
      plan: {
        active_subscription: "aktif abonelik",
        allowed_jobs: "\u0130zin Verilen \u0130\u015fler",
        amount: "Miktar",
        cancel_reason: "Nedeni \u0130ptal Et",
        cancel_subscription: "Aboneli\u011fi iptal et",
        currency: "Para birimi",
        current_plan: "Mevcut Plan",
        edit_plan: "Plan\u0131 D\u00fczenle",
        edit_subscription_plan: "abonelik plan\u0131n\u0131 d\u00fczenle",
        ends_at: "Biter",
        is_trial_plan: "Deneme Plan\u0131d\u0131r",
        job_allowed: "\u0130\u015fe \u0130zin Verildi",
        job_used: "Kullan\u0131lan \u0130\u015f",
        jobs_allowed: "\u0130zin Verilen \u0130\u015fler",
        jobs_used: "Kullan\u0131lan \u0130\u015fler",
        new_plan: "Plan Ekle",
        new_subscription_plan: "yeni abonelik plan\u0131",
        pay_with_manually: "Manuel Olarak \u00d6de",
        pay_with_paypal: "PayPal ile \u00f6de",
        pay_with_stripe: "Stripe ile \u00f6de",
        per_month: "Her ay",
        plan: "Plan",
        plan_amount_cannot_be_changes:
          "Not: - Plan Miktar\u0131 De\u011fi\u015ftirilemez.",
        pricing: "Fiyatland\u0131rma",
        processing: "\u0130\u015fleme",
        purchase: "Sat\u0131n alma",
        renews_on: "Yenileme Tarihi",
        subscription_cancelled: "Abonelik \u0130ptal Edildi",
        subscriptions: "abonelikler",
      },
      plans: "Planlar",
      position: {
        edit_position: "Pozisyonu D\u00fczenle",
        new_position: "Yeni pozisyon",
        position: "Durum",
      },
      positions: "Pozisyonlar",
      post: {
        action: "Aksiyon",
        add: "Ekle",
        blog: "Blog",
        comment: "Yorum Yap",
        comments: "Yorumlar",
        description: "A\u00e7\u0131klama",
        edit_post: "G\u00f6nderiyi d\u00fczenle",
        image: "Resim",
        new_post: "Yeni posta",
        no_posts_available: "Yay\u0131n Yok",
        no_posts_found: "G\u00f6nderi bulunamad\u0131",
        post: "\u0130leti",
        post_a_comments: "Yorum G\u00f6nder",
        post_details: "G\u00f6nderi Ayr\u0131nt\u0131lar\u0131",
        posts: "G\u00f6nderiler",
        select_post_categories: "G\u00f6nderi Kategorilerini Se\u00e7in",
        show_post: "\u0130leti",
        title: "Ba\u015fl\u0131k",
      },
      post_category: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_post_category: "G\u00f6nderi Kategorisini D\u00fczenle",
        name: "ad",
        new_post_category: "Yeni G\u00f6nderi Kategorisi",
        no_post_category_available: "Mevcut G\u00f6nderi Kategorisi Yok",
        no_post_category_found: "Kategori Bulunamad\u0131",
        post_categories: "G\u00f6nderi Kategorileri",
        post_category: "G\u00f6nderi Kategorisi",
        post_category_detail:
          "G\u00f6nderi Kategorisi Ayr\u0131nt\u0131lar\u0131",
        show_post_category: "G\u00f6nderi Kategorisi",
      },
      post_comment: {
        post_comment: "Yorum G\u00f6nder",
        post_comment_details:
          "Yorum Ayr\u0131nt\u0131lar\u0131n\u0131 G\u00f6nder",
      },
      post_comments: "Yorum g\u00f6ndermek",
      pricing_table: { get_started: "Ba\u015flamak" },
      pricings_table: "Fiyatland\u0131rma Tablosu",
      professional_skills: "Profesyonel yetenekler",
      profile: "Profil",
      recent_blog: "Son Blog",
      reported_jobs: "Bildirilen \u0130\u015fler",
      required_degree_level: {
        edit_required_degree_level: "Derece Seviyesini D\u00fczenle",
        name: "Ad",
        new_required_degree_level: "Yeni Derece Seviyesi",
        no_degree_level_available: "Derece Seviyesi Yok",
        no_degree_level_found: "Derece D\u00fczeyi Bulunamad\u0131",
        show_required_degree_level: "Lisans d\u00fczeyinde",
      },
      required_degree_levels: "Derece Seviyeleri",
      resumes: {
        candidate_name: "Aday \u0130smi",
        file: "Dosya",
        name: "\u0130sim Soyisim",
        no_resume_available: "Kullan\u0131labilir \u00d6zge\u00e7mi\u015f Yok",
        no_resume_found: "\u00d6zge\u00e7mi\u015f Bulunamad\u0131",
        resume_name: "Dosya ad\u0131",
      },
      salary_currencies: "Maa\u015f Para Birimleri",
      salary_currency: {
        currency_code: "Para Birimi Kodu",
        currency_icon: "Para Birimi Simgesi",
        currency_name: "Para Birimi Ad\u0131",
        edit_salary_currency: "Maa\u015f Para Birimini D\u00fczenle",
        new_salary_currency: "Yeni Maa\u015f Para Birimi",
        no_salary_currency_available: "Maa\u015f Para Birimi Yok",
        no_salary_currency_found: "Maa\u015f Para Birimi Bulunamad\u0131",
      },
      salary_period: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_salary_period: "Maa\u015f D\u00f6nemini D\u00fczenle",
        new_salary_period: "Yeni Maa\u015f D\u00f6nemi",
        no_salary_period_available: "Maa\u015f D\u00f6nemi Yok",
        no_salary_period_found: "Maa\u015f D\u00f6nemi Bulunamad\u0131",
        period: "D\u00f6nem",
        salary_period_detail:
          "Maa\u015f D\u00f6nemi Ayr\u0131nt\u0131lar\u0131",
        size: "Boyut",
      },
      salary_periods: "Maa\u015f D\u00f6nemleri",
      see_all_plans: "T\u00fcm planlar\u0131 g\u00f6r\u00fcnt\u00fcle",
      selected_candidate: "Se\u00e7ilen Aday",
      setting: {
        about_us: "Hakk\u0131m\u0131zda",
        address: "Adres",
        application_name: "Uygulama Ad\u0131",
        choose: "Se\u00e7",
        company_description: "\u015eirket tan\u0131m\u0131",
        company_url: "\u015firket url'si",
        configuration_update: "Yap\u0131land\u0131rma G\u00fcncellemesi",
        cookie: "Kurabiye",
        disable_cookie: "\u00c7erezi Devre D\u0131\u015f\u0131 B\u0131rak",
        disable_edit: "D\u00fczenlemeyi Devre D\u0131\u015f\u0131 B\u0131rak",
        email: "Email",
        enable_cookie: "\u00c7erezi Etkinle\u015ftir",
        enable_edit: "D\u00fczenlemeyi Etkinle\u015ftir",
        enable_google_recaptcha:
          "\u0130\u015fverenler i\u00e7in Google reCAPTCHA, Aday kayd\u0131 ve Bize Ula\u015f\u0131n ekran\u0131n\u0131 etkinle\u015ftirin.",
        facebook: "Facebook",
        facebook_app_id: "Facebook Uygulama Kimli\u011fi",
        facebook_app_secret: "Facebook Uygulama S\u0131rr\u0131",
        facebook_redirect: "Facebook Y\u00f6nlendirmesi",
        facebook_url: "Facebook URL",
        favicon: "Favicon",
        front_settings: "\u00d6n Ayarlar",
        general: "Genel",
        google: "Google",
        google_client_id: "Google \u0130stemci Kimli\u011fi",
        google_client_secret: "Google \u0130stemci S\u0131rr\u0131",
        google_plus_url: "Google Art\u0131 URL'si",
        google_redirect: "Google Y\u00f6nlendirmesi",
        image_validation:
          "G\u00f6r\u00fcnt\u00fc 90 x 60 piksel olmal\u0131d\u0131r.",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Kimli\u011fi",
        linkedin_client_secret: "LinkedIn \u0130stemci S\u0131rr\u0131",
        linkedin_url: "Linkedin URL'si",
        logo: "Logo",
        mail: "Posta",
        mail__from_address: "Gelen Posta Adresi",
        mail_host: "Posta Bar\u0131nd\u0131r\u0131c\u0131s\u0131",
        mail_mailer: "Posta Postas\u0131",
        mail_password: "Mail \u015eifresi",
        mail_port: "Posta Ba\u011flant\u0131 Noktas\u0131",
        mail_username: "Mail Kullan\u0131c\u0131 Ad\u0131",
        notification_settings: "Bildirim ayarlar\u0131",
        paypal: "Paypal",
        paypal_client_id: "Paypal \u0130stemci Kimli\u011fi",
        paypal_secret: "Paypal S\u0131rr\u0131",
        phone: "Telefon",
        privacy_policy: "Gizlilik Politikas\u0131",
        pusher: "\u0130tici",
        pusher_app_cluster: "\u0130tici Uygulama K\u00fcmesi",
        pusher_app_id: "\u0130tici Uygulama Kimli\u011fi",
        pusher_app_key: "\u0130tici Uygulama Anahtar\u0131",
        pusher_app_secret: "\u0130tici Uygulama S\u0131rr\u0131",
        social_settings: "Sosyal ayarlar",
        stripe: "\u015eerit",
        stripe_key: "Stripe Key",
        stripe_secret_key: "Stripe Gizli Anahtar\u0131",
        stripe_webhook_key: "Stripe Webhook Anahtar\u0131",
        terms_conditions: "\u015eartlar ve ko\u015fullar",
        twitter_url: "Twitter URL'si",
        update_application_configuration:
          "Uygulama yap\u0131land\u0131rma de\u011ferlerini g\u00fcncellemek \u00fczeresiniz, devam etmek istiyor musunuz?",
      },
      settings: "Ayarlar",
      skill: {
        action: "Aksiyon",
        add: "Ekle",
        description: "A\u00e7\u0131klama",
        edit_skill: "Beceri D\u00fczenle",
        name: "Ad",
        new_skill: "Yeni beceri",
        no_skill_available: "Mevcut Beceri Yok",
        no_skill_found: "Beceri Bulunamad\u0131",
        show_skill: "Beceri",
        skill_detail: "Beceri Ayr\u0131nt\u0131lar\u0131",
      },
      skills: "Beceriler",
      social_media: "Sosyal medya",
      social_settings: "Sosyal ayarlar",
      state: {
        country_name: "\u00dclke ad\u0131na",
        edit_state: "Durumu D\u00fczenle",
        new_state: "Yeni Devlet",
        no_state_available: "Eyalet Mevcut De\u011fil",
        no_state_found: "Eyalet Bulunamad\u0131",
        state_name: "Devlet ad\u0131",
        states: "Eyaletler",
      },
      subscribers: "Aboneler",
      subscriptions_plans: "abonelik planlar\u0131",
      testimonial: {
        customer_image: "M\u00fc\u015fteri Resmi",
        customer_name: "M\u00fc\u015fteri ad\u0131",
        description: "A\u00e7\u0131klama",
        edit_testimonial: "Referanslar\u0131 D\u00fczenle",
        new_testimonial: "Yeni Referans",
        no_testimonial_available: "G\u00f6r\u00fc\u015f Yok",
        no_testimonial_found: "G\u00f6r\u00fc\u015f Bulunamad\u0131",
        testimonial: "Takdirname",
        testimonial_detail: "Referans Ayr\u0131nt\u0131lar\u0131",
        testimonials: "Referanslar\u0131",
      },
      testimonials: "Referanslar\u0131",
      tooltip: {
        change_app_logo: "Uygulama logosunu de\u011fi\u015ftir",
        change_favicon: "Favicon'u de\u011fi\u015ftir",
        change_home_banner:
          "Ana sayfa ba\u015fl\u0131\u011f\u0131n\u0131 de\u011fi\u015ftir",
        change_image: "Resmi de\u011fi\u015ftir",
        change_profile:
          "yap\u0131land\u0131rma dosyas\u0131n\u0131 de\u011fi\u015ftir",
        copy_preview_link:
          "\u00d6nizleme Ba\u011flant\u0131s\u0131n\u0131 Kopyala",
      },
      transaction: {
        approved: "Onayl\u0131",
        denied: "reddedildi",
        invoice: "Fatura",
        payment_approved: "\u00d6deme Durumu",
        plan_name: "Plan Ad\u0131",
        select_manual_payment: "Manuel \u00d6demeyi Se\u00e7in",
        subscription_id: "Abonelik Kimli\u011fi",
        transaction_date: "\u0130\u015flem g\u00fcn\u00fc",
        type: "T\u00fcr",
        user_name: "\u0130\u015fveren Ad\u0131",
      },
      transactions: "\u0130\u015flemler",
      translation_manager: "\u00c7eviri Y\u00f6neticisi",
      user: {
        change_password: "\u015eifre de\u011fi\u015ftir",
        edit_profile: "Profili D\u00fczenle",
        email: "Email",
        first_name: "\u0130sim",
        last_name: "Soyad\u0131",
        logout: "\u00c7\u0131k\u0131\u015f Yap",
        name: "Ad",
        password: "Parola",
        password_confirmation: "\u015eifreyi Onayla",
        phone: "Telefon",
        profile_picture: "Profil foto\u011fraf\u0131",
        required_field_messages:
          "L\u00fctfen gerekli t\u00fcm alanlar\u0131 doldurun.",
        user_name: "Kullan\u0131c\u0131 ad\u0131",
      },
      user_language: {
        change_language: "Dili de\u011fi\u015ftir",
        language: "Dil",
      },
      weekdays: {
        fri: "Cuma",
        mon: "AY",
        sat: "Oturdu",
        sun: "G\u00dcNE\u015e",
        thu: "PHU",
        tue: "sal",
        wed: "EVLENMEK",
      },
      your_cv: "\u00d6zge\u00e7mi\u015finiz",
    },
    "tr.pagination": {
      next: "Sonraki &raquo;",
      previous: "&laquo; \u00d6nceki",
    },
    "tr.validation": {
      about_us: "Hakk\u0131m\u0131zda",
      about_us_menu: {
        faq: "SSS",
        faq_not_available: "S\u0131k\u00e7a Sorulan Sorular mevcut de\u011fil",
        fill_out_our_forms_and_submit:
          "Formlar\u0131m\u0131z\u0131 doldurun ve \u00f6zge\u00e7mi\u015finizi hemen g\u00f6nderin",
        frequently_asked_questions: "S\u0131k\u00e7a Sorulan Sorular",
        how_it_works: "Nas\u0131l \u00e7al\u0131\u015f\u0131r",
        register: "Kay\u0131t ol",
        start_by_creating_an_account:
          "Harika platformumuzda bir hesap olu\u015fturarak ba\u015flay\u0131n",
        start_working: "\u00c7al\u0131\u015fmaya ba\u015flamak",
        start_your_new_career_by_working:
          "Yeni kariyerinize en ba\u015far\u0131l\u0131 \u015firketlerden biriyle \u00e7al\u0131\u015farak ba\u015flay\u0131n",
        step_1: "A\u015fama 1",
        step_2: "Ad\u0131m 2",
        step_3: "A\u015fama 3",
        submit_resume: "\u00d6zge\u00e7mi\u015fi G\u00f6nder",
      },
      apply_for_job: {
        already_applied: "Zaten Uyguland\u0131",
        apply_for: "Ba\u015fvuru Yap",
        due_to_our_continued_growth:
          "Devam eden b\u00fcy\u00fcmemiz nedeniyle yeni bir pozisyon al\u0131yoruz",
        expected_salary: "Beklenen Maa\u015f",
        fill_details: "Ayr\u0131nt\u0131lar\u0131 Doldur",
        or_words_to_that_effect: "veya bu etkiye sahip kelimeler",
        save_as_draft: "Taslak olarak kaydet",
        we_received_your_application:
          "Ba\u015fvurunuzu ald\u0131k ve i\u015f ba\u015fvurunuza karar verildi\u011finde size haber verece\u011fiz",
      },
      blog_menu: {
        blog: "Blog",
        blogs: "Blog",
        categories: "Kategoriler",
        newsletter: "B\u00fclten",
        popular_blogs: "Pop\u00fcler Bloglar",
        read_more: "Daha fazla oku",
        share: "Payla\u015f",
      },
      blog_of: "Blog",
      blogs: "Blog",
      common: {
        apply: "Uygulamak",
        browse_all: "T\u00fcm\u00fcne G\u00f6z At",
        close: "Kapat",
        confirm_password: "\u015eifreyi Onayla",
        email: "Email",
        first_name: "\u0130sim",
        last_name: "Soyad\u0131",
        location: "Yer",
        name: "Ad",
        notes: "Notlar",
        password: "Parola",
        search: "Arama",
        show_all: "Hepsini G\u00f6ster \u2193",
        submit: "Sunmak",
      },
      companies: "\u015eirketler",
      companies_menu: {
        featured: "Se\u00e7me",
        no_companies_found: "\u015eirket bulunamad\u0131",
        opened_jobs: "A\u00e7\u0131k \u0130\u015fler",
        search_companies: "\u015eirket Ara",
      },
      company_details: {
        follow: "Takip et",
        our_latest_jobs: "Son \u0130\u015flerimiz",
        processing: "\u0130\u015fleme...",
        report_to_company: "\u015eirkete Rapor Ver",
        unfollow: "Takibi b\u0131rak",
      },
      contact_us: "Bize Ula\u015f\u0131n",
      contact_us_menu: {
        contact_us: "Bize Ula\u015f\u0131n",
        send_message: "Mesaj g\u00f6nder",
      },
      footer: {
        all_rights_reserved: "T\u00fcm haklar\u0131 Sakl\u0131d\u0131r",
        copyright: "Telif Hakk\u0131",
        newsletter: "B\u00fclten",
        newsletter_text:
          "B\u00fcltenimize abone olarak d\u00fczenli g\u00fcncellemelerimizle Ba\u011flant\u0131da Kal\u0131n.",
        useful_links: "Kullan\u0131\u015fl\u0131 ba\u011flant\u0131lar",
      },
      go_to_dashboard: "G\u00f6sterge Tablosuna Git",
      home: "Ev",
      home_menu: {
        any_category: "Herhangi Bir Kategori",
        featured_companies: "\u00d6ne \u00c7\u0131kan \u015eirketler",
        featured_companies_not_available:
          "\u00d6ne \u00c7\u0131kan \u015eirketler mevcut de\u011fil.",
        jobs_offers_for: "\u0130\u015f teklifleri",
        keywords: "Anahtar Kelimeler",
        latest_job_not_available: "En Son \u0130\u015f mevcut de\u011fil.",
        latest_jobs: "Son \u0130\u015fler",
        notices: "Uyar\u0131lar",
        opened_jobs: "A\u00e7\u0131k \u0130\u015fler",
        popular_categories: "Pop\u00fcler Kategoriler",
        position_opened: "Pozisyon A\u00e7\u0131ld\u0131",
        resume: "Devam et",
        testimonials: "Referanslar\u0131",
        you: "sen",
        your_career_starts_now: "Kariyerin \u015eimdi Ba\u015fl\u0131yor",
      },
      job_details: {
        add_to_favorite: "Favorilere ekle",
        add_to_favorites: "Favorilere ekle",
        already_applied: "Zaten Uyguland\u0131",
        apply_for_job: "\u0130\u015fe ba\u015fvurmak",
        career_level: "Kariyer Seviyesi",
        city: "Kent",
        company_name: "\u015eirket Ad\u0131",
        company_overview: "\u015eirket Genel Bak\u0131\u015f\u0131",
        country: "\u00dclke",
        currency: "Para birimi",
        date_posted: "G\u00f6nderildi\u011fi Tarih",
        degree_level: "Lisans d\u00fczeyinde",
        edit_draft: "Tasla\u011f\u0131 D\u00fczenle",
        email_to_friend: "Arkada\u015fa E-posta G\u00f6nder",
        functional_area: "Fonksiyonel B\u00f6lge",
        hide_salary: "Maa\u015f\u0131 Gizle",
        is_freelance: "Serbest mi",
        job_category: "\u0130\u015f kategorisi",
        job_details: "\u0130\u015f Detaylar\u0131",
        job_expiry_date: "\u0130\u015fin Biti\u015f Tarihi",
        job_shift: "\u0130\u015f Vardiyas\u0131",
        job_skills: "\u0130\u015f yetenekleri",
        job_title: "\u0130\u015f ismi",
        job_type: "Meslek t\u00fcr\u00fc",
        position: "Durum",
        posted_on: "Yay\u0131nlanan",
        related_job_not_available:
          "\u0130lgili \u0130\u015f mevcut de\u011fil.",
        related_jobs: "\u0130lgili \u0130\u015fler",
        remove_from_favorite: "S\u0131k Kullan\u0131lanlardan \u00c7\u0131kar",
        report: "Bildiri",
        report_abuse: "K\u00f6t\u00fcye Kullan\u0131m\u0131 Bildir",
        salary: "Maa\u015f",
        salary_period: "Maa\u015f D\u00f6nemi",
        send_to_friend: "Arkada\u015fa g\u00f6nder",
        share_this_job: "Bu \u0130\u015fi Payla\u015f",
        state: "Durum",
      },
      job_menu: {
        full_time: "Tam zamanl\u0131",
        job_by_career_level: "Kariyer D\u00fczeyine G\u00f6re \u0130\u015f",
        job_by_categories: "Kategorilere G\u00f6re \u0130\u015f",
        job_by_functional_area: "Fonksiyonel Alana G\u00f6re \u0130\u015f",
        job_by_gender: "Cinsiyete G\u00f6re \u0130\u015f",
        job_by_skills: "Becerilere G\u00f6re \u0130\u015f",
        job_by_type: "T\u00fcre G\u00f6re \u0130\u015f",
        job_details: "\u0130\u015f Detaylar\u0131",
        matches: "Ma\u00e7lar",
        no_results_found: "Sonu\u00e7 bulunamad\u0131",
        none: "Yok",
        salary_from: "Maa\u015f",
        salary_to: "Maa\u015f",
        search_job: "\u0130\u015f Ara",
        we_found: "Bulduk",
      },
      jobs: "Meslekler",
      login: "Oturum a\u00e7",
      logout: "\u00c7\u0131k\u0131\u015f Yap",
      register: "Kay\u0131t ol",
      register_menu: {
        candidate: "Aday",
        create_account: "Hesap olu\u015ftur",
        employer: "\u0130\u015fveren",
      },
    },
    "zh.messages": {
      about_us: "\u5173\u4e8e\u6211\u4eec",
      about_us_services: "\u5173\u4e8e\u6211\u4eec \u670d\u52a1",
      admin_dashboard: {
        active_jobs: "\u79ef\u6781\u7684\u5de5\u4f5c",
        active_users: "\u6d3b\u8dc3\u7528\u6237",
        featured_employers: "\u7279\u8272\u96c7\u4e3b",
        featured_employers_incomes: "\u7279\u8272\u96c7\u4e3b\u6536\u5165",
        featured_jobs: "\u7279\u8272\u5de5\u4f5c",
        featured_jobs_incomes: "\u7279\u8272\u5de5\u4f5c\u6536\u5165",
        post_statistics: "\u5e16\u5b50\u7d71\u8a08",
        recent_candidates: "\u6700\u8fd1\u7684\u5019\u9009\u4eba",
        recent_employers: "\u6700\u8fd1\u96c7\u4e3b",
        recent_jobs: "\u6700\u8fd1\u7684\u5de5\u4f5c",
        registered_candidates: "\u6ce8\u518c\u5019\u9009\u4eba",
        registered_employer: "\u6ce8\u518c\u96c7\u4e3b",
        subscription_incomes: "\u8ba2\u9605\u6536\u5165",
        today_jobs: "\u4eca\u65e5\u5de5\u4f5c",
        total_active_jobs: "\u603b\u6d3b\u8dc3\u5de5\u4f5c",
        total_candidates: "\u5019\u9009\u4eba\u603b\u6570",
        total_employers: "\u96c7\u4e3b\u603b\u6570",
        total_users: "\u603b\u7528\u6237",
        verified_users: "\u9a8c\u8bc1\u7528\u6237",
        weekly_users: "\u6bcf\u5468\u7528\u6237",
      },
      all_resumes: "\u6240\u6709\u7b80\u5386",
      all_rights_reserved: "\u7248\u6743\u6240\u6709",
      applied_job: {
        applied_jobs: "\u5e94\u7528\u804c\u4f4d",
        companies: "\u516c\u53f8\u4ecb\u7ecd",
        job: "\u5de5\u4f5c",
        notes: "\u7b14\u8bb0",
      },
      apply_job: {
        apply_job: "\u7533\u8bf7\u804c\u4f4d",
        notes: "\u7b14\u8bb0",
        resume: "\u6062\u590d",
      },
      blog_categories: "\u535a\u5ba2\u7c7b\u522b",
      blogs: "\u7f51\u5fd7",
      branding_slider: {
        brand: "\u724c",
        edit_branding_slider: "\u7f16\u8f91\u54c1\u724c\u6ed1\u5757",
        new_branding_slider: "\u65b0\u54c1\u724c\u6ed1\u5757",
        no_branding_slider_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u54c1\u724c\u6ed1\u5757",
        no_branding_slider_found: "\u672a\u627e\u5230\u54c1\u724c\u6ed1\u5757",
      },
      branding_sliders: "\u54c1\u724c\u6ed1\u5757",
      brands: "\u54c1\u724c\u54c1\u724c",
      candidate: {
        address: "\u5730\u5740",
        admins: "\u7ba1\u7406\u54e1",
        already_reported: "\u5df2\u62a5\u544a",
        available_at: "\u53ef\u5728",
        birth_date: "\u751f\u65e5",
        candidate_details: "\u5019\u9009\u4eba\u8be6\u7ec6\u4fe1\u606f",
        candidate_language: "\u8bed\u8a00\u80fd\u529b",
        candidate_skill: "\u6280\u80fd",
        candidates: "\u5019\u9009\u4eba",
        career_level: "\u804c\u4e1a\u6c34\u5e73",
        conform_password: "\u786e\u8ba4\u5bc6\u7801",
        current_salary: "\u5f53\u524d\u5de5\u8d44",
        dashboard: "\u4eea\u8868\u677f",
        edit_admin: "\u7de8\u8f2f\u7ba1\u7406\u54e1",
        edit_candidate: "\u7f16\u8f91\u5019\u9009\u4eba",
        edit_profile_information: "\u7f16\u8f91\u8d44\u6599\u4fe1\u606f",
        education_not_found: "\u6ca1\u6709\u53ef\u7528\u7684\u6559\u80b2\u3002",
        email: "\u7535\u5b50\u90ae\u4ef6",
        email_verified: "\u7535\u5b50\u90ae\u4ef6\u5df2\u9a8c\u8bc1",
        employee: "\u5458\u5de5",
        expected_salary: "\u671f\u671b\u85aa\u6c34",
        experience: "\u7ecf\u9a8c",
        experience_not_found:
          "\u6ca1\u6709\u53ef\u7528\u7684\u7ecf\u9a8c\u3002",
        expired_job: "\u904e\u671f\u5de5\u4f5c",
        father_name: "\u7236\u4eb2\u59d3\u540d",
        first_name: "\u540d\u5b57",
        functional_area: "\u529f\u80fd\u533a\u57df",
        gender: "\u6027\u522b",
        immediate_available: "\u7acb\u5373\u53ef\u7528",
        in_year: "\u591a\u5e74",
        industry: "\u884c\u4e1a",
        is_active: "\u6d3b\u8dc3",
        is_verified: "\u5df2\u9a8c\u8bc1",
        job_alert_message:
          "\u767c\u5e03\u8207\u6211\u9078\u64c7\u76f8\u95dc\u7684\u8077\u4f4d\u6642\uff0c\u901a\u904e\u96fb\u5b50\u90f5\u4ef6\u901a\u77e5\u6211\u3002",
        last_name: "\u59d3",
        marital_status: "\u5a5a\u59fb\u72b6\u51b5",
        national_id_card: "\u56fd\u5bb6\u8eab\u4efd\u8bc1",
        nationality: "\u56fd\u7c4d",
        new_admin: "\u65b0\u7ba1\u7406\u54e1",
        new_candidate: "\u65b0\u5019\u9009\u4eba",
        no_candidate_available: "\u6ca1\u6709\u5019\u9009\u4eba",
        no_candidate_found: "\u627e\u4e0d\u5230\u5019\u9009\u4eba",
        no_reported_candidates_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5019\u9009\u4eba\u62a5\u544a",
        no_reported_candidates_found:
          "\u627e\u4e0d\u5230\u62a5\u544a\u7684\u5019\u9009\u4eba",
        not_immediate_available: "\u6ca1\u6709\u7acb\u5373\u53ef\u7528",
        password: "\u5bc6\u7801",
        phone: "\u7535\u8bdd",
        profile: "\u4e2a\u4eba\u8d44\u6599",
        reporte_to_candidate: "\u5411\u5019\u9078\u4eba\u5831\u544a",
        reported_candidate: "\u7533\u62a5\u5019\u9009\u4eba",
        reported_candidate_detail:
          "\u62a5\u544a\u7684\u5019\u9009\u4eba\u8be6\u7ec6\u4fe1\u606f",
        reported_candidates: "\u5831\u544a\u7684\u5019\u9078\u4eba",
        reported_employer: "\u62a5\u544a\u96c7\u4e3b",
        resume_not_found: "\u6ca1\u6709\u53ef\u7528\u7684\u7b80\u5386\u3002",
        salary_currency: "\u5de5\u8d44\u8d27\u5e01",
        salary_per_month: "\u6bcf\u6708\u5de5\u8cc7\u3002",
        select_candidate: "\u9009\u62e9\u5019\u9009\u4eba",
      },
      candidate_dashboard: {
        followings: "\u8ffd\u968f\u8005",
        location_information: "\u4f4d\u7f6e\u4fe1\u606f\u4e0d\u53ef\u7528.",
        my_cv_list: "\u6211\u7684\u7b80\u5386\u5217\u8868",
        no_not_available: "\u53f7\u7801\u4e0d\u53ef\u7528.",
        profile_views: "\u4e2a\u4eba\u8d44\u6599\u89c6\u56fe",
      },
      candidate_profile: {
        add_education: "\u589e\u52a0\u6559\u80b2",
        add_experience: "\u589e\u52a0\u7ecf\u9a8c",
        age: "\u5e74\u9f84",
        company: "\u516c\u53f8",
        currently_working: "\u6b63\u5728\u5de5\u4f5c",
        degree_level: "\u5b66\u4f4d",
        degree_title: "\u5b66\u4f4d\u6807\u9898",
        description: "\u63cf\u8ff0",
        edit_education: "\u7f16\u8f91\u6559\u80b2",
        edit_experience: "\u7f16\u8f91\u7ecf\u9a8c",
        education: "\u6559\u80b2",
        end_date: "\u7ed3\u675f\u65e5\u671f",
        experience: "\u7ecf\u9a8c",
        experience_title: "\u7ecf\u9a8c\u6807\u9898",
        institute: "\u7814\u7a76\u6240",
        online_profile: "\u5728\u7ebf\u7b80\u4ecb",
        present: "\u5f53\u4e0b",
        result: "\u7ed3\u679c",
        select_year: "\u9078\u64c7\u5e74\u4efd",
        start_date: "\u5f00\u59cb\u65e5\u671f",
        title: "\u6807\u9898",
        upload_resume: "\u4e0a\u4f20\u7b80\u5386",
        work_experience: "\u5de5\u4f5c\u7ecf\u9a8c",
        year: "\u5e74",
        years: "\u5e74",
      },
      candidates: "\u5019\u9009\u4eba",
      career_informations: "\u804c\u4e1a\u4fe1\u606f",
      career_level: {
        edit_career_level: "\u7f16\u8f91\u804c\u4e1a\u7b49\u7ea7",
        level_name: "\u7ea7\u522b\u540d\u79f0",
        new_career_level: "\u65b0\u804c\u4e1a\u6c34\u5e73",
        no_career_level_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u804c\u4e1a\u7ea7\u522b",
        no_career_level_found:
          "\u6ca1\u6709\u627e\u5230\u804c\u4e1a\u7ea7\u522b",
      },
      career_levels: "\u804c\u4e1a\u6c34\u5e73",
      city: {
        cities: "\u57ce\u5e02",
        city_name: "\u57ce\u5e02\u540d",
        edit_city: "\u7f16\u8f91\u57ce\u5e02",
        new_city: "\u65b0\u57ce\u5e02",
        no_city_available: "\u6ca1\u6709\u53ef\u7528\u7684\u57ce\u5e02",
        no_city_found: "\u627e\u4e0d\u5230\u57ce\u5e02",
        state_name: "\u5dde\u540d",
      },
      cms: "\u5185\u5bb9\u7ba1\u7406\u7cfb\u7edf",
      cms_about: {
        about_desc_one: "\u95dc\u65bc\u8aaa\u660e\u4e00",
        about_desc_three: "\u95dc\u65bc\u8aaa\u660e\u4e09",
        about_desc_two: "\u95dc\u65bc\u8aaa\u660e\u4e8c",
        about_image_one: "\u95dc\u65bc\u5716\u50cf\u4e00",
        about_image_three: "\u95dc\u65bc\u5716\u4e09",
        about_image_two: "\u95dc\u65bc\u5716\u4e8c",
        about_title_one: "\u95dc\u65bc\u6a19\u984c\u4e00",
        about_title_three: "\u95dc\u65bc\u6a19\u984c\u4e09",
        about_title_two: "\u95dc\u65bc\u6a19\u984c\u4e8c",
      },
      cms_service: {
        choose: "\u9078\u64c7",
        home_banner: "\u4e3b\u9801\u6a6b\u5e45",
        home_description: "\u4e3b\u9801 \u8aaa\u660e",
        home_title: "\u4e3b\u9801\u6a19\u984c",
      },
      cms_services: "CMS \u670d\u52a1",
      cms_sliders: "CMS \u6ed1\u5757",
      common: {
        action: "\u884c\u52a8",
        active: "\u6d3b\u6027",
        add: "\u52a0",
        admin_name: "\u7ba1\u7406\u54e1\u59d3\u540d",
        all: "\u6240\u6709",
        and_time: "\u548c\u6642\u9593",
        applied: "\u61c9\u7528",
        applied_on: "\u5e94\u7528\u4e8e",
        apply: "\u7533\u8bf7",
        approved_by: "\u7531...\u6279\u51c6",
        are_you_sure: "\u4f60\u78ba\u5b9a\u8981\u522a\u9664\u9019\u500b",
        are_you_sure_want_to_delete:
          "\u4f60\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u5417 ",
        are_you_sure_want_to_reject:
          "\u4f60\u786e\u5b9a\u8981\u62d2\u7edd\u8fd9\u4e2a\u5417",
        are_you_sure_want_to_select:
          "\u4f60\u786e\u5b9a\u8981\u9009\u62e9\u8fd9\u4e2a\u5417",
        back: "\u80cc\u90e8",
        cancel: "\u53d6\u6d88",
        category_image: "\u5206\u7c7b\u56fe\u7247",
        choose: "\u9009\u62e9",
        choose_file: "\u9009\u62e9\u6587\u4ef6",
        close: "\u5173",
        completed: "\u5df2\u5b8c\u6210",
        copyright: "\u7248\u6743",
        created_date: "\u521b\u5efa\u65e5\u671f",
        created_on: "\u521b\u5efa\u4e8e",
        custom: "\u98ce\u4fd7",
        de_active: "\u65e0\u6548",
        decline: "\u4e0b\u964d",
        declined: "\u62d2\u7d55",
        default_country_code: "\u9ed8\u8ba4\u56fd\u5bb6\u4ee3\u7801",
        delete: "\u5220\u9664",
        deleted: "\u5df2\u5220\u9664",
        description: "\u63cf\u8ff0",
        design_by: "\u7531...\u8bbe\u8ba1",
        design_by_name: "InfyOm Labs.",
        download: "\u4e0b\u8f7d",
        drafted: "\u8d77\u8349",
        edit: "\u7f16\u8f91",
        email: "\u7535\u5b50\u90ae\u4ef6",
        error: "\u932f\u8aa4",
        expire: "\u5230\u671f",
        export_excel: "\u5bfc\u51fa\u5230 Excel",
        female: "\u5973",
        filter_options: "\u8fc7\u6ee4\u5668\u9009\u9879",
        filters: "\u8fc7\u6ee4\u5668",
        from: "\u4ece",
        has_been_deleted: " \u5df2\u88ab\u5220\u9664\u3002",
        has_been_rejected: "\u5df2\u88ab\u62d2\u7edd\u3002",
        has_been_selected: "\u5df2\u88ab\u9009\u4e2d\u3002",
        hello: "\u4f60\u597d",
        hi: "\u4f60\u597d",
        hired: "\u50f1\u7528",
        image_aspect_ratio:
          "\u56fe\u50cf\u7eb5\u6a2a\u6bd4\u5e94\u4e3a 1:1\u3002",
        image_file_type:
          "\u56fe\u50cf\u5fc5\u987b\u662f\u4ee5\u4e0b\u7c7b\u578b\u7684\u6587\u4ef6\uff1ajpeg\u3001jpg\u3001png\u3002",
        last_change_by: "\u6700\u5f8c\u66f4\u6539\u8005",
        last_updated: "\u6700\u8fd1\u66f4\u65b0\u65f6\u95f4",
        live: "\u751f\u6d3b",
        login: "\u767b\u5f55",
        male: "\u7537",
        "n/a": "\u4e0d\u9002\u7528",
        name: "\u540d\u79f0",
        no: "\u6ca1\u6709",
        no_cancel: "\u4e0d\uff0c\u53d6\u6d88",
        not_verified: "\u672a\u7ecf\u5ba1\u6838\u7684",
        note: "\u7b14\u8bb0",
        note_message:
          "\u8bf7\u8f93\u5165\u8bed\u8a00\u77ed\u4ee3\u7801\u3002 \u5373\u82f1\u8bed= en\u3002",
        ok: "\u597d\u7684",
        ongoing: "\u9032\u884c\u4e2d",
        paused: "\u5df2\u6682\u505c",
        preview: "\u9884\u4e60",
        print: "\u6253\u5370",
        process: "\u52a0\u5de5...",
        reason: "\u539f\u56e0",
        register: "\u5bc4\u5b58\u5668",
        rejected: "\u62d2\u7edd",
        report: "\u62a5\u544a",
        resend_verification_mail:
          "\u91cd\u65b0\u53d1\u9001\u9a8c\u8bc1\u90ae\u4ef6",
        reset: "\u91cd\u542f",
        save: "\u4fdd\u5b58",
        save_as_draft: "\u4fdd\u5b58\u4e3a\u8349\u7a3f",
        saved_successfully: " \u4fdd\u5b58\u6210\u529f",
        search: "\u641c\u7d22",
        select_job_stage: "\u9078\u64c7\u5de5\u4f5c\u968e\u6bb5",
        selected: "\u5df2\u9009",
        shortlist: "\u5165\u56f4\u540d\u5355",
        show: "\u7bc0\u76ee",
        status: "\u72b6\u6001",
        success: " \u6210\u529f\u7684",
        to: "\u81f3",
        updated_successfully: " \u66f4\u65b0\u6210\u529f",
        verified: "\u5df2\u9a8c\u8bc1",
        view: "\u89c6\u56fe",
        view_more: "\u67e5\u770b\u66f4\u591a",
        view_profile: "\u89c6\u56fe\u540d\u79f0",
        welcome: "\u6b22\u8fce",
        yes: "\u662f",
        yes_delete: "\u662f\u7684\uff0c\u522a\u9664!",
        you_cancel_slot_date:
          "\u60a8\u53d6\u6d88\u6b64\u65e5\u671f\u7684\u7a7a\u6a94",
      },
      companies: "\u516c\u53f8\u4ecb\u7ecd",
      company: {
        candidate_email: "\u5019\u9009\u7535\u5b50\u90ae\u4ef6",
        candidate_name: "\u5019\u9009\u4eba\u540d\u5b57",
        candidate_phone: "\u5019\u9009\u7535\u8bdd",
        ceo: "CEO\u59d3\u540d",
        ceo_name: "\u9996\u5e2d\u6267\u884c\u5b98\u59d3\u540d",
        city: "\u5e02",
        company_details: "\u516c\u53f8\u8d44\u6599",
        company_listing: "\u516c\u53f8\u4e0a\u5e02",
        company_logo: "\u5546\u6807",
        company_name: "\u516c\u53f8\u540d",
        company_size: "\u5c3a\u5bf8",
        confirm_password: "\u786e\u8ba4\u5bc6\u7801",
        country: "\u56fd\u5bb6",
        current_password: "\u7576\u524d\u5bc6\u78bc",
        edit_company: "\u7f16\u8f91\u516c\u53f8",
        edit_employer: "\u7f16\u8f91\u96c7\u4e3b",
        email: "\u7535\u5b50\u90ae\u4ef6",
        email_verified: "\u7535\u5b50\u90ae\u4ef6\u5df2\u9a8c\u8bc1",
        employer: "\u96c7\u4e3b",
        employer_ceo: "\u96c7\u4e3b\u9996\u5e2d\u6267\u884c\u5b98",
        employer_details: "\u96c7\u4e3b\u8be6\u7ec6\u4fe1\u606f",
        employer_name: "\u96c7\u4e3b\u540d\u79f0",
        employers: "\u96c7\u4e3b",
        enter_experience_year: "\u8f38\u5165\u7576\u5e74\u7684\u7d93\u9a57",
        established_in: "\u5efa\u7acb\u5728",
        established_year: "\u9009\u6210\u7acb\u5e74\u4efd",
        facebook_url: "\u81c9\u66f8\u7db2\u5740",
        fax: "\u4f20\u771f",
        followers: "\u8ffd\u968f\u8005",
        google_plus_url: "\u8c37\u6b4c\u52a0\u7db2\u5740",
        image: "\u5716\u7247",
        industry: "\u884c\u4e1a",
        is_active: "\u6d3b\u8dc3",
        is_featured: "\u7cbe\u9009",
        linkedin_url: "\u9818\u82f1\u7db2\u5740",
        location: "\u4f4d\u7f6e",
        location2: "\u7b2c\u4e8c\u8fa6\u516c\u5730\u9ede",
        name: "\u540d\u79f0",
        new_company: "\u65b0\u516c\u53f8",
        new_employer: "\u65b0\u96c7\u4e3b",
        new_password: "\u65b0\u5bc6\u78bc",
        no_employee_found: "\u627e\u4e0d\u5230\u5458\u5de5",
        no_employee_reported_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5458\u5de5\u62a5\u544a",
        no_employer_available: "\u6ca1\u6709\u53ef\u7528\u7684\u5458\u5de5",
        no_of_offices: "\u529e\u4e8b\u5904\u6570\u91cf",
        no_reported_employer_found:
          "\u627e\u4e0d\u5230\u62a5\u544a\u7684\u96c7\u4e3b",
        notes: "\u7b14\u8bb0",
        offices: "\u8fa6\u4e8b\u8655",
        ownership_type: "\u8239\u4e1c\u7c7b\u578b",
        password: "\u5bc6\u7801",
        pinterest_url: "Pinterest \u7db2\u5740",
        report_to_company: "\u5411\u516c\u53f8\u62a5\u544a",
        reported_by: "\u62a5\u544a\u4eba",
        reported_companies: "\u7533\u62a5\u516c\u53f8",
        reported_company: "\u7533\u62a5\u516c\u53f8",
        reported_employer_detail:
          "\u62a5\u544a\u7684\u96c7\u4e3b\u8be6\u7ec6\u4fe1\u606f",
        reported_employers: "\u7533\u62a5\u96c7\u4e3b",
        reported_on: "\u62a5\u544a\u65e5\u671f",
        select_career_level: "\u9078\u64c7\u8077\u696d\u6c34\u5e73",
        select_city: "\u9078\u64c7\u57ce\u5e02",
        select_company: "\u9078\u64c7\u516c\u53f8",
        select_company_size: "\u9078\u64c7\u516c\u53f8\u898f\u6a21",
        select_country: "\u9078\u64c7\u570b\u5bb6",
        select_currency: "\u9078\u64c7\u8ca8\u5e63",
        select_degree_level: "\u9078\u64c7\u5b78\u4f4d\u7b49\u7d1a",
        select_employer_size: "\u9078\u64c7\u96c7\u4e3b\u898f\u6a21",
        select_established_year: "\u9009\u62e9\u6210\u7acb\u5e74\u4efd",
        select_functional_area: "\u9078\u64c7\u529f\u80fd\u5340",
        select_gender: "\u9078\u64c7\u6027\u5225",
        select_industry: "\u9078\u64c7\u884c\u696d",
        select_job_category: "\u9078\u64c7\u5de5\u4f5c\u985e\u5225",
        select_job_shift: "\u9078\u64c7\u5de5\u4f5c\u73ed\u6b21",
        select_job_type: "\u9078\u64c7\u5de5\u4f5c\u985e\u578b",
        select_language: "\u9078\u64c7\u8a9e\u8a00",
        select_marital_status: "\u9078\u64c7\u5a5a\u59fb\u72c0\u6cc1",
        select_ownership_type: "\u9078\u64c7\u6240\u6709\u6b0a\u985e\u578b",
        select_position: "\u9078\u64c7\u8077\u4f4d",
        select_salary_period: "\u9078\u64c7\u5de5\u8cc7\u671f",
        select_state: "\u9078\u64c7\u5dde",
        state: "\u5dde",
        title: "\u8077\u7a31",
        twitter_url: "\u63a8\u7279\u7db2\u5740",
        website: "\u7f51\u7ad9",
      },
      company_size: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        company_size: "\u516c\u53f8\u898f\u6a21",
        edit_company_size: "\u7f16\u8f91\u516c\u53f8\u89c4\u6a21",
        new_company_size: "\u65b0\u516c\u53f8\u89c4\u6a21",
        no_company_size_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u516c\u53f8\u89c4\u6a21",
        no_company_size_found: "\u672a\u627e\u5230\u516c\u53f8\u89c4\u6a21",
        show_company_size: "\u5de5\u4f5c\u7c7b\u522b",
        size: "\u5c3a\u5bf8",
      },
      company_sizes: "\u516c\u53f8\u89c4\u6a21",
      country: {
        countries: "\u56fd\u522b",
        country_name: "\u56fd\u5bb6\u7684\u540d\u5b57",
        edit_country: "\u7f16\u8f91\u56fd\u5bb6",
        new_country: "\u65b0\u56fd\u5bb6",
        no_country_available: "\u6ca1\u6709\u53ef\u7528\u7684\u56fd\u5bb6",
        no_country_found: "\u627e\u4e0d\u5230\u56fd\u5bb6",
        phone_code: "\u7535\u8bdd\u4ee3\u7801",
        short_code: "\u77ed\u4ee3\u7801",
      },
      cv_builder: "\u7b80\u5386\u5236\u4f5c\u4eba",
      dashboard: "\u4eea\u8868\u677f",
      datepicker: {
        last_month: "\u4e0a\u4e2a\u6708",
        last_week: "\u4e0a\u5468",
        this_month: "\u8fd9\u4e2a\u6708",
        this_week: "\u672c\u661f\u671f",
        today: "\u4eca\u5929",
      },
      email_template: {
        body: "\u8eab\u4f53",
        edit_email_template: "\u7f16\u8f91\u7535\u5b50\u90ae\u4ef6\u6a21\u677f",
        short_code: "\u77ed\u4ee3\u7801",
        subject: "\u4e3b\u9898",
        template_name: "\u6a21\u677f\u540d\u79f0",
      },
      email_templates: "\u7535\u5b50\u90ae\u4ef6\u6a21\u677f",
      employer: {
        job_stage: "\u5de5\u4f5c\u968e\u6bb5",
        job_stage_desc: "\u63cf\u8ff0",
      },
      employer_dashboard: {
        dashboard: "\u4eea\u8868\u677f",
        followers: "\u8ffd\u968f\u8005",
        job_applications: "\u5de5\u4f5c\u7533\u8bf7",
        open_jobs: "\u804c\u4f4d\u7a7a\u7f3a",
      },
      employer_menu: {
        closed_jobs: "\u5c01\u9589\u7684\u5de5\u4f5c",
        employer_details_field:
          "\u96c7\u4e3b\u8be6\u7ec6\u4fe1\u606f\u5b57\u6bb5\u662f\u5fc5\u9700\u7684\u3002",
        employer_profile: "\u96c7\u4e3b\u7b80\u4ecb",
        enter_description: "\u8f93\u5165\u63cf\u8ff0",
        enter_employer_details:
          "\u8f93\u5165\u96c7\u4e3b\u8be6\u7ec6\u4fe1\u606f",
        enter_industry_details: "\u8f93\u5165\u884c\u4e1a\u8be6\u60c5...",
        enter_ownership_details: "\u8f93\u5165\u7269\u4e1a\u8be6\u60c5...",
        expires_on: "\u5230\u671f",
        followers: "\u8ffd\u968f\u8005",
        general_dashboard: "\u901a\u7528\u4eea\u8868\u76d8",
        jobs: "\u5de5\u4f5c",
        manage_subscriptions: "\u7ba1\u7406\u8a02\u95b1",
        no_data_available: "\u6c92\u6709\u53ef\u7528\u6578\u64da",
        paused_jobs: "\u66ab\u505c\u7684\u5de5\u4f5c",
        recent_follower: "\u6700\u8fd1\u7684\u8ffd\u96a8\u8005",
        recent_jobs: "\u6700\u8fd1\u7684\u5de5\u4f5c",
        total_job_applications: "\u8077\u4f4d\u7533\u8acb\u7e3d\u6578",
        total_jobs: "\u7e3d\u5de5\u4f5c",
        transactions: "\u4ea4\u6613\u6b21\u6578",
        valid_facebook_url:
          "\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684 Facebook URL",
        valid_google_plus_url:
          "\u8f93\u5165\u6709\u6548\u7684 Google Plus \u7f51\u5740",
        valid_linkedin_url: "\u8bf7\u8f93\u5165\u6709\u6548\u7684 Linkedin URL",
        valid_pinterest_url:
          "\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684 Pinterest URL",
        valid_twitter_url:
          "\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684 Twitter URL",
      },
      employers: "\u96c7\u4e3b",
      env: "\u73af\u5883\u8bbe\u5b9a",
      expired_jobs: "\u8fc7\u671f\u804c\u4f4d",
      faq: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_faq: "\u7f16\u8f91\u5e38\u89c1\u95ee\u9898",
        faq: "\u5e38\u95ee\u95ee\u9898",
        faq_detail:
          "\u5e38\u89c1\u95ee\u9898\u89e3\u7b54\u8be6\u7ec6\u4fe1\u606f",
        new_faq: "\u65b0\u7684\u5e38\u89c1\u95ee\u9898\u89e3\u7b54",
        no_faq_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5e38\u89c1\u95ee\u9898\u89e3\u7b54",
        no_faq_found: "\u672a\u627e\u5230\u5e38\u89c1\u95ee\u9898\u89e3\u7b54",
        show_faq: "\u663e\u793a\u5e38\u89c1\u95ee\u9898",
        title: "\u6807\u9898",
      },
      favourite_companies: "\u8ffd\u968f\u8005",
      favourite_jobs: "\u6700\u559c\u6b22\u7684\u5de5\u4f5c",
      filter_name: {
        closed: "\u5173\u95ed",
        country: "\u56fd\u5bb6",
        digital: "\u6578\u5b57\u7684",
        drafted: "\u8d77\u8349",
        featured_company: "\u7279\u8272\u516c\u53f8",
        featured_job: "\u7279\u8272\u5de5\u4f5c",
        freelancer_job: "\u81ea\u7531\u804c\u4e1a\u8005\u5de5\u4f5c",
        immediate: "\u5373\u65f6",
        job_status: "\u5de5\u4f5c\u73b0\u72b6",
        live: "\u5c45\u4f4f",
        manually: "\u624b\u52d5",
        paused: "\u6682\u505c",
        select_featured_company: "\u9009\u62e9\u7279\u8272\u516c\u53f8",
        select_featured_job: "\u9009\u62e9\u7279\u8272\u5de5\u4f5c",
        select_status: "\u9009\u62e9\u72b6\u6001",
        state: "\u72b6\u6001",
        status: "Status",
        suspended_job: "\u6682\u505c\u5de5\u4f5c",
      },
      flash: {
        about_us_update:
          "\u5173\u4e8e\u6211\u4eec\u66f4\u65b0\u6210\u529f\u3002",
        admin_cant_delete: "\u7ba1\u7406\u5458\u65e0\u6cd5\u5220\u9664\u3002",
        admin_delete: "\u7ba1\u7406\u54e1\u522a\u9664\u6210\u529f\u3002",
        admin_save: "\u7ba1\u7406\u54e1\u4fdd\u5b58\u6210\u529f\u3002",
        admin_update: "\u7ba1\u7406\u54e1\u66f4\u65b0\u6210\u529f\u3002",
        all_notification_read:
          "\u6240\u6709\u901a\u77e5\u8bfb\u53d6\u6210\u529f\u3002",
        are_you_sure_to_change_status:
          "\u60a8\u78ba\u5b9a\u8981\u66f4\u6539\u72c0\u614b\u55ce\uff1f",
        assigned_slot_not_delete:
          "\u5206\u914d\u7684\u63d2\u69fd\u4e0d\u5e94\u5220\u9664\u3002",
        attention: "\u6ce8\u610f\u529b",
        brand_delete: "\u54c1\u724c\u5220\u9664\u6210\u529f\u3002",
        brand_retrieved: "\u54c1\u724c\u68c0\u7d22\u6210\u529f\u3002",
        brand_save: "\u54c1\u724c\u4fdd\u5b58\u6210\u529f\u3002",
        brand_update: "\u54c1\u724c\u66f4\u65b0\u6210\u529f\u3002",
        cancel_reason_require: "\u9700\u8981\u53d6\u6d88\u539f\u56e0\u3002",
        candidate_delete: "\u5019\u9009\u4eba\u5220\u9664\u6210\u529f\u3002",
        candidate_education_delete:
          "\u8003\u751f\u6559\u80b2\u5220\u9664\u6210\u529f\u3002",
        candidate_education_retrieved:
          "\u5019\u9009\u4eba\u6559\u80b2\u68c0\u7d22\u6210\u529f\u3002",
        candidate_education_save:
          "\u5019\u9009\u4eba\u6559\u80b2\u6dfb\u52a0\u6210\u529f\u3002",
        candidate_education_update:
          "\u5019\u9009\u4eba\u6559\u80b2\u66f4\u65b0\u6210\u529f\u3002",
        candidate_experience_delete:
          "\u5019\u9009\u4eba\u4f53\u9a8c\u5220\u9664\u6210\u529f\u3002",
        candidate_experience_retrieved:
          "\u5019\u9009\u4eba\u7ecf\u9a8c\u68c0\u7d22\u6210\u529f\u3002",
        candidate_experience_save:
          "\u5019\u9009\u4eba\u7ecf\u9a8c\u6dfb\u52a0\u6210\u529f\u3002",
        candidate_experience_update:
          "\u5019\u9009\u4eba\u7ecf\u9a8c\u66f4\u65b0\u6210\u529f\u3002",
        candidate_not_found: "\u672a\u627e\u5230\u5019\u9009\u4eba",
        candidate_profile:
          "\u5019\u9009\u4eba\u8d44\u6599\u66f4\u65b0\u6210\u529f\u3002",
        candidate_reported: "\u5019\u9009\u4eba\u62a5\u544a\u6210\u529f\u3002",
        candidate_retrieved: "\u5019\u9009\u4eba\u68c0\u7d22\u6210\u529f\u3002",
        candidate_save: "\u5019\u9009\u4eba\u4fdd\u5b58\u6210\u529f\u3002",
        candidate_update: "\u5019\u9009\u4eba\u66f4\u65b0\u6210\u529f\u3002",
        career_level_cant_delete:
          "\u804c\u4e1a\u7b49\u7ea7\u4e0d\u80fd\u5220\u9664\u3002",
        career_level_delete:
          "\u804c\u4e1a\u7b49\u7ea7\u5220\u9664\u6210\u529f\u3002",
        career_level_retrieved:
          "\u804c\u4e1a\u7b49\u7ea7\u68c0\u7d22\u6210\u529f\u3002",
        career_level_save:
          "\u804c\u4e1a\u7b49\u7ea7\u6dfb\u52a0\u6210\u529f\u3002",
        career_level_update:
          "\u804c\u4e1a\u7b49\u7ea7\u66f4\u65b0\u6210\u529f\u3002",
        city_cant_delete: "\u57ce\u5e02\u4e0d\u80fd\u88ab\u5220\u9664",
        city_delete: "\u57ce\u5e02\u5220\u9664\u6210\u529f\u3002",
        city_retrieved: "\u57ce\u5e02\u68c0\u7d22\u6210\u529f\u3002",
        city_save: "\u57ce\u5e02\u4fdd\u5b58\u6210\u529f\u3002",
        city_update: "\u57ce\u5e02\u66f4\u65b0\u6210\u529f\u3002",
        close_job:
          "\u5df2\u5173\u95ed\u7684\u4f5c\u4e1a\u65e0\u6cd5\u7f16\u8f91\u3002",
        cms_service_update: "CMS \u670d\u52a1\u66f4\u65b0\u6210\u529f\u3002",
        comment_deleted: "\u8bc4\u8bba\u5220\u9664\u6210\u529f\u3002",
        comment_edit: "\u8bc4\u8bba\u7f16\u8f91\u6210\u529f\u3002",
        comment_saved: "\u8bc4\u8bba\u4fdd\u5b58\u6210\u529f\u3002",
        comment_updated: "\u8bc4\u8bba\u66f4\u65b0\u6210\u529f\u3002",
        company_delete: "\u516c\u53f8\u5220\u9664\u6210\u529f\u3002",
        company_mark_feature:
          "\u516c\u53f8\u6807\u8bb0\u4e3a\u7279\u8272\u6210\u529f\u3002",
        company_mark_unFeature:
          "\u516c\u53f8\u6210\u529f\u6807\u8bb0\u4e3a\u672a\u7cbe\u9009\u3002",
        company_save: "\u516c\u53f8\u4fdd\u5b58\u6210\u529f\u3002",
        company_size_cant_delete:
          "\u65e0\u6cd5\u5220\u9664\u516c\u53f8\u89c4\u6a21\u3002",
        company_size_delete:
          "\u516c\u53f8\u89c4\u6a21\u5220\u9664\u6210\u529f\u3002",
        company_size_save:
          "\u516c\u53f8\u89c4\u6a21\u4fdd\u5b58\u6210\u529f\u3002",
        company_size_update:
          "\u516c\u53f8\u89c4\u6a21\u66f4\u65b0\u6210\u529f\u3002",
        company_update: "\u516c\u53f8\u66f4\u65b0\u6210\u529f\u3002",
        country_cant_delete: "\u56fd\u5bb6\u4e0d\u80fd\u88ab\u5220\u9664\u3002",
        country_delete: "\u56fd\u5bb6\u5220\u9664\u6210\u529f\u3002",
        country_save: "\u56fd\u5bb6\u4fdd\u5b58\u6210\u529f\u3002",
        country_update: "\u56fd\u5bb6\u66f4\u65b0\u6210\u529f\u3002",
        default_resume_already_upload:
          "\u9ed8\u8a8d\u7c21\u6b77\u5df2\u4e0a\u50b3\u3002",
        degree_level_cant_delete:
          "\u5b66\u4f4d\u7b49\u7ea7\u4e0d\u80fd\u5220\u9664",
        degree_level_delete:
          "\u5b66\u4f4d\u7ea7\u522b\u5220\u9664\u6210\u529f\u3002",
        degree_level_retrieve:
          "\u5b66\u4f4d\u7ea7\u522b\u68c0\u7d22\u6210\u529f\u3002",
        degree_level_save:
          "\u5b66\u4f4d\u7b49\u7ea7\u4fdd\u5b58\u6210\u529f\u3002",
        degree_level_update:
          "\u5b66\u4f4d\u7b49\u7ea7\u66f4\u65b0\u6210\u529f\u3002",
        description_required:
          "\u63cf\u8ff0\u5b57\u6bb5\u662f\u5fc5\u9700\u7684\u3002",
        email_template:
          "\u7535\u5b50\u90ae\u4ef6\u6a21\u677f\u66f4\u65b0\u6210\u529f\u3002",
        email_verify: "\u7535\u5b50\u90ae\u4ef6\u9a8c\u8bc1\u6210\u529f\u3002",
        employer_profile:
          "\u96c7\u4e3b\u8d44\u6599\u66f4\u65b0\u6210\u529f\u3002",
        employer_update: "\u96c7\u4e3b\u66f4\u65b0\u6210\u529f\u3002",
        enter_cancel_reason: "\u8f38\u5165\u53d6\u6d88\u539f\u56e0...",
        enter_description: "\u8f38\u5165\u63cf\u8ff0",
        enter_notes: "\u8f38\u5165\u8a3b\u91cb...",
        enter_post_description: "\u8f38\u5165\u5e16\u5b50\u63cf\u8ff0",
        faqs_delete:
          "\u5e38\u89c1\u95ee\u9898\u5df2\u6210\u529f\u5220\u9664\u3002",
        faqs_save:
          "\u5e38\u89c1\u95ee\u9898\u5df2\u6210\u529f\u4fdd\u5b58\u3002",
        faqs_update: "\u5e38\u89c1\u95ee\u9898\u66f4\u65b0\u6210\u529f\u3002",
        fav_company_delete:
          "\u6536\u85cf\u7684\u516c\u53f8\u5220\u9664\u6210\u529f\u3002",
        fav_job_added:
          "\u6536\u85cf\u7684\u804c\u4f4d\u6dfb\u52a0\u6210\u529f\u3002",
        fav_job_remove:
          "\u6700\u559c\u6b22\u7684\u5de5\u4f5c\u5df2\u88ab\u5220\u9664\u3002",
        fav_job_removed:
          "\u6536\u85cf\u7684\u5de5\u4f5c\u5df2\u6210\u529f\u5220\u9664\u3002",
        feature_job_price:
          "\u7cbe\u9009\u5de5\u4f5c\u4ef7\u683c\u5e94\u5927\u4e8e 0",
        feature_quota: "\u7cbe\u9009\u914d\u989d\u4e0d\u53ef\u7528",
        featured_not_available:
          "\u7cbe\u9009\u914d\u989d\u4e0d\u53ef\u7528\u3002",
        file_type:
          "\u6587\u6863\u5fc5\u987b\u662f\u4ee5\u4e0b\u7c7b\u578b\u7684\u6587\u4ef6\uff1ajpeg\u3001jpg\u3001pdf\u3001doc\u3001docx\u3002",
        functional_area_cant_delete:
          "\u529f\u80fd\u533a\u4e0d\u80fd\u5220\u9664",
        functional_area_delete:
          "\u529f\u80fd\u533a\u5220\u9664\u6210\u529f\u3002",
        functional_area_save:
          "\u529f\u80fd\u533a\u4fdd\u5b58\u6210\u529f\u3002",
        functional_area_update:
          "\u529f\u80fd\u533a\u66f4\u65b0\u6210\u529f\u3002",
        header_slider_deleted:
          "\u6807\u9898\u6ed1\u5757\u5220\u9664\u6210\u529f\u3002",
        header_slider_save:
          "\u6807\u9898\u6ed1\u5757\u4fdd\u5b58\u6210\u529f\u3002",
        header_slider_update:
          "\u6807\u9898\u6ed1\u5757\u66f4\u65b0\u6210\u529f\u3002",
        image_slider_delete:
          "\u56fe\u50cf\u6ed1\u5757\u5220\u9664\u6210\u529f\u3002",
        image_slider_retrieve:
          "\u56fe\u50cf\u6ed1\u5757\u68c0\u7d22\u6210\u529f\u3002",
        image_slider_save:
          "\u56fe\u50cf\u6ed1\u5757\u4fdd\u5b58\u6210\u529f\u3002",
        image_slider_update:
          "\u56fe\u50cf\u6ed1\u5757\u66f4\u65b0\u6210\u529f\u3002",
        industry_cant_delete:
          "\u884c\u4e1a\u4e0d\u80fd\u88ab\u5220\u9664\u3002",
        industry_delete: "\u884c\u4e1a\u5220\u9664\u6210\u529f\u3002",
        industry_save: "\u884c\u4e1a\u4fdd\u5b58\u6210\u529f\u3002",
        industry_update: "\u884c\u4e1a\u66f4\u65b0\u6210\u529f\u3002",
        inquiry_deleted: "\u67e5\u8be2\u5220\u9664\u6210\u529f\u3002",
        inquiry_retrieve: "\u67e5\u8be2\u68c0\u7d22\u6210\u529f\u3002",
        invoice_retrieve: "\u53d1\u7968\u68c0\u7d22\u6210\u529f\u3002",
        job_abuse_reported:
          "\u5de5\u4f5c\u6ee5\u7528\u62a5\u544a\u6210\u529f\u3002",
        job_alert: "\u5de5\u4f5c\u63d0\u9192\u66f4\u65b0\u6210\u529f\u3002",
        job_application_delete:
          "\u804c\u4f4d\u7533\u8bf7\u5220\u9664\u6210\u529f\u3002",
        job_application_draft:
          "\u5de5\u4f5c\u7533\u8bf7\u8d77\u8349\u6210\u529f",
        job_applied: "\u5de5\u4f5c\u7533\u8bf7\u6210\u529f",
        job_apply_by_candidate:
          "\u5019\u9009\u4eba\u7533\u8bf7\u7684\u804c\u4f4d\u4e0d\u80fd\u5220\u9664",
        job_cant_delete: "\u7121\u6cd5\u522a\u9664\u4f5c\u696d",
        job_category_cant_delete:
          "\u804c\u4f4d\u7c7b\u522b\u4e0d\u80fd\u5220\u9664\u3002",
        job_category_delete:
          "\u4f5c\u4e1a\u7c7b\u522b\u5220\u9664\u6210\u529f\u3002",
        job_category_save:
          "\u5de5\u4f5c\u7c7b\u522b\u4fdd\u5b58\u6210\u529f\u3002",
        job_category_update:
          "\u5de5\u4f5c\u7c7b\u522b\u66f4\u65b0\u6210\u529f\u3002",
        job_create_limit:
          "\u8d85\u8fc7\u60a8\u5e10\u6237\u7684\u5de5\u4f5c\u521b\u5efa\u9650\u5236\uff0c\u66f4\u65b0\u60a8\u7684\u8ba2\u9605\u8ba1\u5212\u3002",
        job_delete: "\u4f5c\u4e1a\u5220\u9664\u6210\u529f\u3002",
        job_draft: "\u5de5\u4f5c\u8349\u7a3f\u4fdd\u5b58\u6210\u529f\u3002",
        job_emailed_to:
          "\u5de5\u4f5c\u5df2\u6210\u529f\u901a\u8fc7\u7535\u5b50\u90ae\u4ef6\u53d1\u9001\u7ed9\u670b\u53cb\u3002",
        job_make_featured: "\u5de5\u4f5c\u4f7f\u7cbe\u9009\u6210\u529f\u3002",
        job_make_unfeatured: "Job Make UnFeatured \u6210\u529f\u3002",
        job_not_found: "\u627e\u4e0d\u5230\u5de5\u4f5c\u3002",
        job_notification:
          "\u4f5c\u4e1a\u901a\u77e5\u53d1\u9001\u6210\u529f\u3002",
        job_save: "\u4f5c\u4e1a\u4fdd\u5b58\u6210\u529f\u3002",
        job_schedule_send:
          "\u4f5c\u4e1a\u8ba1\u5212\u53d1\u9001\u6210\u529f\u3002",
        job_shift_cant_delete:
          "\u65e0\u6cd5\u5220\u9664\u5de5\u4f5c\u73ed\u6b21\u3002",
        job_shift_delete:
          "\u5de5\u4f5c\u73ed\u6b21\u5220\u9664\u6210\u529f\u3002",
        job_shift_retrieve:
          "\u5de5\u4f5c\u73ed\u6b21\u68c0\u7d22\u6210\u529f\u3002",
        job_shift_save:
          "\u5de5\u4f5c\u73ed\u6b21\u4fdd\u5b58\u6210\u529f\u3002",
        job_shift_update:
          "\u5de5\u4f5c\u73ed\u6b21\u66f4\u65b0\u6210\u529f\u3002",
        job_stage_cant_delete:
          "\u65e0\u6cd5\u5220\u9664\u4f5c\u4e1a\u9636\u6bb5\u3002",
        job_stage_change:
          "\u4f5c\u4e1a\u9636\u6bb5\u66f4\u6539\u6210\u529f\u3002",
        job_stage_delete:
          "\u4f5c\u4e1a\u9636\u6bb5\u5220\u9664\u6210\u529f\u3002",
        job_stage_retrieve:
          "\u4f5c\u4e1a\u9636\u6bb5\u68c0\u7d22\u6210\u529f\u3002",
        job_stage_save:
          "\u4f5c\u4e1a\u9636\u6bb5\u4fdd\u5b58\u6210\u529f\u3002",
        job_stage_update:
          "\u4f5c\u4e1a\u9636\u6bb5\u66f4\u65b0\u6210\u529f\u3002",
        job_tag_cant_delete:
          "\u5de5\u4f5c\u6807\u7b7e\u4e0d\u80fd\u88ab\u5220\u9664\u3002",
        job_tag_delete:
          "\u804c\u4f4d\u6807\u7b7e\u5220\u9664\u6210\u529f\u3002",
        job_tag_retrieve:
          "\u5de5\u4f5c\u6807\u7b7e\u68c0\u7d22\u6210\u529f\u3002",
        job_tag_save: "\u5de5\u4f5c\u6807\u7b7e\u4fdd\u5b58\u6210\u529f\u3002",
        job_tag_update:
          "\u804c\u4f4d\u6807\u7b7e\u66f4\u65b0\u6210\u529f\u3002",
        job_type_cant_delete:
          "\u65e0\u6cd5\u5220\u9664\u4f5c\u4e1a\u7c7b\u578b\u3002",
        job_type_delete:
          "\u4f5c\u4e1a\u7c7b\u578b\u5220\u9664\u6210\u529f\u3002",
        job_type_retrieve:
          "\u4f5c\u4e1a\u7c7b\u578b\u68c0\u7d22\u6210\u529f\u3002",
        job_type_save: "\u4f5c\u4e1a\u7c7b\u578b\u4fdd\u5b58\u6210\u529f\u3002",
        job_type_update:
          "\u4f5c\u4e1a\u7c7b\u578b\u66f4\u65b0\u6210\u529f\u3002",
        job_update: "\u4f5c\u4e1a\u66f4\u65b0\u6210\u529f\u3002",
        language_added: "\u8bed\u8a00\u6dfb\u52a0\u6210\u529f\u3002",
        language_changed: "\u8bed\u8a00\u66f4\u6539\u6210\u529f",
        language_delete: "\u8bed\u8a00\u5220\u9664\u6210\u529f\u3002",
        language_retrieve: "\u8bed\u8a00\u68c0\u7d22\u6210\u529f\u3002",
        language_save: "\u8bed\u8a00\u4fdd\u5b58\u6210\u529f\u3002",
        language_update: "\u8bed\u8a00\u66f4\u65b0\u6210\u529f\u3002",
        link_copy: "\u93c8\u63a5\u8907\u88fd\u6210\u529f\u3002",
        manual_payment:
          "\u624b\u52a8\u652f\u4ed8\u6210\u529f\u6279\u51c6\u3002",
        manual_payment_denied:
          "\u624b\u52a8\u4ed8\u6b3e\u88ab\u62d2\u7edd\u6210\u529f\u3002",
        marital_status_delete:
          "\u5a5a\u59fb\u72b6\u51b5\u5220\u9664\u6210\u529f\u3002",
        marital_status_retrieve:
          "\u5a5a\u59fb\u72b6\u51b5\u68c0\u7d22\u6210\u529f\u3002",
        marital_status_save:
          "\u5a5a\u59fb\u72b6\u51b5\u4fdd\u5b58\u6210\u529f\u3002",
        marital_status_update:
          "\u5a5a\u59fb\u72b6\u51b5\u66f4\u65b0\u6210\u529f\u3002",
        media_delete: "\u5a92\u4f53\u5220\u9664\u6210\u529f\u3002",
        newsletter_delete: "NewsLetter \u5220\u9664\u6210\u529f\u3002",
        no_record: "\u6c92\u6709\u627e\u5230\u8a18\u9304\u3002",
        not_deleted: "\u672a\u522a\u9664",
        noticeboard_retrieve:
          "\u5e03\u544a\u680f\u68c0\u7d22\u6210\u529f\u3002",
        noticeboard_save: "\u5e03\u544a\u680f\u4fdd\u5b58\u6210\u529f\u3002",
        noticeboard_update: "\u5e03\u544a\u680f\u66f4\u65b0\u6210\u529f\u3002",
        notification_read: "\u901a\u77e5\u8bfb\u53d6\u6210\u529f\u3002",
        notification_setting_update:
          "\u901a\u77e5\u8bbe\u7f6e\u66f4\u65b0\u6210\u529f\u3002",
        ownership_type_cant_delete:
          "\u4e0d\u80fd\u5220\u9664 OwnerShip \u7c7b\u578b\u3002",
        ownership_type_delete:
          "\u5df2\u6210\u529f\u5220\u9664 OwnerShip \u7c7b\u578b\u3002",
        ownership_type_retrieve:
          "OwnerShip \u7c7b\u578b\u68c0\u7d22\u6210\u529f\u3002",
        ownership_type_save:
          "OwnerShip \u7c7b\u578b\u4fdd\u5b58\u6210\u529f\u3002",
        ownership_type_updated:
          "OwnerShip \u7c7b\u578b\u66f4\u65b0\u6210\u529f\u3002",
        password_update: "\u5bc6\u7801\u66f4\u65b0\u6210\u529f\u3002",
        payment_failed_try_again:
          "\u5bf9\u4e0d\u8d77\uff01 \u4ed8\u6b3e\u5931\u8d25\uff0c\u8bf7\u8fc7\u4e00\u6bb5\u65f6\u95f4\u518d\u8bd5\u3002",
        payment_not_complete: "\u60a8\u7684\u4ed8\u6b3e\u672a\u5b8c\u6210",
        payment_success:
          "\u60a8\u7684\u4ed8\u6b3e\u5df2\u6210\u529f\u5b8c\u6210",
        plan_Save: "\u8ba1\u5212\u4fdd\u5b58\u6210\u529f\u3002",
        plan_cant_delete:
          "\u8ba1\u5212\u65e0\u6cd5\u5220\u9664\uff0c\u5b83\u5305\u542b\u4e00\u4e2a\u6216\u591a\u4e2a\u6709\u6548\u8ba2\u9605\u3002",
        plan_cant_update:
          "\u8ba1\u5212\u4e0d\u80fd\u66f4\u65b0\u3002\u6b64\u8ba1\u5212\u7684\u8ba2\u9605\u5df2\u5b58\u5728",
        plan_delete: "\u8ba1\u5212\u5220\u9664\u6210\u529f\u3002",
        plan_retrieve: "\u8ba1\u5212\u68c0\u7d22\u6210\u529f\u3002",
        plan_update: "\u8ba1\u5212\u66f4\u65b0\u6210\u529f\u3002",
        please_wait_for:
          "\u8bf7\u7b49\u5f85\u7ba1\u7406\u5458\u6279\u51c6\u60a8\u5df2\u6dfb\u52a0\u4eba\u5de5\u4ed8\u6b3e",
        please_wait_for_com:
          "\u8bf7\u7b49\u5f85\u7ba1\u7406\u5458\u6279\u51c6\u4ee5\u5b8c\u6210\u60a8\u7684\u4ea4\u6613",
        policy_update: "\u7b56\u7565\u66f4\u65b0\u6210\u529f\u3002",
        post_category_delete:
          "\u5e16\u5b50\u7c7b\u522b\u5220\u9664\u6210\u529f\u3002",
        post_category_retrieve:
          "\u5e16\u5b50\u7c7b\u522b\u68c0\u7d22\u6210\u529f\u3002",
        post_category_save:
          "\u5e16\u5b50\u7c7b\u522b\u4fdd\u5b58\u6210\u529f\u3002",
        post_category_update:
          "\u5e16\u5b50\u7c7b\u522b\u66f4\u65b0\u6210\u529f\u3002",
        post_comment: "\u5e16\u5b50\u8bc4\u8bba\u68c0\u7d22\u6210\u529f\u3002",
        post_delete: "\u5e16\u5b50\u5220\u9664\u6210\u529f\u3002",
        post_save: "\u5e16\u5b50\u4fdd\u5b58\u6210\u529f\u3002",
        post_update: "\u5e16\u5b50\u66f4\u65b0\u6210\u529f\u3002",
        profile_update:
          "\u914d\u7f6e\u6587\u4ef6\u66f4\u65b0\u6210\u529f\u3002",
        reason_require:
          "\u53d6\u6d88\u539f\u56e0\u662f\u5fc5\u9700\u7684\u3002",
        register_success_mail_active:
          "\u60a8\u5df2\u8a3b\u518a\u6210\u529f\uff0c\u8acb\u901a\u904e\u90f5\u4ef6\u6fc0\u6d3b\u60a8\u7684\u5e33\u6236\u3002",
        registration_done: "\u6ce8\u518c\u6210\u529f\u3002",
        report_to_company: "\u5411\u516c\u53f8\u62a5\u544a\u6210\u529f\u3002",
        reported_candidate_delete:
          "\u62a5\u544a\u7684\u5019\u9009\u4eba\u5df2\u6210\u529f\u5220\u9664\u3002",
        reported_job_delete:
          "\u5df2\u6210\u529f\u5220\u9664\u5df2\u62a5\u544a\u7684\u4f5c\u4e1a\u3002",
        resume_delete: "\u6062\u590d\u5220\u9664\u6210\u529f\u3002",
        resume_update: "\u7b80\u5386\u66f4\u65b0\u6210\u529f\u3002",
        retrieved: "\u68c0\u7d22\u6210\u529f\u3002",
        salary_currency_cant_delete:
          "\u5de5\u8d44\u5e01\u79cd\u4e0d\u80fd\u5220\u9664\u3002",
        salary_currency_destroy:
          "\u5de5\u8d44\u5e01\u79cd\u5220\u9664\u6210\u529f\u3002",
        salary_currency_edit:
          "\u5de5\u8d44\u8d27\u5e01\u68c0\u7d22\u6210\u529f\u3002",
        salary_currency_store:
          "\u5de5\u8d44\u8d27\u5e01\u4fdd\u5b58\u6210\u529f\u3002",
        salary_currency_update:
          "\u5de5\u8d44\u5e01\u79cd\u66f4\u65b0\u6210\u529f\u3002",
        salary_period_cant_delete: "\u5de5\u8d44\u671f\u4e0d\u80fd\u5220\u9664",
        salary_period_delete:
          "\u5de5\u8d44\u671f\u5220\u9664\u6210\u529f\u3002",
        salary_period_retrieve:
          "\u5de5\u8d44\u671f\u68c0\u7d22\u6210\u529f\u3002",
        salary_period_save: "\u5de5\u8d44\u671f\u4fdd\u5b58\u6210\u529f\u3002",
        salary_period_update:
          "\u5de5\u8d44\u671f\u66f4\u65b0\u6210\u529f\u3002",
        select_employer: "\u9078\u64c7\u96c7\u4e3b",
        select_job: "\u9078\u64c7\u5de5\u4f5c",
        select_job_skill: "\u9078\u64c7\u5de5\u4f5c\u6280\u80fd",
        select_job_tag: "\u9078\u64c7\u5de5\u4f5c\u6a19\u7c64",
        select_post_category: "\u9078\u64c7\u5e16\u5b50\u985e\u5225",
        select_skill: "\u9078\u64c7\u6280\u80fd",
        session_created: "\u4f1a\u8bdd\u521b\u5efa\u6210\u529f\u3002",
        setting_update: "\u8bbe\u7f6e\u66f4\u65b0\u6210\u529f\u3002",
        skill_cant_delete: "\u6280\u80fd\u4e0d\u80fd\u5220\u9664",
        skill_delete: "\u6280\u80fd\u5220\u9664\u6210\u529f\u3002",
        skill_save: "\u6280\u80fd\u4fdd\u5b58\u6210\u529f\u3002",
        skill_update: "\u6280\u80fd\u66f4\u65b0\u6210\u529f\u3002",
        slot_already_taken: "\u63d2\u69fd\u5df2\u88ab\u5360\u7528",
        slot_cancel: "\u63d2\u69fd\u53d6\u6d88\u6210\u529f\u3002",
        slot_choose: "\u63d2\u69fd\u9009\u62e9\u6210\u529f",
        slot_create: "\u63d2\u69fd\u521b\u5efa\u6210\u529f",
        slot_delete: "\u63d2\u69fd\u5220\u9664\u6210\u529f\u3002",
        slot_preference_field:
          "\u63d2\u69fd\u9996\u9078\u9805\u5b57\u6bb5\u70ba\u5fc5\u586b\u9805",
        slot_reject: "\u63d2\u69fd\u88ab\u6210\u529f\u62d2\u7edd",
        slot_update: "\u63d2\u69fd\u66f4\u65b0\u6210\u529f\u3002",
        state_cant_delete: "\u4e0d\u80fd\u5220\u9664\u72b6\u6001\u3002",
        state_delete: "\u72b6\u6001\u5220\u9664\u6210\u529f\u3002",
        state_save: "\u72b6\u6001\u4fdd\u5b58\u6210\u529f\u3002",
        state_update: "\u72b6\u6001\u66f4\u65b0\u6210\u529f\u3002",
        status_change: "\u72b6\u6001\u66f4\u6539\u6210\u529f\u3002",
        status_update: "\u72b6\u6001\u66f4\u65b0\u6210\u529f\u3002",
        subscribed: "\u8ba2\u9605\u6210\u529f\u3002",
        subscription_cancel: "\u8ba2\u9605\u53d6\u6d88\u6210\u529f\u3002",
        subscription_resume: "\u8ba2\u9605\u6210\u529f\u6062\u590d\u3002",
        success_verify:
          "\u60a8\u5df2\u6210\u529f\u9a8c\u8bc1\u60a8\u7684\u7535\u5b50\u90ae\u4ef6\u3002\u8bf7\u767b\u5f55 \uff01",
        testimonial_delete: "\u63a8\u8350\u4e66\u5220\u9664\u6210\u529f\u3002",
        testimonial_retrieve:
          "\u63a8\u8350\u4e66\u68c0\u7d22\u6210\u529f\u3002",
        testimonial_save: "\u8bc1\u660e\u4fdd\u5b58\u6210\u529f\u3002",
        testimonial_update: "\u63a8\u8350\u4e66\u66f4\u65b0\u6210\u529f\u3002",
        the_name_has: "\u540d\u5b57\u5df2\u7ecf\u88ab\u5360\u7528\u4e86",
        there_are_no: "\u6ca1\u6709\u4e0a\u4f20\u7b80\u5386\u3002",
        this_currency_is:
          "PayPal \u4e0d\u652f\u6301\u8fd9\u79cd\u8d27\u5e01\u8fdb\u884c\u4ed8\u6b3e\u3002",
        translation_update: "\u7ffb\u8bd1\u66f4\u65b0\u6210\u529f\u3002",
        trial_plan_update:
          "\u8bd5\u7528\u8ba1\u5212\u66f4\u65b0\u6210\u529f\u3002",
        unfollow_company:
          "\u6210\u529f\u53d6\u6d88\u5173\u6ce8\u516c\u53f8\u3002",
        verification_mail:
          "\u9a8c\u8bc1\u90ae\u4ef6\u91cd\u65b0\u53d1\u9001\u6210\u529f\u3002",
        your_are_not_author:
          "\u4f60\u4e0d\u662f\u8ba2\u9605\u7684\u4f5c\u8005\u3002\u6240\u4ee5\u4f60\u4e0d\u80fd\u53d6\u6d88\u8fd9\u4e2a\u8ba2\u9605\u3002",
        your_payment_comp:
          "\u60a8\u7684\u4ed8\u6b3e\u5df2\u6210\u529f\u5b8c\u6210",
      },
      footer_settings: "\u9875\u811a\u8bbe\u7f6e",
      front_cms: "\u524d\u53f0CMS",
      front_home: {
        candidates: "\u5019\u9009\u4eba",
        companies: "\u516c\u53f8\u4ecb\u7ecd",
        jobs: "\u5de5\u4f5c",
        resumes: "\u5c65\u5386\u8868",
      },
      front_settings: {
        exipre_on: "\u5f00\u542f",
        expires_on: "\u5230\u671f",
        featured: "\u7cbe\u9009",
        featured_companies_days: "\u7279\u8272\u516c\u53f8\u65e5",
        featured_companies_due_days:
          "\u9ed8\u8ba4\u516c\u53f8\u5230\u671f\u65e5",
        featured_companies_enable: "\u7279\u8272\u516c\u53f8\u542f\u7528",
        featured_companies_price: "\u7279\u8272\u516c\u53f8\u4ef7\u683c",
        featured_companies_quota: "\u7279\u8272\u516c\u53f8\u65e5",
        featured_employer_not_available:
          "\u7279\u8272\u96c7\u4e3b\u4e0d\u53ef\u7528",
        featured_job: "\u7279\u8272\u5de5\u4f5c",
        featured_jobs_days: "\u7279\u8272\u5de5\u4f5c\u65e5",
        featured_jobs_due_days: "\u9ed8\u8ba4\u4f5c\u4e1a\u5230\u671f\u65e5",
        featured_jobs_enable: "\u7279\u8272\u5de5\u4f5c\u542f\u7528",
        featured_jobs_price: "\u7279\u8272\u5de5\u4f5c\u4ef7\u683c",
        featured_jobs_quota: "\u7279\u8272\u5de5\u4f5c\u914d\u989d",
        featured_listing_currency: "\u7cbe\u9078\u4e0a\u5e02\u8ca8\u5e63",
        latest_jobs_enable:
          "\u6839\u64da\u767b\u9304\u7528\u6236\u6240\u5728\u570b\u5bb6/\u5730\u5340\u986f\u793a\u6700\u65b0\u8077\u4f4d",
        latest_jobs_enable_message:
          "\u767b\u9304\u5f8c\u5c07\u986f\u793a\u5019\u9078\u4eba/\u96c7\u4e3b\u6240\u5728\u570b\u5bb6\u7684\u6700\u65b0\u8077\u4f4d",
        make_feature: "\u88fd\u4f5c\u529f\u80fd",
        make_featured: "\u6210\u4e3a\u7279\u8272",
        make_featured_job: "\u505a\u7279\u8272\u5de5\u4f5c",
        pay_to_get: "\u4ed8\u8cbb\u7372\u5f97",
        remove_featured: "\u522a\u9664\u7cbe\u9078",
      },
      functional_area: {
        edit_functional_area: "\u7f16\u8f91\u529f\u80fd\u533a",
        name: "\u540d\u79f0",
        new_functional_area: "\u65b0\u529f\u80fd\u533a",
        no_functional_area_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u529f\u80fd\u533a",
        no_functional_area_found: "\u672a\u627e\u5230\u529f\u80fd\u533a",
      },
      functional_areas: "\u529f\u80fd\u533a",
      general: "\u4e00\u822c",
      general_dashboard: "\u901a\u7528\u4eea\u8868\u76d8",
      general_settings: "\u5e38\u89c4\u8bbe\u7f6e",
      go_to_homepage: "\u53bb\u9996\u9875",
      header_slider: {
        edit_header_slider: "\u7f16\u8f91\u9875\u7709\u6ed1\u5757",
        header_slider: "\u6807\u9898\u6ed1\u5757",
        image_size_message:
          "\u56fe\u50cf\u5fc5\u987b\u662f1920 x 1080\u50cf\u7d20\u6216\u4ee5\u4e0a\u7684\u50cf\u7d20\u3002",
        image_title_text:
          "\u4e0a\u4f201920 x 1080\u50cf\u7d20\u6216\u4ee5\u4e0a\u50cf\u7d20\u7684\u56fe\u50cf\u4ee5\u83b7\u5f97\u6700\u4f73\u7684\u7528\u6237\u4f53\u9a8c\u3002",
        new_header_slider: "\u65b0\u6807\u9898\u6ed1\u5757",
        no_header_slider_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u6807\u9898\u6ed1\u5757",
      },
      header_sliders: "\u6807\u9898\u6ed1\u5757",
      image_slider: {
        action: "\u884c\u52d5",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_image_slider: "\u7de8\u8f2f\u5716\u50cf\u6ed1\u584a",
        image: "\u5716\u7247",
        image_extension_message:
          "\u5716\u7247\u5fc5\u9808\u662f\u4ee5\u4e0b\u985e\u578b\u7684\u6587\u4ef6\uff1apng\uff0cjpg\uff0cjpeg\u3002",
        image_size_message:
          "\u5716\u7247\u7684\u50cf\u7d20\u5fc5\u9808\u70ba1140 x 500\u6216\u66f4\u9ad8\u3002",
        image_slider: "\u56fe\u50cf\u6ed1\u5757",
        image_slider_details:
          "\u56fe\u50cf\u6ed1\u5757\u8be6\u7ec6\u4fe1\u606f",
        image_title_text:
          "\u4e0a\u50b31140 x 500\u50cf\u7d20\u6216\u66f4\u9ad8\u50cf\u7d20\u7684\u5716\u50cf\uff0c\u4ee5\u7372\u5f97\u6700\u4f73\u7684\u7528\u6236\u9ad4\u9a57\u3002",
        is_active: "\u72c0\u614b",
        message: "\u7981\u7528\u4e3b\u9801\u4f5c\u696d\u641c\u7d22",
        message_title:
          "\u5982\u679c\u7981\u7528\u6b64\u5207\u63db\uff0c\u5247\u9ed8\u8a8d\u641c\u7d22\u5c4f\u5e55\u5c07\u4e0d\u53ef\u898b\u3002",
        new_image_slider: "\u65b0\u5716\u50cf\u6ed1\u584a",
        no_image_slider_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u56fe\u50cf\u6ed1\u5757",
        no_image_slider_found: "\u672a\u627e\u5230\u56fe\u50cf\u6ed1\u5757",
        select_status: "\u9078\u64c7\u72c0\u614b",
        slider: "\u542f\u7528\u5168\u89d2\u6ed1\u5757\u3002",
        slider_active: "\u7981\u7528\u4e3b\u9875\u56fe\u50cf\u6ed1\u5757",
        slider_active_title:
          "\u5982\u679c\u7981\u7528\u6b64\u5207\u6362\uff0c\u5219\u9ed8\u8ba4\u56fe\u50cf\u6ed1\u5757\u5c4f\u5e55\u5c06\u4e0d\u53ef\u89c1\u3002",
        slider_title:
          "\u5982\u679c\u542f\u7528\u6b64\u5f00\u5173\uff0c\u5219\u56fe\u50cf\u6ed1\u5757\u4e3a\u5168\u5c4f\u5c4f\u5e55\u3002",
      },
      image_sliders: "\u5f71\u50cf\u6ed1\u584a",
      industries: "\u4ea7\u4e1a\u9886\u57df",
      industry: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_industry: "\u7f16\u8f91\u884c\u4e1a",
        industry_detail: "\u884c\u4e1a\u8be6\u60c5",
        name: "\u540d\u79f0",
        new_industry: "\u65b0\u4ea7\u4e1a",
        no_industry_available: "\u6ca1\u6709\u53ef\u7528\u7684\u884c\u4e1a",
        no_industry_found: "\u6ca1\u6709\u627e\u5230\u884c\u4e1a",
        size: "\u5c3a\u5bf8",
      },
      inquires: "\u8be2\u95ee",
      inquiry: {
        email: "\u7535\u5b50\u90ae\u4ef6",
        inquiry: "\u8be2\u95ee",
        inquiry_date: "\u54a8\u8be2\u65e5\u671f",
        inquiry_details: "\u67e5\u8be2\u5185\u5bb9",
        message: "\u4fe1\u606f",
        name: "\u540d\u79f0",
        no_inquiry_available: "\u6ca1\u6709\u53ef\u7528\u7684\u67e5\u8be2",
        no_inquiry_found: "\u672a\u627e\u5230\u67e5\u8be2",
        phone_no: "\u7535\u8bdd\u53f7\u7801",
        subject: "\u5b66\u79d1",
      },
      job: {
        add_note: "\u52a0\u6ce8",
        applies_job_not_found:
          "\u627e\u4e0d\u5230\u5e94\u7528\u7684\u5de5\u4f5c",
        career_level: "\u804c\u4e1a\u6c34\u5e73",
        city: "\u5e02",
        country: "\u56fd\u5bb6",
        created_at: "\u521b\u5efa\u4e8e",
        currency: "\u8d27\u5e01",
        degree_level: "\u5b66\u4f4d",
        description: "\u63cf\u8ff0",
        edit_job: "\u7f16\u8f91\u5de5\u4f5c",
        email_to_friend: "\u7535\u90ae\u7ed9\u670b\u53cb",
        expires_on: "\u5230\u671f",
        favourite_companies_not_found:
          "\u627e\u4e0d\u5230\u559c\u6b22\u7684\u516c\u53f8",
        favourite_company: "\u6700\u559c\u6b22\u7684\u516c\u53f8",
        favourite_job: "\u6700\u559c\u6b22\u7684\u5de5\u4f5c",
        favourite_job_not_found:
          "\u627e\u4e0d\u5230\u6700\u559c\u6b22\u7684\u5de5\u4f5c",
        following_company_not_found:
          "\u627e\u4e0d\u5230\u540e\u7eed\u516c\u53f8",
        friend_email: "\u670b\u53cb\u7535\u90ae",
        friend_name: "\u670b\u53cb\u59d3\u540d",
        functional_area: "\u529f\u80fd\u533a\u57df",
        hide_salary: "\u9690\u85cf\u85aa\u6c34",
        is_featured: "\u7cbe\u9009",
        is_freelance: "\u662f\u81ea\u7531\u804c\u4e1a\u8005",
        is_suspended: "\u6682\u505c",
        job: "\u5de5\u4f5c",
        job_alert: "\u5de5\u4f5c\u8b66\u5831",
        job_details: "\u804c\u4f4d\u8be6\u60c5",
        job_expiry_date: "\u4f5c\u4e1a\u5230\u671f\u65e5",
        job_shift: "\u8f6e\u73ed",
        job_skill: "\u5de5\u4f5c\u6280\u80fd",
        job_title: "\u804c\u79f0",
        job_type: "\u5de5\u4f5c\u7c7b\u578b",
        job_url: "\u5de5\u4f5c\u7f51\u5740",
        new_job: "\u65b0\u5de5\u4f5c",
        no_applied_job_found:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5e94\u7528\u4f5c\u4e1a",
        no_favourite_job_found:
          "\u6ca1\u6709\u6700\u559c\u6b22\u7684\u5de5\u4f5c",
        no_followers_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u8ffd\u968f\u8005",
        no_followers_found: "\u627e\u4e0d\u5230\u8ffd\u968f\u8005",
        no_following_companies_found:
          "\u4e0b\u5217\u516c\u53f8\u4e0d\u53ef\u7528",
        no_job_reported_available: "\u6ca1\u6709\u5de5\u4f5c\u62a5\u544a",
        no_preference: "\u6ca1\u6709\u504f\u597d",
        no_reported_job_found:
          "\u627e\u4e0d\u5230\u62a5\u544a\u7684\u5de5\u4f5c",
        notes: "\u7b14\u8bb0",
        please_enter_salary_range_to_greater_than_salary_range_from:
          "\u8bf7\u8f93\u5165\u85aa\u8d44\u8303\u56f4\u81f3\u5927\u4e8e\u85aa\u8d44\u8303\u56f4\u81ea\u3002",
        position: "\u4f4d\u7f6e",
        remove_favourite_jobs:
          "\u5220\u9664\u6700\u559c\u6b22\u7684\u5de5\u4f5c",
        reported_job: "\u62a5\u544a\u7684\u5de5\u4f5c",
        reported_jobs_detail: "\u62a5\u544a\u7684\u5de5\u4f5c\u660e\u7ec6",
        reported_user: "\u62a5\u544a\u7684\u7528\u6237",
        salary_from: "\u85aa\u6c34\u6765\u81ea",
        salary_period: "\u5de5\u8d44\u671f",
        salary_to: "\u85aa\u6c34\u81f3",
        state: "\u5dde",
        subscriber: "\u8ba2\u6237",
        view_notes: "\u67e5\u770b\u7b14\u8bb0",
      },
      job_application: {
        application_date: "\u7533\u8bf7\u65e5\u671f",
        candidate_name: "\u5019\u9009\u4eba\u540d\u5b57",
        job_application: "\u7533\u8bf7\u5de5\u4f5c",
      },
      job_applications: "\u5de5\u4f5c\u7533\u8bf7",
      job_categories: "\u5de5\u4f5c\u7c7b\u522b",
      job_category: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_job_category: "\u7f16\u8f91\u5de5\u4f5c\u7c7b\u522b",
        is_featured: "\u7cbe\u9009",
        job_category: "\u5de5\u4f5c\u7c7b\u522b",
        name: "\u540d\u79f0",
        new_job_category: "\u65b0\u5de5\u4f5c\u7c7b\u522b",
        no_job_category_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5de5\u4f5c\u7c7b\u522b",
        no_job_category_found: "\u627e\u4e0d\u5230\u804c\u4f4d\u7c7b\u522b",
        show_job_category: "\u804c\u4f4d\u7c7b\u522b\u8be6\u7ec6\u4fe1\u606f",
      },
      job_experience: {
        edit_job_experience: "\u7f16\u8f91\u5de5\u4f5c\u7ecf\u5386",
        is_active: "\u6d3b\u8dc3",
        is_default: "\u662f\u9ed8\u8ba4\u503c",
        job_experience: "\u5de5\u4f5c\u7ecf\u9a8c",
        language: "\u8bed\u8a00",
        new_job_experience: "\u65b0\u5de5\u4f5c\u7ecf\u9a8c",
      },
      job_experiences: "\u5de5\u4f5c\u7ecf\u9a8c",
      job_notification: {
        job_notifications: "\u5de5\u4f5c\u901a\u77e5",
        no_jobs_available: "\u65e0\u804c\u4f4d\u7a7a\u7f3a",
        select_all_jobs: "\u9009\u62e9\u6240\u6709\u5de5\u4f5c",
      },
      job_shift: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_job_shift: "\u7f16\u8f91\u5de5\u4f5c\u73ed\u6b21",
        job_shift_detail: "\u8f6e\u73ed\u7ec6\u8282",
        new_job_shift: "\u65b0\u5de5\u4f5c\u8f6c\u79fb",
        no_job_shifts_available: "\u6ca1\u6709\u5de5\u4f5c\u8f6c\u79fb",
        no_job_shifts_found: "\u627e\u4e0d\u5230\u5de5\u4f5c\u8f6c\u79fb",
        shift: "\u8f6c\u79fb",
        show_job_shift: "\u8f6e\u73ed",
        size: "\u5c3a\u5bf8",
      },
      job_shifts: "\u8f6e\u73ed",
      job_skill: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_job_skill: "\u7f16\u8f91\u5de5\u4f5c\u6280\u80fd",
        name: "\u540d\u79f0",
        new_job_skill: "\u65b0\u5de5\u4f5c\u6280\u80fd",
        show_job_skill: "\u5de5\u4f5c\u6280\u80fd",
      },
      job_skills: "\u5de5\u4f5c\u6280\u5de7",
      job_stage: {
        add_slot: "\u6dfb\u52a0\u63d2\u69fd",
        add_slots: "\u6dfb\u52a0\u63d2\u69fd",
        batch: "\u6279\u6b21",
        cancel_slot: "\u53d6\u6d88\u69fd",
        cancel_this_slot: "\u53d6\u6d88\u8fd9\u4e2a\u69fd",
        cancel_your_selected_slot:
          "\u53d6\u6d88\u60a8\u9009\u62e9\u7684\u4f4d\u7f6e",
        candidate_note: "\u8003\u751f\u6ce8\u610f\u4e8b\u9805",
        choose_slots: "\u9009\u62e9\u63d2\u69fd",
        date: "\u65e5\u671f",
        edit_job_stage: "\u7f16\u8f91\u4f5c\u4e1a\u9636\u6bb5",
        edit_slot: "\u7de8\u8f2f\u69fd",
        history: "\u5386\u53f2",
        job_stage: "\u5de5\u4f5c\u9636\u6bb5",
        job_stage_detail: "\u5de5\u4f5c\u9636\u6bb5\u8be6\u7ec6\u4fe1\u606f",
        new_job_stage: "\u65b0\u5de5\u4f5c\u9636\u6bb5",
        new_slot_send: "\u65b0\u63d2\u69fd\u53d1\u9001",
        no_job_stage_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5de5\u4f5c\u9636\u6bb5",
        no_job_stage_found: "\u6ca1\u6709\u627e\u5230\u5de5\u4f5c\u9636\u6bb5",
        no_slot_available: "\u6ca1\u6709\u53ef\u7528\u7684\u63d2\u69fd",
        reject_all_slot: "\u62d2\u7edd\u6240\u6709\u63d2\u69fd",
        rejected_all_slots: "\u62d2\u7edd\u6240\u6709\u63d2\u69fd",
        send_slot: "\u767c\u9001\u69fd",
        send_slots: "\u53d1\u9001\u63d2\u69fd",
        slot: "\u6295\u5e63\u53e3",
        slot_preference: "\u63d2\u69fd\u504f\u597d",
        slots: "slots",
        time: "\u65f6\u95f4",
        you_cancel_this_slot: "\u60a8\u53d6\u6d88\u8fd9\u4e2a\u69fd",
        you_have_rejected_all_slot:
          "\u60a8\u5df2\u62d2\u7edd\u6240\u6709\u63d2\u69fd",
        you_have_selected_this_slot:
          "\u60a8\u9009\u62e9\u4e86\u8fd9\u4e2a\u63d2\u69fd",
        your_note: "\u4f60\u7684\u7b46\u8a18",
      },
      job_stages: "\u5de5\u4f5c\u9636\u6bb5",
      job_tag: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_job_tag: "\u7f16\u8f91\u5de5\u4f5c\u6807\u7b7e",
        job_tag: "\u5de5\u4f5c\u6a19\u7c64",
        job_tag_detail: "\u804c\u4f4d\u6807\u7b7e\u8be6\u7ec6\u4fe1\u606f",
        name: "\u540d\u79f0",
        new_job_tag: "\u65b0\u5de5\u4f5c\u6807\u7b7e",
        no_job_tag_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5de5\u4f5c\u6807\u7b7e",
        no_job_tag_found: "\u627e\u4e0d\u5230\u5de5\u4f5c\u6807\u7b7e",
        show_job_tag: "\u5de5\u4f5c\u6807\u7b7e",
        size: "\u5c3a\u5bf8",
      },
      job_tags: "\u5de5\u4f5c\u6807\u7b7e",
      job_type: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_job_type: "\u7f16\u8f91\u5de5\u4f5c\u7c7b\u578b",
        job_type: "\u5de5\u4f5c\u7c7b\u578b",
        job_type_detail: "\u5de5\u4f5c\u7c7b\u578b\u8be6\u7ec6\u4fe1\u606f",
        name: "\u540d\u79f0",
        new_job_type: "\u65b0\u5de5\u4f5c\u7c7b\u578b",
        no_job_type_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5de5\u4f5c\u7c7b\u578b",
        no_job_type_found: "\u627e\u4e0d\u5230\u5de5\u4f5c\u7c7b\u578b",
        show_job_type: "\u5de5\u4f5c\u7c7b\u578b",
      },
      job_types: "\u5de5\u4f5c\u7c7b\u578b",
      jobs: "\u5de5\u4f5c",
      language: {
        edit_language: "\u7f16\u8f91\u8bed\u8a00",
        is_active: "\u6d3b\u8dc3",
        is_default: "\u662f\u9ed8\u8ba4\u503c",
        is_rtl: "Is RTL",
        iso_code: "ISO Code",
        language: "\u8bed\u8a00",
        native: "\u672c\u673a",
        new_language: "\u65b0\u8bed\u8a00",
        no_language_available: "\u65e0\u53ef\u7528\u8bed\u8a00",
        no_language_found: "\u627e\u4e0d\u5230\u8bed\u8a00",
      },
      languages: "\u8bed\u8a00\u80fd\u529b",
      marital_status: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_marital_status: "\u7f16\u8f91\u5a5a\u59fb\u72b6\u51b5",
        marital_status: "\u5a5a\u59fb\u72b6\u51b5",
        marital_status_detail:
          "\u5a5a\u59fb\u72b6\u51b5\u8be6\u7ec6\u4fe1\u606f",
        new_marital_status: "\u65b0\u5a5a\u72b6\u51b5",
        no_marital_status_available: "\u6ca1\u6709\u5a5a\u59fb\u72b6\u51b5",
        no_marital_status_found: "\u627e\u4e0d\u5230\u5a5a\u59fb\u72b6\u51b5",
        show_marital_status: "\u5a5a\u59fb\u72b6\u51b5",
      },
      marital_statuses: "\u5a5a\u59fb\u72b6\u51b5",
      months: {
        apr: "\u56db\u6708",
        aug: "\u4e5d\u6708",
        dec: "\u592a\u9633",
        feb: "\u4e8c\u6708",
        jan: "\u7b80",
        jul: "\u516b\u6708",
        jun: "\u541b",
        mar: "\u4e09\u6708",
        may: "\u53ef\u80fd",
        nov: "\u5341\u4e8c\u6708",
        oct: "\u5341\u4e00\u6708",
        sep: "\u5341\u6708",
      },
      no_skills: "\u6ca1\u6709\u6280\u80fd",
      no_subscriber_available:
        "\u6ca1\u6709\u53ef\u7528\u7684\u8ba2\u9605\u8005",
      no_subscriber_found: "\u627e\u4e0d\u5230\u8ba2\u9605\u8005",
      noticeboard: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_noticeboard: "\u7f16\u8f91\u5e03\u544a\u680f",
        is_active: "\u6d3b\u8dc3",
        new_noticeboard: "\u65b0\u5e03\u544a\u680f",
        no_noticeboard_available: "\u6ca1\u6709\u516c\u544a\u677f\u53ef\u7528",
        no_noticeboard_found: "\u672a\u627e\u5230\u516c\u544a\u677f",
        noticeboard: "\u516c\u544a\u680f",
        noticeboard_detail: "\u516c\u544a\u680f\u8be6\u7ec6\u4fe1\u606f",
        title: "\u6807\u9898",
      },
      noticeboards: "\u5e03\u544a\u680f",
      notification: {
        company: "\u516c\u53f8",
        company_marked_featured:
          "\u88ab\u6807\u8bb0\u4e3a\u7279\u8272\u7684\u516c\u53f8",
        empty_notifications:
          "\u6211\u4eec\u627e\u4e0d\u5230\u4efb\u4f55\u901a\u77e5",
        job_application_rejected_message:
          "\u60a8\u7684\u7533\u8bf7\u88ab\u62d2\u7edd",
        job_application_select_message: "\u60a8\u88ab\u9009\u4e3a",
        job_application_shortlist_message:
          "\u60a8\u7684\u5e94\u7528\u7a0b\u5e8f\u5df2\u5217\u5165",
        job_application_submitted: "\u63d0\u4ea4\u7684\u5de5\u4f5c\u7533\u8bf7",
        mark_all_as_read: "\u6807\u8bb0\u4e3a\u5df2\u8bfb",
        marked_as_featured: "\u6807\u8bb0\u4e3a\u7cbe\u9009",
        new_candidate_registered: "\u65b0\u5019\u9009\u4eba\u6ce8\u518c",
        new_employer_registered: "\u65b0\u96c7\u4e3b\u6ce8\u518c",
        notifications: "\u901a\u77e5\u4e8b\u9879",
        purchase: "\u91c7\u8d2d",
        read_notification: "\u901a\u77e5\u8bfb\u53d6\u6210\u529f",
        started_following: "\u5f00\u59cb\u4e8e",
        started_following_you: "\u5f00\u59cb\u5173\u6ce8\u60a8\u3002",
      },
      notification_settings: {
        CANDIDATE_REJECTED_FOR_JOB:
          "\u5f53\u5019\u9009\u4eba\u62d2\u7edd\u5de5\u4f5c\u65f6",
        CANDIDATE_SELECTED_FOR_JOB:
          "\u5f53\u5019\u9009\u4eba\u88ab\u9009\u4e3a\u5de5\u4f5c\u65f6",
        CANDIDATE_SHORTLISTED_FOR_JOB:
          "\u5f53\u5019\u9009\u4eba\u5165\u56f4\u5de5\u4f5c\u65f6",
        EMPLOYER_PURCHASE_PLAN:
          "\u5f53\u96c7\u4e3b\u8d2d\u4e70\u8ba2\u9605\u8ba1\u5212\u65f6",
        FOLLOW_COMPANY:
          "\u5f53\u5019\u9009\u4eba\u5f00\u59cb\u5173\u6ce8\u516c\u53f8\u65f6",
        FOLLOW_JOB:
          "\u5f53\u5019\u9009\u4eba\u5f00\u59cb\u5173\u6ce8\u4e54\u5e03\u65af\u65f6",
        JOB_ALERT: "\u5f53\u96c7\u4e3b\u521b\u9020\u5de5\u4f5c",
        JOB_APPLICATION_SUBMITTED:
          "\u63d0\u4ea4\u65b0\u7684\u6c42\u804c\u7533\u8bf7\u65f6",
        MARK_COMPANY_FEATURED:
          "\u5c06\u516c\u53f8\u6807\u8bb0\u4e3a\u7cbe\u9009\u516c\u53f8\u65f6",
        MARK_COMPANY_FEATURED_ADMIN:
          "\u7576\u96c7\u4e3b\u5c07\u5de5\u4f5c\u6a19\u8a18\u70ba\u7cbe\u9078\u6642",
        MARK_JOB_FEATURED:
          "\u5c06\u5de5\u4f5c\u6807\u8bb0\u4e3a\u7cbe\u9009\u65f6",
        MARK_JOB_FEATURED_ADMIN:
          "\u7576\u96c7\u4e3b\u5c07\u5de5\u4f5c\u6a19\u8a18\u70ba\u7cbe\u9078\u6642",
        NEW_CANDIDATE_REGISTERED:
          "\u5f53\u65b0\u5019\u9009\u4eba\u6ce8\u518c\u65f6",
        NEW_EMPLOYER_REGISTERED: "\u5f53\u65b0\u96c7\u4e3b\u6ce8\u518c\u65f6",
        admin: "\u884c\u653f",
        blog_category: "\u535a\u5ba2\u7c7b\u522b",
        candidate: "\u5019\u9009\u4eba",
        employer: "\u96c7\u5458",
      },
      ownership_type: {
        edit_ownership_type: "\u7f16\u8f91\u6240\u6709\u6743\u7c7b\u578b",
        new_ownership_type: "\u65b0\u6240\u6709\u6743\u7c7b\u578b",
        no_ownership_type_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u6240\u6709\u6743\u7c7b\u578b",
        no_ownership_type_found:
          "\u672a\u627e\u5230\u6240\u6709\u6743\u7c7b\u578b",
        ownership_type: "\u6240\u6709\u6b0a\u985e\u578b",
        ownership_type_detail:
          "\u6240\u6709\u6743\u7c7b\u578b\u8be6\u7ec6\u4fe1\u606f",
      },
      ownership_types: "\u6240\u6709\u6743\u7c7b\u578b",
      phone: {
        invalid_country_code: "\u570b\u5bb6\u4ee3\u78bc\u7121\u6548",
        invalid_number: "\u7121\u6548\u865f\u78bc",
        too_long: "\u592a\u9577",
        too_short: "\u592a\u77ed",
        valid_number: "\u6709\u6548\u865f\u78bc",
      },
      plan: {
        active_subscription: "\u6d3b\u8e8d\u8a02\u95b1",
        allowed_jobs: "\u5141\u8a31\u7684\u5de5\u4f5c",
        amount: "\u91cf",
        cancel_reason: "\u53d6\u6d88\u539f\u56e0",
        cancel_subscription: "\u53d6\u6d88\u8ba2\u9605",
        currency: "\u8d27\u5e01",
        current_plan: "\u5f53\u524d\u8ba1\u5212",
        edit_plan: "\u4fee\u6539\u8a08\u5283",
        edit_subscription_plan: "\u7de8\u8f2f\u8a02\u95b1\u8a08\u5283",
        ends_at: "\u7ed3\u675f\u4e8e",
        is_trial_plan: "\u662f\u8a66\u7528\u8a08\u5283",
        job_allowed: "\u5141\u8bb8\u5de5\u4f5c",
        job_used: "\u4f5c\u696d\u4f7f\u7528",
        jobs_allowed: "\u5141\u8bb8\u7684\u5de5\u4f5c",
        jobs_used: "\u4f7f\u7528\u7684\u5de5\u4f5c",
        new_plan: "\u6dfb\u52a0\u8a08\u5283",
        new_subscription_plan: "\u65b0\u7684\u8a02\u95b1\u8a08\u5283",
        pay_with_manually: "\u624b\u52a8\u4ed8\u6b3e",
        pay_with_paypal: "\u4f7f\u7528\u8d1d\u5b9d\u4ed8\u6b3e",
        pay_with_stripe: "\u7528\u6761\u7eb9\u652f\u4ed8",
        per_month: "\u6bcf\u6708",
        plan: "\u8ba1\u5212",
        plan_amount_cannot_be_changes:
          "\u6ce8\u610f\uff1a-\u8ba1\u5212\u91d1\u989d\u65e0\u6cd5\u66f4\u6539",
        pricing: "\u8ba2\u9605\u5df2\u53d6\u6d88",
        processing: "\u52a0\u5de5",
        purchase: "\u91c7\u8d2d",
        renews_on: "\u7eed\u7ea6",
        subscription_cancelled: "\u8ba2\u9605\u5df2\u53d6\u6d88",
        subscriptions: "\u8a02\u95b1",
      },
      plans: "\u8ba1\u5212",
      position: {
        edit_position: "\u7f16\u8f91\u4f4d\u7f6e",
        new_position: "\u65b0\u7684\u4f4d\u7f6e",
        position: "\u4f4d\u7f6e",
      },
      positions: "\u804c\u4f4d",
      post: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        blog: "\u535a\u5ba2",
        comment: "\u8bc4\u8bba",
        comments: "\u6ce8\u91ca",
        description: "\u63cf\u8ff0",
        edit_post: "\u7f16\u8f91\u5e16\u5b50",
        image: "\u56fe\u7247",
        new_post: "\u6700\u65b0\u5e16\u5b50",
        no_posts_available: "\u6ca1\u6709\u53ef\u7528\u7684\u5e16\u5b50",
        no_posts_found: "\u627e\u4e0d\u5230\u5e16\u5b50",
        post: "\u53d1\u5e03",
        post_a_comments: "\u53d1\u8868\u8bc4\u8bba",
        post_details: "\u5e16\u5b50\u8be6\u7ec6\u4fe1\u606f",
        posts: "\u5e16\u5b50",
        select_post_categories: "\u9009\u62e9\u5e16\u5b50\u7c7b\u522b",
        show_post: "\u53d1\u5e03",
        title: "\u6807\u9898",
      },
      post_category: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_post_category: "\u7f16\u8f91\u5e16\u5b50\u7c7b\u522b",
        name: "\u540d\u79f0",
        new_post_category: "\u65b0\u804c\u4f4d\u7c7b\u522b",
        no_post_category_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5e16\u5b50\u7c7b\u522b",
        no_post_category_found: "\u672a\u627e\u5230\u5e16\u5b50\u7c7b\u522b",
        post_categories: "\u5e16\u5b50\u7c7b\u522b",
        post_category: "\u5e16\u5b50\u7c7b\u522b",
        post_category_detail:
          "\u5e16\u5b50\u7c7b\u522b\u8be6\u7ec6\u4fe1\u606f",
        show_post_category: "\u5e16\u5b50\u7c7b\u522b",
      },
      post_comment: {
        post_comment: "\u53d1\u8868\u8bc4\u8bba",
        post_comment_details: "\u53d1\u8868\u8bc4\u8bba\u8be6\u60c5",
      },
      post_comments: "\u53d1\u8868\u8bc4\u8bba",
      pricing_table: { get_started: "\u958b\u59cb" },
      pricings_table: "\u5b9a\u50f9\u8868",
      professional_skills: "\u4e13\u4e1a\u6280\u80fd",
      profile: "\u4e2a\u4eba\u8d44\u6599",
      recent_blog: "\u6700\u8fd1\u7684\u535a\u5ba2",
      reported_jobs: "\u62a5\u544a\u7684\u5de5\u4f5c",
      required_degree_level: {
        edit_required_degree_level: "\u7f16\u8f91\u5b66\u4f4d\u7b49\u7ea7",
        name: "\u540d\u79f0",
        new_required_degree_level: "\u65b0\u5b66\u4f4d\u7b49\u7ea7",
        no_degree_level_available:
          "\u6ca1\u6709\u5b66\u4f4d\u7ea7\u522b\u53ef\u7528",
        no_degree_level_found: "\u672a\u627e\u5230\u5b66\u4f4d\u7ea7\u522b",
        show_required_degree_level: "\u5b66\u4f4d",
      },
      required_degree_levels: "\u5b66\u4f4d\u7b49\u7ea7",
      resumes: {
        candidate_name: "\u5019\u9009\u4eba\u540d\u5b57",
        file: "\u6587\u4ef6",
        name: "\u540d\u79f0",
        no_resume_available: "\u6ca1\u6709\u53ef\u7528\u7684\u7b80\u5386",
        no_resume_found: "\u627e\u4e0d\u5230\u7b80\u5386",
        resume_name: "\u6587\u4ef6\u540d",
      },
      salary_currencies: "\u5de5\u8d44\u8d27\u5e01",
      salary_currency: {
        currency_code: "\u8d27\u5e01\u4ee3\u7801",
        currency_icon: "\u8ca8\u5e63\u5716\u6a19",
        currency_name: "\u8d27\u5e01\u540d\u79f0",
        edit_salary_currency: "\u66f4\u6539\u85aa\u6c34\u5e01\u79cd",
        new_salary_currency: "\u65b0\u85aa\u6c34\u8d27\u5e01",
        no_salary_currency_available:
          "\u6ca1\u6709\u53ef\u7528\u7684\u5de5\u8d44\u8d27\u5e01",
        no_salary_currency_found:
          "\u6ca1\u6709\u627e\u5230\u5de5\u8d44\u8d27\u5e01",
      },
      salary_period: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_salary_period: "\u7f16\u8f91\u5de5\u8d44\u671f",
        new_salary_period: "\u65b0\u5de5\u8d44\u671f",
        no_salary_period_available: "\u65e0\u85aa\u8d44\u671f",
        no_salary_period_found: "\u627e\u4e0d\u5230\u5de5\u8d44\u671f",
        period: "\u5de5\u8d44\u671f",
        salary_period_detail: "\u5de5\u8d44\u671f\u660e\u7ec6",
        size: "\u5c3a\u5bf8",
      },
      salary_periods: "\u5de5\u8d44\u671f",
      see_all_plans: "\u67e5\u770b\u6240\u6709\u8ba1\u5212",
      selected_candidate: "\u9009\u5b9a\u7684\u5019\u9009\u4eba",
      setting: {
        about_us: "\u5173\u4e8e\u6211\u4eec",
        address: "\u5730\u5740",
        application_name: "\u5e94\u7528\u540d\u79f0",
        choose: "\u9009\u62e9",
        company_description: "\u516c\u53f8\u4ecb\u7ecd",
        company_url: "\u516c\u53f8\u7db2\u5740",
        configuration_update: "\u914d\u7f6e\u66f4\u65b0",
        cookie: "\u66f2\u5947\u997c",
        disable_cookie: "\u7981\u7528Cookie",
        disable_edit: "\u7981\u7528\u7f16\u8f91",
        email: "\u7535\u5b50\u90ae\u4ef6",
        enable_cookie: "\u542f\u7528Cookie",
        enable_edit: "\u542f\u7528\u7f16\u8f91",
        enable_google_recaptcha:
          "\u4e3a\u96c7\u4e3b\u3001\u5019\u9009\u4eba\u6ce8\u518c\u548c\u8054\u7cfb\u6211\u4eec\u5c4f\u5e55\u542f\u7528 Google reCAPTCHA\u3002",
        facebook: "Facebook",
        facebook_app_id: "Facebook\u5e94\u7528\u7a0b\u5e8fID",
        facebook_app_secret: "Facebook App Secret",
        facebook_redirect: "Facebook\u91cd\u5b9a\u5411",
        facebook_url: "\u81c9\u66f8\u7db2\u5740",
        favicon: "\u7f51\u7ad9\u56fe\u6807",
        front_settings: "\u6b63\u9762\u8bbe\u7f6e",
        general: "\u4e00\u822c",
        google: "Google",
        google_client_id: "Google\u5ba2\u6237ID",
        google_client_secret: "Google Client Secret",
        google_plus_url: "\u8c37\u6b4c\u52a0\u7db2\u5740",
        google_redirect: "Google\u91cd\u5b9a\u5411",
        image_validation:
          "\u5716\u50cf\u5fc5\u9808\u70ba 90 x 60 \u50cf\u7d20\u3002",
        linkedin: "LinkedIn",
        linkedin_client_id: "LinkedIn Id",
        linkedin_client_secret: "LinkedIn\u5ba2\u6237\u7aef\u673a\u5bc6",
        linkedin_url: "\u9818\u82f1\u7db2\u5740",
        logo: "\u5546\u6807",
        mail: "\u90ae\u4ef6",
        mail__from_address: "\u90ae\u4ef6\u53d1\u4ef6\u4eba\u5730\u5740",
        mail_host: "\u90ae\u4ef6\u4e3b\u673a",
        mail_mailer: "\u90ae\u4ef6\u90ae\u4ef6\u7a0b\u5e8f",
        mail_password: "\u90ae\u4ef6\u5bc6\u7801",
        mail_port: "\u90ae\u4ef6\u7aef\u53e3",
        mail_username: "\u90ae\u4ef6\u7528\u6237\u540d",
        notification_settings: "\u901a\u77e5\u8bbe\u7f6e",
        paypal: "Paypal",
        paypal_client_id: "Paypal\u5ba2\u6237ID",
        paypal_secret: "Paypal\u673a\u5bc6",
        phone: "\u7535\u8bdd",
        privacy_policy: "\u9690\u79c1\u653f\u7b56",
        pusher: "Pusher",
        pusher_app_cluster: "\u63a8\u9001\u5e94\u7528\u7a0b\u5e8f\u96c6\u7fa4",
        pusher_app_id: "\u63a8\u9001\u5e94\u7528\u7a0b\u5e8fID",
        pusher_app_key: "\u63a8\u9001\u5e94\u7528\u7a0b\u5e8f\u5bc6\u94a5",
        pusher_app_secret: "Pusher App Secret",
        social_settings: "\u793e\u4f1a\u73af\u5883",
        stripe: "\u6761\u5e26",
        stripe_key: "Stripe\u952e",
        stripe_secret_key: "\u6761\u7eb9\u79d8\u5bc6\u5bc6\u94a5",
        stripe_webhook_key: "\u6761\u7eb9Webhook\u5bc6\u94a5",
        terms_conditions: "\u6761\u6b3e\u548c\u6761\u4ef6",
        twitter_url: "\u63a8\u7279\u7db2\u5740",
        update_application_configuration:
          "\u60a8\u5373\u5c06\u66f4\u65b0\u5e94\u7528\u7a0b\u5e8f\u914d\u7f6e\u503c\uff0c\u8981\u7ee7\u7eed\u5417\uff1f",
      },
      settings: "\u8bbe\u5b9a\u503c",
      skill: {
        action: "\u884c\u52a8",
        add: "\u52a0",
        description: "\u63cf\u8ff0",
        edit_skill: "\u7f16\u8f91\u6280\u80fd",
        name: "\u540d\u79f0",
        new_skill: "\u65b0\u6280\u80fd",
        no_skill_available: "\u6ca1\u6709\u53ef\u7528\u7684\u6280\u80fd",
        no_skill_found: "\u627e\u4e0d\u5230\u6280\u80fd",
        show_skill: "\u6280\u80fd",
        skill_detail: "\u6280\u80fd\u7ec6\u8282",
      },
      skills: "\u6280\u80fd\u4e13\u957f",
      social_media: "\u793e\u4ea4\u5a92\u4f53",
      social_settings: "\u793e\u4f1a\u73af\u5883",
      state: {
        country_name: "\u4ee5\u56fd\u5bb6\u7684\u540d\u4e49",
        edit_state: "\u7f16\u8f91\u72b6\u6001",
        new_state: "\u65b0\u5dde",
        no_state_available: "\u6ca1\u6709\u53ef\u7528\u72b6\u6001",
        no_state_found: "\u627e\u4e0d\u5230\u72b6\u6001",
        state_name: "\u5dde\u540d",
        states: "\u72b6\u6001",
      },
      subscribers: "\u8ba2\u6237",
      subscriptions_plans: "\u8a02\u95b1\u8a08\u5283",
      testimonial: {
        customer_image: "\u5ba2\u6237\u5f62\u8c61",
        customer_name: "\u987e\u5ba2\u59d3\u540d",
        description: "\u63cf\u8ff0",
        edit_testimonial: "\u7f16\u8f91\u63a8\u8350\u4e66",
        new_testimonial: "\u65b0\u63a8\u8350\u4e66",
        no_testimonial_available: "\u6ca1\u6709\u53ef\u7528\u7684\u63a8\u8350",
        no_testimonial_found: "\u6ca1\u6709\u627e\u5230\u63a8\u8350\u4e66",
        testimonial: "\u611f\u8a00",
        testimonial_detail: "\u8bc1\u660e\u8be6\u60c5",
        testimonials: "\u611f\u8a00",
      },
      testimonials: "\u611f\u8a00",
      tooltip: {
        change_app_logo: "\u66f4\u6539\u61c9\u7528\u7a0b\u5e8f\u5fbd\u6a19",
        change_favicon: "\u66f4\u6539\u7f51\u7ad9\u56fe\u6807",
        change_home_banner: "\u66f4\u6539\u9996\u9801\u6a6b\u5e45",
        change_image: "\u66f4\u6539\u5716\u50cf",
        change_profile: "\u66f4\u6539\u914d\u7f6e\u6587\u4ef6",
        copy_preview_link: "\u8907\u88fd\u9810\u89bd\u93c8\u63a5",
      },
      transaction: {
        approved: "\u5f97\u5230\u6b63\u5f0f\u8a8d\u53ef\u7684",
        denied: "\u62d2\u7d55",
        invoice: "\u53d1\u7968",
        payment_approved: "\u652f\u4ed8\u72c0\u614b",
        plan_name: "\u8ba1\u5212\u540d\u79f0",
        select_manual_payment: "\u9078\u64c7\u4eba\u5de5\u4ed8\u6b3e",
        subscription_id: "\u8ba2\u9605\u7f16\u53f7",
        transaction_date: "\u4ea4\u6613\u65e5\u671f",
        type: "\u7c7b\u578b",
        user_name: "\u96c7\u4e3b\u540d\u7a31",
      },
      transactions: "\u4ea4\u6613\u6b21\u6570",
      translation_manager: "\u7ffb\u8bd1\u7ecf\u7406",
      user: {
        change_password: "\u66f4\u6539\u5bc6\u7801",
        edit_profile: "\u7f16\u8f91\u4e2a\u4eba\u8d44\u6599",
        email: "\u7535\u5b50\u90ae\u4ef6",
        first_name: "\u540d\u5b57",
        last_name: "\u59d3",
        logout: "\u767b\u51fa",
        name: "\u540d\u79f0",
        password: "\u5bc6\u7801",
        password_confirmation: "\u786e\u8ba4\u5bc6\u7801",
        phone: "\u7535\u8bdd",
        required_field_messages:
          "\u8bf7\u586b\u5199\u6240\u6709\u5fc5\u586b\u5b57\u6bb5\u3002",
        user_name: "\u7528\u6237\u540d",
      },
      user_language: {
        change_language: "\u6539\u53d8\u8bed\u8a00",
        language: "\u8bed\u8a00",
      },
      weekdays: {
        fri: "\u5468\u4e94",
        mon: "\u661f\u671f\u4e00",
        sat: "\u661f\u671f\u516d",
        sun: "\u592a\u9633",
        thu: "\u5468\u56db",
        tue: "\u5468\u4e8c",
        wed: "\u661f\u671f\u4e09",
      },
      your_cv: "\u60a8\u7684\u7b80\u5386",
    },
    "zh.pagination": {
      next: "\u4e0b\u4e00\u4e2a &raquo;",
      previous: "&laquo; \u4ee5\u524d",
    },
    "zh.validation": {
      accepted: "\u7684 :attribute \u5fc5\u987b\u88ab\u63a5\u53d7.",
      active_url:
        "\u7684 :attribute \u4e0d\u662f\u6709\u6548\u7684\u7f51\u5740\u3002",
      after:
        "\u7684 :attribute \u5fc5\u987b\u662f\u4e4b\u540e\u7684\u65e5\u671f :date.",
      after_or_equal:
        "\u7684 :attribute \u5fc5\u987b\u662f\u7b49\u4e8e\u6216\u5c0f\u4e8e\u7b49\u4e8e\u7684\u65e5\u671f :date.",
      alpha: "\u7684 :attribute \u53ea\u80fd\u5305\u542b\u5b57\u6bcd.",
      alpha_dash:
        "\u7684 :attribute \u53ea\u80fd\u5305\u542b\u5b57\u6bcd\uff0c\u6570\u5b57\uff0c\u7834\u6298\u53f7\u548c\u4e0b\u5212\u7ebf\u3002",
      alpha_num:
        "\u7684 :attribute \u53ea\u80fd\u5305\u542b\u5b57\u6bcd\u548c\u6570\u5b57.",
      array: "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u6570\u7ec4.",
      attributes: [],
      before:
        "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u65e5\u671f\u4e4b\u524d :date.",
      before_or_equal:
        "\u7684 :attribute \u5fc5\u987b\u662f\u65e9\u4e8e\u6216\u7b49\u4e8e\u7684\u65e5\u671f :date.",
      between: {
        array:
          "\u7684 :attribute \u5fc5\u987b\u4ecb\u4e8e :min \u548c :max \u9879\u76ee.",
        file: "\u7684 :attribute \u5fc5\u987b\u4ecb\u4e8e :min \u548c :max \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u5fc5\u987b\u4ecb\u4e8e :min \u548c :max.",
        string:
          "\u7684 :attribute \u5fc5\u987b\u4ecb\u4e8e :min \u548c :max \u4eba\u7269.",
      },
      boolean:
        "\u7684 :attribute \u5b57\u6bb5\u5fc5\u987b\u4e3atrue\u6216false\u3002.",
      confirmed: "\u7684 :attribute \u786e\u8ba4\u4e0d\u7b26.",
      custom: { "attribute-name": { "rule-name": "custom-message" } },
      date: "\u7684 :attribute \u4e0d\u662f\u6709\u6548\u65e5\u671f.",
      date_equals:
        "\u7684 :attribute \u65e5\u671f\u5fc5\u987b\u7b49\u4e8e :date.",
      date_format: "\u7684 :attribute \u4e0e\u683c\u5f0f\u4e0d\u7b26 :format.",
      different: "\u7684 :attribute \u548c :other \u5fc5\u987b\u4e0d\u540c.",
      digits: "\u7684 :attribute \u4e00\u5b9a\u662f :digits \u6570\u5b57.",
      digits_between:
        "\u7684 :attribute \u5fc5\u987b\u4ecb\u4e8e :min \u548c :max \u6570\u5b57.",
      dimensions: "\u7684 :attribute \u56fe\u7247\u5c3a\u5bf8\u65e0\u6548.",
      distinct: "\u7684 :attribute \u5b57\u6bb5\u5177\u6709\u91cd\u590d\u503c.",
      email:
        "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u6709\u6548\u7684E-mail\u5730\u5740.",
      ends_with:
        "\u7684 :attribute \u5fc5\u987b\u4ee5\u4ee5\u4e0b\u4efb\u4e00\u7ed3\u5c3e: :values.",
      exists: "\u7684 \u5df2\u9009 :attribute \u662f\u65e0\u6548\u7684.",
      file: "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u6587\u4ef6.",
      filled:
        "\u7684 :attribute \u5b57\u6bb5\u5fc5\u987b\u6709\u4e00\u4e2a\u503c.",
      gt: {
        array:
          "\u7684 :attribute \u5fc5\u987b\u8d85\u8fc7 :value \u9879\u76ee.",
        file: "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e :value \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e :value.",
        string:
          "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e :value \u4eba\u7269.",
      },
      gte: {
        array:
          "\u7684 :attribute \u4e00\u5b9a\u6709 :value \u9879\u4ee5\u4e0a.",
        file: "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e\u6216\u7b49\u4e8e :value \u5343\u5b57\u8282.",
        numeric:
          "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e\u6216\u7b49\u4e8e :value.",
        string:
          "\u7684 :attribute \u5fc5\u987b\u5927\u4e8e\u6216\u7b49\u4e8e :value \u4eba\u7269.",
      },
      image: "\u7684 :attribute \u5fc5\u987b\u662f\u56fe\u50cf.",
      in: "\u7684 \u5df2\u9009 :attribute \u662f\u65e0\u6548\u7684.",
      in_array:
        "\u7684 :attribute \u5b57\u6bb5\u4e0d\u5b58\u5728\u4e8e :other.",
      integer: "\u7684 :attribute \u5fc5\u987b\u662f\u6574\u6570.",
      ip: "\u7684 :attribute \u5fc5\u987b\u662f\u6709\u6548\u7684IP\u5730\u5740.",
      ipv4: "\u7684 :attribute \u5fc5\u987b\u662f\u6709\u6548\u7684IPv4\u5730\u5740.",
      ipv6: "\u7684 :attribute \u5fc5\u987b\u662f\u6709\u6548\u7684IPv6\u5730\u5740.",
      json: "v :attribute \u5fc5\u987b\u662f\u6709\u6548\u7684JSON\u5b57\u7b26\u4e32.",
      lt: {
        array:
          "\u7684 :attribute \u5fc5\u987b\u5c11\u4e8e :value \u9879\u76ee.",
        file: "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e :value \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e :value.",
        string:
          "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e :value \u4eba\u7269.",
      },
      lte: {
        array:
          "\u7684 :attribute \u4e0d\u5f97\u8d85\u8fc7 :value \u9879\u76ee.",
        file: "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e\u6216\u7b49\u4e8e :value \u5343\u5b57\u8282.",
        numeric:
          "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e\u6216\u7b49\u4e8e :value.",
        string:
          "\u7684 :attribute \u5fc5\u987b\u5c0f\u4e8e\u6216\u7b49\u4e8e :value \u4eba\u7269.",
      },
      max: {
        array:
          "\u7684 :attribute \u53ef\u80fd\u4e0d\u8d85\u8fc7 :max \u9879\u76ee.",
        file: "\u7684 :attribute \u4e0d\u5f97\u5927\u4e8e :max \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u4e0d\u5f97\u5927\u4e8e :max.",
        string: "\u7684 :attribute \u4e0d\u5f97\u5927\u4e8e :max \u4eba\u7269.",
      },
      mimes:
        "\u7684 :attribute \u5fc5\u987b\u662f\u7c7b\u578b\u7684\u6587\u4ef6: :values.",
      mimetypes:
        "\u7684 :attribute \u5fc5\u987b\u662f\u7c7b\u578b\u7684\u6587\u4ef6: :values.",
      min: {
        array: "\u7684 :attribute \u5fc5\u987b\u81f3\u5c11 :min \u9879\u76ee.",
        file: "\u7684 :attribute \u5fc5\u987b\u81f3\u5c11 :min \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u5fc5\u987b\u81f3\u5c11 :min.",
        string: "\u7684 :attribute \u5fc5\u987b\u81f3\u5c11 :min \u4eba\u7269.",
      },
      not_in: "\u7684 \u5df2\u9009 :attribute \u662f\u65e0\u6548\u7684.",
      not_regex: "\u7684 :attribute \u683c\u5f0f\u65e0\u6548.",
      numeric: "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u6570\u5b57.",
      password: "\u7684 \u5bc6\u7801\u9519\u8bef.",
      present: "\u7684 :attribute \u5b57\u6bb5\u5fc5\u987b\u5b58\u5728.",
      regex: "\u7684 :attribute \u683c\u5f0f\u65e0\u6548.",
      required: "\u7684 :attribute \u5fc5\u586b\u9879.",
      required_if:
        "\u7684 :attribute \u4f55\u65f6\u9700\u8981\u8be5\u5b57\u6bb5 :other \u662f :value.",
      required_unless:
        "\u7684 :attribute \u5fc5\u586b\u5b57\u6bb5\uff0c\u9664\u975e :other \u5728 :values.",
      required_with:
        "\u7684 :attribute \u4f55\u65f6\u9700\u8981\u8be5\u5b57\u6bb5 :values \u5b58\u5728.",
      required_with_all:
        "\u7684 :attribute \u4f55\u65f6\u9700\u8981\u8be5\u5b57\u6bb5 :values \u5b58\u5728.",
      required_without:
        "\u7684 :attribute \u4f55\u65f6\u9700\u8981\u8be5\u5b57\u6bb5 :values \u4e0d\u5b58\u5728.",
      required_without_all:
        "\u7684 :attribute \u5982\u679c\u6ca1\u6709 :values \u5b58\u5728.",
      same: "\u7684 :attribute \u548c :other \u5fc5\u987b\u5339\u914d.",
      size: {
        array: "\u7684 :attribute \u5fc5\u987b\u5305\u542b :size \u9879\u76ee.",
        file: "\u7684 :attribute \u4e00\u5b9a\u662f :size \u5343\u5b57\u8282.",
        numeric: "\u7684 :attribute \u4e00\u5b9a\u662f :size.",
        string: "\u7684 :attribute \u4e00\u5b9a\u662f :size \u4eba\u7269.",
      },
      starts_with:
        "\u7684 :attribute \u5fc5\u987b\u4ee5\u4e0b\u5217\u5176\u4e2d\u4e00\u9879\u5f00\u5934: :values.",
      string:
        "\u7684 :attribute \u5fc5\u987b\u662f\u4e00\u4e2a\u5b57\u7b26\u4e32.",
      timezone: "\u7684 :attribute \u5fc5\u987b\u662f\u6709\u6548\u533a\u57df.",
      unique: "\u7684 :attribute \u5df2\u6709\u4eba\u5e26\u8d70\u4e86.",
      uploaded: "\u7684 :attribute \u4e0a\u4f20\u5931\u8d25.",
      url: "\u7684 :attribute \u683c\u5f0f\u65e0\u6548.",
      uuid: "\u7684 :attribute \u5fc5\u987b\u662f\u6709\u6548\u7684UUID.",
    },
  });
})();
