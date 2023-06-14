(() => {
  var __webpack_require__ = {
      d: (e, t) => {
        for (var s in t)
          __webpack_require__.o(t, s) &&
            !__webpack_require__.o(e, s) &&
            Object.defineProperty(e, s, { enumerable: !0, get: t[s] });
      },
      o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
      r: (e) => {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      },
    },
    __webpack_exports__ = {};
  (() => {
    "use strict";
    var e = {};
    __webpack_require__.r(e),
      __webpack_require__.d(e, {
        PageRenderer: () => ae,
        PageSnapshot: () => V,
        clearCache: () => ye,
        connectStreamSource: () => ve,
        disconnectStreamSource: () => be,
        navigator: () => me,
        registerAdapter: () => ge,
        renderStreamMessage: () => we,
        session: () => ue,
        setConfirmMethod: () => Ee,
        setProgressBarDelay: () => Se,
        start: () => pe,
        visit: () => fe,
      }),
      (function () {
        if (
          void 0 === window.Reflect ||
          void 0 === window.customElements ||
          window.customElements.polyfillWrapFlushCallback
        )
          return;
        const e = HTMLElement,
          t = function () {
            return Reflect.construct(e, [], this.constructor);
          };
        (window.HTMLElement = t),
          (HTMLElement.prototype = e.prototype),
          (HTMLElement.prototype.constructor = HTMLElement),
          Object.setPrototypeOf(HTMLElement, e);
      })(),
      (function (e) {
        function t(e, t, s) {
          throw new e(
            "Failed to execute 'requestSubmit' on 'HTMLFormElement': " +
              t +
              ".",
            s
          );
        }
        "function" != typeof e.requestSubmit &&
          (e.requestSubmit = function (e) {
            e
              ? (!(function (e, s) {
                  e instanceof HTMLElement ||
                    t(TypeError, "parameter 1 is not of type 'HTMLElement'"),
                    "submit" == e.type ||
                      t(
                        TypeError,
                        "The specified element is not a submit button"
                      ),
                    e.form == s ||
                      t(
                        DOMException,
                        "The specified element is not owned by this form element",
                        "NotFoundError"
                      );
                })(e, this),
                e.click())
              : (((e = document.createElement("input")).type = "submit"),
                (e.hidden = !0),
                this.appendChild(e),
                e.click(),
                this.removeChild(e));
          });
      })(HTMLFormElement.prototype);
    const t = new WeakMap();
    function s(e) {
      const s = (function (e) {
        const t =
            e instanceof Element
              ? e
              : e instanceof Node
              ? e.parentElement
              : null,
          s = t ? t.closest("input, button") : null;
        return "submit" == (null == s ? void 0 : s.type) ? s : null;
      })(e.target);
      s && s.form && t.set(s.form, s);
    }
    var i, r, n, o, a, l;
    !(function () {
      if ("submitter" in Event.prototype) return;
      let e;
      if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor))
        e = window.SubmitEvent.prototype;
      else {
        if ("SubmitEvent" in window) return;
        e = window.Event.prototype;
      }
      addEventListener("click", s, !0),
        Object.defineProperty(e, "submitter", {
          get() {
            if ("submit" == this.type && this.target instanceof HTMLFormElement)
              return t.get(this.target);
          },
        });
    })(),
      (function (e) {
        (e.eager = "eager"), (e.lazy = "lazy");
      })(i || (i = {}));
    class c extends HTMLElement {
      constructor() {
        super(),
          (this.loaded = Promise.resolve()),
          (this.delegate = new c.delegateConstructor(this));
      }
      static get observedAttributes() {
        return ["disabled", "loading", "src"];
      }
      connectedCallback() {
        this.delegate.connect();
      }
      disconnectedCallback() {
        this.delegate.disconnect();
      }
      reload() {
        const { src: e } = this;
        (this.src = null), (this.src = e);
      }
      attributeChangedCallback(e) {
        "loading" == e
          ? this.delegate.loadingStyleChanged()
          : "src" == e
          ? this.delegate.sourceURLChanged()
          : this.delegate.disabledChanged();
      }
      get src() {
        return this.getAttribute("src");
      }
      set src(e) {
        e ? this.setAttribute("src", e) : this.removeAttribute("src");
      }
      get loading() {
        return (function (e) {
          switch (e.toLowerCase()) {
            case "lazy":
              return i.lazy;
            default:
              return i.eager;
          }
        })(this.getAttribute("loading") || "");
      }
      set loading(e) {
        e ? this.setAttribute("loading", e) : this.removeAttribute("loading");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(e) {
        e
          ? this.setAttribute("disabled", "")
          : this.removeAttribute("disabled");
      }
      get autoscroll() {
        return this.hasAttribute("autoscroll");
      }
      set autoscroll(e) {
        e
          ? this.setAttribute("autoscroll", "")
          : this.removeAttribute("autoscroll");
      }
      get complete() {
        return !this.delegate.isLoading;
      }
      get isActive() {
        return this.ownerDocument === document && !this.isPreview;
      }
      get isPreview() {
        var e, t;
        return null ===
          (t =
            null === (e = this.ownerDocument) || void 0 === e
              ? void 0
              : e.documentElement) || void 0 === t
          ? void 0
          : t.hasAttribute("data-turbo-preview");
      }
    }
    function d(e) {
      return new URL(e.toString(), document.baseURI);
    }
    function h(e) {
      let t;
      return e.hash
        ? e.hash.slice(1)
        : (t = e.href.match(/#(.*)$/))
        ? t[1]
        : void 0;
    }
    function u(e, t) {
      return d(
        (null == t ? void 0 : t.getAttribute("formaction")) ||
          e.getAttribute("action") ||
          e.action
      );
    }
    function m(e) {
      return (
        ((function (e) {
          return (function (e) {
            return e.pathname.split("/").slice(1);
          })(e).slice(-1)[0];
        })(e).match(/\.[^.]*$/) || [])[0] || ""
      );
    }
    function p(e, t) {
      const s = (function (e) {
        return (t = e.origin + e.pathname), t.endsWith("/") ? t : t + "/";
        var t;
      })(t);
      return e.href === d(s).href || e.href.startsWith(s);
    }
    function g(e, t) {
      return p(e, t) && !!m(e).match(/^(?:|\.(?:htm|html|xhtml))$/);
    }
    function f(e) {
      const t = h(e);
      return null != t ? e.href.slice(0, -(t.length + 1)) : e.href;
    }
    function v(e) {
      return f(e);
    }
    class b {
      constructor(e) {
        this.response = e;
      }
      get succeeded() {
        return this.response.ok;
      }
      get failed() {
        return !this.succeeded;
      }
      get clientError() {
        return this.statusCode >= 400 && this.statusCode <= 499;
      }
      get serverError() {
        return this.statusCode >= 500 && this.statusCode <= 599;
      }
      get redirected() {
        return this.response.redirected;
      }
      get location() {
        return d(this.response.url);
      }
      get isHTML() {
        return (
          this.contentType &&
          this.contentType.match(
            /^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/
          )
        );
      }
      get statusCode() {
        return this.response.status;
      }
      get contentType() {
        return this.header("Content-Type");
      }
      get responseText() {
        return this.response.clone().text();
      }
      get responseHTML() {
        return this.isHTML
          ? this.response.clone().text()
          : Promise.resolve(void 0);
      }
      header(e) {
        return this.response.headers.get(e);
      }
    }
    function w(e, { target: t, cancelable: s, detail: i } = {}) {
      const r = new CustomEvent(e, { cancelable: s, bubbles: !0, detail: i });
      return (
        t && t.isConnected
          ? t.dispatchEvent(r)
          : document.documentElement.dispatchEvent(r),
        r
      );
    }
    function y() {
      return new Promise((e) => requestAnimationFrame(() => e()));
    }
    function S(e = "") {
      return new DOMParser().parseFromString(e, "text/html");
    }
    function E(e, ...t) {
      const s = (function (e, t) {
          return e.reduce((e, s, i) => e + s + (null == t[i] ? "" : t[i]), "");
        })(e, t)
          .replace(/^\n/, "")
          .split("\n"),
        i = s[0].match(/^\s+/),
        r = i ? i[0].length : 0;
      return s.map((e) => e.slice(r)).join("\n");
    }
    function C() {
      return Array.apply(null, { length: 36 })
        .map((e, t) =>
          8 == t || 13 == t || 18 == t || 23 == t
            ? "-"
            : 14 == t
            ? "4"
            : 19 == t
            ? (Math.floor(4 * Math.random()) + 8).toString(16)
            : Math.floor(15 * Math.random()).toString(16)
        )
        .join("");
    }
    function $(e, ...t) {
      for (const s of t.map((t) => (null == t ? void 0 : t.getAttribute(e))))
        if ("string" == typeof s) return s;
      return null;
    }
    function L(...e) {
      for (const t of e)
        "turbo-frame" == t.localName && t.setAttribute("busy", ""),
          t.setAttribute("aria-busy", "true");
    }
    function T(...e) {
      for (const t of e)
        "turbo-frame" == t.localName && t.removeAttribute("busy"),
          t.removeAttribute("aria-busy");
    }
    !(function (e) {
      (e[(e.get = 0)] = "get"),
        (e[(e.post = 1)] = "post"),
        (e[(e.put = 2)] = "put"),
        (e[(e.patch = 3)] = "patch"),
        (e[(e.delete = 4)] = "delete");
    })(r || (r = {}));
    class R {
      constructor(e, t, s, i = new URLSearchParams(), r = null) {
        (this.abortController = new AbortController()),
          (this.resolveRequestPromise = (e) => {}),
          (this.delegate = e),
          (this.method = t),
          (this.headers = this.defaultHeaders),
          (this.body = i),
          (this.url = s),
          (this.target = r);
      }
      get location() {
        return this.url;
      }
      get params() {
        return this.url.searchParams;
      }
      get entries() {
        return this.body ? Array.from(this.body.entries()) : [];
      }
      cancel() {
        this.abortController.abort();
      }
      async perform() {
        var e, t;
        const { fetchOptions: s } = this;
        null === (t = (e = this.delegate).prepareHeadersForRequest) ||
          void 0 === t ||
          t.call(e, this.headers, this),
          await this.allowRequestToBeIntercepted(s);
        try {
          this.delegate.requestStarted(this);
          const e = await fetch(this.url.href, s);
          return await this.receive(e);
        } catch (e) {
          if ("AbortError" !== e.name)
            throw (this.delegate.requestErrored(this, e), e);
        } finally {
          this.delegate.requestFinished(this);
        }
      }
      async receive(e) {
        const t = new b(e);
        return (
          w("turbo:before-fetch-response", {
            cancelable: !0,
            detail: { fetchResponse: t },
            target: this.target,
          }).defaultPrevented
            ? this.delegate.requestPreventedHandlingResponse(this, t)
            : t.succeeded
            ? this.delegate.requestSucceededWithResponse(this, t)
            : this.delegate.requestFailedWithResponse(this, t),
          t
        );
      }
      get fetchOptions() {
        var e;
        return {
          method: r[this.method].toUpperCase(),
          credentials: "same-origin",
          headers: this.headers,
          redirect: "follow",
          body: this.isIdempotent ? null : this.body,
          signal: this.abortSignal,
          referrer:
            null === (e = this.delegate.referrer) || void 0 === e
              ? void 0
              : e.href,
        };
      }
      get defaultHeaders() {
        return { Accept: "text/html, application/xhtml+xml" };
      }
      get isIdempotent() {
        return this.method == r.get;
      }
      get abortSignal() {
        return this.abortController.signal;
      }
      async allowRequestToBeIntercepted(e) {
        const t = new Promise((e) => (this.resolveRequestPromise = e));
        w("turbo:before-fetch-request", {
          cancelable: !0,
          detail: {
            fetchOptions: e,
            url: this.url,
            resume: this.resolveRequestPromise,
          },
          target: this.target,
        }).defaultPrevented && (await t);
      }
    }
    class F {
      constructor(e, t) {
        (this.started = !1),
          (this.intersect = (e) => {
            const t = e.slice(-1)[0];
            (null == t ? void 0 : t.isIntersecting) &&
              this.delegate.elementAppearedInViewport(this.element);
          }),
          (this.delegate = e),
          (this.element = t),
          (this.intersectionObserver = new IntersectionObserver(
            this.intersect
          ));
      }
      start() {
        this.started ||
          ((this.started = !0),
          this.intersectionObserver.observe(this.element));
      }
      stop() {
        this.started &&
          ((this.started = !1),
          this.intersectionObserver.unobserve(this.element));
      }
    }
    class k {
      constructor(e) {
        (this.templateElement = document.createElement("template")),
          (this.templateElement.innerHTML = e);
      }
      static wrap(e) {
        return "string" == typeof e ? new this(e) : e;
      }
      get fragment() {
        const e = document.createDocumentFragment();
        for (const t of this.foreignElements)
          e.appendChild(document.importNode(t, !0));
        return e;
      }
      get foreignElements() {
        return this.templateChildren.reduce(
          (e, t) => ("turbo-stream" == t.tagName.toLowerCase() ? [...e, t] : e),
          []
        );
      }
      get templateChildren() {
        return Array.from(this.templateElement.content.children);
      }
    }
    (k.contentType = "text/vnd.turbo-stream.html"),
      (function (e) {
        (e[(e.initialized = 0)] = "initialized"),
          (e[(e.requesting = 1)] = "requesting"),
          (e[(e.waiting = 2)] = "waiting"),
          (e[(e.receiving = 3)] = "receiving"),
          (e[(e.stopping = 4)] = "stopping"),
          (e[(e.stopped = 5)] = "stopped");
      })(n || (n = {})),
      (function (e) {
        (e.urlEncoded = "application/x-www-form-urlencoded"),
          (e.multipart = "multipart/form-data"),
          (e.plain = "text/plain");
      })(o || (o = {}));
    class A {
      constructor(e, t, s, i = !1) {
        (this.state = n.initialized),
          (this.delegate = e),
          (this.formElement = t),
          (this.submitter = s),
          (this.formData = (function (e, t) {
            const s = new FormData(e),
              i = null == t ? void 0 : t.getAttribute("name"),
              r = null == t ? void 0 : t.getAttribute("value");
            i && null != r && s.get(i) != r && s.append(i, r);
            return s;
          })(t, s)),
          (this.location = d(this.action)),
          this.method == r.get &&
            (function (e, t) {
              const s = new URLSearchParams();
              for (const [e, i] of t) i instanceof File || s.append(e, i);
              e.search = s.toString();
            })(this.location, [...this.body.entries()]),
          (this.fetchRequest = new R(
            this,
            this.method,
            this.location,
            this.body,
            this.formElement
          )),
          (this.mustRedirect = i);
      }
      static confirmMethod(e, t) {
        return confirm(e);
      }
      get method() {
        var e;
        return (
          (function (e) {
            switch (e.toLowerCase()) {
              case "get":
                return r.get;
              case "post":
                return r.post;
              case "put":
                return r.put;
              case "patch":
                return r.patch;
              case "delete":
                return r.delete;
            }
          })(
            (
              (null === (e = this.submitter) || void 0 === e
                ? void 0
                : e.getAttribute("formmethod")) ||
              this.formElement.getAttribute("method") ||
              ""
            ).toLowerCase()
          ) || r.get
        );
      }
      get action() {
        var e;
        const t =
          "string" == typeof this.formElement.action
            ? this.formElement.action
            : null;
        return (
          (null === (e = this.submitter) || void 0 === e
            ? void 0
            : e.getAttribute("formaction")) ||
          this.formElement.getAttribute("action") ||
          t ||
          ""
        );
      }
      get body() {
        return this.enctype == o.urlEncoded || this.method == r.get
          ? new URLSearchParams(this.stringFormData)
          : this.formData;
      }
      get enctype() {
        var e;
        return (function (e) {
          switch (e.toLowerCase()) {
            case o.multipart:
              return o.multipart;
            case o.plain:
              return o.plain;
            default:
              return o.urlEncoded;
          }
        })(
          (null === (e = this.submitter) || void 0 === e
            ? void 0
            : e.getAttribute("formenctype")) || this.formElement.enctype
        );
      }
      get isIdempotent() {
        return this.fetchRequest.isIdempotent;
      }
      get stringFormData() {
        return [...this.formData].reduce(
          (e, [t, s]) => e.concat("string" == typeof s ? [[t, s]] : []),
          []
        );
      }
      get confirmationMessage() {
        return this.formElement.getAttribute("data-turbo-confirm");
      }
      get needsConfirmation() {
        return null !== this.confirmationMessage;
      }
      async start() {
        const { initialized: e, requesting: t } = n;
        if (this.needsConfirmation) {
          if (!A.confirmMethod(this.confirmationMessage, this.formElement))
            return;
        }
        if (this.state == e)
          return (this.state = t), this.fetchRequest.perform();
      }
      stop() {
        const { stopping: e, stopped: t } = n;
        if (this.state != e && this.state != t)
          return (this.state = e), this.fetchRequest.cancel(), !0;
      }
      prepareHeadersForRequest(e, t) {
        if (!t.isIdempotent) {
          const t =
            (function (e) {
              if (null != e) {
                const t = (
                  document.cookie ? document.cookie.split("; ") : []
                ).find((t) => t.startsWith(e));
                if (t) {
                  const e = t.split("=").slice(1).join("=");
                  return e ? decodeURIComponent(e) : void 0;
                }
              }
            })(P("csrf-param")) || P("csrf-token");
          t && (e["X-CSRF-Token"] = t),
            (e.Accept = [k.contentType, e.Accept].join(", "));
        }
      }
      requestStarted(e) {
        var t;
        (this.state = n.waiting),
          null === (t = this.submitter) ||
            void 0 === t ||
            t.setAttribute("disabled", ""),
          w("turbo:submit-start", {
            target: this.formElement,
            detail: { formSubmission: this },
          }),
          this.delegate.formSubmissionStarted(this);
      }
      requestPreventedHandlingResponse(e, t) {
        this.result = { success: t.succeeded, fetchResponse: t };
      }
      requestSucceededWithResponse(e, t) {
        if (t.clientError || t.serverError)
          this.delegate.formSubmissionFailedWithResponse(this, t);
        else if (
          this.requestMustRedirect(e) &&
          (function (e) {
            return 200 == e.statusCode && !e.redirected;
          })(t)
        ) {
          const e = new Error(
            "Form responses must redirect to another location"
          );
          this.delegate.formSubmissionErrored(this, e);
        } else
          (this.state = n.receiving),
            (this.result = { success: !0, fetchResponse: t }),
            this.delegate.formSubmissionSucceededWithResponse(this, t);
      }
      requestFailedWithResponse(e, t) {
        (this.result = { success: !1, fetchResponse: t }),
          this.delegate.formSubmissionFailedWithResponse(this, t);
      }
      requestErrored(e, t) {
        (this.result = { success: !1, error: t }),
          this.delegate.formSubmissionErrored(this, t);
      }
      requestFinished(e) {
        var t;
        (this.state = n.stopped),
          null === (t = this.submitter) ||
            void 0 === t ||
            t.removeAttribute("disabled"),
          w("turbo:submit-end", {
            target: this.formElement,
            detail: Object.assign({ formSubmission: this }, this.result),
          }),
          this.delegate.formSubmissionFinished(this);
      }
      requestMustRedirect(e) {
        return !e.isIdempotent && this.mustRedirect;
      }
    }
    function P(e) {
      const t = document.querySelector(`meta[name="${e}"]`);
      return t && t.content;
    }
    class M {
      constructor(e) {
        this.element = e;
      }
      get children() {
        return [...this.element.children];
      }
      hasAnchor(e) {
        return null != this.getElementForAnchor(e);
      }
      getElementForAnchor(e) {
        return e
          ? this.element.querySelector(`[id='${e}'], a[name='${e}']`)
          : null;
      }
      get isConnected() {
        return this.element.isConnected;
      }
      get firstAutofocusableElement() {
        return this.element.querySelector("[autofocus]");
      }
      get permanentElements() {
        return [...this.element.querySelectorAll("[id][data-turbo-permanent]")];
      }
      getPermanentElementById(e) {
        return this.element.querySelector(`#${e}[data-turbo-permanent]`);
      }
      getPermanentElementMapForSnapshot(e) {
        const t = {};
        for (const s of this.permanentElements) {
          const { id: i } = s,
            r = e.getPermanentElementById(i);
          r && (t[i] = [s, r]);
        }
        return t;
      }
    }
    class B {
      constructor(e, t) {
        (this.submitBubbled = (e) => {
          const t = e.target;
          if (
            !e.defaultPrevented &&
            t instanceof HTMLFormElement &&
            t.closest("turbo-frame, html") == this.element
          ) {
            const s = e.submitter || void 0;
            "dialog" !=
              ((null == s ? void 0 : s.getAttribute("formmethod")) ||
                t.method) &&
              this.delegate.shouldInterceptFormSubmission(t, s) &&
              (e.preventDefault(),
              e.stopImmediatePropagation(),
              this.delegate.formSubmissionIntercepted(t, s));
          }
        }),
          (this.delegate = e),
          (this.element = t);
      }
      start() {
        this.element.addEventListener("submit", this.submitBubbled);
      }
      stop() {
        this.element.removeEventListener("submit", this.submitBubbled);
      }
    }
    class I {
      constructor(e, t) {
        (this.resolveRenderPromise = (e) => {}),
          (this.resolveInterceptionPromise = (e) => {}),
          (this.delegate = e),
          (this.element = t);
      }
      scrollToAnchor(e) {
        const t = this.snapshot.getElementForAnchor(e);
        t
          ? (this.scrollToElement(t), this.focusElement(t))
          : this.scrollToPosition({ x: 0, y: 0 });
      }
      scrollToAnchorFromLocation(e) {
        this.scrollToAnchor(h(e));
      }
      scrollToElement(e) {
        e.scrollIntoView();
      }
      focusElement(e) {
        e instanceof HTMLElement &&
          (e.hasAttribute("tabindex")
            ? e.focus()
            : (e.setAttribute("tabindex", "-1"),
              e.focus(),
              e.removeAttribute("tabindex")));
      }
      scrollToPosition({ x: e, y: t }) {
        this.scrollRoot.scrollTo(e, t);
      }
      scrollToTop() {
        this.scrollToPosition({ x: 0, y: 0 });
      }
      get scrollRoot() {
        return window;
      }
      async render(e) {
        const { isPreview: t, shouldRender: s, newSnapshot: i } = e;
        if (s)
          try {
            (this.renderPromise = new Promise(
              (e) => (this.resolveRenderPromise = e)
            )),
              (this.renderer = e),
              this.prepareToRenderSnapshot(e);
            const s = new Promise((e) => (this.resolveInterceptionPromise = e));
            this.delegate.allowsImmediateRender(
              i,
              this.resolveInterceptionPromise
            ) || (await s),
              await this.renderSnapshot(e),
              this.delegate.viewRenderedSnapshot(i, t),
              this.finishRenderingSnapshot(e);
          } finally {
            delete this.renderer,
              this.resolveRenderPromise(void 0),
              delete this.renderPromise;
          }
        else this.invalidate();
      }
      invalidate() {
        this.delegate.viewInvalidated();
      }
      prepareToRenderSnapshot(e) {
        this.markAsPreview(e.isPreview), e.prepareToRender();
      }
      markAsPreview(e) {
        e
          ? this.element.setAttribute("data-turbo-preview", "")
          : this.element.removeAttribute("data-turbo-preview");
      }
      async renderSnapshot(e) {
        await e.render();
      }
      finishRenderingSnapshot(e) {
        e.finishRendering();
      }
    }
    class x extends I {
      invalidate() {
        this.element.innerHTML = "";
      }
      get snapshot() {
        return new M(this.element);
      }
    }
    class O {
      constructor(e, t) {
        (this.clickBubbled = (e) => {
          this.respondsToEventTarget(e.target)
            ? (this.clickEvent = e)
            : delete this.clickEvent;
        }),
          (this.linkClicked = (e) => {
            this.clickEvent &&
              this.respondsToEventTarget(e.target) &&
              e.target instanceof Element &&
              this.delegate.shouldInterceptLinkClick(e.target, e.detail.url) &&
              (this.clickEvent.preventDefault(),
              e.preventDefault(),
              this.delegate.linkClickIntercepted(e.target, e.detail.url)),
              delete this.clickEvent;
          }),
          (this.willVisit = () => {
            delete this.clickEvent;
          }),
          (this.delegate = e),
          (this.element = t);
      }
      start() {
        this.element.addEventListener("click", this.clickBubbled),
          document.addEventListener("turbo:click", this.linkClicked),
          document.addEventListener("turbo:before-visit", this.willVisit);
      }
      stop() {
        this.element.removeEventListener("click", this.clickBubbled),
          document.removeEventListener("turbo:click", this.linkClicked),
          document.removeEventListener("turbo:before-visit", this.willVisit);
      }
      respondsToEventTarget(e) {
        const t =
          e instanceof Element ? e : e instanceof Node ? e.parentElement : null;
        return t && t.closest("turbo-frame, html") == this.element;
      }
    }
    class H {
      constructor(e, t, s, i = !0) {
        (this.currentSnapshot = e),
          (this.newSnapshot = t),
          (this.isPreview = s),
          (this.willRender = i),
          (this.promise = new Promise(
            (e, t) => (this.resolvingFunctions = { resolve: e, reject: t })
          ));
      }
      get shouldRender() {
        return !0;
      }
      prepareToRender() {}
      finishRendering() {
        this.resolvingFunctions &&
          (this.resolvingFunctions.resolve(), delete this.resolvingFunctions);
      }
      createScriptElement(e) {
        if ("false" == e.getAttribute("data-turbo-eval")) return e;
        {
          const t = document.createElement("script");
          return (
            this.cspNonce && (t.nonce = this.cspNonce),
            (t.textContent = e.textContent),
            (t.async = !1),
            (function (e, t) {
              for (const { name: s, value: i } of [...t.attributes])
                e.setAttribute(s, i);
            })(t, e),
            t
          );
        }
      }
      preservingPermanentElements(e) {
        (class {
          constructor(e) {
            this.permanentElementMap = e;
          }
          static preservingPermanentElements(e, t) {
            const s = new this(e);
            s.enter(), t(), s.leave();
          }
          enter() {
            for (const e in this.permanentElementMap) {
              const [, t] = this.permanentElementMap[e];
              this.replaceNewPermanentElementWithPlaceholder(t);
            }
          }
          leave() {
            for (const e in this.permanentElementMap) {
              const [t] = this.permanentElementMap[e];
              this.replaceCurrentPermanentElementWithClone(t),
                this.replacePlaceholderWithPermanentElement(t);
            }
          }
          replaceNewPermanentElementWithPlaceholder(e) {
            const t = (function (e) {
              const t = document.createElement("meta");
              return (
                t.setAttribute("name", "turbo-permanent-placeholder"),
                t.setAttribute("content", e.id),
                t
              );
            })(e);
            e.replaceWith(t);
          }
          replaceCurrentPermanentElementWithClone(e) {
            const t = e.cloneNode(!0);
            e.replaceWith(t);
          }
          replacePlaceholderWithPermanentElement(e) {
            const t = this.getPlaceholderById(e.id);
            null == t || t.replaceWith(e);
          }
          getPlaceholderById(e) {
            return this.placeholders.find((t) => t.content == e);
          }
          get placeholders() {
            return [
              ...document.querySelectorAll(
                "meta[name=turbo-permanent-placeholder][content]"
              ),
            ];
          }
        }.preservingPermanentElements(this.permanentElementMap, e));
      }
      focusFirstAutofocusableElement() {
        const e = this.connectedSnapshot.firstAutofocusableElement;
        (function (e) {
          return e && "function" == typeof e.focus;
        })(e) && e.focus();
      }
      get connectedSnapshot() {
        return this.newSnapshot.isConnected
          ? this.newSnapshot
          : this.currentSnapshot;
      }
      get currentElement() {
        return this.currentSnapshot.element;
      }
      get newElement() {
        return this.newSnapshot.element;
      }
      get permanentElementMap() {
        return this.currentSnapshot.getPermanentElementMapForSnapshot(
          this.newSnapshot
        );
      }
      get cspNonce() {
        var e;
        return null ===
          (e = document.head.querySelector('meta[name="csp-nonce"]')) ||
          void 0 === e
          ? void 0
          : e.getAttribute("content");
      }
    }
    class N extends H {
      get shouldRender() {
        return !0;
      }
      async render() {
        await y(),
          this.preservingPermanentElements(() => {
            this.loadFrameElement();
          }),
          this.scrollFrameIntoView(),
          await y(),
          this.focusFirstAutofocusableElement(),
          await y(),
          this.activateScriptElements();
      }
      loadFrameElement() {
        var e;
        const t = document.createRange();
        t.selectNodeContents(this.currentElement), t.deleteContents();
        const s = this.newElement,
          i =
            null === (e = s.ownerDocument) || void 0 === e
              ? void 0
              : e.createRange();
        i &&
          (i.selectNodeContents(s),
          this.currentElement.appendChild(i.extractContents()));
      }
      scrollFrameIntoView() {
        if (this.currentElement.autoscroll || this.newElement.autoscroll) {
          const s = this.currentElement.firstElementChild,
            i =
              ((e = this.currentElement.getAttribute("data-autoscroll-block")),
              (t = "end"),
              "end" == e || "start" == e || "center" == e || "nearest" == e
                ? e
                : t);
          if (s) return s.scrollIntoView({ block: i }), !0;
        }
        var e, t;
        return !1;
      }
      activateScriptElements() {
        for (const e of this.newScriptElements) {
          const t = this.createScriptElement(e);
          e.replaceWith(t);
        }
      }
      get newScriptElements() {
        return this.currentElement.querySelectorAll("script");
      }
    }
    class q {
      constructor() {
        (this.hiding = !1),
          (this.value = 0),
          (this.visible = !1),
          (this.trickle = () => {
            this.setValue(this.value + Math.random() / 100);
          }),
          (this.stylesheetElement = this.createStylesheetElement()),
          (this.progressElement = this.createProgressElement()),
          this.installStylesheetElement(),
          this.setValue(0);
      }
      static get defaultCSS() {
        return E`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 9999;
        transition:
          width ${q.animationDuration}ms ease-out,
          opacity ${q.animationDuration / 2}ms ${
          q.animationDuration / 2
        }ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
      }
      show() {
        this.visible ||
          ((this.visible = !0),
          this.installProgressElement(),
          this.startTrickling());
      }
      hide() {
        this.visible &&
          !this.hiding &&
          ((this.hiding = !0),
          this.fadeProgressElement(() => {
            this.uninstallProgressElement(),
              this.stopTrickling(),
              (this.visible = !1),
              (this.hiding = !1);
          }));
      }
      setValue(e) {
        (this.value = e), this.refresh();
      }
      installStylesheetElement() {
        document.head.insertBefore(
          this.stylesheetElement,
          document.head.firstChild
        );
      }
      installProgressElement() {
        (this.progressElement.style.width = "0"),
          (this.progressElement.style.opacity = "1"),
          document.documentElement.insertBefore(
            this.progressElement,
            document.body
          ),
          this.refresh();
      }
      fadeProgressElement(e) {
        (this.progressElement.style.opacity = "0"),
          setTimeout(e, 1.5 * q.animationDuration);
      }
      uninstallProgressElement() {
        this.progressElement.parentNode &&
          document.documentElement.removeChild(this.progressElement);
      }
      startTrickling() {
        this.trickleInterval ||
          (this.trickleInterval = window.setInterval(
            this.trickle,
            q.animationDuration
          ));
      }
      stopTrickling() {
        window.clearInterval(this.trickleInterval), delete this.trickleInterval;
      }
      refresh() {
        requestAnimationFrame(() => {
          this.progressElement.style.width = 10 + 90 * this.value + "%";
        });
      }
      createStylesheetElement() {
        const e = document.createElement("style");
        return (e.type = "text/css"), (e.textContent = q.defaultCSS), e;
      }
      createProgressElement() {
        const e = document.createElement("div");
        return (e.className = "turbo-progress-bar"), e;
      }
    }
    q.animationDuration = 300;
    class j extends M {
      constructor() {
        super(...arguments),
          (this.detailsByOuterHTML = this.children
            .filter(
              (e) =>
                !(function (e) {
                  return "noscript" == e.tagName.toLowerCase();
                })(e)
            )
            .map((e) =>
              (function (e) {
                e.hasAttribute("nonce") && e.setAttribute("nonce", "");
                return e;
              })(e)
            )
            .reduce((e, t) => {
              const { outerHTML: s } = t,
                i = s in e ? e[s] : { type: D(t), tracked: _(t), elements: [] };
              return Object.assign(Object.assign({}, e), {
                [s]: Object.assign(Object.assign({}, i), {
                  elements: [...i.elements, t],
                }),
              });
            }, {}));
      }
      get trackedElementSignature() {
        return Object.keys(this.detailsByOuterHTML)
          .filter((e) => this.detailsByOuterHTML[e].tracked)
          .join("");
      }
      getScriptElementsNotInSnapshot(e) {
        return this.getElementsMatchingTypeNotInSnapshot("script", e);
      }
      getStylesheetElementsNotInSnapshot(e) {
        return this.getElementsMatchingTypeNotInSnapshot("stylesheet", e);
      }
      getElementsMatchingTypeNotInSnapshot(e, t) {
        return Object.keys(this.detailsByOuterHTML)
          .filter((e) => !(e in t.detailsByOuterHTML))
          .map((e) => this.detailsByOuterHTML[e])
          .filter(({ type: t }) => t == e)
          .map(({ elements: [e] }) => e);
      }
      get provisionalElements() {
        return Object.keys(this.detailsByOuterHTML).reduce((e, t) => {
          const {
            type: s,
            tracked: i,
            elements: r,
          } = this.detailsByOuterHTML[t];
          return null != s || i
            ? r.length > 1
              ? [...e, ...r.slice(1)]
              : e
            : [...e, ...r];
        }, []);
      }
      getMetaValue(e) {
        const t = this.findMetaElementByName(e);
        return t ? t.getAttribute("content") : null;
      }
      findMetaElementByName(e) {
        return Object.keys(this.detailsByOuterHTML).reduce((t, s) => {
          const {
            elements: [i],
          } = this.detailsByOuterHTML[s];
          return (function (e, t) {
            return (
              "meta" == e.tagName.toLowerCase() && e.getAttribute("name") == t
            );
          })(i, e)
            ? i
            : t;
        }, void 0);
      }
    }
    function D(e) {
      return (function (e) {
        return "script" == e.tagName.toLowerCase();
      })(e)
        ? "script"
        : (function (e) {
            const t = e.tagName.toLowerCase();
            return (
              "style" == t ||
              ("link" == t && "stylesheet" == e.getAttribute("rel"))
            );
          })(e)
        ? "stylesheet"
        : void 0;
    }
    function _(e) {
      return "reload" == e.getAttribute("data-turbo-track");
    }
    class V extends M {
      constructor(e, t) {
        super(e), (this.headSnapshot = t);
      }
      static fromHTMLString(e = "") {
        return this.fromDocument(S(e));
      }
      static fromElement(e) {
        return this.fromDocument(e.ownerDocument);
      }
      static fromDocument({ head: e, body: t }) {
        return new this(t, new j(e));
      }
      clone() {
        return new V(this.element.cloneNode(!0), this.headSnapshot);
      }
      get headElement() {
        return this.headSnapshot.element;
      }
      get rootLocation() {
        var e;
        return d(
          null !== (e = this.getSetting("root")) && void 0 !== e ? e : "/"
        );
      }
      get cacheControlValue() {
        return this.getSetting("cache-control");
      }
      get isPreviewable() {
        return "no-preview" != this.cacheControlValue;
      }
      get isCacheable() {
        return "no-cache" != this.cacheControlValue;
      }
      get isVisitable() {
        return "reload" != this.getSetting("visit-control");
      }
      getSetting(e) {
        return this.headSnapshot.getMetaValue(`turbo-${e}`);
      }
    }
    !(function (e) {
      (e.visitStart = "visitStart"),
        (e.requestStart = "requestStart"),
        (e.requestEnd = "requestEnd"),
        (e.visitEnd = "visitEnd");
    })(a || (a = {})),
      (function (e) {
        (e.initialized = "initialized"),
          (e.started = "started"),
          (e.canceled = "canceled"),
          (e.failed = "failed"),
          (e.completed = "completed");
      })(l || (l = {}));
    const W = {
      action: "advance",
      historyChanged: !1,
      visitCachedSnapshot: () => {},
      willRender: !0,
    };
    var U, J;
    !(function (e) {
      (e[(e.networkFailure = 0)] = "networkFailure"),
        (e[(e.timeoutFailure = -1)] = "timeoutFailure"),
        (e[(e.contentTypeMismatch = -2)] = "contentTypeMismatch");
    })(U || (U = {}));
    class z {
      constructor(e, t, s, i = {}) {
        (this.identifier = C()),
          (this.timingMetrics = {}),
          (this.followedRedirect = !1),
          (this.historyChanged = !1),
          (this.scrolled = !1),
          (this.snapshotCached = !1),
          (this.state = l.initialized),
          (this.delegate = e),
          (this.location = t),
          (this.restorationIdentifier = s || C());
        const {
          action: r,
          historyChanged: n,
          referrer: o,
          snapshotHTML: a,
          response: c,
          visitCachedSnapshot: d,
          willRender: h,
        } = Object.assign(Object.assign({}, W), i);
        (this.action = r),
          (this.historyChanged = n),
          (this.referrer = o),
          (this.snapshotHTML = a),
          (this.response = c),
          (this.isSamePage = this.delegate.locationWithActionIsSamePage(
            this.location,
            this.action
          )),
          (this.visitCachedSnapshot = d),
          (this.willRender = h),
          (this.scrolled = !h);
      }
      get adapter() {
        return this.delegate.adapter;
      }
      get view() {
        return this.delegate.view;
      }
      get history() {
        return this.delegate.history;
      }
      get restorationData() {
        return this.history.getRestorationDataForIdentifier(
          this.restorationIdentifier
        );
      }
      get silent() {
        return this.isSamePage;
      }
      start() {
        this.state == l.initialized &&
          (this.recordTimingMetric(a.visitStart),
          (this.state = l.started),
          this.adapter.visitStarted(this),
          this.delegate.visitStarted(this));
      }
      cancel() {
        this.state == l.started &&
          (this.request && this.request.cancel(),
          this.cancelRender(),
          (this.state = l.canceled));
      }
      complete() {
        this.state == l.started &&
          (this.recordTimingMetric(a.visitEnd),
          (this.state = l.completed),
          this.adapter.visitCompleted(this),
          this.delegate.visitCompleted(this),
          this.followRedirect());
      }
      fail() {
        this.state == l.started &&
          ((this.state = l.failed), this.adapter.visitFailed(this));
      }
      changeHistory() {
        var e;
        if (!this.historyChanged) {
          const t =
              this.location.href ===
              (null === (e = this.referrer) || void 0 === e ? void 0 : e.href)
                ? "replace"
                : this.action,
            s = this.getHistoryMethodForAction(t);
          this.history.update(s, this.location, this.restorationIdentifier),
            (this.historyChanged = !0);
        }
      }
      issueRequest() {
        this.hasPreloadedResponse()
          ? this.simulateRequest()
          : this.shouldIssueRequest() &&
            !this.request &&
            ((this.request = new R(this, r.get, this.location)),
            this.request.perform());
      }
      simulateRequest() {
        this.response &&
          (this.startRequest(), this.recordResponse(), this.finishRequest());
      }
      startRequest() {
        this.recordTimingMetric(a.requestStart),
          this.adapter.visitRequestStarted(this);
      }
      recordResponse(e = this.response) {
        if (((this.response = e), e)) {
          const { statusCode: t } = e;
          K(t)
            ? this.adapter.visitRequestCompleted(this)
            : this.adapter.visitRequestFailedWithStatusCode(this, t);
        }
      }
      finishRequest() {
        this.recordTimingMetric(a.requestEnd),
          this.adapter.visitRequestFinished(this);
      }
      loadResponse() {
        if (this.response) {
          const { statusCode: e, responseHTML: t } = this.response;
          this.render(async () => {
            this.cacheSnapshot(),
              this.view.renderPromise && (await this.view.renderPromise),
              K(e) && null != t
                ? (await this.view.renderPage(
                    V.fromHTMLString(t),
                    !1,
                    this.willRender
                  ),
                  this.adapter.visitRendered(this),
                  this.complete())
                : (await this.view.renderError(V.fromHTMLString(t)),
                  this.adapter.visitRendered(this),
                  this.fail());
          });
        }
      }
      getCachedSnapshot() {
        const e =
          this.view.getCachedSnapshotForLocation(this.location) ||
          this.getPreloadedSnapshot();
        if (
          e &&
          (!h(this.location) || e.hasAnchor(h(this.location))) &&
          ("restore" == this.action || e.isPreviewable)
        )
          return e;
      }
      getPreloadedSnapshot() {
        if (this.snapshotHTML) return V.fromHTMLString(this.snapshotHTML);
      }
      hasCachedSnapshot() {
        return null != this.getCachedSnapshot();
      }
      loadCachedSnapshot() {
        const e = this.getCachedSnapshot();
        if (e) {
          const t = this.shouldIssueRequest();
          this.render(async () => {
            this.cacheSnapshot(),
              this.isSamePage
                ? this.adapter.visitRendered(this)
                : (this.view.renderPromise && (await this.view.renderPromise),
                  await this.view.renderPage(e, t, this.willRender),
                  this.adapter.visitRendered(this),
                  t || this.complete());
          });
        }
      }
      followRedirect() {
        var e;
        this.redirectedToLocation &&
          !this.followedRedirect &&
          (null === (e = this.response) || void 0 === e
            ? void 0
            : e.redirected) &&
          (this.adapter.visitProposedToLocation(this.redirectedToLocation, {
            action: "replace",
            response: this.response,
          }),
          (this.followedRedirect = !0));
      }
      goToSamePageAnchor() {
        this.isSamePage &&
          this.render(async () => {
            this.cacheSnapshot(), this.adapter.visitRendered(this);
          });
      }
      requestStarted() {
        this.startRequest();
      }
      requestPreventedHandlingResponse(e, t) {}
      async requestSucceededWithResponse(e, t) {
        const s = await t.responseHTML,
          { redirected: i, statusCode: r } = t;
        null == s
          ? this.recordResponse({
              statusCode: U.contentTypeMismatch,
              redirected: i,
            })
          : ((this.redirectedToLocation = t.redirected ? t.location : void 0),
            this.recordResponse({
              statusCode: r,
              responseHTML: s,
              redirected: i,
            }));
      }
      async requestFailedWithResponse(e, t) {
        const s = await t.responseHTML,
          { redirected: i, statusCode: r } = t;
        null == s
          ? this.recordResponse({
              statusCode: U.contentTypeMismatch,
              redirected: i,
            })
          : this.recordResponse({
              statusCode: r,
              responseHTML: s,
              redirected: i,
            });
      }
      requestErrored(e, t) {
        this.recordResponse({ statusCode: U.networkFailure, redirected: !1 });
      }
      requestFinished() {
        this.finishRequest();
      }
      performScroll() {
        this.scrolled ||
          ("restore" == this.action
            ? this.scrollToRestoredPosition() ||
              this.scrollToAnchor() ||
              this.view.scrollToTop()
            : this.scrollToAnchor() || this.view.scrollToTop(),
          this.isSamePage &&
            this.delegate.visitScrolledToSamePageLocation(
              this.view.lastRenderedLocation,
              this.location
            ),
          (this.scrolled = !0));
      }
      scrollToRestoredPosition() {
        const { scrollPosition: e } = this.restorationData;
        if (e) return this.view.scrollToPosition(e), !0;
      }
      scrollToAnchor() {
        const e = h(this.location);
        if (null != e) return this.view.scrollToAnchor(e), !0;
      }
      recordTimingMetric(e) {
        this.timingMetrics[e] = new Date().getTime();
      }
      getTimingMetrics() {
        return Object.assign({}, this.timingMetrics);
      }
      getHistoryMethodForAction(e) {
        switch (e) {
          case "replace":
            return history.replaceState;
          case "advance":
          case "restore":
            return history.pushState;
        }
      }
      hasPreloadedResponse() {
        return "object" == typeof this.response;
      }
      shouldIssueRequest() {
        return (
          !this.isSamePage &&
          ("restore" == this.action
            ? !this.hasCachedSnapshot()
            : this.willRender)
        );
      }
      cacheSnapshot() {
        this.snapshotCached ||
          (this.view
            .cacheSnapshot()
            .then((e) => e && this.visitCachedSnapshot(e)),
          (this.snapshotCached = !0));
      }
      async render(e) {
        this.cancelRender(),
          await new Promise((e) => {
            this.frame = requestAnimationFrame(() => e());
          }),
          await e(),
          delete this.frame,
          this.performScroll();
      }
      cancelRender() {
        this.frame && (cancelAnimationFrame(this.frame), delete this.frame);
      }
    }
    function K(e) {
      return e >= 200 && e < 300;
    }
    class G {
      constructor(e) {
        (this.progressBar = new q()),
          (this.showProgressBar = () => {
            this.progressBar.show();
          }),
          (this.session = e);
      }
      visitProposedToLocation(e, t) {
        this.navigator.startVisit(e, C(), t);
      }
      visitStarted(e) {
        e.loadCachedSnapshot(),
          e.issueRequest(),
          e.changeHistory(),
          e.goToSamePageAnchor();
      }
      visitRequestStarted(e) {
        this.progressBar.setValue(0),
          e.hasCachedSnapshot() || "restore" != e.action
            ? this.showVisitProgressBarAfterDelay()
            : this.showProgressBar();
      }
      visitRequestCompleted(e) {
        e.loadResponse();
      }
      visitRequestFailedWithStatusCode(e, t) {
        switch (t) {
          case U.networkFailure:
          case U.timeoutFailure:
          case U.contentTypeMismatch:
            return this.reload();
          default:
            return e.loadResponse();
        }
      }
      visitRequestFinished(e) {
        this.progressBar.setValue(1), this.hideVisitProgressBar();
      }
      visitCompleted(e) {}
      pageInvalidated() {
        this.reload();
      }
      visitFailed(e) {}
      visitRendered(e) {}
      formSubmissionStarted(e) {
        this.progressBar.setValue(0), this.showFormProgressBarAfterDelay();
      }
      formSubmissionFinished(e) {
        this.progressBar.setValue(1), this.hideFormProgressBar();
      }
      showVisitProgressBarAfterDelay() {
        this.visitProgressBarTimeout = window.setTimeout(
          this.showProgressBar,
          this.session.progressBarDelay
        );
      }
      hideVisitProgressBar() {
        this.progressBar.hide(),
          null != this.visitProgressBarTimeout &&
            (window.clearTimeout(this.visitProgressBarTimeout),
            delete this.visitProgressBarTimeout);
      }
      showFormProgressBarAfterDelay() {
        null == this.formProgressBarTimeout &&
          (this.formProgressBarTimeout = window.setTimeout(
            this.showProgressBar,
            this.session.progressBarDelay
          ));
      }
      hideFormProgressBar() {
        this.progressBar.hide(),
          null != this.formProgressBarTimeout &&
            (window.clearTimeout(this.formProgressBarTimeout),
            delete this.formProgressBarTimeout);
      }
      reload() {
        window.location.reload();
      }
      get navigator() {
        return this.session.navigator;
      }
    }
    class X {
      constructor() {
        this.started = !1;
      }
      start() {
        this.started ||
          ((this.started = !0),
          addEventListener("turbo:before-cache", this.removeStaleElements, !1));
      }
      stop() {
        this.started &&
          ((this.started = !1),
          removeEventListener(
            "turbo:before-cache",
            this.removeStaleElements,
            !1
          ));
      }
      removeStaleElements() {
        const e = [...document.querySelectorAll('[data-turbo-cache="false"]')];
        for (const t of e) t.remove();
      }
    }
    class Y {
      constructor(e) {
        (this.started = !1),
          (this.submitCaptured = () => {
            removeEventListener("submit", this.submitBubbled, !1),
              addEventListener("submit", this.submitBubbled, !1);
          }),
          (this.submitBubbled = (e) => {
            if (!e.defaultPrevented) {
              const t = e.target instanceof HTMLFormElement ? e.target : void 0,
                s = e.submitter || void 0;
              if (t) {
                "dialog" !=
                  ((null == s ? void 0 : s.getAttribute("formmethod")) ||
                    t.getAttribute("method")) &&
                  this.delegate.willSubmitForm(t, s) &&
                  (e.preventDefault(), this.delegate.formSubmitted(t, s));
              }
            }
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          (addEventListener("submit", this.submitCaptured, !0),
          (this.started = !0));
      }
      stop() {
        this.started &&
          (removeEventListener("submit", this.submitCaptured, !0),
          (this.started = !1));
      }
    }
    class Z {
      constructor(e) {
        (this.element = e),
          (this.linkInterceptor = new O(this, e)),
          (this.formInterceptor = new B(this, e));
      }
      start() {
        this.linkInterceptor.start(), this.formInterceptor.start();
      }
      stop() {
        this.linkInterceptor.stop(), this.formInterceptor.stop();
      }
      shouldInterceptLinkClick(e, t) {
        return this.shouldRedirect(e);
      }
      linkClickIntercepted(e, t) {
        const s = this.findFrameElement(e);
        s && s.delegate.linkClickIntercepted(e, t);
      }
      shouldInterceptFormSubmission(e, t) {
        return this.shouldSubmit(e, t);
      }
      formSubmissionIntercepted(e, t) {
        const s = this.findFrameElement(e, t);
        s &&
          (s.removeAttribute("reloadable"),
          s.delegate.formSubmissionIntercepted(e, t));
      }
      shouldSubmit(e, t) {
        var s;
        const i = u(e, t),
          r = this.element.ownerDocument.querySelector(
            'meta[name="turbo-root"]'
          ),
          n = d(
            null !== (s = null == r ? void 0 : r.content) && void 0 !== s
              ? s
              : "/"
          );
        return this.shouldRedirect(e, t) && g(i, n);
      }
      shouldRedirect(e, t) {
        const s = this.findFrameElement(e, t);
        return !!s && s != e.closest("turbo-frame");
      }
      findFrameElement(e, t) {
        const s =
          (null == t ? void 0 : t.getAttribute("data-turbo-frame")) ||
          e.getAttribute("data-turbo-frame");
        if (s && "_top" != s) {
          const e = this.element.querySelector(`#${s}:not([disabled])`);
          if (e instanceof c) return e;
        }
      }
    }
    class Q {
      constructor(e) {
        (this.restorationIdentifier = C()),
          (this.restorationData = {}),
          (this.started = !1),
          (this.pageLoaded = !1),
          (this.onPopState = (e) => {
            if (this.shouldHandlePopState()) {
              const { turbo: t } = e.state || {};
              if (t) {
                this.location = new URL(window.location.href);
                const { restorationIdentifier: e } = t;
                (this.restorationIdentifier = e),
                  this.delegate.historyPoppedToLocationWithRestorationIdentifier(
                    this.location,
                    e
                  );
              }
            }
          }),
          (this.onPageLoad = async (e) => {
            await Promise.resolve(), (this.pageLoaded = !0);
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          (addEventListener("popstate", this.onPopState, !1),
          addEventListener("load", this.onPageLoad, !1),
          (this.started = !0),
          this.replace(new URL(window.location.href)));
      }
      stop() {
        this.started &&
          (removeEventListener("popstate", this.onPopState, !1),
          removeEventListener("load", this.onPageLoad, !1),
          (this.started = !1));
      }
      push(e, t) {
        this.update(history.pushState, e, t);
      }
      replace(e, t) {
        this.update(history.replaceState, e, t);
      }
      update(e, t, s = C()) {
        const i = { turbo: { restorationIdentifier: s } };
        e.call(history, i, "", t.href),
          (this.location = t),
          (this.restorationIdentifier = s);
      }
      getRestorationDataForIdentifier(e) {
        return this.restorationData[e] || {};
      }
      updateRestorationData(e) {
        const { restorationIdentifier: t } = this,
          s = this.restorationData[t];
        this.restorationData[t] = Object.assign(Object.assign({}, s), e);
      }
      assumeControlOfScrollRestoration() {
        var e;
        this.previousScrollRestoration ||
          ((this.previousScrollRestoration =
            null !== (e = history.scrollRestoration) && void 0 !== e
              ? e
              : "auto"),
          (history.scrollRestoration = "manual"));
      }
      relinquishControlOfScrollRestoration() {
        this.previousScrollRestoration &&
          ((history.scrollRestoration = this.previousScrollRestoration),
          delete this.previousScrollRestoration);
      }
      shouldHandlePopState() {
        return this.pageIsLoaded();
      }
      pageIsLoaded() {
        return this.pageLoaded || "complete" == document.readyState;
      }
    }
    class ee {
      constructor(e) {
        (this.started = !1),
          (this.clickCaptured = () => {
            removeEventListener("click", this.clickBubbled, !1),
              addEventListener("click", this.clickBubbled, !1);
          }),
          (this.clickBubbled = (e) => {
            if (this.clickEventIsSignificant(e)) {
              const t = (e.composedPath && e.composedPath()[0]) || e.target,
                s = this.findLinkFromClickTarget(t);
              if (s) {
                const t = this.getLocationForLink(s);
                this.delegate.willFollowLinkToLocation(s, t) &&
                  (e.preventDefault(),
                  this.delegate.followedLinkToLocation(s, t));
              }
            }
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          (addEventListener("click", this.clickCaptured, !0),
          (this.started = !0));
      }
      stop() {
        this.started &&
          (removeEventListener("click", this.clickCaptured, !0),
          (this.started = !1));
      }
      clickEventIsSignificant(e) {
        return !(
          (e.target && e.target.isContentEditable) ||
          e.defaultPrevented ||
          e.which > 1 ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey
        );
      }
      findLinkFromClickTarget(e) {
        if (e instanceof Element)
          return e.closest("a[href]:not([target^=_]):not([download])");
      }
      getLocationForLink(e) {
        return d(e.getAttribute("href") || "");
      }
    }
    function te(e) {
      return "advance" == e || "replace" == e || "restore" == e;
    }
    class se {
      constructor(e) {
        this.delegate = e;
      }
      proposeVisit(e, t = {}) {
        this.delegate.allowsVisitingLocationWithAction(e, t.action) &&
          (g(e, this.view.snapshot.rootLocation)
            ? this.delegate.visitProposedToLocation(e, t)
            : (window.location.href = e.toString()));
      }
      startVisit(e, t, s = {}) {
        this.stop(),
          (this.currentVisit = new z(
            this,
            d(e),
            t,
            Object.assign({ referrer: this.location }, s)
          )),
          this.currentVisit.start();
      }
      submitForm(e, t) {
        this.stop(),
          (this.formSubmission = new A(this, e, t, !0)),
          this.formSubmission.start();
      }
      stop() {
        this.formSubmission &&
          (this.formSubmission.stop(), delete this.formSubmission),
          this.currentVisit &&
            (this.currentVisit.cancel(), delete this.currentVisit);
      }
      get adapter() {
        return this.delegate.adapter;
      }
      get view() {
        return this.delegate.view;
      }
      get history() {
        return this.delegate.history;
      }
      formSubmissionStarted(e) {
        "function" == typeof this.adapter.formSubmissionStarted &&
          this.adapter.formSubmissionStarted(e);
      }
      async formSubmissionSucceededWithResponse(e, t) {
        if (e == this.formSubmission) {
          const s = await t.responseHTML;
          if (s) {
            e.method != r.get && this.view.clearSnapshotCache();
            const { statusCode: i, redirected: n } = t,
              o = {
                action: this.getActionForFormSubmission(e),
                response: { statusCode: i, responseHTML: s, redirected: n },
              };
            this.proposeVisit(t.location, o);
          }
        }
      }
      async formSubmissionFailedWithResponse(e, t) {
        const s = await t.responseHTML;
        if (s) {
          const e = V.fromHTMLString(s);
          t.serverError
            ? await this.view.renderError(e)
            : await this.view.renderPage(e),
            this.view.scrollToTop(),
            this.view.clearSnapshotCache();
        }
      }
      formSubmissionErrored(e, t) {
        console.error(t);
      }
      formSubmissionFinished(e) {
        "function" == typeof this.adapter.formSubmissionFinished &&
          this.adapter.formSubmissionFinished(e);
      }
      visitStarted(e) {
        this.delegate.visitStarted(e);
      }
      visitCompleted(e) {
        this.delegate.visitCompleted(e);
      }
      locationWithActionIsSamePage(e, t) {
        const s = h(e),
          i = h(this.view.lastRenderedLocation),
          r = "restore" === t && void 0 === s;
        return (
          "replace" !== t &&
          f(e) === f(this.view.lastRenderedLocation) &&
          (r || (null != s && s !== i))
        );
      }
      visitScrolledToSamePageLocation(e, t) {
        this.delegate.visitScrolledToSamePageLocation(e, t);
      }
      get location() {
        return this.history.location;
      }
      get restorationIdentifier() {
        return this.history.restorationIdentifier;
      }
      getActionForFormSubmission(e) {
        const { formElement: t, submitter: s } = e,
          i = $("data-turbo-action", s, t);
        return te(i) ? i : "advance";
      }
    }
    !(function (e) {
      (e[(e.initial = 0)] = "initial"),
        (e[(e.loading = 1)] = "loading"),
        (e[(e.interactive = 2)] = "interactive"),
        (e[(e.complete = 3)] = "complete");
    })(J || (J = {}));
    class ie {
      constructor(e) {
        (this.stage = J.initial),
          (this.started = !1),
          (this.interpretReadyState = () => {
            const { readyState: e } = this;
            "interactive" == e
              ? this.pageIsInteractive()
              : "complete" == e && this.pageIsComplete();
          }),
          (this.pageWillUnload = () => {
            this.delegate.pageWillUnload();
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          (this.stage == J.initial && (this.stage = J.loading),
          document.addEventListener(
            "readystatechange",
            this.interpretReadyState,
            !1
          ),
          addEventListener("pagehide", this.pageWillUnload, !1),
          (this.started = !0));
      }
      stop() {
        this.started &&
          (document.removeEventListener(
            "readystatechange",
            this.interpretReadyState,
            !1
          ),
          removeEventListener("pagehide", this.pageWillUnload, !1),
          (this.started = !1));
      }
      pageIsInteractive() {
        this.stage == J.loading &&
          ((this.stage = J.interactive), this.delegate.pageBecameInteractive());
      }
      pageIsComplete() {
        this.pageIsInteractive(),
          this.stage == J.interactive &&
            ((this.stage = J.complete), this.delegate.pageLoaded());
      }
      get readyState() {
        return document.readyState;
      }
    }
    class re {
      constructor(e) {
        (this.started = !1),
          (this.onScroll = () => {
            this.updatePosition({
              x: window.pageXOffset,
              y: window.pageYOffset,
            });
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          (addEventListener("scroll", this.onScroll, !1),
          this.onScroll(),
          (this.started = !0));
      }
      stop() {
        this.started &&
          (removeEventListener("scroll", this.onScroll, !1),
          (this.started = !1));
      }
      updatePosition(e) {
        this.delegate.scrollPositionChanged(e);
      }
    }
    class ne {
      constructor(e) {
        (this.sources = new Set()),
          (this.started = !1),
          (this.inspectFetchResponse = (e) => {
            const t = (function (e) {
              var t;
              const s =
                null === (t = e.detail) || void 0 === t
                  ? void 0
                  : t.fetchResponse;
              if (s instanceof b) return s;
            })(e);
            t &&
              (function (e) {
                var t;
                return (
                  null !== (t = e.contentType) && void 0 !== t ? t : ""
                ).startsWith(k.contentType);
              })(t) &&
              (e.preventDefault(), this.receiveMessageResponse(t));
          }),
          (this.receiveMessageEvent = (e) => {
            this.started &&
              "string" == typeof e.data &&
              this.receiveMessageHTML(e.data);
          }),
          (this.delegate = e);
      }
      start() {
        this.started ||
          ((this.started = !0),
          addEventListener(
            "turbo:before-fetch-response",
            this.inspectFetchResponse,
            !1
          ));
      }
      stop() {
        this.started &&
          ((this.started = !1),
          removeEventListener(
            "turbo:before-fetch-response",
            this.inspectFetchResponse,
            !1
          ));
      }
      connectStreamSource(e) {
        this.streamSourceIsConnected(e) ||
          (this.sources.add(e),
          e.addEventListener("message", this.receiveMessageEvent, !1));
      }
      disconnectStreamSource(e) {
        this.streamSourceIsConnected(e) &&
          (this.sources.delete(e),
          e.removeEventListener("message", this.receiveMessageEvent, !1));
      }
      streamSourceIsConnected(e) {
        return this.sources.has(e);
      }
      async receiveMessageResponse(e) {
        const t = await e.responseHTML;
        t && this.receiveMessageHTML(t);
      }
      receiveMessageHTML(e) {
        this.delegate.receivedMessageFromStream(new k(e));
      }
    }
    class oe extends H {
      async render() {
        this.replaceHeadAndBody(), this.activateScriptElements();
      }
      replaceHeadAndBody() {
        const { documentElement: e, head: t, body: s } = document;
        e.replaceChild(this.newHead, t), e.replaceChild(this.newElement, s);
      }
      activateScriptElements() {
        for (const e of this.scriptElements) {
          const t = e.parentNode;
          if (t) {
            const s = this.createScriptElement(e);
            t.replaceChild(s, e);
          }
        }
      }
      get newHead() {
        return this.newSnapshot.headSnapshot.element;
      }
      get scriptElements() {
        return [...document.documentElement.querySelectorAll("script")];
      }
    }
    class ae extends H {
      get shouldRender() {
        return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
      }
      prepareToRender() {
        this.mergeHead();
      }
      async render() {
        this.willRender && this.replaceBody();
      }
      finishRendering() {
        super.finishRendering(),
          this.isPreview || this.focusFirstAutofocusableElement();
      }
      get currentHeadSnapshot() {
        return this.currentSnapshot.headSnapshot;
      }
      get newHeadSnapshot() {
        return this.newSnapshot.headSnapshot;
      }
      get newElement() {
        return this.newSnapshot.element;
      }
      mergeHead() {
        this.copyNewHeadStylesheetElements(),
          this.copyNewHeadScriptElements(),
          this.removeCurrentHeadProvisionalElements(),
          this.copyNewHeadProvisionalElements();
      }
      replaceBody() {
        this.preservingPermanentElements(() => {
          this.activateNewBody(), this.assignNewBody();
        });
      }
      get trackedElementsAreIdentical() {
        return (
          this.currentHeadSnapshot.trackedElementSignature ==
          this.newHeadSnapshot.trackedElementSignature
        );
      }
      copyNewHeadStylesheetElements() {
        for (const e of this.newHeadStylesheetElements)
          document.head.appendChild(e);
      }
      copyNewHeadScriptElements() {
        for (const e of this.newHeadScriptElements)
          document.head.appendChild(this.createScriptElement(e));
      }
      removeCurrentHeadProvisionalElements() {
        for (const e of this.currentHeadProvisionalElements)
          document.head.removeChild(e);
      }
      copyNewHeadProvisionalElements() {
        for (const e of this.newHeadProvisionalElements)
          document.head.appendChild(e);
      }
      activateNewBody() {
        document.adoptNode(this.newElement),
          this.activateNewBodyScriptElements();
      }
      activateNewBodyScriptElements() {
        for (const e of this.newBodyScriptElements) {
          const t = this.createScriptElement(e);
          e.replaceWith(t);
        }
      }
      assignNewBody() {
        document.body && this.newElement instanceof HTMLBodyElement
          ? document.body.replaceWith(this.newElement)
          : document.documentElement.appendChild(this.newElement);
      }
      get newHeadStylesheetElements() {
        return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(
          this.currentHeadSnapshot
        );
      }
      get newHeadScriptElements() {
        return this.newHeadSnapshot.getScriptElementsNotInSnapshot(
          this.currentHeadSnapshot
        );
      }
      get currentHeadProvisionalElements() {
        return this.currentHeadSnapshot.provisionalElements;
      }
      get newHeadProvisionalElements() {
        return this.newHeadSnapshot.provisionalElements;
      }
      get newBodyScriptElements() {
        return this.newElement.querySelectorAll("script");
      }
    }
    class le {
      constructor(e) {
        (this.keys = []), (this.snapshots = {}), (this.size = e);
      }
      has(e) {
        return v(e) in this.snapshots;
      }
      get(e) {
        if (this.has(e)) {
          const t = this.read(e);
          return this.touch(e), t;
        }
      }
      put(e, t) {
        return this.write(e, t), this.touch(e), t;
      }
      clear() {
        this.snapshots = {};
      }
      read(e) {
        return this.snapshots[v(e)];
      }
      write(e, t) {
        this.snapshots[v(e)] = t;
      }
      touch(e) {
        const t = v(e),
          s = this.keys.indexOf(t);
        s > -1 && this.keys.splice(s, 1), this.keys.unshift(t), this.trim();
      }
      trim() {
        for (const e of this.keys.splice(this.size)) delete this.snapshots[e];
      }
    }
    class ce extends I {
      constructor() {
        super(...arguments),
          (this.snapshotCache = new le(10)),
          (this.lastRenderedLocation = new URL(location.href));
      }
      renderPage(e, t = !1, s = !0) {
        const i = new ae(this.snapshot, e, t, s);
        return this.render(i);
      }
      renderError(e) {
        const t = new oe(this.snapshot, e, !1);
        return this.render(t);
      }
      clearSnapshotCache() {
        this.snapshotCache.clear();
      }
      async cacheSnapshot() {
        if (this.shouldCacheSnapshot) {
          this.delegate.viewWillCacheSnapshot();
          const { snapshot: e, lastRenderedLocation: t } = this;
          await new Promise((e) => setTimeout(() => e(), 0));
          const s = e.clone();
          return this.snapshotCache.put(t, s), s;
        }
      }
      getCachedSnapshotForLocation(e) {
        return this.snapshotCache.get(e);
      }
      get snapshot() {
        return V.fromElement(this.element);
      }
      get shouldCacheSnapshot() {
        return this.snapshot.isCacheable;
      }
    }
    function de(e) {
      Object.defineProperties(e, he);
    }
    const he = {
        absoluteURL: {
          get() {
            return this.toString();
          },
        },
      },
      ue = new (class {
        constructor() {
          (this.navigator = new se(this)),
            (this.history = new Q(this)),
            (this.view = new ce(this, document.documentElement)),
            (this.adapter = new G(this)),
            (this.pageObserver = new ie(this)),
            (this.cacheObserver = new X()),
            (this.linkClickObserver = new ee(this)),
            (this.formSubmitObserver = new Y(this)),
            (this.scrollObserver = new re(this)),
            (this.streamObserver = new ne(this)),
            (this.frameRedirector = new Z(document.documentElement)),
            (this.drive = !0),
            (this.enabled = !0),
            (this.progressBarDelay = 500),
            (this.started = !1);
        }
        start() {
          this.started ||
            (this.pageObserver.start(),
            this.cacheObserver.start(),
            this.linkClickObserver.start(),
            this.formSubmitObserver.start(),
            this.scrollObserver.start(),
            this.streamObserver.start(),
            this.frameRedirector.start(),
            this.history.start(),
            (this.started = !0),
            (this.enabled = !0));
        }
        disable() {
          this.enabled = !1;
        }
        stop() {
          this.started &&
            (this.pageObserver.stop(),
            this.cacheObserver.stop(),
            this.linkClickObserver.stop(),
            this.formSubmitObserver.stop(),
            this.scrollObserver.stop(),
            this.streamObserver.stop(),
            this.frameRedirector.stop(),
            this.history.stop(),
            (this.started = !1));
        }
        registerAdapter(e) {
          this.adapter = e;
        }
        visit(e, t = {}) {
          this.navigator.proposeVisit(d(e), t);
        }
        connectStreamSource(e) {
          this.streamObserver.connectStreamSource(e);
        }
        disconnectStreamSource(e) {
          this.streamObserver.disconnectStreamSource(e);
        }
        renderStreamMessage(e) {
          document.documentElement.appendChild(k.wrap(e).fragment);
        }
        clearCache() {
          this.view.clearSnapshotCache();
        }
        setProgressBarDelay(e) {
          this.progressBarDelay = e;
        }
        get location() {
          return this.history.location;
        }
        get restorationIdentifier() {
          return this.history.restorationIdentifier;
        }
        historyPoppedToLocationWithRestorationIdentifier(e, t) {
          this.enabled
            ? this.navigator.startVisit(e, t, {
                action: "restore",
                historyChanged: !0,
              })
            : this.adapter.pageInvalidated();
        }
        scrollPositionChanged(e) {
          this.history.updateRestorationData({ scrollPosition: e });
        }
        willFollowLinkToLocation(e, t) {
          return (
            this.elementDriveEnabled(e) &&
            g(t, this.snapshot.rootLocation) &&
            this.applicationAllowsFollowingLinkToLocation(e, t)
          );
        }
        followedLinkToLocation(e, t) {
          const s = this.getActionForLink(e);
          this.convertLinkWithMethodClickToFormSubmission(e) ||
            this.visit(t.href, { action: s });
        }
        convertLinkWithMethodClickToFormSubmission(e) {
          const t = e.getAttribute("data-turbo-method");
          if (t) {
            const s = document.createElement("form");
            (s.method = t),
              (s.action = e.getAttribute("href") || "undefined"),
              (s.hidden = !0),
              e.hasAttribute("data-turbo-confirm") &&
                s.setAttribute(
                  "data-turbo-confirm",
                  e.getAttribute("data-turbo-confirm")
                );
            const i = this.getTargetFrameForLink(e);
            return (
              i
                ? (s.setAttribute("data-turbo-frame", i),
                  s.addEventListener("turbo:submit-start", () => s.remove()))
                : s.addEventListener("submit", () => s.remove()),
              document.body.appendChild(s),
              w("submit", { cancelable: !0, target: s })
            );
          }
          return !1;
        }
        allowsVisitingLocationWithAction(e, t) {
          return (
            this.locationWithActionIsSamePage(e, t) ||
            this.applicationAllowsVisitingLocation(e)
          );
        }
        visitProposedToLocation(e, t) {
          de(e), this.adapter.visitProposedToLocation(e, t);
        }
        visitStarted(e) {
          de(e.location),
            e.silent ||
              this.notifyApplicationAfterVisitingLocation(e.location, e.action);
        }
        visitCompleted(e) {
          this.notifyApplicationAfterPageLoad(e.getTimingMetrics());
        }
        locationWithActionIsSamePage(e, t) {
          return this.navigator.locationWithActionIsSamePage(e, t);
        }
        visitScrolledToSamePageLocation(e, t) {
          this.notifyApplicationAfterVisitingSamePageLocation(e, t);
        }
        willSubmitForm(e, t) {
          const s = u(e, t);
          return (
            this.elementDriveEnabled(e) &&
            (!t || this.elementDriveEnabled(t)) &&
            g(d(s), this.snapshot.rootLocation)
          );
        }
        formSubmitted(e, t) {
          this.navigator.submitForm(e, t);
        }
        pageBecameInteractive() {
          (this.view.lastRenderedLocation = this.location),
            this.notifyApplicationAfterPageLoad();
        }
        pageLoaded() {
          this.history.assumeControlOfScrollRestoration();
        }
        pageWillUnload() {
          this.history.relinquishControlOfScrollRestoration();
        }
        receivedMessageFromStream(e) {
          this.renderStreamMessage(e);
        }
        viewWillCacheSnapshot() {
          var e;
          (null === (e = this.navigator.currentVisit) || void 0 === e
            ? void 0
            : e.silent) || this.notifyApplicationBeforeCachingSnapshot();
        }
        allowsImmediateRender({ element: e }, t) {
          return !this.notifyApplicationBeforeRender(e, t).defaultPrevented;
        }
        viewRenderedSnapshot(e, t) {
          (this.view.lastRenderedLocation = this.history.location),
            this.notifyApplicationAfterRender();
        }
        viewInvalidated() {
          this.adapter.pageInvalidated();
        }
        frameLoaded(e) {
          this.notifyApplicationAfterFrameLoad(e);
        }
        frameRendered(e, t) {
          this.notifyApplicationAfterFrameRender(e, t);
        }
        applicationAllowsFollowingLinkToLocation(e, t) {
          return !this.notifyApplicationAfterClickingLinkToLocation(e, t)
            .defaultPrevented;
        }
        applicationAllowsVisitingLocation(e) {
          return !this.notifyApplicationBeforeVisitingLocation(e)
            .defaultPrevented;
        }
        notifyApplicationAfterClickingLinkToLocation(e, t) {
          return w("turbo:click", {
            target: e,
            detail: { url: t.href },
            cancelable: !0,
          });
        }
        notifyApplicationBeforeVisitingLocation(e) {
          return w("turbo:before-visit", {
            detail: { url: e.href },
            cancelable: !0,
          });
        }
        notifyApplicationAfterVisitingLocation(e, t) {
          return (
            L(document.documentElement),
            w("turbo:visit", { detail: { url: e.href, action: t } })
          );
        }
        notifyApplicationBeforeCachingSnapshot() {
          return w("turbo:before-cache");
        }
        notifyApplicationBeforeRender(e, t) {
          return w("turbo:before-render", {
            detail: { newBody: e, resume: t },
            cancelable: !0,
          });
        }
        notifyApplicationAfterRender() {
          return w("turbo:render");
        }
        notifyApplicationAfterPageLoad(e = {}) {
          return (
            T(document.documentElement),
            w("turbo:load", { detail: { url: this.location.href, timing: e } })
          );
        }
        notifyApplicationAfterVisitingSamePageLocation(e, t) {
          dispatchEvent(
            new HashChangeEvent("hashchange", {
              oldURL: e.toString(),
              newURL: t.toString(),
            })
          );
        }
        notifyApplicationAfterFrameLoad(e) {
          return w("turbo:frame-load", { target: e });
        }
        notifyApplicationAfterFrameRender(e, t) {
          return w("turbo:frame-render", {
            detail: { fetchResponse: e },
            target: t,
            cancelable: !0,
          });
        }
        elementDriveEnabled(e) {
          const t = null == e ? void 0 : e.closest("[data-turbo]");
          return this.drive
            ? !t || "false" != t.getAttribute("data-turbo")
            : !!t && "true" == t.getAttribute("data-turbo");
        }
        getActionForLink(e) {
          const t = e.getAttribute("data-turbo-action");
          return te(t) ? t : "advance";
        }
        getTargetFrameForLink(e) {
          const t = e.getAttribute("data-turbo-frame");
          if (t) return t;
          {
            const t = e.closest("turbo-frame");
            if (t) return t.id;
          }
        }
        get snapshot() {
          return this.view.snapshot;
        }
      })(),
      { navigator: me } = ue;
    function pe() {
      ue.start();
    }
    function ge(e) {
      ue.registerAdapter(e);
    }
    function fe(e, t) {
      ue.visit(e, t);
    }
    function ve(e) {
      ue.connectStreamSource(e);
    }
    function be(e) {
      ue.disconnectStreamSource(e);
    }
    function we(e) {
      ue.renderStreamMessage(e);
    }
    function ye() {
      ue.clearCache();
    }
    function Se(e) {
      ue.setProgressBarDelay(e);
    }
    function Ee(e) {
      A.confirmMethod = e;
    }
    var Ce = Object.freeze({
      __proto__: null,
      navigator: me,
      session: ue,
      PageRenderer: ae,
      PageSnapshot: V,
      start: pe,
      registerAdapter: ge,
      visit: fe,
      connectStreamSource: ve,
      disconnectStreamSource: be,
      renderStreamMessage: we,
      clearCache: ye,
      setProgressBarDelay: Se,
      setConfirmMethod: Ee,
    });
    class $e {
      constructor(e) {
        (this.visitCachedSnapshot = ({ element: e }) => {
          var t;
          const { id: s, clone: i } = this;
          null === (t = e.querySelector("#" + s)) ||
            void 0 === t ||
            t.replaceWith(i);
        }),
          (this.clone = e.cloneNode(!0)),
          (this.id = e.id);
      }
    }
    function Le(e) {
      if (null != e) {
        const t = document.getElementById(e);
        if (t instanceof c) return t;
      }
    }
    function Te(e, t) {
      if (e) {
        const i = e.getAttribute("src");
        if (null != i && null != t && ((s = t), d(i).href == d(s).href))
          throw new Error(
            `Matching <turbo-frame id="${e.id}"> element has a source URL which references itself`
          );
        if (
          (e.ownerDocument !== document && (e = document.importNode(e, !0)),
          e instanceof c)
        )
          return e.connectedCallback(), e.disconnectedCallback(), e;
      }
      var s;
    }
    const Re = {
      after() {
        this.targetElements.forEach((e) => {
          var t;
          return null === (t = e.parentElement) || void 0 === t
            ? void 0
            : t.insertBefore(this.templateContent, e.nextSibling);
        });
      },
      append() {
        this.removeDuplicateTargetChildren(),
          this.targetElements.forEach((e) => e.append(this.templateContent));
      },
      before() {
        this.targetElements.forEach((e) => {
          var t;
          return null === (t = e.parentElement) || void 0 === t
            ? void 0
            : t.insertBefore(this.templateContent, e);
        });
      },
      prepend() {
        this.removeDuplicateTargetChildren(),
          this.targetElements.forEach((e) => e.prepend(this.templateContent));
      },
      remove() {
        this.targetElements.forEach((e) => e.remove());
      },
      replace() {
        this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
      },
      update() {
        this.targetElements.forEach((e) => {
          (e.innerHTML = ""), e.append(this.templateContent);
        });
      },
    };
    class Fe extends HTMLElement {
      async connectedCallback() {
        try {
          await this.render();
        } catch (e) {
          console.error(e);
        } finally {
          this.disconnect();
        }
      }
      async render() {
        var e;
        return null !== (e = this.renderPromise) && void 0 !== e
          ? e
          : (this.renderPromise = (async () => {
              this.dispatchEvent(this.beforeRenderEvent) &&
                (await y(), this.performAction());
            })());
      }
      disconnect() {
        try {
          this.remove();
        } catch (e) {}
      }
      removeDuplicateTargetChildren() {
        this.duplicateChildren.forEach((e) => e.remove());
      }
      get duplicateChildren() {
        var e;
        const t = this.targetElements
            .flatMap((e) => [...e.children])
            .filter((e) => !!e.id),
          s = [
            ...(null === (e = this.templateContent) || void 0 === e
              ? void 0
              : e.children),
          ]
            .filter((e) => !!e.id)
            .map((e) => e.id);
        return t.filter((e) => s.includes(e.id));
      }
      get performAction() {
        if (this.action) {
          const e = Re[this.action];
          if (e) return e;
          this.raise("unknown action");
        }
        this.raise("action attribute is missing");
      }
      get targetElements() {
        return this.target
          ? this.targetElementsById
          : this.targets
          ? this.targetElementsByQuery
          : void this.raise("target or targets attribute is missing");
      }
      get templateContent() {
        return this.templateElement.content.cloneNode(!0);
      }
      get templateElement() {
        if (this.firstElementChild instanceof HTMLTemplateElement)
          return this.firstElementChild;
        this.raise("first child element must be a <template> element");
      }
      get action() {
        return this.getAttribute("action");
      }
      get target() {
        return this.getAttribute("target");
      }
      get targets() {
        return this.getAttribute("targets");
      }
      raise(e) {
        throw new Error(`${this.description}: ${e}`);
      }
      get description() {
        var e, t;
        return null !==
          (t = (
            null !== (e = this.outerHTML.match(/<[^>]+>/)) && void 0 !== e
              ? e
              : []
          )[0]) && void 0 !== t
          ? t
          : "<turbo-stream>";
      }
      get beforeRenderEvent() {
        return new CustomEvent("turbo:before-stream-render", {
          bubbles: !0,
          cancelable: !0,
        });
      }
      get targetElementsById() {
        var e;
        const t =
          null === (e = this.ownerDocument) || void 0 === e
            ? void 0
            : e.getElementById(this.target);
        return null !== t ? [t] : [];
      }
      get targetElementsByQuery() {
        var e;
        const t =
          null === (e = this.ownerDocument) || void 0 === e
            ? void 0
            : e.querySelectorAll(this.targets);
        return 0 !== t.length ? Array.prototype.slice.call(t) : [];
      }
    }
    (c.delegateConstructor = class {
      constructor(e) {
        (this.fetchResponseLoaded = (e) => {}),
          (this.currentFetchRequest = null),
          (this.resolveVisitPromise = () => {}),
          (this.connected = !1),
          (this.hasBeenLoaded = !1),
          (this.settingSourceURL = !1),
          (this.element = e),
          (this.view = new x(this, this.element)),
          (this.appearanceObserver = new F(this, this.element)),
          (this.linkInterceptor = new O(this, this.element)),
          (this.formInterceptor = new B(this, this.element));
      }
      connect() {
        this.connected ||
          ((this.connected = !0),
          (this.reloadable = !1),
          this.loadingStyle == i.lazy && this.appearanceObserver.start(),
          this.linkInterceptor.start(),
          this.formInterceptor.start(),
          this.sourceURLChanged());
      }
      disconnect() {
        this.connected &&
          ((this.connected = !1),
          this.appearanceObserver.stop(),
          this.linkInterceptor.stop(),
          this.formInterceptor.stop());
      }
      disabledChanged() {
        this.loadingStyle == i.eager && this.loadSourceURL();
      }
      sourceURLChanged() {
        (this.loadingStyle == i.eager || this.hasBeenLoaded) &&
          this.loadSourceURL();
      }
      loadingStyleChanged() {
        this.loadingStyle == i.lazy
          ? this.appearanceObserver.start()
          : (this.appearanceObserver.stop(), this.loadSourceURL());
      }
      async loadSourceURL() {
        if (
          !this.settingSourceURL &&
          this.enabled &&
          this.isActive &&
          (this.reloadable || this.sourceURL != this.currentURL)
        ) {
          const e = this.currentURL;
          if (((this.currentURL = this.sourceURL), this.sourceURL))
            try {
              (this.element.loaded = this.visit(d(this.sourceURL))),
                this.appearanceObserver.stop(),
                await this.element.loaded,
                (this.hasBeenLoaded = !0);
            } catch (t) {
              throw ((this.currentURL = e), t);
            }
        }
      }
      async loadResponse(e) {
        (e.redirected || (e.succeeded && e.isHTML)) &&
          (this.sourceURL = e.response.url);
        try {
          const t = await e.responseHTML;
          if (t) {
            const { body: s } = S(t),
              i = new M(await this.extractForeignFrameElement(s)),
              r = new N(this.view.snapshot, i, !1, !1);
            this.view.renderPromise && (await this.view.renderPromise),
              await this.view.render(r),
              ue.frameRendered(e, this.element),
              ue.frameLoaded(this.element),
              this.fetchResponseLoaded(e);
          }
        } catch (e) {
          console.error(e), this.view.invalidate();
        } finally {
          this.fetchResponseLoaded = () => {};
        }
      }
      elementAppearedInViewport(e) {
        this.loadSourceURL();
      }
      shouldInterceptLinkClick(e, t) {
        return (
          !e.hasAttribute("data-turbo-method") &&
          this.shouldInterceptNavigation(e)
        );
      }
      linkClickIntercepted(e, t) {
        (this.reloadable = !0), this.navigateFrame(e, t);
      }
      shouldInterceptFormSubmission(e, t) {
        return this.shouldInterceptNavigation(e, t);
      }
      formSubmissionIntercepted(e, t) {
        this.formSubmission && this.formSubmission.stop(),
          (this.reloadable = !1),
          (this.formSubmission = new A(this, e, t));
        const { fetchRequest: s } = this.formSubmission;
        this.prepareHeadersForRequest(s.headers, s),
          this.formSubmission.start();
      }
      prepareHeadersForRequest(e, t) {
        e["Turbo-Frame"] = this.id;
      }
      requestStarted(e) {
        L(this.element);
      }
      requestPreventedHandlingResponse(e, t) {
        this.resolveVisitPromise();
      }
      async requestSucceededWithResponse(e, t) {
        await this.loadResponse(t), this.resolveVisitPromise();
      }
      requestFailedWithResponse(e, t) {
        console.error(t), this.resolveVisitPromise();
      }
      requestErrored(e, t) {
        console.error(t), this.resolveVisitPromise();
      }
      requestFinished(e) {
        T(this.element);
      }
      formSubmissionStarted({ formElement: e }) {
        L(e, this.findFrameElement(e));
      }
      formSubmissionSucceededWithResponse(e, t) {
        const s = this.findFrameElement(e.formElement, e.submitter);
        this.proposeVisitIfNavigatedWithAction(s, e.formElement, e.submitter),
          s.delegate.loadResponse(t);
      }
      formSubmissionFailedWithResponse(e, t) {
        this.element.delegate.loadResponse(t);
      }
      formSubmissionErrored(e, t) {
        console.error(t);
      }
      formSubmissionFinished({ formElement: e }) {
        T(e, this.findFrameElement(e));
      }
      allowsImmediateRender(e, t) {
        return !0;
      }
      viewRenderedSnapshot(e, t) {}
      viewInvalidated() {}
      async visit(e) {
        var t;
        const s = new R(this, r.get, e, new URLSearchParams(), this.element);
        return (
          null === (t = this.currentFetchRequest) || void 0 === t || t.cancel(),
          (this.currentFetchRequest = s),
          new Promise((e) => {
            (this.resolveVisitPromise = () => {
              (this.resolveVisitPromise = () => {}),
                (this.currentFetchRequest = null),
                e();
            }),
              s.perform();
          })
        );
      }
      navigateFrame(e, t, s) {
        const i = this.findFrameElement(e, s);
        this.proposeVisitIfNavigatedWithAction(i, e, s),
          i.setAttribute("reloadable", ""),
          (i.src = t);
      }
      proposeVisitIfNavigatedWithAction(e, t, s) {
        const i = $("data-turbo-action", s, t, e);
        if (te(i)) {
          const { visitCachedSnapshot: t } = new $e(e);
          e.delegate.fetchResponseLoaded = (s) => {
            if (e.src) {
              const { statusCode: r, redirected: n } = s,
                o = {
                  statusCode: r,
                  redirected: n,
                  responseHTML: e.ownerDocument.documentElement.outerHTML,
                };
              ue.visit(e.src, {
                action: i,
                response: o,
                visitCachedSnapshot: t,
                willRender: !1,
              });
            }
          };
        }
      }
      findFrameElement(e, t) {
        var s;
        return null !==
          (s = Le(
            $("data-turbo-frame", t, e) || this.element.getAttribute("target")
          )) && void 0 !== s
          ? s
          : this.element;
      }
      async extractForeignFrameElement(e) {
        let t;
        const s = CSS.escape(this.id);
        try {
          if ((t = Te(e.querySelector(`turbo-frame#${s}`), this.currentURL)))
            return t;
          if (
            (t = Te(
              e.querySelector(`turbo-frame[src][recurse~=${s}]`),
              this.currentURL
            ))
          )
            return await t.loaded, await this.extractForeignFrameElement(t);
          console.error(
            `Response has no matching <turbo-frame id="${s}"> element`
          );
        } catch (e) {
          console.error(e);
        }
        return new c();
      }
      formActionIsVisitable(e, t) {
        return g(d(u(e, t)), this.rootLocation);
      }
      shouldInterceptNavigation(e, t) {
        const s =
          $("data-turbo-frame", t, e) || this.element.getAttribute("target");
        if (e instanceof HTMLFormElement && !this.formActionIsVisitable(e, t))
          return !1;
        if (!this.enabled || "_top" == s) return !1;
        if (s) {
          const e = Le(s);
          if (e) return !e.disabled;
        }
        return (
          !!ue.elementDriveEnabled(e) && !(t && !ue.elementDriveEnabled(t))
        );
      }
      get id() {
        return this.element.id;
      }
      get enabled() {
        return !this.element.disabled;
      }
      get sourceURL() {
        if (this.element.src) return this.element.src;
      }
      get reloadable() {
        return this.findFrameElement(this.element).hasAttribute("reloadable");
      }
      set reloadable(e) {
        const t = this.findFrameElement(this.element);
        e ? t.setAttribute("reloadable", "") : t.removeAttribute("reloadable");
      }
      set sourceURL(e) {
        (this.settingSourceURL = !0),
          (this.element.src = null != e ? e : null),
          (this.currentURL = this.element.src),
          (this.settingSourceURL = !1);
      }
      get loadingStyle() {
        return this.element.loading;
      }
      get isLoading() {
        return (
          void 0 !== this.formSubmission ||
          void 0 !== this.resolveVisitPromise()
        );
      }
      get isActive() {
        return this.element.isActive && this.connected;
      }
      get rootLocation() {
        var e;
        const t = this.element.ownerDocument.querySelector(
          'meta[name="turbo-root"]'
        );
        return d(
          null !== (e = null == t ? void 0 : t.content) && void 0 !== e
            ? e
            : "/"
        );
      }
    }),
      customElements.define("turbo-frame", c),
      customElements.define("turbo-stream", Fe),
      (() => {
        let e = document.currentScript;
        if (e && !e.hasAttribute("data-turbo-suppress-warning"))
          for (; (e = e.parentElement); )
            if (e == document.body)
              return console.warn(
                E`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
                e.outerHTML
              );
      })(),
      (window.Turbo = Ce),
      pe(),
      (window.Turbo = e),
      pe();
  })(),
    (() => {
      function e(e) {
        var t, s, i, r, n, o, a, l;
        e.querySelector(".previewImage").addEventListener(
          "click",
          function (e) {
            e.currentTarget,
              t ||
                (((t = document.createElement("span")).className = "drop"),
                this.appendChild(t));
            (t.className = "drop"),
              (s = getComputedStyle(this, null).getPropertyValue("width")),
              (i = getComputedStyle(this, null).getPropertyValue("height")),
              (r = Math.max(parseInt(s, 10), parseInt(i, 10))),
              (t.style.width = r + "px"),
              (t.style.height = r + "px"),
              (n = getComputedStyle(this, null).getPropertyValue("width")),
              (o = getComputedStyle(this, null).getPropertyValue("height")),
              (a = e.pageX - this.offsetLeft - parseInt(n, 10) / 2),
              (l = e.pageY - this.offsetTop - parseInt(o, 10) / 2 - 30),
              (t.style.top = l + "px"),
              (t.style.left = a + "px"),
              (t.className += " animate"),
              e.stopPropagation();
          }
        );
      }
      function t(e) {
        e.querySelector(".image-upload").addEventListener(
          "change",
          function (t) {
            !(function (t) {
              var s = /image.*/;
              if (!t.type.match(s)) throw "File Type is not match.";
              if (!t) throw "File not found.";
              !(function (t) {
                var s = e.querySelector(".previewImage"),
                  i = new FileReader();
                (i.onload = function (e) {
                  var t = new Image();
                  (t.src = e.target.result),
                    (t.onload = function () {
                      s.style.backgroundImage = "url(" + e.target.result + ")";
                    });
                }),
                  i.readAsDataURL(t);
              })(t);
            })(t.currentTarget.files[0]);
          }
        );
      }
      (window.listen = function (e, t, s) {
        $(document).on(e, t, s);
      }),
        (window.listenClick = function (e, t) {
          $(document).on("click", e, t);
        }),
        (window.listenSubmit = function (e, t) {
          $(document).on("submit", e, t);
        }),
        (window.listenHiddenBsModal = function (e, t) {
          $(document).on("hidden.bs.modal", e, t);
        }),
        (window.listenShowBsModal = function (e, t) {
          $(document).on("show.bs.modal", e, t);
        }),
        (window.listenChange = function (e, t) {
          $(document).on("change", e, t);
        }),
        (window.listenKeyup = function (e, t) {
          $(document).on("keyup", e, t);
        }),
        (window.listenWithOutTarget = function (e, t) {
          $(document).on(e, t);
        }),
        (window.IOInitImageComponent = function () {
          var s = document.querySelectorAll(".image-picker");
          if (s)
            for (var i = 0; i < s.length; i++) {
              var r = s[i];
              e(r), t(r);
            }
        }),
        (window.IOInitSidebar = function () {
          $(".sidebar-btn").click(function () {
            $("#sidebar").toggleClass("collapsed-menu"),
              $("body").toggleClass("collapsed-menu"),
              $(".aside-submenu").collapse("hide");
          }),
            $("#sidebar-overly").click(function () {
              $("#sidebar").toggleClass("collapsed-menu"),
                $("body").toggleClass("collapsed-menu");
            }),
            $(".header-btn").click(function () {
              $("#nav-header").addClass("show-nav"),
                $("body").addClass("show-nav");
            }),
            $("#nav-overly").click(function () {
              $("#nav-header").removeClass("show-nav"),
                $("body").removeClass("show-nav");
            }),
            $(".horizontal-menubar").click(function () {
              $(".horizontal-sidebar").toggleClass("collapsed-menu"),
                $("body").toggleClass("collapsed-menu");
            }),
            $("#horizontal-menubar-overly").click(function () {
              $(".horizontal-sidebar").toggleClass("collapsed-menu"),
                $("body").toggleClass("collapsed-menu");
            }),
            $(window).resize(function () {
              $(window).width() > 1200 &&
                $(".aside-collapse-btn").click(function () {
                  $("#sidebar").removeClass("collapsed-menu"),
                    $("body").removeClass("collapsed-menu");
                });
            });
        });
    })(),
    document.addEventListener("turbo:load", function () {
      if ($("#indexHomeData").length) {
        $(".search-categories").on("click", function () {
          $(".dropdown-menu").css("z-index", "100");
        }),
          $("body").click(function () {
            $("#jobsSearchResults").fadeOut();
          });
        var e = [],
          t = JSON.parse($("#indexHomeData").val());
        $.each(t, function (t, s) {
          e.push(s);
        }),
          $("#search-location").length &&
            $("#search-location").autocomplete({ source: e }),
          $(window).width(),
          $(".slick-slider").slick({
            dots: !1,
            arrows: !1,
            autoplay: !0,
            autoplayspeed: 1600,
            centerPadding: "0",
            slidesToShow: 6,
            slidesToScroll: 1,
            responsive: [
              { breakpoint: 1199, settings: { slidesToShow: 4 } },
              { breakpoint: 767, settings: { slidesToShow: 3 } },
              { breakpoint: 480, settings: { slidesToShow: 2 } },
            ],
          }),
          $(".testimonial-carousel").slick({
            dots: !0,
            autoplay: !0,
            autoplayspeed: 1600,
            centerPadding: "0",
            slidesToShow: 1,
            slidesToScroll: 1,
          }),
          $(".counter").each(function () {
            var e = $(this),
              t = e.attr("data-count");
            (countDuration = parseInt(e.attr("data-duration"))),
              $({ counter: e.text() }).animate(
                { counter: t },
                {
                  duration: countDuration,
                  easing: "linear",
                  step: function () {
                    e.text(Math.floor(this.counter));
                  },
                  complete: function () {
                    e.text(this.counter);
                  },
                }
              );
          }),
          $(window).width() > 1024 &&
            $("#brandingSlider .item").length < 6 &&
            $("#brandingSlider.owl-carousel .owl-stage-outer")
              .css("display", "flex")
              .css("justify-content", "center"),
          $("#brandingSlider .item").on("mouseover", function () {
            $(this).closest(".owl-carousel").trigger("stop.owl.autoplay");
          }),
          $("#brandingSlider .item").on("mouseout", function () {
            $(this).closest(".owl-carousel").trigger("play.owl.autoplay");
          }),
          $("#notices").on("mouseover", function () {
            this.stop();
          }),
          $("#notices").on("mouseout", function () {
            this.start();
          }),
          $("#search-keywords").on("keyup", function () {
            var e = $(this).val();
            "" != e
              ? $.ajax({
                  url: route("get.jobs.search"),
                  method: "GET",
                  data: { searchTerm: e },
                  success: function (e) {
                    $("#jobsSearchResults").fadeIn(),
                      $("#jobsSearchResults").html(e);
                  },
                })
              : $("#jobsSearchResults").fadeOut();
          }),
          listenClick("#jobsSearchResults ul li", function () {
            $("#search-keywords").val($(this).text()),
              $("#jobsSearchResults").fadeOut();
          }),
          $(".banner-carousel").slick({
            dots: !1,
            autoplay: !0,
            autoplayspeed: 1600,
            centerPadding: "0",
            slidesToShow: 1,
            slidesToScroll: 1,
          });
      }
    }),
    document.addEventListener("turbo:load", function () {
      ($("#addEmployerNewForm").length || $("#addCandidateNewForm").length) &&
        ($("#loginTab a").click(function (e) {
          e.preventDefault(), $(this).tab("show");
        }),
        $("ul.nav-tabs > li > a").on("shown.bs.tab", function (e) {
          var t = $(e.target).attr("href").substr(1);
          (window.location.hash = t),
            (document.body.scrollTop = 0),
            (document.documentElement.scrollTop = 0);
        }),
        window.location.hash,
        $("#candidate").on("hidden.bs.tab", function () {
          resetModalForm("#candidateForm", "#candidateValidationErrBox");
        }),
        $("#employer").on("hidden.bs.tab", function () {
          resetModalForm("#employeeForm", "#employerValidationErrBox");
        }));
    }),
    listenSubmit("#addCandidateNewForm", function (e) {
      e.preventDefault(),
        processingBtn("#addCandidateNewForm", "#btnCandidateSave", "loading"),
        $.ajax({
          url: route("front.save.register"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              setTimeout(function () {
                Turbo.visit(route("front.candidate.login"));
              }, 1500));
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            processingBtn("#addCandidateNewForm", "#btnCandidateSave");
          },
        });
    }),
    listenSubmit("#addEmployerNewForm", function (e) {
      e.preventDefault(),
        processingBtn("#addEmployerNewForm", "#btnEmployerSave", "loading"),
        $.ajax({
          url: route("front.save.register"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              setTimeout(function () {
                Turbo.visit(route("front.employee.login"));
              }, 1500));
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            processingBtn("#addEmployerNewForm", "#btnEmployerSave");
          },
        });
    }),
    document.addEventListener("turbo:load", function () {}),
    (window.checkGoogleReCaptcha = function (e) {
      return (
        0 != grecaptcha.getResponse().length ||
        (displayErrorMessage("You must verify google recaptcha."),
        processingBtn(
          1 == e ? "#addCandidateNewForm" : "#addEmployerNewForm",
          1 == e ? "#btnCandidateSave" : "#btnEmployerSave"
        ),
        !1)
      );
    }),
    document.addEventListener("turbo:load", function () {
      window.changeCredentials = function (e, t) {
        $("#email").val(e), $("#password").val(t);
      };
    }),
    listenClick(".admin-login", function () {
      changeCredentials("admin@infyjobs.com", "123456");
    }),
    listenClick(".candidate-login", function () {
      changeCredentials("candidate@gmail.com", "123456");
    }),
    listenClick(".employee-login", function () {
      changeCredentials("employer@gmail.com", "123456");
    }),
    document.addEventListener("turbo:load", function () {
      $("#advertiseImage").length && $("#currency").select2({ width: "100%" }),
        listenChange("#advertiseImage", function () {
          var e, t, s;
          $("#validationErrorsBox").addClass("d-none"),
            (e = $(this)),
            (t = "#validationErrorsBox"),
            (s = $(e).val().split(".").pop().toLowerCase()),
            (-1 == $.inArray(s, ["jpg", "jpeg", "png"])
              ? ($(e).val(""),
                $(t).removeClass("d-none"),
                $(t)
                  .html("The image must be a file of type: jpg, jpeg, png.")
                  .show(),
                0)
              : ($(t).hide(), 1)) &&
              (function (e, t) {
                var s = !0;
                if (e.files && e.files[0]) {
                  var i = new FileReader();
                  (i.onload = function (e) {
                    var i = new Image();
                    (i.src = e.target.result),
                      (i.onload = function () {
                        if (450 != i.height || 630 != i.width)
                          return (
                            $("#advertiseImage").val(""),
                            $("#validationErrorsBox").removeClass("d-none"),
                            $("#validationErrorsBox")
                              .html("The image must be of pixel 450 x 630")
                              .show(),
                            !1
                          );
                        $(t).attr("src", e.target.result), (s = !0);
                      });
                  }),
                    s && (i.readAsDataURL(e.files[0]), $(t).show());
                }
              })(this, "#advertisePreview"),
            $("#validationErrorsBox").delay(5e3).slideUp(300);
        }),
        listenChange(".featured-job-active", function () {
          !(function (e) {
            $.ajax({
              url: route("change-is-job-active", e),
              method: "post",
              cache: !1,
              success: function (e) {
                e.success && displaySuccessMessage(e.message);
              },
              error: function (e) {
                displayErrorMessage(e.message);
              },
            });
          })(1 == $(this).prop("checked") ? 1 : 0);
        }),
        listenChange(".featured-company-active", function () {
          !(function (e) {
            $.ajax({
              url: route("change-is-company-active", e),
              method: "post",
              cache: !1,
              success: function (e) {
                e.success && displaySuccessMessage(e.message);
              },
              error: function (e) {
                displayErrorMessage(e.message);
              },
            });
          })(1 == $(this).prop("checked") ? 1 : 0);
        }),
        listenChange(".job-country-active", function () {
          !(function (e) {
            $.ajax({
              url: route("change-is-job-country-active", e),
              method: "post",
              cache: !1,
              success: function (e) {
                e.success && displaySuccessMessage(e.message);
              },
              error: function (e) {
                displayErrorMessage(e.message);
              },
            });
          })(1 == $(this).prop("checked") ? 1 : 0);
        });
    }),
    listenSubmit("#newsLetterForm", function (e) {
      e.preventDefault();
      var t = $("#mc-email").val();
      if (
        "" != t &&
        !/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(t)
      )
        return displayErrorMessage("Please enter a valid Email"), !1;
      processingBtn("#newsLetterForm", "#btnLetterSave", "loading"),
        $.ajaxSetup({
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
          },
        }),
        $.ajax({
          url: $("#createNewLetterUrl").val(),
          type: "post",
          data: new FormData($(this)[0]),
          processData: !1,
          contentType: !1,
          success: function (e) {
            displaySuccessMessage(e.message);
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            $("#mc-email").val(""),
              processingBtn("#newsLetterForm", "#btnLetterSave");
          },
        });
    }),
    (() => {
      function e() {
        0 == $(".comment-count").text().replace("(", "").replace(")", "") &&
          ($(".comments").hide(), $("#post-comment").hide());
      }
      document.addEventListener("turbo:load", function () {
        window.scrollTo(0, 0);
      }),
        listenSubmit("#commentForm", function (e) {
          var t;
          e.preventDefault(),
            processingBtn("#commentForm", "#submitBtn", "loading"),
            "" === $(".comment-id").val()
              ? $.ajax({
                  type: "POST",
                  url: $("#blogComment").val(),
                  data: $("#commentForm").serialize(),
                  success: function (e) {
                    if (e.success) {
                      var t = $(".comments").find(".comment-card").length + 1;
                      0 === $(".comments").find(".comment-card").length ||
                        $(".comment-count").text(""),
                        $(".comment-count").append("(" + t + ")"),
                        t >= 0 &&
                          ($(".comments").show(), $("#post-comment").show());
                      var s = [
                        {
                          image: isEmpty(e.data.user)
                            ? $("#defaultBlogImage").val()
                            : e.data.user.avatar,
                          commentName: e.data.name,
                          commentCreated: moment(e.data.created_at).format(
                            "DD, MMM yy hh:mm a"
                          ),
                          comment: e.data.comment,
                          id: e.data.id,
                        },
                      ];
                      $(".comment-box").prepend(
                        prepareTemplateRender("#blogTemplate", s)
                      ),
                        $("#commentForm")[0].reset(),
                        displaySuccessMessage(e.message);
                    }
                  },
                  error: function (e) {
                    displayErrorMessage(e.responseJSON.message);
                  },
                  complete: function () {
                    processingBtn("#commentForm", "#submitBtn");
                  },
                })
              : ((t = $(".comment-id").val()),
                $.ajax({
                  type: "PUT",
                  url: route("blog.update.comment", t),
                  data: $("#commentForm").serialize(),
                  success: function (e) {
                    $("#comment-" + t).html(""),
                      $("#comment-" + t).html(e.data.comment),
                      $("#commentForm")[0].reset(),
                      $(".comment-id").val(""),
                      displaySuccessMessage(e.message),
                      processingBtn("#commentForm", "#submitBtn");
                  },
                  error: function (e) {
                    displayErrorMessage(e.responseJSON.message);
                  },
                  complete: function () {
                    processingBtn("#commentForm", "#submitBtn");
                  },
                }));
        }),
        listenClick(".delete-comment-btn", function (t) {
          t.preventDefault();
          var s = $(this).data("id"),
            i = $(this);
          swal(
            {
              title: Lang.get("messages.common.delete") + " !",
              text:
                Lang.get("messages.common.are_you_sure_want_to_delete") +
                '"' +
                Lang.get("messages.post.comment") +
                '" ?',
              type: "warning",
              showCancelButton: !0,
              closeOnConfirm: !1,
              showLoaderOnConfirm: !0,
              confirmButtonColor: "#6777ef",
              cancelButtonColor: "#d33",
              buttons: {
                confirm: Lang.get("messages.common.yes"),
                cancel: Lang.get("messages.common.no"),
              },
            },
            function (t) {
              t &&
                ($.ajaxSetup({
                  headers: {
                    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr(
                      "content"
                    ),
                  },
                }),
                $.ajax({
                  type: "DELETE",
                  url: route("blog.delete.comment", s),
                  success: function (t) {
                    i.closest(".comment-card").remove(),
                      $(".comment-count").text(""),
                      0 !== $(".comments").find(".comment-card").length
                        ? $(".comment-count").append(
                            "<span>(" +
                              $(".comments").find(".comment-card").length +
                              ")</span>"
                          )
                        : e(),
                      swal({
                        title: Lang.get("messages.common.deleted") + " !",
                        text:
                          Lang.get("messages.post.comment") +
                          Lang.get("messages.common.has_been_deleted"),
                        type: "success",
                        confirmButtonColor: "#1967D2",
                        timer: 2e3,
                      });
                  },
                }));
            }
          );
        }),
        listenClick(".edit-comment-btn", function (e) {
          e.preventDefault();
          var t = $(this).data("id");
          $(".comment-id").val($(".delete-comment-btn").data("id")),
            $.ajax({
              type: "GET",
              url: route("blog.edit.comment", t),
              success: function (e) {
                $(".comment").val(e.data.comment),
                  $(".comment-name").val(e.data.name),
                  $(".comment-email").val(e.data.email),
                  $(".comment-id").val(e.data.id),
                  $("#comment-field").focus();
              },
              error: function (e) {
                displayErrorMessage(e.responseJSON.message);
              },
            });
        }),
        e();
    })(),
    $(window).scrollTop(0),
    document.addEventListener("turbo:load", function () {
      var e = $("#salaryFrom"),
        t = $("#salaryTo");
      if ($("#salaryFrom").length || $("#salaryTo").length) {
        var s = $("#jobExperience");
        if (e.length || t.length || s.length) {
          $("#searchCategories").select2(),
            $("#searchSkill").select2(),
            $("#searchGender").select2(),
            $("#searchCareerLevel").select2(),
            $("#searchFunctionalArea").select2();
          var i,
            r = JSON.parse($("#input").val());
          if (
            ($(document).on("change", ".jobType", function () {
              var e = [];
              $("input:checkbox[name=job-type]:checked").each(function () {
                e.push($(this).val());
              }),
                e.length > 0
                  ? window.livewire.emit("changeFilter", "types", e)
                  : window.livewire.emit("resetFilter");
            }),
            $("input[name=job-type]").prop("checked", !1),
            $("#jobExperience").length &&
              (void 0 !== (i = $("#jobExperience").siblings()[1]) && i.remove(),
              $("#jobExperience").ionRangeSlider({
                type: "single",
                min: 0,
                step: 1,
                max: 30,
                max_postfix: "+",
                onFinish: function (e) {
                  window.livewire.emit("changeFilter", "jobExperience", e.from);
                },
              }),
              $("#jobExperience").addClass("irs-hidden-input")),
            e.length &&
              (void 0 !== (i = $("#salaryFrom").siblings()[1]) && i.remove(),
              $("#salaryFrom").ionRangeSlider({
                type: "single",
                min: 0,
                step: 100,
                max: 15e4,
                max_postfix: "+",
                onFinish: function (e) {
                  window.livewire.emit("changeFilter", "salaryFrom", e.from);
                },
              }),
              $("#salaryFrom").addClass("irs-hidden-input")),
            t.length)
          )
            void 0 !== (i = t.siblings()[1]) && i.remove(),
              t.ionRangeSlider({
                type: "single",
                min: 0,
                step: 100,
                max: 15e4,
                max_postfix: "+",
                onFinish: function (e) {
                  window.livewire.emit("changeFilter", "salaryTo", e.from);
                },
              }),
              t.addClass("irs-hidden-input");
          $("#searchCategories").on("change", function () {
            window.livewire.emit("changeFilter", "category", $(this).val());
          }),
            $("#searchSkill").on("change", function () {
              window.livewire.emit("changeFilter", "skill", $(this).val());
            }),
            $("#searchGender").on("change", function () {
              window.livewire.emit("changeFilter", "gender", $(this).val());
            }),
            $("#searchCareerLevel").on("change", function () {
              window.livewire.emit(
                "changeFilter",
                "careerLevel",
                $(this).val()
              );
            }),
            $("#searchFunctionalArea").on("change", function () {
              window.livewire.emit(
                "changeFilter",
                "functionalArea",
                $(this).val()
              );
            }),
            $("#searchByLocation").on("keyup", function () {
    
              window.livewire.emit(
                "changeFilter",
                "searchByLocation",
                $(this).val()
              );
            }),
            $("#searchLocation").on("keyup", function () {
            
              window.livewire.emit(
                "changeFilter",
                "searchLocation",
                $(this).val()
              );
            }),
            "" != r.location &&
              ($("#searchByLocation").val(r.location),
              window.livewire.emit(
                "changeFilter",
                "searchByLocation",
                r.location
              )),
             
            "" != r.keywords &&
              window.livewire.emit("changeFilter", "title", r.keywords),
            $(document).on("click", ".reset-filter", function () {
              window.livewire.emit("resetFilter"),
                e.data("ionRangeSlider").update({ from: 0, to: 0 }),
                t.data("ionRangeSlider").update({ from: 0, to: 0 }),
                s.data("ionRangeSlider").update({ from: 0, to: 0 }),
                $("#searchByLocation").val(""),
                $("#searchFunctionalArea").val("").trigger("change"),
                $("#searchCareerLevel").val("").trigger("change"),
                $("#searchGender").val("").val("").trigger("change"),
                $("#searchSkill").val("").val("").trigger("change"),
                $("#searchCategories").val("").trigger("change"),
                $(".jobType").prop("checked", !1);
            }),
            $(window).width() > 991
              ? ($("#search-jobs-filter").show(), $("#collapseBtn").hide())
              : ($(".job-post-sidebar").hide(),
                $("#collapseBtn").click(function () {
                  $(".job-post-sidebar").show();
                }));
        }
      }
    }),
    document.addEventListener("livewire:load", function () {
      window.livewire.hook("message.processed", function () {
        $(window).scrollTop(0),
          $(document).on("click", "#jobsSearchResults ul li", function () {
            $("#searchByLocation").val($(this).text()),
              $("#jobsSearchResults").fadeOut();
          });
      });
    }),
    document.addEventListener("turbo:load", function () {
      $("#resumeId").select2(),
        listenClick(".save-draft", function (e) {
          e.preventDefault(),
            submitForm(
              "#applyJobForm",
              "draft",
              "#draftJobSave",
              "#applyJobSave"
            );
        }),
        listenClick(".apply-job", function (e) {
          e.preventDefault(),
            submitForm(
              "#applyJobForm",
              "apply",
              "#applyJobSave",
              "#draftJobSave"
            );
        }),
        (window.submitForm = function (e, t, s, i) {
          processingBtn(e, s, "loading"), $(i).prop("disabled", !0);
          var r = new FormData($(document).find(e)[0]);
          r.append("application_type", t),
            $.ajax({
              url: route("apply-job"),
              type: "post",
              data: r,
              dataType: "JSON",
              contentType: !1,
              cache: !1,
              processData: !1,
              success: function (e) {
                e.success &&
                  (displaySuccessMessage(e.message),
                  setTimeout(function () {
                    window.location = route("front.job.details", e.data);
                  }, 3e3));
              },
              error: function (t) {
                displayErrorMessage(t.responseJSON.message),
                  processingBtn(e, s, "reset"),
                  $(i).prop("disabled", !1);
              },
            });
        });
    }),
    document.addEventListener("turbo:load", function () {
      if ($("#removeFromFavorite").length || $("#addToFavorites").length) {
        var e = $("#isJobAddedToFavourite").val(),
          t = $("#removeFromFavorite").val(),
          s = $("#addToFavorites").val();
        e ? $(".favouriteText").text(t) : $(".favouriteText").text(s),
          $("#jobUrl").val(window.location.href),
          $("#addToFavourite").on("click", function () {
            var e = $(this).data("favorite-user-id"),
              t = $(this).data("favorite-job-id");
            $.ajax({
              url: route("save.favourite.job"),
              type: "POST",
              data: {
                _token: $('meta[name="csrf-token"]').attr("content"),
                userId: e,
                jobId: t,
              },
              success: function (e) {
                console.log("sd"),
                  e.success &&
                    ($("#favorite").empty(),
                    e.data
                      ? $("#favorite").html(
                          '<i class="fa-solid fa-bookmark text-primary featured"></i>'
                        )
                      : $("#favorite").html(
                          '<i class="fa-regular fa-bookmark text-primary"></i>'
                        ),
                    displaySuccessMessage(e.message));
              },
              error: function (e) {
                displayErrorMessage(e.responseJSON.message);
              },
            });
          });
      }
    }),
    listenSubmit("#reportJobAbuse", function (e) {
      e.preventDefault(),
        processingBtn("#reportJobAbuse", "#btnReportJobAbuse", "loading"),
        $.ajax({
          url: route("report.job.abuse"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              $("#reportJobAbuseModal").modal("hide"),
              $(".reportJobAbuse").attr("disabled", !0),
              $(".reportJobAbuse").text(
                Lang.get("messages.candidate.already_reported")
              ),
              $(".close-modal").click());
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            processingBtn("#reportJobAbuse", "#btnReportJobAbuse");
          },
        });
    }),
    listenSubmit("#emailJobToFriend", function (e) {
      e.preventDefault(),
        processingBtn("#emailJobToFriend", "#btnSendToFriend", "loading"),
        $.ajax({
          url: route("email.job"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              $("#friendName,#friendEmail").val(""),
              $("#emailJobToFriendModal").modal("hide"),
              $(".close-modal").click());
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            processingBtn("#emailJobToFriend", "#btnSendToFriend");
          },
        });
    }),
    listenHiddenBsModal("#emailJobToFriendModal", function () {
      $("#friendName,#friendEmail").val("");
    }),
    listenHiddenBsModal("#reportJobAbuseModal", function () {
      $("#noteForReportAbuse").val("");
    }),
    listenSubmit("#reportToCandidate", function (e) {
      e.preventDefault(),
        processingBtn("#reportToCandidate", "#btnReportCandidate", "loading"),
        $.ajax({
          url: route("report.to.candidate"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              $("#reportToCandidateModal").modal("hide"),
              $(".reportToCandidate").attr("disabled", !0),
              $(".reportToCandidate").text(
                Lang.get("messages.candidate.already_reported")
              ),
              $(".close-modal").click());
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
          complete: function () {
            processingBtn("#reportToCandidate", "#btnReportCandidate");
          },
        });
    }),
    listenHiddenBsModal("#reportToCandidateModal", function () {
      $("#noteForReportToCompany").val("");
    }),
    document.addEventListener("turbo:load", function () {
      if ($("#isCompanyAddedToFavourite").length) {
        var e = $("#isCompanyAddedToFavourite").val(),
          t = $("#followText").val(),
          s = $("#unfollowText").val();
        $(".favouriteText").length &&
          (e
            ? ($(".favouriteIcon").addClass("fa fa-star"),
              $(".favouriteText").text(s))
            : ($(".favouriteIcon").addClass("fa-regular fa-star"),
              $(".favouriteText").text(t))),
          $("#addToFavourite").on("click", function () {
            var e = $(this).data("favorite-user-id"),
              i = $(this).data("favorite-company_id");
            $.ajax({
              url: route("save.favourite.company"),
              type: "POST",
              data: {
                _token: $('meta[name="csrf-token"]').attr("content"),
                userId: e,
                companyId: i,
              },
              success: function (e) {
                e.success &&
                  (e.data
                    ? ($(".favouriteIcon").removeClass("fa-regular fa-star"),
                      $(".favouriteIcon").addClass("fa fa-star"),
                      $(".favouriteText").text(s))
                    : ($(".favouriteIcon").removeClass("fa fa-star"),
                      $(".favouriteIcon").addClass("fa-regular fa-star"),
                      $(".favouriteText").text(t)),
                  displaySuccessMessage(e.message));
              },
              error: function (e) {
                displayErrorMessage(e.responseJSON.message);
              },
            });
          });
      }
    }),
    listenSubmit("#reportToCompany", function (e) {
      e.preventDefault(),
        $.ajax({
          url: route("report.to.company"),
          type: "POST",
          data: $(this).serialize(),
          success: function (e) {
            e.success &&
              (displaySuccessMessage(e.message),
              $("#reportToCompanyModal").modal("hide"),
              $(".reportToCompanyBtn").attr("disabled", !0),
              $(".reportToCompanyBtn").text(
                Lang.get("messages.candidate.already_reported")
              ));
          },
          error: function (e) {
            displayErrorMessage(e.responseJSON.message);
          },
        });
    }),
    listenHiddenBsModal("#reportToCompanyModal", function () {
      $("#reportToCompany")[0].reset();
    }),
    listenClick(".show-employer-detail-btn", function (e) {
      ajaxCallInProgress();
      var t = $(e.currentTarget).attr("data-id");
      $.ajax({
        url: route("reported.companies.show", t),
        type: "GET",
        success: function (e) {
          if (e.success) {
            $("#showReportedCompany").html(""),
              $("#showReportedBy").html(""),
              $("#showReportedWhen").html(""),
              $("#showReportedNote").html(""),
              $("#showImage").html(""),
              $("#showReportedCompany").append(e.data.company.user.first_name),
              $("#showReportedBy").append(e.data.user.first_name),
              $("#showReportedWhen").append(e.data.date);
            var t = document.createElement("textarea");
            (t.innerHTML = isEmpty(e.data.note) ? "N/A" : e.data.note),
              $("#showReportedNote").append(t.value),
              $("#showImage").append(
                '<img src="' +
                  e.data.company.company_url +
                  '" class="testimonial-modal-img" />'
              ),
              $("#showReportedCompaniesModel").appendTo("body").modal("show"),
              ajaxCallCompleted();
          }
        },
        error: function (e) {
          displayErrorMessage(e.responseJSON.message);
        },
      });
    }),
    listenClick(".reported-company-delete-btn", function (e) {
      var t = $(e.currentTarget).attr("data-id");
      deleteItem(
        route("delete.reported.company", t),
        Lang.get("messages.candidate.reported_employer")
      );
    }),
    document.addEventListener("turbo:load", function () {
      $("#industry").length &&
        $("#industry").on("change", function (e) {
          var t = $("#industry").select2("val");
          window.livewire.emit("changeFilter", "featured", t);
        }),
        $("#filter_status").length &&
          $("#filter_status").on("change", function (e) {
            var t = $("#filter_status").select2("val");
            window.livewire.emit("changeFilter", "status", t);
          }),
        $("#searchByCompany").length &&
          ($("#searchByCompany").focus(),
          listenChange(".isActive", function (e) {
            !(function (e) {
              $.ajax({
                url: route("change.company.status", e),
                method: "post",
                cache: !1,
                success: function (e) {
                  e.success &&
                    (displaySuccessMessage(e.message),
                    window.livewire.emit("refresh"));
                },
                error: function (e) {
                  displayErrorMessage(e.responseJSON.message);
                },
              });
            })($(e.currentTarget).data("id"));
          }),
          listenClick(".adminMakeFeatured", function (e) {
            !(function (e) {
              $.ajax({
                url: route("mark-as-featured", e),
                method: "post",
                cache: !1,
                success: function (e) {
                  e.success &&
                    (displaySuccessMessage(e.message),
                    $('[data-toggle="tooltip"]').tooltip("hide"),
                    window.livewire.emit("refresh"));
                },
                error: function (e) {
                  displayErrorMessage(e.responseJSON.message);
                },
              });
            })($(e.currentTarget).data("id"));
          }),
          listenClick(".adminUnFeatured", function (e) {
            !(function (e) {
              $.ajax({
                url: route("mark-as-unfeatured", e),
                method: "post",
                cache: !1,
                success: function (e) {
                  e.success &&
                    (displaySuccessMessage(e.message),
                    $('[data-toggle="tooltip"]').tooltip("hide"),
                    window.livewire.emit("refresh"));
                },
                error: function (e) {
                  displayErrorMessage(e.responseJSON.message);
                },
              });
            })($(e.currentTarget).data("id"));
          }),
          listenClick(".delete-btn", function (e) {
            var t = $(e.currentTarget).attr("data-id");
            swal(
              {
                title: Lang.get("messages.common.delete") + " !",
                text: Lang.get("messages.common.are_you_sure_want_to_delete")  + Lang.get("messages.candidate.employee") +'?',
                type: "warning",
                showCancelButton: !0,
                closeOnConfirm: !1,
                showLoaderOnConfirm: !0,
                confirmButtonColor: "#6777ef",
                cancelButtonColor: "#d33",
                cancelButtonText: Lang.get("messages.common.no"),
                confirmButtonText: Lang.get("messages.common.yes"),
              },
              function () {
                window.livewire.emit("deleteEmployee", t);
              }
            );
          }),
          document.addEventListener("delete", function () {
            swal({
              title: Lang.get("messages.common.deleted") + " !",
              text:
                Lang.get("messages.candidate.employee") +
                Lang.get("messages.common.has_been_deleted"),
              type: "success",
              confirmButtonColor: "#6777ef",
              timer: 2e3,
            });
          }),
          listenChange(".isFeatured", function (e) {
            var t = $(e.currentTarget).data("id");
            activeIsFeatured(t);
          }),
          listenChange(".is-email-verified", function (e) {
            if (!$(this).is(":checked")) return !1;
            !(function (e) {
              $.ajax({
                url: route("company.verified.email", e),
                method: "post",
                cache: !1,
                success: function (e) {
                  if (e.success)
                    return (
                      displaySuccessMessage(e.message),
                      window.livewire.emit("refresh"),
                      !0
                    );
                },
                error: function (e) {
                  displayErrorMessage(e.responseJSON.message);
                },
              });
            })($(e.currentTarget).data("id")),
              $(this).attr("disabled", !0);
          }),
          listenClick(".send-email-verification", function (e) {
            var t = $(e.currentTarget).attr("data-id");
            $.ajax({
              url: route("company.resendEmailVerification", t),
              type: "post",
              success: function (e) {
                if (e.success) return displaySuccessMessage(e.message), !0;
              },
              error: function (e) {
                displayErrorMessage(e.responseJSON.message);
              },
            });
          }));
    }),
    (() => {
      function loadwebCustomData() {
        $(".alert").delay(5e3).slideUp(300),
          $("#gRecaptchaContainerCompanyRegistration").empty(),
          setTimeout(function () {
            loadCaptchaForCompanyRegistration();
          }, 500);
      }
      function deleteFrontItemAjax(url, tableId, header) {
        var callFunction =
          arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
        $.ajax({
          url,
          type: "DELETE",
          dataType: "json",
          success: function success() {
            window.livewire.emit("refreshDatatable"),
              window.livewire.emit("resetPage"),
              swal({
                title: Lang.get("messages.common.deleted") + " !",
                text: header + Lang.get("messages.common.has_been_deleted"),
                type: "success",
                confirmButtonColor: "#009ef7",
                timer: 2e3,
              }),
              callFunction && eval(callFunction);
          },
          error: function (e) {
            swal({
              title: "",
              text: e.responseJSON.message,
              type: "error",
              confirmButtonColor: "#009ef7",
              timer: 5e3,
            });
          },
        });
      }
      document.addEventListener("turbo:load", loadwebCustomData),
        (window.manageFrontAjaxErrors = function (e) {
          var t =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : "editValidationErrorsBox";
          404 == e.status
            ? iziToast.error({
                title: "Error!",
                message: e.responseJSON.message,
                position: "topRight",
              })
            : printErrorMessage("#" + t, e);
        }),
        (window.deleteFrontItem = function (e, t, s) {
          var i = Swal.mixin({
            customClass: {
              confirmButton: "swal2-confirm btn fw-bold btn-danger mt-0",
              cancelButton:
                "swal2-cancel btn fw-bold btn-bg-light btn-color-primary mt-0",
            },
            buttonsStyling: !1,
          });
          i.fire({
            title: Lang.get("messages.common.delete") + " !",
            text:
              Lang.get("messages.common.are_you_sure_want_to_delete") +
              '"' +
              s +
              '" ?',
            icon: "warning",
            showCancelButton: !0,
            closeOnConfirm: !1,
            showLoaderOnConfirm: !0,
            confirmButtonColor: "#6777ef",
            cancelButtonColor: "#d33",
            cancelButtonText: Lang.get("messages.common.no"),
            confirmButtonText: Lang.get("messages.common.yes"),
          }).then(function (i) {
            i.isConfirmed && deleteFrontItemAjax(e, t, s, null);
          });
        }),
        (window.loadCaptchaForCompanyRegistration = function () {
          var e = document.getElementById(
            "gRecaptchaContainerCompanyRegistration"
          );
          if (!e) return !1;
          e.innerHTML = "";
          var t = document.createElement("div");
          grecaptcha.render(t, {
            sitekey: siteKey,
            callback: function (e) {
              $("#companyRegistrationBtn").attr("disabled", !1);
            },
          }),
            e.appendChild(t);
        });
    })(),
    document.addEventListener("turbo:load", function () {
      $(".price-input").length && priceFormatSelector(".price-input");
    }),
    (window.addCommas = function (e) {
      for (
        var t = (e += "").split("."),
          s = t[0],
          i = t.length > 1 ? "." + t[1] : "",
          r = /(\d+)(\d{3})/;
        r.test(s);

      )
        s = s.replace(r, "$1,$2");
      return s + i;
    }),
    (window.getFormattedPrice = function (e) {
      if ("" != e || e > 0)
        return "number" != typeof e && (e = e.replace(/,/g, "")), addCommas(e);
    }),
    (window.priceFormatSelector = function (e) {
      $(document).on("input keyup keydown keypress", e, function (e) {
        var t = $(this).val();
        if ("" === t) $(this).val("");
        else {
          if (/[0-9]+(,[0-9]+)*$/.test(t))
            return $(this).val(getFormattedPrice(t)), !0;
          $(this).val(t.replace(/[^0-9 \,]/, ""));
        }
      });
    }),
    (() => {
      function e() {
        if (!$("#phoneNumber").length && !$("#prefix_code").length) return !1;
        var e = document.querySelector("#phoneNumber"),
          t = document.querySelector("#error-msg"),
          s = document.querySelector("#valid-msg"),
          i = [
            Lang.get("messages.phone.invalid_number"),
            Lang.get("messages.phone.invalid_country_code"),
            Lang.get("messages.phone.too_short"),
            Lang.get("messages.phone.too_long"),
            Lang.get("messages.phone.invalid_number"),
          ],
          r = window.intlTelInput(e, {
            initialCountry: defaultCountryCodeValue,
            separateDialCode: !0,
            geoIpLookup: function (e, t) {
              $.get("https://ipinfo.io", function () {}, "jsonp").always(
                function (t) {
                  var s = t && t.country ? t.country : "";
                  e(s);
                }
              );
            },
            utilsScript: "../../public/assets/js/inttel/js/utils.min.js",
          });
        "undefined" != typeof phoneNo &&
          "" !== phoneNo &&
          setTimeout(function () {
            $("#phoneNumber").trigger("change");
          }, 500);
        var n = r.selectedCountryData.dialCode;
        $("#prefix_code").val(n);
        var o = $("#phoneNumber").val().replace(/\s/g, "");
        $("#phoneNumber").val(o);
        var a = function () {
          e.classList.remove("error"),
            (t.innerHTML = ""),
            t.classList.add("d-none"),
            s.classList.add("d-none");
        };
        if (
          (e.addEventListener("blur", function () {
            if ((a(), e.value.trim()))
              if (r.isValidNumber()) s.classList.remove("d-none");
              else {
                e.classList.add("error");
                var n = r.getValidationError();
                (t.innerHTML = i[n]), t.classList.remove("d-none");
              }
          }),
          e.addEventListener("change", a),
          e.addEventListener("keyup", a),
          "undefined" != typeof phoneNo && "" !== phoneNo)
        )
          setTimeout(function () {
            $("#phoneNumber").trigger("change");
          }, 500);
        else {
          var l = window.localStorage.getItem("flagClassLocal"),
            c = window.localStorage.getItem("dialCodeValLocal");
          if (c) {
            $(".iti__selected-flag>.iti__flag").addClass(l),
              $(".iti__selected-dial-code").text(c);
            var d = $("#phoneNumber").val();
            r.setNumber(c + d);
          }
        }
        $("#phoneNumber").on("blur keyup change countrychange", function () {
          "undefined" != typeof phoneNo &&
            "" !== phoneNo &&
            (r.setNumber("+" + phoneNo), (phoneNo = ""));
          var e = r.selectedCountryData.dialCode;
          $("#prefix_code").val(e);
        });
      }
      document.addEventListener("turbo:load", e),
        document.addEventListener("turbo:load", e);
    })();
})();
