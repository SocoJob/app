@extends('employer.layouts.app')
@section('title')
{{ __('messages.company.edit_employer') }}
@endsection
@push('css')
{{-- <link href="{{ asset('assets/css/summernote.min.css') }}" rel="stylesheet" type="text/css"/>--}}
{{-- <link href="{{ asset('assets/css/select2.min.css') }}" rel="stylesheet" type="text/css"/>--}}
<link rel="stylesheet" href="{{ asset('assets/css/inttel/css/intlTelInput.css') }}">
@endpush
@section('content')
<div class="d-flex flex-column">
    <div class="row">
        <div class="col-12">
            @include('layouts.errors')
            @include('flash::message')
            <div class="alert alert-danger  hide d-none" id="editValidationErrorsBox">
                <i class="fa-solid fa-face-frown me-5"></i>
            </div>
        </div>
    </div>
    @if(!$user->is_verified)
        <div class="alert-warning p-3 w-auto rounded">
            Para poder utilizar la app debes de completar el perfil.
        </div>
    @endif
    <div class="card">
        <div class="card-body">

            {{ Form::model($user, ['route' => ['company.update.form', $company->id],'files' => 'true', 'method' => 'put','id'=>'editCompanyForm']) }}
            @if($isFeaturedEnable)
            <div class="d-flex justify-content-end">
                @if($company->activeFeatured)
                <div class="badge badge-info d-inline-block rounded">
                    {{ __('messages.front_settings.featured') }}
                    {{ __('messages.front_settings.exipre_on') }}
                    {{ (new Carbon\Carbon($company->activeFeatured->end_time))->format('d/m/y') }}
                </div>
                @else
                @if($isFeaturedAvilabal)
                <a class="btn btn-info btn-sm" id="makeFeatured">{{ __('messages.front_settings.make_featured') }}</a>
                {{-- @else--}}
                {{-- <button class="btn btn-info btn-sm" data-bs-toggle="tooltip"--}}
                {{-- data-bs-placement="bottom"--}}
                {{-- title="{{ __('messages.front_settings.featured_employer_not_available') }}">--}}
                {{-- {{ __('messages.front_settings.make_featured') }}</button>--}}
                @endif
                @endif
            </div>
            @endif
            @include('employer.companies.edit_fields')
            {{ Form::close() }}
            {{ Form::hidden('countryId',$company->user->country_id,['id' => 'countryId']) }}
            {{ Form::hidden('stateId',$company->user->state_id,['id' => 'stateId']) }}
            {{ Form::hidden('cityId',$company->user->city_id,['id' => 'cityId']) }}
            {{ Form::hidden('companyId',$company->id,['id' => 'employerCompanyId']) }}
            {{ Form::hidden('employerPanel',true,['class'=>'employerPanel'])}}
            {{Form::hidden('isEdit', true, ['class' => 'isEdit'])}}

        </div>
    </div>
</div>
@endsection

@push('scripts')
{{-- <script src="https://js.stripe.com/v3/"></script>--}}
<script>
    var phoneNo = "{{ old('region_code').old('phone') }}";
</script>
{{-- <script src="{{mix('assets/js/companies/create-edit.js')}}"></script>--}}
{{-- <script src="{{ asset('assets/js/companies/companies_stripe_payment.js') }}"></script>--}}
{{-- <script src="{{ mix('assets/js/custom/phone-number-country-code.js') }}"></script>--}}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        var myAlert = document.getElementById('myAlert');
        myAlert.addEventListener('click', function(event) {
            if (event.target.classList.contains('close')) {
                myAlert.setAttribute('data-auto-dismiss', 'true');
            }
        });
    });
</script>

@endpush