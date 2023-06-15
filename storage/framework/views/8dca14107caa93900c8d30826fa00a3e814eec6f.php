<?php $__env->startSection('title'); ?>
    <?php echo e(__('web.home')); ?>

<?php $__env->stopSection(); ?>





<?php $__env->startSection('content'); ?>
    <div class="home-page">
        <!-- start hero section -->
        <section class="hero-section position-relative pt-100 bg-soco">
        </section>
        <!-- end hero section -->

        <!--start find-job section-->
        <section class="find-job-section">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-xl-8 col-lg-8">
                        <div class="find-job position-relative bg-white">
                            <form action="<?php echo e(route('front.search.jobs')); ?>" id='searchForm' method="get">
                                <div class="row align-items-center justify-content-around">
                                    <div class="col-lg-5 br-2 mb-lg-0 mb-4 ps-lg-4">
                                        <h3 class="fs-16 text-secondary mb-0">
                                            <?php echo app('translator')->get('web.home_menu.keywords'); ?></h3>
                                        <input type="text" class="fs-14 text-gray mb-0" name="keywords" id="search-keywords" placeholder="<?php echo app('translator')->get('web.web_home.job_title_keywords_company'); ?>" autocomplete="off">
                                        <div id="jobsSearchResults" class="position-absolute w100 job-search"></div>
                                    </div>
                                    <div class="col-lg-4 br-2 ps-lg-3 mb-lg-0 mb-4 ps-lg-4">
                                        <h3 class="fs-16 text-secondary mb-0">
                                            <?php echo app('translator')->get('web.common.location'); ?></h3>
                                        <input type="text" class="fs-14 text-gray mb-0" name="location" id="search-location" placeholder="<?php echo app('translator')->get('web.web_home.city_or_postcode'); ?>" autocomplete="off">
                                    </div>
                                    <div class="col-lg-3 text-center"> 
                                        <button class="btn btn-primary d-block pt-3 pb-3 find-jobs-btn" type="submit">
                                            <?php echo app('translator')->get('web.web_home.find_jobs'); ?> 
                                        </button> 
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container position-relative">
                <div class="row align-items-center flex-column-reverse flex-lg-row">

                    <div class="hero-content mt-lg-0 mt-md-5 my-4">
                        <h1 class="mb-md-4 mb-3 pe-xxl-3">
                            Si quieres trabajar como socorrista,
                            en SocoJob tienes tu oportunidad                            
                        </h1>
                        <p class="mb-lg-4 pb-lg-3 mb-4 fs-18 text-gray">
                            La demanda de socorristas ha ido en aumento en los últimos años, especialmente durante la temporada de verano, cuando las playas y piscinas se llenan de turistas y locales. Por eso, cada vez hay más empresas que ofrecen ofertas de trabajo de socorrismo para cubrir la creciente necesidad de encontrar socorristas en diferentes lugares.

Ahora tienes la oportunidad de ver todas las ofertas de trabajo de socorrismo y trabajar en parques acuáticos, hoteles, clubes deportivos, playas, ríos, pantanos, campings, clubs privados y piscinas públicas.

