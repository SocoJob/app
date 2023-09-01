@extends('candidate.profile.index')
@push('css')
<link rel="stylesheet" href="{{ asset('assets/css/inttel/css/intlTelInput.css') }}">
<link rel="stylesheet" href="{{ asset('css/bootstrap-datetimepicker.css') }}">
@endpush
@section('section')
@if(!$user->is_verified)
    <div class="alert-danger p-3 w-auto rounded" >
    <svg class="svg-inline--fa fa-triangle-exclamation text-white" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="triangle-exclamation" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"></path></svg>
    Esta cuenta está pendiente de confirmación. Para completar la inscripción es obligatorio subir la titulación en la pestaña "Titulaciones subidas".
    </div>
@endif
<div class="card">
    <div class="card-body">
        <input type="hidden" class="languageSelection" prefix-value="es">
        {{ Form::model($user,['route' => 'candidate-profile.update', 'files' => true,'id'=>'candidateProfileUpdate', 'method' => 'put']) }}
        <div class="mt-5">
            @if($errors->any())
                {{ $errors }}
            @endif
            <div class="alert alert-danger d-none" id="validationErrors">
                <i class='fa-solid fa-face-frown me-4'></i>
            </div>
            <div class="row mb-5">
                {{ Form::hidden('isEdit',true,['id' => 'isEdit']) }}
                <div class="col-xl-6 col-md-6 col-sm-6 mb-5">
                    {{ Form::label('first_name',__('messages.candidate.first_name').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::text('first_name', $user->first_name, ['class' => 'form-control','placeholder'=> __('messages.candidate.first_name'),'required']) }}
                </div>
                <div class="col-xl-6 col-md-6 col-sm-6 mb-5">
                    {{ Form::label('last_name', __('messages.candidate.last_name').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::text('last_name', $user->last_name,['class' =>'form-control ','placeholder'=> __('messages.candidate.last_name'),'required']) }}
                </div>
                <div class="col-xl-6 col-md-6  col-sm-6  mb-5">
                    {{ Form::label('email', __('messages.company.email').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::email('email', isset($user)?$user->email:null, ['class' => 'form-control ', 'placeholder'=> __('messages.company.email'),'required']) }}
                </div>

                <div class="col-xl-6 col-md-6 col-sm-6 mb-5">
                    {{ Form::label('dob',__('messages.candidate.birth_date').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    <input type="text" name="dob" id="birthDate" required class="form-control {{(getLoggedInUser()->theme_mode) ? 'bg-light' : 'bg-white'}}" autocomplete="off" placeholder="{{__('messages.candidate.birth_date')}}" value="{{$user->dob}}" required>
                </div>
                <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                    {{ Form::label('country', __('messages.company.country').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::select('country_id',  $data['countries'], null, ['class' => 'form-select ','id'=>'countryId','required','placeholder' => __('messages.company.select_country'),'required']) }}
                </div>
                <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                    {{ Form::label('state', __('messages.company.state').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::select('state_id', (isset($states) && $states!=null?$states:[]), null, ['id'=>'stateId','class' => 'form-select','required','placeholder' => __('messages.company.select_state'),'required']) }}
                </div>
                <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                    {{ Form::label('city', __('messages.company.city').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    {{ Form::select('city_id',(isset($cities) && $cities!=null?$cities:[]), null,['class' => 'form-select ','id'=>'cityId','required','placeholder' => __('messages.company.select_city'),'required']) }}
                </div>
                <div class="col-sm-6 mb-5 mobile-itel-width">
                    {{ Form::label('phone',__('messages.candidate.phone').(':'),['class' => 'form-label']) }}
                    <span class="required"></span>
                    <div class="col-sm-12 mb-5">
                        {{ Form::tel('phone', isset($user->phone) ? $user->phone : null, ['class' => 'form-control','onkeyup' => 'if (/\D/g.test(this.value)) this.value = this.value.replace(/\D/g,"")','id'=>'phoneNumber','required']) }}
                    </div>
                    {{ Form::hidden('region_code',null,['id'=>'prefix_code']) }}
                    <span id="valid-msg" class="text-success d-block fw-400 fs-small mt-2 d-none">{{__('messages.phone.valid_number')}}</span>
                    <span id="error-msg" class="text-danger d-block fw-400 fs-small mt-2 d-none"></span>
                </div>
                <div class="col-sm-6 mb-5"> 
                    {{ Form::label('gender', __('messages.candidate.gender').':', ['class' => 'form-label']) }}
                    <span class="required"></span>
                    <br>
                    <span class="form-check is-valid form-check-sm">
                        <label class="form-label ">{{ __('messages.common.male') }}</label>&nbsp;&nbsp;
                        {{ Form::radio('gender', '0', isset($user->gender) ? $user->gender == 0 : true, ['class' => 'form-check-input','id'=>'male']) }} &nbsp;
                        <br>
                        <label class="form-label ">{{ __('messages.common.female') }}</label>
                        {{ Form::radio('gender', '1', isset($user->gender) ? $user->gender == 1 : true, ['class' => 'form-check-input','id'=>'female']) }}
                    </span>
                </div>
                <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                    {{ Form::label('career_level', __('messages.candidate.career_level').':', ['class' => 'form-label']) }}
                    {{ Form::select('career_level_id',  $data['careerLevel'], isset($user->candidate->career_level_id) ? $user->candidate->career_level_id : null,['class' => 'form-select','id' => 'careerLevelId', 'placeholder'=> __('messages.company.select_career_level'),'required']) }}
                </div>
                {{--<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                        {{ Form::label('experience', __('messages.candidate.experience').':', ['class' => 'form-label']) }}
                {{ Form::text('experience', isset($user->candidate->experience) ? $user->candidate->experience : null,['class' => 'form-control','min' => '0', 'max' => '15','placeholder'=>__('messages.candidate.experience'), 'onkeyup' => 'if (/\D/g.test(this.value)) this.value = this.value.replace(/\D/g,"")','required']) }}
            </div>--}}
            <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                {{ Form::label('marital_status', __('messages.candidate.marital_status').':', ['class' => 'form-label']) }}
                <span class="required"></span>
                {{ Form::select('marital_status_id', $data['maritalStatus'], isset($user->candidate->marital_status_id) ? $user->candidate->marital_status_id : null,  ['class' => 'form-select ', 'id'=>'maritalStatusId','required']) }}
            </div>
            <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
                {{ Form::label('nationality', __('messages.candidate.nationality').':', ['class' => 'form-label']) }}
                {{ Form::text('nationality', isset($user->candidate->nationality) ? $user->candidate->nationality : null, ['class' => 'form-control ','placeholder' => __('messages.candidate.nationality')]) }}
            </div>
            <div class="col-xl-12 col-md-12 col-sm-12 mb-5 ">
                <div class="col-xl-4 col-md-4 col-sm-4">
                    {{ Form::label('immediate_available', __('messages.candidate.immediate_available').':', ['class' => 'form-label']) }}
                    <br>
                    <span class="form-check is-valid form-check-sm">
                        <label class="form-label ">{{ __('messages.candidate.immediate_available')}}</label>&nbsp;&nbsp;
                        {{ Form::radio('immediate_available', '1', isset($user->candidate->immediate_available) ? $user->candidate->immediate_available == 1 : true, ['class' => 'form-check-input','id'=>'available']) }} &nbsp;
                        <br>
                        <label class="form-label ">{{ __('messages.candidate.not_immediate_available') }}</label>
                        {{ Form::radio('immediate_available', '0', isset($user->candidate->immediate_available) ? $user->candidate->immediate_available == 0 : true, ['class' => 'form-check-input','id'=>'not_available']) }}
                    </span>
                </div>
                <div class="col-xl-6 col-md-6 col-sm-6 available-at">
                    {{ Form::label('available_at', __('messages.candidate.available_at').':', ['class' => 'form-label  mb-3']) }}
                    <input type="text" name="available_at" id="availableAt" class="form-control {{(getLoggedInUser()->theme_mode) ? 'bg-light' : 'bg-white'}}" placeholder="{{__('messages.candidate.available_at')}}" value="{{ isset($user->candidate->available_at) ? $user->candidate->available_at : null}}" required>
                </div>
            </div>
            <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                {{ Form::label('industry', __('messages.candidate.industry').':', ['class' => 'form-label']) }}
                <span class="required"></span>
                {{ Form::select('industry_id',  $data['industry'], isset($user->candidate->industry_id) ? $user->candidate->industry_id : null, ['class' => 'form-select','id' => 'industryId','placeholder'=>__('messages.company.select_industry'),'required']) }}
            </div>
            <div class="col-xl-6 col-md-6 col-sm-6 mb-5 d-none">
                {{ Form::label('father_name', __('messages.candidate.father_name_candidate').':', ['class' => 'form-label']) }}
                <span class="required"></span>
                {{ Form::text('father_name', $user->candidate->father_name, ['class' => 'form-control','placeholder'=> __('messages.candidate.father_name')]) }}
            </div>
            <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                {{ Form::label('skill_id','¿Dónde quiero trabajar? (Provincias y costas):', ['class' => 'form-label']) }}
                <span class="required"></span>
                {{ Form::select('candidateSkills[]',$data['skills'], (count($candidateSkills) > 0)?$candidateSkills:null,  ['id'=>'skillId','class' => 'form-select ','multiple'=>true,'required','placeholder'=>__('Seleccionar provincias y costas')]) }}
            </div>
            <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
                {{ Form::label('functional_area', __('messages.candidate.functional_area_candidate').':', ['class' => 'form-label']) }}
                {{ Form::select('functional_area_id', $data['functionalArea'], isset($user->candidate->functional_area_id) ? $user->candidate->functional_area_id : null,['class' => 'form-select','id' => 'functionalAreaId', 'placeholder'=> __('messages.company.select_functional_area')]) }}
            </div>
            {{--
                    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                        {{ Form::label('current_salary', __('messages.candidate.current_salary').':', ['class' => 'form-label']) }}
            {{ Form::text('current_salary',  isset($user->candidate->current_salary) ? $user->candidate->current_salary : null,['class' => 'form-control','placeholder'=> __('messages.candidate.current_salary')]) }}
        </div>
        <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
            {{ Form::label('expected_salary',  __('messages.candidate.expected_salary').':', ['class' => 'form-label']) }}
            {{ Form::text('expected_salary', isset($user->candidate->expected_salary) ? $user->candidate->expected_salary : null,['class' => 'form-control','placeholder'=>__('messages.candidate.expected_salary')]) }}
        </div>
        <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
            {{ Form::label('salary_currency', __('messages.candidate.salary_currency').':', ['class' => 'form-label']) }}
            {{ Form::select('salary_currency',   $data['currency'], isset($user->candidate->salary_currency) ? $user->candidate->salary_currency : null,['class' => 'form-select','id' => 'salaryCurrencyId','placeholder'=> __('messages.company.select_currency')]) }}
        </div>
        --}}
        <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
            {{ Form::label('language_id', __('messages.candidate.candidate_language').':', ['class' => 'form-label']) }}
            <span class="required"></span>
            {{ Form::select('candidateLanguage[]',$data['language'], (count($candidateLanguage) > 0) ? $candidateLanguage : null, ['class' => 'form-select ', 'id'=>'languageId','multiple'=>true,'required']) }}
        </div>
        {{--
                    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
                        {{ Form::label('facebook_url', __('messages.company.facebook_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-facebook-f facebook-fa-icon text-primary"></i>
            </div>
            {{ Form::text('facebook_url', $user->facebook_url, ['class' => 'form-control','id'=>'facebookUrl','placeholder'=>'https://www.facebook.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('twitter_url', __('messages.company.twitter_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-twitter twitter-fa-icon text-primary"></i>
            </div>
            {{ Form::text('twitter_url', $user->twitter_url, ['class' => 'form-control','id'=>'twitterUrl','placeholder'=>'https://www.twitter.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('linkedin_url', __('messages.company.linkedin_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-linkedin-in linkedin-fa-icon text-primary"></i>
            </div>
            {{ Form::text('linkedin_url', $user->linkedin_url, ['class' => 'form-control','id'=>'linkedInUrl','placeholder'=>'https://www.linkedin.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('google_plus_url', __('messages.company.google_plus_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-google-plus-g google-plus-fa-icon text-danger"></i>
            </div>
            {{ Form::text('google_plus_url', $user->google_plus_url ,['class' => 'form-control','id'=>'googlePlusUrl','placeholder'=>'https://www.plus.google.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('pinterest_url', __('messages.company.pinterest_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-pinterest-p pinterest-fa-icon text-danger"></i>
            </div>
            {{ Form::text('pinterest_url', $user->pinterest_url, ['class' => 'form-control','id'=>'pinterestUrl','placeholder'=>'https://www.pinterest.com']) }}
        </div>
    </div>
    --}}

    <div class="col-sm-6 mb-5">
        <div class="mb-3" io-image-input="true">
            <label for="exampleInputImage" class="form-label"> {{ __('messages.candidate.profile')}}:</label>
            <span class="required"></span>
            <span data-bs-toggle="tooltip" data-placement="top" data-bs-original-title="{{ __('messages.setting.image_validation')  }}">
                <i class="fas fa-question-circle ml-1 general-question-mark"></i>
            </span>
            <div class="d-block">
                <div class="image-picker">
                    <div class="image previewImage" id="exampleInputImage" style="background-image: url({{ (!empty($user->media[0]))? $user->media[0]->getFullUrl() : asset('assets/img/infyom-logo.png')}})">
                    </div>
                    <span class="picker-edit rounded-circle text-gray-500 fs-small" data-bs-toggle="tooltip" data-placement="top" data-bs-original-title="{{ __('messages.tooltip.change_profile') }}">
                        <label>
                            <i class="fa-solid fa-pen" id="profileImageIcon"></i>
                            <input type="file" name="image" class="image-upload d-none" accept="image/*" />
                        </label>
                    </span>
                </div>
            </div>
        </div>
    </div>
  
        <div class="mx-auto " style="width:auto">
            <div class="p-3 w-auto rounded" style="background-color:#cc0000;color:white;">
                <h4 class="alert-heading mt-2"> <i class="fas fa-exclamation-triangle text-white"></i> Advertencia!</h4>
                <p> {{ __('messages.candidate.father_name_candidate') }}</p>
            </div>
        </div>

    {{--
                    <div class="col-xl-12 col-md-6 col-sm-12 mb-5">
                        {{ Form::label('address',__('messages.candidate.address').':', ['class' => 'form-label']) }}
    {{ Form::textarea('address', isset($user->candidate->address) ? $user->candidate->address : null, ['class' => 'form-control','rows'=>'5','placeholder'=>__('messages.candidate.address')]) }}
</div>
--}}

<!-- Submit Field -->
<div class="d-flex justify-content-end mt-2">
    {{ Form::submit(__('messages.common.save'), ['class' => 'btn btn-success  me-3 btnSave']) }}
    <a class="btn btn-primary " href="/candidate/profile?section=resume">Subir archivos</a>
    {{-- <a href=""--}}
    {{-- class="btn btn-light btn-active-light-primary me-2">{{__('messages.common.cancel')}}</a>--}}
</div>
</div>
</div>
</div>
</div>
{{ Form::close() }}
@endsection
@push('scripts')
<script>
    var phoneNo = "{{ old('region_code').old('phone') }}";
</script>
{{-- <script src="{{mix('assets/js/custom/input_price_format.js')}}"></script>--}}
{{-- <script src="{{mix('assets/js/candidate-profile/candidate-general.js')}}"></script>--}}
{{-- <script src="{{ mix('assets/js/custom/phone-number-country-code.js') }}"></script>--}}
@endpush