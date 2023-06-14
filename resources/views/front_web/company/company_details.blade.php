@extends('front_web.layouts.app')
@section('title')
    {{ __('web.job_details.job_details') }}
@endsection
{{--@section('page_css')--}}
{{--    <link href="{{asset('front_web/scss/company-details.css')}}" rel="stylesheet" type="text/css">--}}
{{--@endsection--}}
@section('content')
    <div class="company-details-page">
        <!-- start hero section --> 
        <section class="hero-section position-relative bg-light py-40">
            <div class="container">
                <div class="row align-items-center justify-content-center ">
                    <div class="col-12">
                        <div class="row align-items-lg-center mb-3">
                            <div class="col-3 col-sm-2" >
                                <div class="company-profile-img mt-md-0 mt-3 w-100 h-100">
                                    <img src="{{ (!empty($companyDetail->company_url)) ? $companyDetail->company_url : asset('assets/img/infyom-logo.png') }}"
                                         alt="job_detail_logo">
                                </div>
                            </div>
                            <div class="col-9 col-sm-10">
                                <div class="hero-content ps-xl-0 ps-3">
                                    <h4 class="text-primary mb-0">
                                        {{ html_entity_decode($companyDetail->user->full_name) }}
                                    </h4>
                                    <div class="hero-desc d-flex align-items-center flex-wrap">
                                        <!-- <div class="d-flex align-items-center me-4 pe-2">
                                            <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                {{!empty($companyDetail->industry->name)? $companyDetail->industry->name : __('messages.common.n/a')}}</p>
                                        </div> -->
                                        @if(!empty($companyDetail->user->city_id) || (!empty($companyDetail->user->state_id)) || (!empty($companyDetail->user->country_id)))
                                            <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                                <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                                <p class="fs-14 text-gray mb-0">
                                                    {{ (!empty($companyDetail->user->city_id)) ? $companyDetail->user->city_name.', ' : '' }} {{ (!empty($companyDetail->user->country_id)) ? $companyDetail->user->country_name : '' }}</p>
                                            </div>
                                        @endif
                                        <!-- @isset($companyDetail->user->phone)
                                            <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                                <i class="fa-solid fa-phone text-gray me-3 fs-18"></i>
                                                <p class="fs-14 text-gray mb-0">
                                                    {{$companyDetail->user->phone}}</p>
                                            </div>
                                        @endisset -->
                                        <!-- <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                            <i class="fa-solid fa-envelope text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                {{$companyDetail->user->email}}</p>
                                        </div> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        @role('Candidate')
                        <div class="row align-items-lg-center">
                            <div class="hero-desc d-md-flex">
                                <div class="desc d-flex me-4 pe-2">
                                    <a href="javascript:void(0)" class="btn btn-outline-primary mx-auto"
                                       data-favorite-user-id="{{ (getLoggedInUserId() !== null) ? getLoggedInUserId() : null }}"
                                       data-favorite-company_id="{{ $companyDetail->id }}" id="addToFavourite">
                                        <i class="favouriteIcon text-primary"></i>
                                        <span class="favouriteText"></span>
                                    </a>
                                </div>
                                <!-- <div class="desc d-flex me-4 pe-2">
                                    @if($isReportedToCompany)
                                        <button type="button" class="btn btn-outline-danger reportToCompanyBtn"
                                                disabled data-bs-toggle="modal"
                                                data-bs-target="#reportToCompanyModal">
                                            {{ __('messages.candidate.already_reported') }}
                                        </button>
                                    @else
                                        <button data-bs-toggle="modal" data-bs-target="#reportToCompanyModal"
                                           class="btn btn-outline-danger  reportToCompanyBtn {{ ($isReportedToCompany) ? 'disabled' : '' }}"
                                            {{ ($isReportedToCompany) ? 'style=pointer-events:none;' : '' }}>{{ __('messages.company.report_to_company') }}
                                        </button>
                                    @endif
                                </div> -->
                            </div>
                        </div>
                        @endrole
                    </div>
                </div>
            </div>
        </section>
        <!-- end hero section -->

        <!-- start about-comapany section -->
        <section class="about-company-section py-60">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="about-company-left">
                            <h5 class="fs-18 text-secondary">@lang('web.web_company.about_company')</h5>
                            <div class="job-description mb-5 pb-lg-2">
                                {!! nl2br($companyDetail->details) !!}
                            </div>
                        </div>
                        <div class="our-latest-jobs">
                            <h5 class="fs-18 text-secondary mb-40">
                                {{ ($jobDetails->count() > 0 ) ? __('web.company_details.our_latest_jobs')  : __('web.home_menu.latest_job_not_available') }}
                            </h5>
                            <div class="row">
                                @foreach($jobDetails as $job)
                                    <div class="col-12 mb-40">
                                        <div class="job-card card py-30">
                                            <div class="row">
                                                <div class="col-lg-1 col-sm-2 col-3">
                                                    <img src="{{$job->company->company_url}}" class="card-img rounded"
                                                         alt="...">
                                                </div>
                                                <div class="col-sm-10 col-9  ps-lg-4 ms-xl-4 ms-lg-3">
                                                    <div class="card-body p-0 ">
                                                        @if(Str::length($job->job_title) < 35)
                                                            <a href="{{ route('front.job.details',$job->job_id) }}">
                                                                <h5 class="card-title fs-18 mb-0 d-inline-block">
                                                                    {{html_entity_decode($job->job_title)}}</h5>
                                                            </a>
                                                        @else
                                                            <a href="{{ route('front.job.details',$job->job_id) }}"
                                                               data-toggle="tooltip" data-placement="bottom"
                                                               class="hover-color"
                                                               title="{{ html_entity_decode($job->job_title) }}">
                                                                <h5 class="card-title fs-18 mb-0">
                                                                    {{ Str::limit(html_entity_decode($job->job_title),30,'...') }}
                                                                </h5>
                                                            </a>
                                                        @endif
                                                    </div>
                                                    <div class="card-desc d-sm-flex mt-4">
                                                        <div class="desc d-flex me-sm-4 mb-sm-0 mb-3 ">
                                                            <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                                            <p class="fs-14 text-gray mb-0">
                                                                {{$job->jobCategory->name}}</p>
                                                        </div>
                                                        @if(!empty($job->country_name))
                                                            <div class="desc d-flex">
                                                                <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                                                @if(Str::length($job->full_location) < 45)
                                                                    <p class="fs-14 text-gray">
                                                                        {{$job->full_location}}
                                                                    </p>
                                                                @else
                                                                    <p class="fs-14 text-gray" data-toggle="tooltip"
                                                                           data-placement="bottom"
                                                                       title="{{$job->full_location}}">
                                                                        {{ Str::limit($job->full_location,45,'...') }}
                                                                    </p>
                                                                @endif
                                                            </div>
                                                        @endif
                                                    </div>
                                                    <div class="desc d-flex flex-wrap mt-sm-2">
                                                        @foreach($job->jobsSkill->take(1) as $skills)
                                                            <p class="text text-primary fs-14 mt-sm-0 mt-2 mb-0 me-3">
                                                                {{$skills->name}}</p>
                                                            @if(count($job->jobsSkill) - 1 > 0)
                                                                <p class="fs-14 text text-primary mt-sm-0 mt-2 mb-0 ">
                                                                    {{'+'.(count($job->jobsSkill) - 1)}}
                                                                </p>
                                                            @endif
                                                        @endforeach
                                                    </div>
                                                </div>
                                                @if($job->activeFeatured)
                                                    <div class="bookmark text-end position-absolute pe-5">
                                                        <i class="text-primary fa-solid fa-bookmark featured"></i>
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                                @if(($jobDetails->count() > 0 ))
                                    <div class="row justify-content-center">
                                        <div class="col-8 text-center">
                                            <a href="{{ route('front.search.jobs',array('company'=> $companyDetail->id)) }}"
                                               class="btn btn-primary mb-40 mt-lg-4">
                                                @lang('web.common.show_all')</a>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="about-company-right br-10 px-40 bg-gray">
                            <!-- <div class="desc d-flex justify-content-between">
                                <p class="fs-14 text-secondary">
                                    @lang('web.web_company.ownership'):</p>
                                <p class="fs-14 text-gray text-end">
                                    {{!empty($companyDetail->ownerShipType->name)? $companyDetail->ownerShipType->name : __('messages.common.n/a')}}</p>
                            </div> -->
                            <div class="desc d-flex justify-content-between">
                                <p class="fs-14 text-secondary">
                                    @lang('web.web_company.company_size'):</p>
                                <p class="fs-14 text-gray text-end">
                                    {{!empty($companyDetail->companySize->size)? $companyDetail->companySize->size : __('messages.common.n/a')}}</p>
                            </div>
                            <div class="desc d-flex justify-content-between">
                                <p class="fs-14 text-secondary">
                                    @lang('web.web_jobs.founded_in'):</p>
                                <p class="fs-14 text-gray text-end">
                                    {{!empty($companyDetail->established_in)? $companyDetail->established_in : __('messages.common.n/a')}}</p>
                            </div>
                            <!-- @if($companyDetail->user->phone)
                                <div class="desc d-flex justify-content-between">
                                    <p class="fs-14 text-secondary">
                                        @lang('web.web_jobs.phone'):</p>
                                    <p class="fs-14 text-gray text-end">
                                        {{$companyDetail->user->phone}}</p>
                                </div>
                            @endif
                            <div class="desc d-flex justify-content-between">
                                <p class="fs-14 text-secondary">@lang('web.common.email'):</p>
                                <a href="#" class="fs-14 text-gray text-end">{{$companyDetail->user->email}}</a>
                            </div> -->
                            <div class="desc d-flex justify-content-between">
                                <p class="fs-14 text-secondary">
                                    @lang('web.common.location'):</p>
                                <p class="fs-14 text-gray text-end">
                                    {{ (isset($companyDetail->location)) ? html_entity_decode(Str::limit($companyDetail->location,12,'...')) : __('messages.common.n/a') }} {{ (isset($companyDetail->location2)) ? ','.html_entity_decode(Str::limit($companyDetail->location2,12,'...')) : '' }}
                                </p>
                            </div>
                            @if(isset($companyDetail->user->facebook_url) || isset($companyDetail->user->twitter_url) || isset($companyDetail->user->pinterest_url) || isset($companyDetail->user->google_plus_url) || isset($companyDetail->user->linkedin_url))
                                <div class="desc d-flex justify-content-between">
                                    <p class="fs-14 text-secondary">@lang('web.web_company.social_media'):</p>
                                    <p class="fs-14 text-gray text-end">
                                        @if(isset($companyDetail->user->facebook_url))
                                            <a href="{{ (isset($companyDetail->user->facebook_url)) ? addLinkHttpUrl($companyDetail->user->facebook_url) : 'javascript:void(0)' }}"
                                               class="ms-2" target="_blank">
                                                <i class="fa-brands fa-facebook-f"></i></a>
                                        @endif
                                        @if(isset($companyDetail->user->linkedin_url))
                                            <a href="{{ (isset($companyDetail->user->linkedin_url)) ? addLinkHttpUrl($companyDetail->user->linkedin_url) : 'javascript:void(0)' }}"
                                               class="ms-2" target="_blank">
                                                <i class="fa-brands fa-linkedin-in"></i></a>
                                        @endif
                                        @if(isset($companyDetail->user->twitter_url))
                                            <a href="{{ (isset($companyDetail->user->twitter_url)) ? addLinkHttpUrl($companyDetail->user->twitter_url) : 'javascript:void(0)' }}"
                                               class="ms-2" target="_blank">
                                                <i class="fa-brands fa-twitter"></i></a>
                                        @endif
                                        @if(isset($companyDetail->user->google_plus_url))
                                            <a href="{{ (isset($companyDetail->user->google_plus_url)) ? addLinkHttpUrl($companyDetail->user->google_plus_url) : 'javascript:void(0)' }}"
                                               class="ms-2" target="_blank">
                                                <i class="fa-brands fa-google-plus-g"></i></a>
                                        @endif
                                        @if(isset($companyDetail->user->pinterest_url))
                                            <a href="{{ (isset($companyDetail->user->pinterest_url)) ? addLinkHttpUrl($companyDetail->user->pinterest_url) : 'javascript:void(0)' }}"
                                               class="ms-2" target="_blank">
                                                <i class="fa-brands fa-pinterest-p"></i></a>
                                        @endif
                                    </p>
                                </div>
                            @endif
                            @isset($companyDetail->website)
                                <a href="{{ (isset($companyDetail->website))
                                        ?
                                            (!str_contains($companyDetail->website,'https://')
                                            ? 'https://'.$companyDetail->website
                                            : $companyDetail->website)
                                        : 'javascript:void(0)' }}"
                                   class="col-12 btn btn-primary" target="_blank">
                                    {{ (isset($companyDetail->website)) ? preg_replace("(^https?://www.)", "", $companyDetail->website) : 'N/A' }}</a>
                            @endisset
                        </div>
                    </div>
                </div>
            </div>
        </section>

        @role('Candidate')
        @include('front_web.company.report_to_company_modal')
        @endrole
        <!-- end about-comapany section -->
        {{ Form::hidden('isCompanyAddedToFavourite', $isCompanyAddedToFavourite, ['id' => 'isCompanyAddedToFavourite']) }}
        {{ Form::hidden('followText', __('web.company_details.follow'), ['id' => 'followText']) }}
        {{ Form::hidden('unfollowText', __('web.company_details.unfollow'), ['id' => 'unfollowText']) }}
    </div>
@endsection
{{--@section('page_scripts')--}}
{{--    <script>--}}
        {{--let addCompanyFavouriteUrl = "{{ route('save.favourite.company') }}"--}}
        {{--let isCompanyAddedToFavourite = "{{ $isCompanyAddedToFavourite }}"--}}
        {{--let reportToCompanyUrl = "{{ route('report.to.company') }}"--}}
        {{--let followText = "{{ __('web.company_details.follow') }}"--}}
        {{--let unfollowText = "{{ __('web.company_details.unfollow') }}"--}}
{{--    </script>--}}
{{--@endsection--}}