En este buscador podrás encontrar todas las ofertas de trabajo de socorrismo, tan solo busca donde quieres trabajar e inscríbete en aquellas ofertas que más te interesen. Podrás ver las condiciones, el tipo de contrato, y los sueldos que ofrece cada empleador.
                        </p>
                    </div>
                </div>
            </div>
            </section>
        <!--end find-job section-->

        <!-- start-companies-logo section -->
        <?php if(count($branding) > 0): ?>
        <section class="comapnies-logo-section py-80">
            <div class="container">
                <div class="slick-slider">
                    <?php $__currentLoopData = $branding; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $brand): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="slide d-flex justify-content-center align-items-center">
                            <img src="<?php echo e($brand->branding_slider_url); ?>" alt="Branding Slider" class="img-fluid" />
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- end-companies-logo section -->

        <!-- start-slider-test-img section -->
        <?php if(count($imageSliders) > 0 && $imageSliderActive->value): ?>
        <section class="<?php echo e(($slider->value == 0) ? 'container' : ' '); ?> slider-test-section position-relative">
            <div id="carouselExampleControls" class="carousel slide"
                 data-bs-ride="carousel">
                <div class="carousel-inner">
                    <?php $__currentLoopData = $imageSliders; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key=>$imageSlider): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="carousel-item position-relative <?php echo e(($key==0)?'active':''); ?>">
                            <img src="<?php echo e($imageSlider->image_slider_url); ?>" class="d-block w-100 slider-img" alt="slide">
                            <?php if($imageSlider->description): ?>
                                <div class="row justify-content-center">
                                    <div class="slider-img-desc col-10 text-center position-absolute">
                                        <div class="slide-desc">
                                            <?php echo Str::limit($imageSlider->description, 495, ' ...'); ?>

                                        </div>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                    <i class="icon fa-solid fa-arrow-left text-white"></i>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                    <i class="icon fa-solid fa-arrow-right text-white"></i>
                </button>
            </div>
        </section>
        <?php endif; ?>
        <!-- end-slider-test-img section -->

        <!-- start-popular-job-categories-section -->
        <?php if(count($jobCategories) > 0): ?>
        <section class="popular-job-categories-section py-100">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-8">
                        <div class="section-heading text-center mx-xxl-4 mx-lg-0 mx-sm-3">
                            <h2 class="text-secondary bg-white">
                                <?php echo app('translator')->get('web.web_home.popular_job_categories'); ?>
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="job-categories-card">
                    <div class="row">
                        <?php $__currentLoopData = $jobCategories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $jobCategory): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <div class="col-lg-4 col-md-6 px-xl-3 mb-40">
                                <div class="card py-30">
                                    <div class="row align-items-center">
                                        <div class="col-3">
                                            <img src="<?php echo e($jobCategory->image_url); ?>" class="card-img" alt="...">
                                        </div>
                                        <div class="col-8">
                                            <div class="card-body ps-xl-0 ps-lg-3">
                                                <a href="<?php echo e(route('front.search.jobs',array('categories'=> $jobCategory->id))); ?>" class="text-secondary primary-link-hover">
                                                    <h5 class="card-title fs-18"><?php echo e(html_entity_decode($jobCategory->name)); ?></h5>
                                                </a>
                                                <p class="card-text fs-14 text-gray">
                                                    <?php echo e((($jobCategory->jobs_count) ? $jobCategory->jobs_count : 0) .' open positions'); ?>

                                                </p>
                                            </div>
                                        </div>
                                        <?php if($jobCategory->is_featured): ?>
                                            <div class="col-1 icon position-relative pe-0">
                                                <i class="text-primary fa-solid fa-bookmark"></i>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- start-popular-job-categories-section -->

        <!-- start latest-job-section -->
        <?php if(count($latestJobs) > 0): ?>
        <section class="latest-job-section py-100 bg-gray">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-8">
                        <div class="section-heading ms-xxl-4 me-xxl-4 ms-md-3 me-md-3 text-center">
                            <h2 class="text-secondary bg-gray">
                                <?php echo app('translator')->get('web.home_menu.latest_jobs'); ?>
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="job-card">
                    <div class="row">
                        <?php if(\Illuminate\Support\Facades\Auth::check() && isset(auth()->user()->country_name) && isset($latestJobsEnable)?$latestJobsEnable->value:''): ?>
                            <?php if(in_array(auth()->user()->country_name, array_column($latestJobs->toArray(),'country_name'))): ?>
                                <?php $__currentLoopData = $latestJobs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $job): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php if($job->country_name == auth()->user()->country_name): ?>
                                        <?php echo $__env->make('front_web.common.job_card', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                                    <?php endif; ?>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                <div class="col-md-12 text-center">
                                    <a href="<?php echo e(route('front.search.jobs')); ?>" class="btn btn-primary fs-14 mt-3"><?php echo e(__('web.common.browse_all')); ?></a>
                                </div>
                            <?php else: ?>
                                <div class="col-md-12 text-center">
                                    <a href="<?php echo e(route('front.search.jobs')); ?>" class="btn btn-primary fs-14 mt-3"><?php echo e(__('web.common.browse_all')); ?></a>
                                </div>
                            <?php endif; ?>
                        <?php else: ?>
                            <?php $__currentLoopData = $latestJobs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $job): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <?php echo $__env->make('front_web.common.job_card', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            <div class="col-12 text-center">
                                <a href="<?php echo e(route('front.search.jobs')); ?>"
                                   class="btn btn-primary fs-14 mt-3">
                                    <?php echo app('translator')->get('web.common.browse_all'); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- end latest-job-section -->

        <!-- start featured-job-section -->
        <?php if(count($featuredJobs)): ?>
        <section class="latest-job-section py-100">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="section-heading text-center">
                            <h2 class="text-secondary bg-white">
                                <?php echo app('translator')->get('web.home_menu.featured_jobs'); ?></h2>
                        </div>
                    </div>
                </div>
                <div class="job-card">
                    <div class="row">
                        <?php $__currentLoopData = $featuredJobs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $job): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php echo $__env->make('front_web.common.job_card', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-6 text-center">
                            <a class="btn btn-primary fs-14 mt-3"
                               href="<?php echo e(route('front.search.jobs',['is_featured' => true])); ?>">
                                <?php echo app('translator')->get('web.common.browse_all'); ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- end featured-job-section -->

        <!-- start notice-section -->
        <?php if(count($notices) > 0): ?>
        <section class="notice-section">
            <div class="container">
                <div class="notice-content bg-light">
                    <div class="row justify-content-center">
                        <div class="col-8">
                            <div class="section-heading pt-md-3 mt-5 text-center">
                                <h2 class="text-secondary bg-light">
                                    <?php echo app('translator')->get('web.home_menu.notices'); ?></h2>
                            </div>
                        </div>
                    </div>
                    <div class="autoscroller">
                        <div class="marquee">
                            <div class="row justify-content-center me-0">
                                <?php $__currentLoopData = $notices; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key=>$notice): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <div class="col-sm-10 col-11 position-relative mb-4 <?php echo e($loop->first?'':'mt-lg-3'); ?>">
                                        <div class="notice-desc bg-white py-20 px-md-5 px-4">
                                            <p class="fs-16 text-secondary">
                                                <?php echo nl2br(strip_tags($notice->description)); ?>

                                            </p>
                                            <p class="fs-14 text-gray mb-md-0 mb-5">
                                                <?php echo e(html_entity_decode($notice->title)); ?> | <?php echo e($notice->created_at->diffForHumans()); ?>

                                            </p>
                                        </div>
                                        <span href="#" class="btn-primary position-absolute">
                                            <?php echo e(\Carbon\Carbon::parse($notice->created_at)->translatedFormat('jS M, Y')); ?>

                                        </span>
                                    </div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- end notice-section -->

        <!-- start testimonial-section -->
        <?php if(count($testimonials) > 0): ?>
            <?php echo $__env->make('front_web.home.testimonials', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        <?php endif; ?>
        <!-- end testimonial-section -->

        <!-- start blog-section -->
        <?php if(count($recentBlog) > 0): ?>
        <section class="recent-blog-section py-100 bg-gray">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="section-heading text-center">
                            <h2 class="text-secondary bg-gray mx-xxl-3 mx-xl-5">
                                <?php echo app('translator')->get('messages.recent_blog'); ?>
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="blog-card">
                    <div class="row">
                        <?php $__currentLoopData = $recentBlog; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $post): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <div class="col-lg-4 col-md-6 mb-lg-0 mb-sm-5 mb-4">
                                <div class="card">
                                    <div class="card-img-top position-relative">
                                        <div class="inner-image">
                                            <img src="<?php echo e(empty($post->blog_image_url) ? asset('front_web/images/blog-1.png') : $post->blog_image_url); ?>" class="card-img-top" alt="Employee Motivation">
                                        </div>
                                        <div class="overlay position-absolute">
                                            <a href="<?php echo e(route('front.posts.details',$post->id)); ?>" class="btn text-white fs-16">
                                                <?php echo e(__('web.post_menu.read_more')); ?>

                                            </a>
                                        </div>
                                    </div>
                                    <div class="card-body py-30">
                                        <a href="<?php echo e(route('front.posts.details',$post->id)); ?>" class="text-secondary primary-link-hover">
                                            <h5 class="card-title fs-18">
                                                <?php echo e(html_entity_decode($post->title)); ?>

                                            </h5>
                                        </a>
                                        <div class="blog-desc card-text mb-3">
                                            <?php echo !empty($post->description) ? Str::limit(strip_tags($post->description),100,'...') : __('messages.common.n/a'); ?>

                                        </div>
                                        <span class="fs-14 text-gray">
                                            <?php if($post->comments_count == 0 || $post->comments_count == 1): ?>
                                                 <?php echo e(\Carbon\Carbon::parse($post->created_at)->translatedFormat('M jS Y')); ?> | <?php echo e($post->comments_count); ?> Comment
                                            <?php else: ?>
                                                <?php echo e(\Carbon\Carbon::parse($post->created_at)->translatedFormat('M jS Y')); ?> | <?php echo e($post->comments_count); ?> Comments
                                            <?php endif; ?>
                                    </span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </div>
            </div>
        </section>
        <?php endif; ?>
        <!-- end blog-section -->

        <!-- start-about-section -->
        <section class="about-section py-60 bg-secondary">
            <div class="container">
                <div class="row justify-content-between align-items-center">
                    <div class="col-sm-3 col-6 text-center mb-sm-0 mb-4">
                        <div class="about-desc">
                            <h3 class="text-primary counter" data-duration="3000" data-count="<?php echo e($dataCounts['candidates']); ?>"></h3>
                            <p class="text-white fs-18 mb-0">
                                <?php echo app('translator')->get('messages.front_home.candidates'); ?></p>
                        </div>
                    </div>
                    <div class="col-sm-3 col-6 text-center mb-sm-0 mb-4">
                        <div class="about-desc" data-wow-delay="400ms">
                            <h3 class="text-primary counter" data-duration="3000" data-count="<?php echo e($dataCounts['jobs']); ?>"></h3>
                            <p class="text-white fs-18 mb-0">
                                <?php echo app('translator')->get('messages.front_home.jobs'); ?></p>
                        </div>
                    </div>
                    <div class="col-sm-3 col-6 text-center">
                        <div class="about-desc" data-wow-delay="800ms">
                            <h3 class="text-primary counter" data-duration="3000" data-count="<?php echo e($dataCounts['resumes']); ?>"></h3>
                            <p class="text-white fs-18 mb-0">
                                <?php echo app('translator')->get('messages.front_home.resumes'); ?></p>
                        </div>
                    </div>
                    <div class="col-sm-3 col-6 text-center">
                        <div class="about-desc" data-wow-delay="800ms">
                            <h3 class="text-primary counter" data-count="<?php echo e($dataCounts['companies']); ?>" data-duration="3000"></h3>
                            <p class="text-white fs-18 mb-0">
                                <?php echo app('translator')->get('messages.front_home.companies'); ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end-about-section -->

        <!-- start pricing-packages-section -->
        <?php if(count($plans) > 0): ?>
            <section class="pricing-packages-section py-100">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-12">
                            <div class="section-heading text-center">
                                <h2 class="text-secondary bg-white ms-xl-5 me-xl-4"> <?php echo app('translator')->get('web.web_home.pricing_packages'); ?> </h2>
                            </div>
                        </div>
                    </div>
                    <section class="slider-test-section position-relative">
                        <div id="carouselExampleControl" class="carousel slide"
                             data-bs-ride="carousel">
                            <div class="carousel-inner">
                                <?php $__currentLoopData = $plansArray; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key=>$plans): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <div class="carousel-item position-relative <?php echo e(($key==0)?'active':''); ?>">
                                        <div class="row d-flex justify-content-center">
                                            <?php $__currentLoopData = $plans; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $plan): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <div class="col-lg-4 col-sm-6 my-3">
                                                    <div class="pricing-plan-card card me-lg-2">
                                                        <div class="card-body text-center py-4 px-lg-5 px-sm-4">
                                                            <h4 class="mb-0"><?php echo e(html_entity_decode( Str::limit($plan['name'], 50, '...') )); ?></h4>
                                                            <div class="card-body-top text-center d-flex justify-content-center">
                                                                <h3 class="text-primary"> <?php echo e(empty($plan['salaryCurrency']->currency_icon)?'$':$plan['salaryCurrency']->currency_icon); ?><?php echo e($plan['amount']); ?> </h3>
                                                                <span class="text-gray mt-xl-4 mt-sm-3 mt-2 ms-1"> / <?php if(array_key_exists('interval',$plan) && $plan['interval']=='year'): ?> Anual <?php else: ?> _('web.web_home.monthly') <?php endif; ?></span>
                                                            </div>
                                                            <div class="card-body-bottom">
                                                                <div class="text d-flex align-items-center justify-content-center my-4">
                                                                    <div class="check-box me-2">
                                                                        <i class="fa-solid fa-check text-black"></i>
                                                                    </div>
                                                                    <span class="text-gray">
                                                        <?php echo e($plan['allowed_jobs'].' '.($plan['allowed_jobs'] > 1 ? __('messages.plan.jobs_allowed') : __('messages.plan.job_allowed'))); ?></span>
                                                                </div>
                                                                <?php if(Auth::check() && Auth::user()->hasRole('Candidate')): ?>
                                                                    <a href="#"
                                                                       class="btn btn-primary" data-turbo="false"><?php echo e(__('messages.pricing_table.get_started')); ?></a>
                                                                <?php elseif(Auth::check() && Auth::user()->hasRole('Employer')): ?>
                                                                    <a href="<?php echo e(route('manage-subscription.index')); ?>"
                                                                       class="btn btn-primary" data-turbo="false"><?php echo e(__('messages.pricing_table.get_started')); ?></a>
                                                                <?php elseif(Auth::check() && Auth::user()->hasRole('Admin')): ?>
                                                                    <a href="#"
                                                                       class="btn btn-primary d-none" data-turbo="false"><?php echo e(__('messages.pricing_table.get_started')); ?></a>
                                                                <?php else: ?>
                                                                    <a href="<?php echo e(route('employer.register')); ?>"
                                                                       class="btn btn-primary" data-turbo="false"><?php echo e(__('messages.pricing_table.get_started')); ?></a>
                                                                <?php endif; ?>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </div>
                                    </div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControl"
                                    data-bs-slide="prev">
                                <i class="icon fa-solid fa-arrow-left text-black border-blue"></i>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControl"
                                    data-bs-slide="next">
                                <i class="icon fa-solid fa-arrow-right text-black border-blue"></i>
                            </button>
                        </div>

                    </section>
                </div>
            </section>
        <?php endif; ?>
    <?php echo e(Form::hidden('homeData',json_encode(getCountries()),['id'=>'indexHomeData'])); ?>

    <!-- end pricing-packages-section -->
    </div>
<?php $__env->stopSection(); ?>



        




        
        
        
        
        






<?php echo $__env->make('front_web.layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH /Users/fjalonsoo/Desktop/Proyectos/SocoJob/5. GitContent/resources/views/front_web/home/home.blade.php ENDPATH**/ ?>