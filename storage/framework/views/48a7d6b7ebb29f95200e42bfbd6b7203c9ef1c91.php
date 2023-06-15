<!-- start footer section -->
<footer class="footer bg-light">
    <div class="container-fluid">
        <div class="row mx-1">
            <div class="col-12 col-sm-6 col-lg-3">
                <div class="footer-logo">
                    <a href="<?php echo e(route('front.search.jobs')); ?>">
                        <img src="<?php echo e(asset($settings['footer_logo'])); ?>" alt="jobs-landing" class="img-fluid"/>
                    </a>
                </div>
                <p class="d-block text-gray my-4">
                    <?php echo e(__('web.footer.newsletter_text')); ?>

                </p>
               
                <h5 class="fw-bold" style="font-size: 0.8em !important;line-height: 1;font-weight: 600 !important;letter-spacing: 2px;">Síguenos</h5>
                <div class="social-icon d-flex my-4" style="margin-left: -5px;">
                    <?php if(!empty($settings['facebook_url'])): ?>
                        <a href="<?php echo e($settings['facebook_url']); ?>" target="_blank" class="social-icon-box d-flex align-items-center justify-content-center me-3">
                            <img src="<?php echo e(asset('images/facebook.png')); ?>" alt="">
                        </a>
                    <?php endif; ?>
                    <?php if(!empty($settings['twitter_url'])): ?>
                        <a href="<?php echo e($settings['twitter_url']); ?>" target="_blank" class="social-icon-box d-flex align-items-center justify-content-center me-3">
                            <img src="<?php echo e(asset('images/twitter.png')); ?>" alt="">
                        </a>
                    <?php endif; ?>
                    <?php if(!empty($settings['google_plus_url'])): ?>
                        <a href="<?php echo e($settings['google_plus_url']); ?>" target="_blank" class="social-icon-box d-flex align-items-center justify-content-center me-3">
                            <img src="<?php echo e(asset('images/instagram.png')); ?>" alt="">
                        </a>
                    <?php endif; ?>
                    <?php if(!empty($settings['linkedIn_url'])): ?>
                        <a href="<?php echo e($settings['linkedIn_url']); ?>" target="_blank" class="social-icon-box d-flex align-items-center justify-content-center me-3">
                            <img src="<?php echo e(asset('images/linkedin.png')); ?>" alt="">
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <h3 class="mb-3 text-secondary fs-18 fw-bold" style="font-size: 0.8em !important;line-height: 1;font-weight: 600 !important;letter-spacing: 2px;"><?php echo e(__('web.footer.noticies')); ?></h3>
                <div class="d-flex footer-info__block mb-3">
                    <p class="text-muted" style="margin-bottom: 1.5rem;" >Accede a nuestro blog y descubre las noticias más recientes de socorrismo</p>                
                </div>
                <div class="d-flex footer-info__block mb-3 justify-content-start">
                    <a href="https://socojob.com/blog/" class="btn btn-primary btn-lg text-white" style="font-size: inherit;border-radius: 8px;padding: 0.5rem 2rem;background-color: #026295;font-family: 'Poppins';">BLOG</a>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <h3 class="mb-2 text-secondary fs-18 fw-bold" style="font-size: 0.8em !important;line-height: 1;font-weight: 600 !important;letter-spacing: 2px;"><?php echo e(__('web.footer.download_app')); ?></h3>
                <div class="row px-0 mb-3">
                    <div class="col mt-2">
                        <a href="#"> <img src="<?php echo e(asset('images/app1.png')); ?>" alt="" style="width: 10rem;"></a>
                       
                    </div>
                    <div class="col mt-2">
                        <a href="#"> <img src="<?php echo e(asset('images/gp1.png')); ?>" alt="" style="    width: 10rem;"></a>
                       
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <h3 class="mb-3 text-secondary fs-18 fw-bold" style="font-size: 0.8em !important;line-height: 1;font-weight: 600 !important;letter-spacing: 2px;"><?php echo e(__('web.footer.contact_us')); ?></h3>
                <div class="footer-info">
                    <div class="d-flex footer-info__block mb-3">
                        <p class="text-muted" style="margin-bottom: 1.5rem;" >Si quieres trabajar como socorrista en SocoJob tienes tu oportunidad</p>
                   
                    </div>
                    <div class="d-flex footer-info__block mb-3 justify-content-start">
                        <a href="<?php echo e(route('front.search.jobs')); ?>" class="btn btn-primary btn-lg text-white" style="font-size: inherit;border-radius: 8px;padding: 0.5rem 2rem;background-color: #026295;font-family: 'Poppins';">Ofertas de trabajo</a>
                    </div>
               
                </div>
            </div>
        </div>
        <div class="row pt-5">
            <div class="col-8 mx-auto text-center">
                <a href="https://socojob.com/politica-de-privacidad/" class="btn btn-link text-muted link-underline link-underline-opacity-75-hover">Política de Privacidad</a>
                <a href="https://socojob.com/politica-de-cookies/" class="btn btn-link text-muted link-underline link-underline-opacity-75-hover">Política de Cookies </a>
                <a href="https://socojob.com/terminos-y-condiciones/" class="btn btn-link text-muted link-underline link-underline-opacity-75-hover">Términos y Condiciones</a>
                <p style="font-size: 0.7em;text-transform: uppercase;letter-spacing: 0.14em;font-weight: 700;color: rgba(34, 34, 34, 0.5);fill: rgba(34, 34, 34, 0.5);padding-bottom: 4em;">©COPYRIGHT <?php echo e(date('Y')); ?> | TODOS LOS DERECHOS RESERVADOS </p>
            </div>
            <!-- <div class="col-12 text-center mt-lg-5 mt-4 copy-right">
                <p class="pt-4 pb-4 text-gray fs-14">
                    &copy;<?php echo e(date('Y')); ?>

                    <a href="<?php echo e(getSettingValue('company_url')); ?>">
                        <?php echo e(html_entity_decode($settings['application_name'])); ?></a>.
                    <?php echo e(__('web.footer.all_rights_reserved')); ?>.
                </p>
            </div> -->
        </div>
    </div>
</footer>
<!-- end footer section -->
<?php /**PATH /Users/fjalonsoo/Desktop/Proyectos/SocoJob/5. GitContent/resources/views/front_web/layouts/footer.blade.php ENDPATH**/ ?>