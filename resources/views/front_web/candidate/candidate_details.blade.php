@extends('front_web.layouts.app')
@section('title')
    {{ __('messages.candidate.candidate_details') }}
@endsection
{{--@section('page_css')--}}
{{--    <link href="{{asset('front_web/scss/candidate-details.css')}}" rel="stylesheet" type="text/css">--}}
{{--@endsection--}}
@section('content')
    <section class="hero-section position-relative bg-light py-40">
        <div class="container">
            <div class="row align-items-center justify-content-center ">
                <div class="col-12">
                    <div class="row align-items-lg-center mb-3">
                        <div class="col-lg-1 col-sm-2 col-3">
                            <div class="candidate-profile-img mt-md-0 mt-3">
                                <img src="{{ (!empty($candidateDetails->user->avatar)) ? $candidateDetails->user->avatar : asset('assets/img/infyom-logo.png') }}"
                                        alt="candidate profile">
                            </div>
                        </div>
                        <div class="col-sm-10 col-9">
                            <div class="hero-content ps-xl-0 ps-3">
                                <h4 class="text-primary mb-0">
                                    @if(isset($view) and $view == true)
                                        {{ $candidateDetails->user->first_name }} {{ $candidateDetails->user->last_name }} 
                                    @else
                                        {{ $candidateDetails->user->first_name }} {{ Str::limit($candidateDetails->user->last_name,1) }} 
                                    @endif
                                </h4>
                                <div class="hero-desc d-flex align-items-center flex-wrap">
                                    <div class="d-flex align-items-center me-4 pe-2">
                                        <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-0">
                                            {{!empty($candidateDetails->functionalArea->name)? $candidateDetails->functionalArea->name : __('messages.common.n/a')}}</p>
                                    </div>
                                    
                                    @if(!empty($candidateDetails->user->country_name))
                                        <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                            <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                    <span>{{$candidateDetails->user->country_name}}
                                                        @if(!empty($candidateDetails->user->state_name))
                                                            ,{{$candidateDetails->user->state_name }}
                                                        @endif
                                                        @if(!empty($candidateDetails->user->city_name))
                                                            ,{{$candidateDetails->user->city_name}}
                                                @endif
                                            </p>
                                        </div>
                                    @endif
                                    <!-- @if(isset($view) and $view == true)
                                    <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                        <i class="fa-solid fa-envelope text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-0">
                                            {{$candidateDetails->user->email}}
                                        </p>
                                    </div>
                                    @endif -->
                                    @if(isset($view) and $view == true)
                                    <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                        <i class="fa-solid fa-phone-alt text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-0">
                                            {{$candidateDetails->user->phone}}
                                        </p>
                                    </div>
                                    @endif
                                    @if($candidateDetails->user->dob)
                                        <div class="desc d-flex align-items-center me-lg-4 me-2 pe-2">
                                            <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                            <p class="fs-14 text-gray mb-0">
                                                {{ \Carbon\Carbon::parse($candidateDetails->user->dob)->locale('es')->translatedFormat('d F, Y')  }}
                                            </p>
                                        </div>
                                    @endif
                                </div>
                               @php
                               $subscription = Auth::user()->subscriptions()->active()->first();
                               @endphp
                               @if(isset($subscription) and  $subscription->current_period_end > \Carbon\Carbon::now())
                                    @if(empty($view) or $view == false)
                                    <button onclick="verSocorrista()" class="btn btn-success btn-sm mt-2 d-block">Contactar</button>
                                    @endif
                                @else
                                    <a href="{{ route('manage-subscription.index') }}" class="btn btn-succes btn-sm mt-2 ">Suscribirse para contactar.</a>
                                @endif
                            </div>
                        </div> 
                        <!-- <div class="d-flex align-items-center flex-wrap">
                            @auth
                                @role('Employer')
                                <ul class="post-tags mt-3 ps-0">
                                    @if($isReportedToCandidate)
                                        <button class="btn btn-outline-danger reportToCompany reportToCandidate" disabled
                                        >{{ __('messages.candidate.already_reported') }}</button>
                                    @else
                                        <button type="button" class="btn btn-outline-danger reportToCompany reportToCandidate"
                                                data-bs-toggle="modal"
                                                data-bs-target="#reportToCandidateModal">
                                            {{ __('messages.candidate.reporte_to_candidate') }}
                                        </button>
                                    @endif
                                </ul>
                                @endrole
                            @endauth
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="about-company-section py-60 pt-2">
        <div class="container">
            <div class="row">
                @include('front_web.candidate.candidate_detail_sidebar')
            </div>
        </div>
    </section>
    <!-- end hero section -->
    @role('Employer')
    @include('front_web.candidate.report_to_candidate_modal')
    @endrole
    <script>
        var csrfToken = '{{ csrf_token() }}';
        function verSocorrista(){
            $.post("{{ route('payment.candidate.stripe') }}", {_token:csrfToken, candidate: "{{ $candidateDetails->id }}" }, function(response) {
                // Obtener la URL de Stripe desde la respuesta JSON del servidor
                var stripeUrl = response.url;
                // Redireccionar a la URL de Stripe
                window.location.href = stripeUrl;
            });
        }
    </script>
@endsection
{{--@section('scripts')--}}
{{--    <script>--}}
{{--        let reportToCandidateUrl = "{{ route('report.to.candidate') }}"--}}
{{--    </script>--}}
{{--@endsection--}}
