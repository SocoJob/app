@extends('front_web.layouts.app')
@section('title')
    {{ __('web.job_details.job_details') }}
@endsection
{{--@section('page_css')--}}
{{--    <link href="{{asset('front_web/scss/job-details.css')}}" rel="stylesheet" type="text/css">--}}
{{--@endsection--}}
@section('content')
    <div class="job-details-page">
        <!-- start hero section -->
        <section class="hero-section position-relative bg-light py-40">
            <div class="container">
                <div class="row align-items-center justify-content-center">
                    <div class="col-12">
                        <div class="row align-items-lg-center mb-3">
                            <div class="col-sm-2 col-2">
                                <div class="job-profile-img mt-md-0 mt-3 pt-sm-1 w-100 h-auto">
                                    <img src="{{$job->company->company_url}}" alt="job_detail_logo" class="rounded">
                                </div>
                            </div>
                            <div class="col-sm-7 col-10 mb-2">
                                <div class="hero-content ps-xl-0 ps-3 ">
                                    <h4 class="text-primary mb-0">
                                        {{ html_entity_decode(Str::limit($job->job_title,50,'...')) }}
                                        @role('Candidate')
                                            @if(!$isJobApplicationRejected)
                                                <button class="btn p-0" data-favorite-user-id="{{ (getLoggedInUserId() !== null) ? getLoggedInUserId() : null }}"
                                                        data-favorite-job-id="{{ $job->id }}" id="addToFavourite">
                                                    <span id="favorite">
                                                        <i class=" {{ ($isJobAddedToFavourite)? 'fa-solid fa-bookmark featured':'fa-regular fa-bookmark'}}  text-primary fs-18"></i>
                                                    </span>
                                                </button>
                                            @endif
                                        @endrole
                                    </h4>
                                    <div class="hero-desc d-flex align-items-center flex-wrap">
                                        <div class="d-flex align-items-center me-4 pe-2">
                                            <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                {{ html_entity_decode($job->jobCategory->name) }}</p>
                                        </div>
                                        <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                            <i class="fa-solid fa-clock text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                {{ $job->created_at->locale('es')->diffForHumans() }}</p>
                                        </div>
                                        @if($job->hide_salary=='0')
                                            <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                                <i class="fa-solid fa-money-bill text-gray me-3 fs-18"></i>
                                                <span class="text-gray mb-0">
                                                    {{$job->currency->currency_icon}} {{$job->salary_from.' - '.$job->salary_to}}</span>
                                            </div>
                                        @endif
                                    </div>
                                    @if(count($job->jobsTag) > 0)
                                        <div class="hero-desc d-md-flex">
                                            @foreach($job->jobsTag->pluck('name') as $value)
                                                <div class="desc d-flex {{$loop->last?'':'me-2 pe-2'}}">
                                                    <span class="tag-badge">
                                                        {{ $value }}</span>
                                                </div>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            </div>
                            <div class="col-12 col-lg-3 d-flex justify-content-center mt-1">
                            @auth
                                @role('Candidate')
                                <div class="hero-desc d-flex flex-wrap">
                                    <!-- <div class="desc d-flex me-4 pe-2 d-none">
                                        <button type="button" class="btn btn-outline-success emailJobToFriend"
                                                data-bs-toggle="modal" data-bs-target="#emailJobToFriendModal">
                                            {{ __('web.job_details.email_to_friend') }}
                                        </button>
                                    </div> -->
                                    <!-- <div class="desc d-flex me-4 pe-2 d-none">
                                        @if($isJobReportedAsAbuse)
                                            <button type="button" class="btn btn-outline-danger reportJobAbuse"
                                                    disabled data-bs-toggle="modal"
                                                    data-bs-target="#reportJobAbuseModal">
                                                {{ __('messages.candidate.already_reported') }}
                                            </button>
                                        @else
                                            <button type="button" class="btn btn-outline-danger reportJobAbuse"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#reportJobAbuseModal">
                                                {{ __('web.job_details.report_abuse') }}
                                            </button>
                                        @endif
                                    </div> -->
                                    <div class="desc d-flex me-4 pe-2">
                                        @if(!$isApplied && !$isJobApplicationRejected && ! $isJobApplicationCompleted && ! $isJobApplicationShortlisted)
                                            @if($isActive && !$job->is_suspended )
                                                <button
                                                        class="btn {{ $isJobDrafted ? 'btn-primary' : 'btn-primary' }} "
                                                        onclick="window.location='{{ route('show.apply-job-form', $job->job_id) }}'">
                                                    {{ $isJobDrafted ? __('web.job_details.edit_draft') : __('web.job_details.apply_for_job') }}
                                                </button>
                                            @endif
                                        @else
                                            <button class="btn btn-primary ml-2">{{ __('web.job_details.already_applied') }}</button>
                                        @endif
                                    </div>
                                </div>
                                @endrole
                            @else
                                @isset($job->job_expiry_date)
                                    @if($isActive && !$job->is_suspended && \Carbon\Carbon::today()->toDateString() < $job->job_expiry_date->toDateString())
                                        <div class="hero-desc d-flex flex-wrap">
                                            <!-- <div class="desc d-flex me-4 pe-2">
                                                <button class="btn btn-outline-dark mb-3"
                                                        onclick="window.location='{{ route('candidate.register') }}'">{{ __('web.job_details.register_to_apply') }}
                                                </button>
                                            </div> -->
                                            <div class="desc d-flex me-4 pe-2">
                                                <button class="btn btn-primary mb-3"
                                                        onclick="window.location='{{ route('front.candidate.login') }}'">
                                                    {{ __('web.job_details.apply_for_job') }}
                                                </button>
                                            </div>
                                        </div>
                                    @endif
                                @endisset
                            @endauth
                        </div>
                        </div>
                      
                    </div>
                </div>
            </div>
        </section>
        <!-- end hero section -->
        <!-- start job-details section -->
        <section class="job-details-section">
            <div class="container">
                <div class="row">
                    @if($job->is_suspended || !$isActive)
                        <div class="col-md-12 col-sm-12">
                            <div class="alert alert-warning text-warning bg-transparent" role="alert">
                                El trabajo está
                                <strong> {{\App\Models\Job::STATUS[$job->status]}}.</strong>
                            </div>
                        </div>
                    @endif
                    <!-- @if(Session::has('warning'))
                        <div class="col-md-12 col-sm-12">
                            <div class="alert alert-warning" role="alert">
                                {{ Session::get('warning') }}
                                <a href="{{ route('candidate.profile',['section'=> 'resume']) }}"
                                   class="alert-link ml-2 ">{{ __('web.job_details.click_here') }}</a> {{ __('web.job_details.to_upload_resume') }}
                                .
                            </div>
                        </div>
                    @endif -->
                   
                    <div class="row">
                        <div class="job-desc-right br-10 px-40 bg-gray mb-40 mt-lg-0 mt-md-5 mt-4 col-12 col-sm-6">
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-calendar-days text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">
                                        @lang('web.job_details.date_posted'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ \Carbon\Carbon::parse($job->created_at)->locale('es')->translatedFormat('d F, Y') }}</p>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2 d-none">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-clock text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">
                                        @lang('web.web_jobs.expiration_date'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ \Carbon\Carbon::parse($job->job_expiry_date)->translatedFormat('jS M, Y') }}
                                </p>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-location-dot text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">@lang('web.common.location'):</p>
                                </div>
                                @php
                                    $texttooltip = '';
                                    if (!empty($job->city_id)){
                                          $texttooltip =$job->city_name;
                                    }
                                    if (!empty($job->state_id)){
                                         $texttooltip = $texttooltip.", ".$job->state_name;
                                    }
                                    if (!empty($job->country_id)){
                                        $texttooltip = $texttooltip.", ".$job->country_name;
                                    }
                                        
                                @endphp
                                <p class="fs-14 text-gray text-end text-truncate" data-toggle="tooltip"  title="{{ $texttooltip}}"> 
                                        
                                   
                                    @if (!empty($job->city_id))
                                        {{$job->city_name}} ,
                                    @endif
                                    @if (!empty($job->state_id))
                                        {{$job->state_name}},
                                    @endif
                                    @if (!empty($job->country_id))
                                        {{$job->country_name}}
                                    @endif
                                    @if (empty($job->country_id))
                                        {{ __('web.job_details.location_information_not_available') }}
                                    @endif
                                </p>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-briefcase text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">@lang('messages.job.job_type'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ ($job->jobType) ? html_entity_decode($job->jobType->name) : __('messages.common.n/a') }}</p>
                            </div>
                            @if($job->jobShift)
                                <div class="desc-box d-flex justify-content-between mb-2">
                                    <div class="d-flex align-items-center mb-3">
                                        <i class="fa-solid fa-briefcase text-primary me-2 fs-18"></i>
                                        <p class="fs-14 text-secondary mb-0">@lang('messages.job.job_shift'):</p>
                                    </div>
                                    <p class="fs-14 text-gray text-end">
                                        {{ html_entity_decode($job->jobShift->shift) }}
                                    </p>
                                </div>
                            @endif
                         
                            <div class="desc-box d-flex justify-content-between mb-2 d-none">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-user-plus text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">@lang('messages.positions'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ isset($job->position)?$job->position:'0' }}</p>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-briefcase text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">
                                        @lang('messages.job_experience.job_experience'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    @isset($job->careerLevel) {{$job->careerLevel->level_name}}  @endisset Años</p>
                            </div>
                            <!-- <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-calendar-day text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">
                                        @lang('messages.job.salary_period'):</p>
                                </div>
                                @isset($job->salaryPeriod)
                                <p class="fs-14 text-gray text-end">{{ $job->salaryPeriod->period }}</p>
                                @endisset
                            </div> -->
                            <div class="desc-box d-flex justify-content-between mb-2 d-none">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="fa-solid fa-laptop text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">
                                        @lang('messages.job.is_freelance'):</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ $job->is_freelance == 1 ? __('messages.common.yes') : __('messages.common.no') }}</p>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <div class="d-flex align-items-center mb-3">
                              
                                    <i class="fa-solid fa-house-user text-primary me-2 fs-18"></i>
                                    <p class="fs-14 text-secondary mb-0">Alojamiento</p>
                                </div>
                                <p class="fs-14 text-gray text-end">
                                    {{ $job->accommodation == 'si' ? __('messages.common.yes') : __('messages.common.no') }}</p>
                            </div>
                            <div class="desc-box d-none">
                                <p class="fs-18 text-secondary my-4">
                                    @lang('web.job_details.job_skills')</p>
                                <div class="desc d-flex flex-wrap">
                                    @if($job->jobsSkill->isNotEmpty())
                                        @foreach($job->jobsSkill->pluck('name') as $key => $value)
                                            <p class="fs-14 text-gray bg-white py-2 br-gray px-3 {{$loop->last?'':'me-4'}} rounded-3">
                                                {{html_entity_decode($value) }}</p>
                                        @endforeach
                                    @else
                                        <p class="fs-14 text-gray bg-white py-2 br-gray px-3">N/A</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="company-overview br-10 px-40 bg-gray col-12 col-sm-6">
                            <h5 class="fs-18 text-secondary mb-4">
                                @lang('web.job_details.company_overview')</h5>
                            <div class="company-profile d-flex mb-4">
                                <div class="profile" style="width: 15rem;">
                                    <img src="{{ $job->company->company_url }}">
                                </div>
                                <div class="desc ms-4">
                                    <p class="fs-18 text-secondary mb-0 ">
                                        {{ html_entity_decode($job->company->user->first_name) }}</p>
                                    <a href="{{ route('front.company.details', $job->company->unique_id) }}" class="fs-14 text-primary">
                                        @lang('web.web_jobs.view_company_profile')</a>
                                </div>
                            </div>
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <p class="fs-14 text-secondary">@lang('web.web_jobs.founded_in'):</p>
                                <p class="fs-14 text-gray text-end">
                                    {{$job->company->established_in}}</p>
                            </div>
                            <!-- @if($job->company->user->phone)
                                <div class="desc-box d-flex justify-content-between mb-2">
                                    <p class="fs-14 text-secondary">@lang('web.web_jobs.phone'):</p>
                                    <p class="fs-14 text-gray text-end">
                                        {{$job->company->user->phone}}</p>
                                </div>
                            @endif -->
                            <div class="desc-box d-flex justify-content-between mb-2">
                                <p class="fs-14 text-secondary">@lang('web.common.location_company'):</p>
                                @if (!empty($job->company->location))
                                    <p class="fs-14 text-gray text-end">{{$job->company->location}}</p>
                                @else
                                    <p class="fs-14 text-gray text-end">
                                        {{ __('web.job_details.location_information_not_available') }}
                                    </p>
                                @endif
                            </div>
                            @isset($job->company->companySize->size)
                            <div class="dec-box d-flex justify-content-between mb-2">
                                <p class="fs-14 text-secondary">@lang('messages.company.company_size')</p>
                                <p class="fs-14 text-gray text-end">{{ $job->company->companySize->size }}</p>
                            </div>
                            @endisset
                            <a href="{{ route('front.company.details', $job->company->unique_id) }}" class="col-6 btn btn-primary d-flex justify-content-center mx-auto">
                                {{ __('web.companies_menu.opened_jobs') }}: {{ $jobsCount?$jobsCount : 0 }}</a>
                                    @if($job->company->website)
                                        <a target="_blank" href="{{$job->company->website}}"
                                                                class="col-12 btn btn-success mt-2">{{$job->company->website}}</a>
                                    @endif
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-log-6">
                        @if(count($getRelatedJobs)>0)
                            <div class="row our-latest-jobs">
                                <h5 class="fs-18 text-secondary mt-5 mb-4 pb-2">
                                    @lang('web.job_details.related_jobs')
                                </h5>
                                @foreach($getRelatedJobs as $relatedJob)
                                    @if($relatedJob->status != \App\Models\Job::STATUS_DRAFT)
                                        <div class="col-12 mb-40">
                                            <div class="job-card card py-30 ">
                                                <div class="row">
                                                    <div class="col-lg-1 col-sm-2 col-3">
                                                        <img src="{{$relatedJob->company->company_url}}" class="card-img" alt="">
                                                    </div>
                                                    <div class="col-sm-10 col-9 ps-lg-4 ms-xl-4 ms-lg-3">
                                                        <div class="card-body p-0">
                                                            <a href="{{route('front.job.details',$relatedJob['job_id']) }}" class="text-secondary primary-link-hover">
                                                                <h5 class="card-title fs-18 mb-0 d-inline-block">
                                                                    {{ html_entity_decode($relatedJob['job_title']) }}
                                                                </h5>
                                                            </a>
                                                        </div>
                                                        <div class="card-desc d-sm-flex mt-4 flex-wrap">
                                                            <div class="d-flex me-sm-4 mb-sm-0">
                                                                <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                                                <p class="fs-14 text-gray">
                                                                    {{$relatedJob->jobCategory->name}}</p>
                                                            </div>
                                                            <div class="d-flex me-sm-4">
                                                                <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                                                <p class="fs-14 text-gray">
                                                                    {{ (!empty($relatedJob->full_location)) ? $relatedJob->full_location : 'Location Info. not available.'}}</p>
                                                            </div>
                                                            <div class="d-flex me-sm-4">
                                                                    <i class="fa-solid fa-clock text-gray me-3 fs-18"></i>
                                                                    <p class="fs-14 text-gray">
                                                                        {{$relatedJob->created_at->locale('es')->diffForHumans()}}</p>
                                                                </div>
                                                            @if($job->hide_salary=='0')
                                                                    <div class="d-flex">
                                                                        <span class="text-gray me-3">
                                                                            {{$relatedJob->currency->currency_icon}}&nbsp</span>
                                                                        <p class="fs-14 text-gray">
                                                                            {{ $relatedJob->salary_from}} - {{$relatedJob->salary_to}}</p>
                                                                    </div>
                                                                @endif
                                                        </div>
                                                        <div class="d-flex flex-wrap mt-sm-2">
                                                            @foreach($relatedJob->jobsSkill->take(1) as $jobSkill)
                                                                <p class="text text-primary fs-14 mt-sm-0 mt-2 mb-0 me-3">
                                                                    {{$jobSkill->name}}</p>
                                                                @if(count($relatedJob->jobsSkill) - 1 > 0)
                                                                    <p class="fs-14 text text-primary mt-sm-0 mt-2 mb-0">
                                                                        {{'+'.(count($relatedJob->jobsSkill) - 1)}}
                                                                    </p>
                                                                @endif
                                                            @endforeach
                                                        </div>
                                                    </div>
                                                    @if($relatedJob->activeFeatured)
                                                        <div class="bookmark text-end position-absolute end-0 me-3">
                                                            <i class="text-primary fa-solid fa-bookmark"></i>
                                                        </div>
                                                    @endif
                                                </div>
                                            </div>
                                        </div>
                                    @endif
                                @endforeach
                                @if(($getRelatedJobs->count() > 0 ))
                                    <div class="row justify-content-center">
                                        <div class="col-8 text-center">
                                            <a href="{{ route('front.search.jobs') }}"
                                               class="btn btn-primary mb-40 mt-lg-4">
                                                @lang('web.common.show_all')</a>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        @endif
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end job-details section -->
    </div>
    @role('Candidate')
        @include('front_web.jobs.email_to_friend')
        @include('front_web.jobs.report_job_modal')
    @endrole
    {{ Form::hidden('isJobAddedToFavourite',  $isJobAddedToFavourite, ['id' => 'isJobAddedToFavourite']) }}
    {{ Form::hidden('removeFromFavorite',  __('web.job_details.remove_from_favorite'), ['id' => 'removeFromFavorite']) }}
    {{ Form::hidden('addToFavorites',  __('web.job_details.add_to_favorite'), ['id' => 'addToFavorites']) }}
@endsection
{{--@section('page_scripts')--}}
{{--    <script>--}}
        {{--let addJobFavouriteUrl = "{{ route('save.favourite.job') }}";--}}
        {{--let reportAbuseUrl = "{{ route('report.job.abuse') }}";--}}
        {{--let emailJobToFriend = "{{ route('email.job') }}";--}}
        {{--        let isJobAddedToFavourite = "{{ $isJobAddedToFavourite }}";--}}
        {{--let removeFromFavorite = "{{ __('web.job_details.remove_from_favorite') }}";--}}
        {{--let addToFavorites = "{{ __('web.job_details.add_to_favorite') }}";--}}
{{--    </script>--}}
{{--@endsection--}}
