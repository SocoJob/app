<?php
    $settings  = settings();
    $lang = session()->get('languageName');
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
        <title><?php echo $__env->yieldContent('title'); ?> | <?php echo e(getAppName()); ?></title>
        <link rel="shortcut icon" href="<?php echo e(getSettingValue('favicon')); ?>" type="image/x-icon">
        <link rel="icon" href="<?php echo e(getSettingValue('favicon')); ?>" type="image/x-icon">
        <link href="<?php echo e(asset('assets/css/all.min.css')); ?>" rel="stylesheet" type="text/css">
        <link href="<?php echo e(asset('front_web/scss/bootstrap.css')); ?>" rel="stylesheet" type="text/css">
        
        <link rel="stylesheet" type="text/css" href="<?php echo e(asset('front_web/css/jquery-ui.min.css')); ?>">
        <link rel="stylesheet" href="<?php echo e(asset('assets/css/iziToast.min.css')); ?>">
        
        <link href="<?php echo e(asset('assets/css/front-third-party.css')); ?>" rel="stylesheet" type="text/css">
        <link href="<?php echo e(mix('css/front-pages.css')); ?>" rel="stylesheet" type="text/css">
        
        <?php echo $__env->yieldContent('page_css'); ?>
        <?php echo \Livewire\Livewire::styles(); ?>         
        <?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate(); ?>

        <script src="<?php echo e(asset('vendor/livewire/livewire.js')); ?>"></script>
        <?php echo $__env->make('livewire.livewire-turbo', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        
        <script src="https://cdn.jsdelivr.net/gh/livewire/turbolinks@v0.1.x/dist/livewire-turbolinks.js"
                data-turbolinks-eval="false" data-turbo-eval="false">
        </script>
        <script src="https://js.stripe.com/v3/"></script>
        <script src="<?php echo e(mix('js/front-third-party.js')); ?>"></script>
        <script src='https://www.google.com/recaptcha/api.js'></script>
        <script>
            let siteKey = "<?php echo e(config('app.google_recaptcha_site_key')); ?>"
        </script>
        <script src="<?php echo e(mix('js/front_pages.js')); ?>"></script>
        <script src="<?php echo e(asset('assets/js/custom/custom.js')); ?>"></script>

        <?php echo $__env->yieldContent('page_scripts'); ?>
        <?php $__currentLoopData = googleJobSchema(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $jobSchema): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php echo nl2br($jobSchema); ?>

        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </head>
    <body <?php echo e($lang == 'pt' || $lang == 'fr' || $lang == 'es' ? 'languages' : ''); ?>>
    <span class="header-padding"></span>
    <?php echo $__env->make('front_web.layouts.header', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>

    <?php echo $__env->yieldContent('content'); ?>

    <!-- Footer Start -->
    <?php if(Request::segment(1)!='candidate-register' && Request::segment(1)!= 'employer-register'&& Request::segment(1)!='users'): ?>
        <?php echo $__env->make('front_web.layouts.footer', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        <?php endif; ?>
    <!-- Footer End -->
    <?php echo e(Form::hidden('createNewLetterUrl',route('news-letter.create'),['id'=>'createNewLetterUrl'])); ?>

    <script data-turbo-eval="false">
        let defaultCountryCodeValue = "<?php echo e(getSettingValue('default_country_code')); ?>"
    </script>
    </body>
</html>
<?php /**PATH /Users/fjalonsoo/Desktop/Proyectos/SocoJob/5. GitContent/resources/views/front_web/layouts/app.blade.php ENDPATH**/ ?>