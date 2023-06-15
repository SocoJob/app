<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="title" content="<?php echo e(getAppName()); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title>404 Not Found | <?php echo e(getAppName()); ?></title>
    <link href="<?php echo e(asset('front_web/scss/bootstrap.css')); ?>" rel="stylesheet" type="text/css">
</head>
<body>
<div class="container con-404 vh-100 d-flex justify-content-center">
    <div class="row justify-content-md-center d-block">
        <div class="col-md-12 mt-5">
            <img src="<?php echo e(asset('assets/img/404-error-image.png')); ?>" class="img-fluid img-404 mx-auto d-block">
        </div>
        <div class="col-md-12 text-center error-page-404">
            <h2>Opps! Something's missing...</h2>
            <p class="not-found-subtitle">The page you are looking for doesn't exists / isn't available / was loading
                incorrectly.</p>
            <a class="btn btn-primary back-btn mt-3" href="<?php echo e(url()->previous()); ?>" >Back to Previous Page</a>
        </div>
    </div>
</div>
<script src="<?php echo e(asset('front_web/js/bootstrap.bundle.min.js')); ?>"></script>
</body>
</html>

<?php /**PATH /Users/fjalonsoo/Desktop/Proyectos/SocoJob/5. GitContent/resources/views/errors/404.blade.php ENDPATH**/ ?>