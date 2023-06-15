<!-- start header section -->
<header class="bg-light">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-3 col-4">
                <a href="<?php echo e(route('front.search.jobs')); ?>" class="header-logo">
                    <img src="<?php echo e(asset($settings['logo'])); ?>" alt="Jobs" class="img-fluid"/>
                </a>
            </div>
            <div class="col-lg-9 col-8">
                <nav class="navbar navbar-expand-lg navbar-light justify-content-end py-0">
                    <button class="navbar-toggler border-0 p-0" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul class="navbar-nav align-items-center py-2 py-lg-0">
                            <!-- <li class="nav-item">
                                <a class="nav-link <?php echo e(Request::is('/') ? 'active' : ''); ?>" aria-current="page"
                                   href="https://socojob.com/"><?php echo e(__('web.home')); ?></a>
                            </li> -->
                            <li class="nav-item">
                                <a class="nav-link <?php echo e(Request::is('search-jobs') || Request::is('job-details*') ? 'active' : ''); ?>"
                                   href="<?php echo e(route('front.search.jobs')); ?>"><?php echo e(__('web.jobs')); ?></a>
                            </li>
                            <?php if(auth()->check() && auth()->user()->hasRole('Candidate')): ?>
                            <li class="nav-item">   
                                <a class="nav-link <?php echo e(Request::is('company-lists') || Request::is('company-details*') ? 'active' : ''); ?>"
                                   href="<?php echo e(route('front.company.lists')); ?>"><?php echo e(__('web.companies')); ?></a>
                            </li>
                            <?php endif; ?>
                            <?php if(auth()->guard()->check()): ?>
                                <?php if(auth()->check() && auth()->user()->hasRole('Employer|Admin')): ?>
                                <li class="nav-item">
                                    <a class="nav-link <?php echo e(Request::is('candidate-lists') || Request::is('candidate-details*') ? 'active' : ''); ?>"
                                       href="<?php echo e(route('front.candidate.lists')); ?>"><?php echo e(__('web.job_seekers')); ?></a>
                                </li>
                                <?php endif; ?>
                            <?php endif; ?>
                            <!-- <li class="nav-item">
                                <a class="nav-link <?php echo e(Request::is('about-us') ? 'active' : ''); ?>"
                                   href="https://socojob.com/nosotros/">Nosotros </a>
                            </li> -->
                            <!-- <li class="nav-item">
                                <a class="nav-link <?php echo e(Request::is('contact-us') ? 'active' : ''); ?>"
                                   href="<?php echo e(route('front.contact')); ?>"><?php echo e(__('web.contact_us')); ?></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?php echo e(Request::is('posts*') ? 'active' : ''); ?>"
                                   href="https://socojob.com/blog/">Blog</a>
                            </li> -->
                            
                        </ul>
                        <?php if(!Auth::check()): ?>
                            <div class="text-lg-end header-btn-grp ms-lg-3">
                                <ul class="navbar-nav align-items-center py-2 py-lg-0">
                                    <li class="nav-item">
                                        <a href="<?php echo e(route('front.candidate.login')); ?>" class="nav-link me-xxl-3 me-2 mb-3 mb-lg-0 nav-link"><?php echo e(__('web.login')); ?></a>
                                        <ul class="nav submenu">
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('front.candidate.login')); ?>"
                                                   class="nav-link d-flex align-items-center text-capitalize">
                                                    <?php echo e(__('messages.notification_settings.candidate')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('front.employee.login')); ?>"
                                                   class="nav-link d-flex align-items-center  text-capitalize">
                                                    <?php echo e(__('messages.company.employer')); ?>

                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="nav-item">
                                        <a href="<?php echo e(route('candidate.register')); ?>" class="mb-3 mb-lg-0 nav-link"><?php echo e(__('web.register')); ?></a>
                                        <ul class="nav submenu">
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('candidate.register')); ?>"
                                                   class="nav-link d-flex align-items-center  text-capitalize">
                                                    <?php echo e(__('messages.notification_settings.candidate')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('employer.register')); ?>"
                                                   class="nav-link d-flex align-items-center text-capitalize ">
                                                    <?php echo e(__('messages.company.employer')); ?>

                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        <?php else: ?>
                            <div class="text-lg-end header-btn-grp ms-xxl-5 ms-lg-3">
                                <ul class="navbar-nav align-items-center py-2 py-lg-0">
                                    <li class="nav-item">
                                        <a href="javascript:void(0)" class="mb-3 mb-lg-0 user-logo d-flex align-items-center" >
                                            <img src="<?php echo e(getLoggedInUser()->avatar); ?>" width="50" class="rounded object-cover"/>&nbsp;&nbsp;
                                            <span class="text-truncate text-primary"> <?php echo e(__('messages.common.hi')); ?>, <?php echo e(getLoggedInUser()->full_name); ?></span>
                                        </a>
                                        <ul class="nav submenu">
                                            <li class="nav-item">
                                                <a href="<?php echo e(dashboardURL()); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('web.go_to_dashboard')); ?>

                                                </a>
                                            </li>
                                            <?php if(auth()->check() && auth()->user()->hasRole('Candidate')): ?>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('candidate.profile')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('web.my_profile')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('favourite.jobs')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.favourite_jobs')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('favourite.companies')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.candidate_dashboard.followings')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('candidate.applied.job')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.applied_job.applied_jobs')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('candidate.job.alert')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.job.job_alert')); ?>

                                                </a>
                                            </li>
                                            <?php endif; ?>
                                            <?php if(auth()->check() && auth()->user()->hasRole('Employer')): ?>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('company.edit.form', \Illuminate\Support\Facades\Auth::user()->owner_id)); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('web.my_profile')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('job.index')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.employer_menu.jobs')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('followers.index')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.employer_menu.followers')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('manage-subscription.index')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.employer_menu.manage_subscriptions')); ?>

                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a href="<?php echo e(route('transactions.index')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center">
                                                    <?php echo e(__('messages.employer_menu.transactions')); ?>

                                                </a>
                                            </li>
                                            <?php endif; ?>
                                            <li class="nav-item">
                                                <a href="<?php echo e(url('logout')); ?>" data-turbo="false"
                                                   class="nav-link d-flex align-items-center"
                                                   onclick="event.preventDefault(); localStorage.clear();  document.getElementById('logout-form').submit();">
                                                    <?php echo e(__('web.logout')); ?>

                                                </a>
                                                <form id="logout-form" action="<?php echo e(url('/logout')); ?>" method="POST"
                                                      class="d-none">
                                                    <?php echo e(csrf_field()); ?>

                                                </form>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</header>
<!-- end header section -->
<?php /**PATH /Users/fjalonsoo/Desktop/Proyectos/SocoJob/5. GitContent/resources/views/front_web/layouts/header.blade.php ENDPATH**/ ?>