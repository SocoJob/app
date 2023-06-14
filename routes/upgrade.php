<?php

use App\Http\Controllers\BrandingSliderController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\Candidates;
use App\Http\Controllers\CareerLevelController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\CmsServicesController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanySizeController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\EmployerController;
use App\Http\Controllers\FAQController;
use App\Http\Controllers\FeaturedCompanySubscriptionController;
use App\Http\Controllers\FeaturedJobSubscriptionController;
use App\Http\Controllers\FrontSettingsController;
use App\Http\Controllers\FunctionalAreaController;
use App\Http\Controllers\HeaderSliderController;
use App\Http\Controllers\ImageSliderController;
use App\Http\Controllers\IndustryController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobCategoryController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobNotificationController;
use App\Http\Controllers\JobShiftController;
use App\Http\Controllers\JobStageController;
use App\Http\Controllers\JobTypeController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MaritalStatusController;
use App\Http\Controllers\NoticeboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSettingsController;
use App\Http\Controllers\OwnerShipTypeController;
use App\Http\Controllers\PaypalController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PostCategoryController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\RequiredDegreeLevelController;
use App\Http\Controllers\SalaryCurrencyController;
use App\Http\Controllers\SalaryPeriodController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TestimonialsController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TranslationManagerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Web;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// upgrade to v4.2.0
Route::get('/upgrade-to-v4-2-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'AddIsFullSliderSettingSeeder',
            '--force' => true,
        ]);
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'AddIsSliderActiveDeactiveSeeder',
            '--force' => true,
        ]);
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'RenameIsActiveToSlierIsActiveInSettingSeeder',
            '--force' => true,
        ]);
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'AddRecordNotificationSetting',
            '--force' => true,
        ]);
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'UpdateNotificationSettingAdminTypeSeeder',
            '--force' => true,
        ]);
});

// upgrade to v4.4.0
Route::get('/upgrade-to-v4-4-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        [
            '--class' => 'AddEnableGoogleRecaptchaSeeder',
            '--force' => true,
        ]);
});

// upgrade to v4.5.0
Route::get('/upgrade-to-v4-5-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'RemoveProviderUniqueRuleFromSocialAccountsSeeder', '--force' => true]);
});

// upgrade to v6.0.0
Route::get('/upgrade-to-v6-0-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'FrontSettingAdvertiseImageSeeder', '--force' => true]);
});

// upgrade to v6.1.0
Route::get('/upgrade-to-v6-1-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'CreateDefaultCurrencySeeder', '--force' => true]);
});

// upgrade to v7.1.0
Route::get('/upgrade-to-v7-1-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'EmailTemplateSeeder', '--force' => true]);
});

// upgrade to v7.1.1
Route::get('/upgrade-to-v7-1-1', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'CurrencySeeder', '--force' => true]);
});

// upgrade to v8.0.0
Route::get('/upgrade-to-v8-0-0', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_06_29_000000_add_uuid_to_failed_jobs_table.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_1_103036_add_conversions_disk_column_in_media_table.php',
        ]);
});

// upgrade to v8.1.0
Route::get('/upgrade-to-v8-1-0', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_08_085344_create_post_comments_table.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_08_121050_add_column_is_created_by_admin_in_jobs_table.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_10_070048_create_job_stages_table.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_10_104206_add_job_stage_in_job_applications.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
            '--path'  => 'database/migrations/2021_07_10_114138_create_job_application_schedules_table.php',
        ]);
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'FooterLogoSeeder', '--force' => true]);
});

// upgrade to v9.0.0
Route::get('/upgrade-to-v9-0-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'CmsServicesSeeder', '--force' => true]);
});
// upgrade to v9.1.0
Route::get('/upgrade-to-v9-1-0', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed',
        ['--class' => 'CreateFrontSettingSeeder', '--force' => true]);
});
// upgrade to v12.2.0
Route::get('/upgrade/database', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate',
        [
            '--force' => true,
        ]);
});
