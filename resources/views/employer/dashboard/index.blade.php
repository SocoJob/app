@extends('employer.layouts.app')
@section('title')
    {{ __('messages.employer_dashboard.dashboard') }}
@endsection
@push('css')
    <link rel="stylesheet" href="{{ asset('assets/css/daterangepicker.css') }}">
@endpush
@section('content')
    <div class="row">
        <div class="col-xl-4 col-sm-6 widget">
            <div class="shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2" style="background-color:#2476B7 !important">
                <div class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="fas fa-briefcase text-white fs-1-xl fa-4x"></i>
                </div>
                <div class="text-end text-white">
                    <h2 class="fs-1-xxl fw-bolder text-white">{{ isset($totalJobs)?numberFormatShort($totalJobs):'0' }}</h2>
                    <a href="{{ route('job.index') }}" class="mb-0 fs-4 fw-light text-white">{{ __('messages.employer_menu.total_jobs') }}</a>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-sm-6 widget">
            <div class="shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2" style="background-color: #5799CD;">
                <div class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="far fa-clock text-white fs-1-xl fa-4x"></i>
                </div>
                <div class="text-end text-white">
                    <h2 class="fs-1-xxl fw-bolder text-white">{{ isset($jobCount)?numberFormatShort($jobCount):'0' }}</h2>
                    <a href="{{ route('job.index') }}"  class="mb-0 fs-4 fw-light text-white">{{ __('messages.employer_menu.live_jobs') }}</a>
                </div>
            </div>
        </div>
        <!-- <div class="col-xl-4 col-sm-6 widget">
            <div class="bg-warning shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2">
                <div class="bg-yellow-300 widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="fas fa-pause-circle text-white fs-1-xl fa-4x"></i>
                </div> 
                <div class="text-end text-white">
                    <h2 class="fs-1-xxl fw-bolder text-white">{{ isset($pausedJobCount)?numberFormatShort($pausedJobCount):'0' }}</h2>
                    <h3 class="mb-0 fs-4 fw-light">{{ __('messages.employer_menu.paused_jobs') }}</h3>
                </div>
            </div>
        </div> -->
        <div class="col-xl-4 col-sm-6 widget">
            <div class="shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2"  style="background-color:#7DB0D8 !important">
                <div class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="fas fa-window-close text-white fs-1-xl fa-4x"></i>
                </div>
                <div class="text-end text-white">
                    <h2 class="fs-1-xxl fw-bolder text-white">{{ isset($closedJobCount)?numberFormatShort($closedJobCount):'0' }}</h2>
                    <a href="{{ route('job.index') }}" class="mb-0 fs-4 fw-light text-white">{{ __('messages.employer_menu.closed_jobs') }}</a>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-sm-6 widget">
            <div class="bg-info shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2">
                <div
                        class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="far fa-user text-white fs-1-xl fa-4x"></i>
                </div>
                <div class="text-end text-white">
                    <h2 class="fs-1-xxl fw-bolder text-white">{{ isset($followersCount)?numberFormatShort($followersCount):'0' }}</h2>
                    <a href="{{ route('followers.index') }}" class="mb-0 fs-4 fw-light text-white">{{ __('messages.employer_menu.followers') }}</a>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-sm-6 widget">
            <div class=" shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2"  style="background-color:#95CCED !important" >
                <div
                        class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                    <i class="fas fa-file fa-4x fs-1-xl {{getLoggedInUser()->theme_mode ? 'text-muted' : 'text-white'}}"></i>
                </div>
                <div class="text-end {{getLoggedInUser()->theme_mode ? 'text-muted' : 'text-white'}}">
                    <h2 class="fs-1-xxl fw-bolder text-light"> {{ isset($jobApplicationsCount) ? numberFormatShort($jobApplicationsCount) : '0' }}</h2>
                    <a href="{{ route('job.index') }}" class="mb-0 fs-4 fw-light text-light text-white">{{ __('messages.employer_menu.total_job_applications') }}</a>
                </div>
            </div>
        </div>
        <div class="col-xl-4 col-sm-6 widget">
            <div class=" shadow-md rounded-10 p-xxl-10 px-5 py-10 d-flex align-items-center justify-content-between my-sm-3 my-2"  style="background-color:#BFCCFA !important" >
                <div
                        class="widget-icon rounded-10 me-2 d-flex align-items-center justify-content-center">
                        <i class="fas fa-money-check-alt fa-4x fs-1-xl {{getLoggedInUser()->theme_mode ? 'text-muted' : 'text-white'}}"></i>
                    <!-- <i class="fas fa-file fa-4x fs-1-xl {{getLoggedInUser()->theme_mode ? 'text-muted' : 'text-white'}}"></i> -->
                </div>
                <div class="text-end {{getLoggedInUser()->theme_mode ? 'text-muted' : 'text-white'}}">
                    @php
                    $subscription = Auth::user()->subscriptions()->active()->first();

                    @endphp
   
                    <h2 class="fs-1-xxl fw-bolder text-light" style="font-size: 16px !important;"> {{ isset($subscription) ? $subscription->name : 'Sin Suscripción' }}</h2>
                    <a href="{{ route('manage-subscription.index') }}" class="mb-0 fs-4 fw-light text-light text-white">Plan de precios</a>
                </div>
            </div>
        </div>
    </div>
    <!-- <div class="card card-xl-stretch mb-xl-8">
  
        <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
                                    <span
                                            class="card-label fs-3 mb-1">{{ __('messages.job_applications') }}</span>
            </h3>
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="row justify-content-end">
                    <div class="col-lg-4 col-md-4 col-xl-3 col-sm-4 mt-3 mt-md-0 ">
                        <div class="card-header-action w-100">
                            {{  Form::select('jobs', $jobStatus, null, ['id' => 'jobStatus', 'class' => 'form-control status-filter', 'placeholder' => __('messages.flash.select_job')]) }}
                        </div>
                    </div>
                    <div class="col-lg-4  col-md-4 col-xl-3 col-sm-4 mt-3 mt-md-0">
                        <div class="card-header-action w-100">
                            {{  Form::select('gender', $gender, null, ['id' => 'gender', 'class' => 'form-control status-filter', 'placeholder' => __('messages.company.select_gender')]) }}
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-xl-4 col-sm-4 mt-0">
                        <div id="timeRange" class="time_range time_range_width w-30 border rounded-2 p-3">
                            <i class="far fa-calendar-alt"
                               aria-hidden="true"></i>&nbsp;&nbsp;<span></span> <b
                                    class="caret"></b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      
    </div> -->

   
   
@endsection
