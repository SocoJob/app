<div class="row">
    {{ Form::hidden('user_id',$user->id) }}
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('name', __('messages.company.name').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::text('name', isset($user)?$user->full_name:null, ['class' => 'form-control','required', 'placeholder' => __('messages.company.name')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('email', __('messages.company.email').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::email('email', null, ['class' => 'form-control', 'required', 'placeholder' => __('messages.company.email')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mobile-itel-width mb-5">
        {{ Form::label('phone', __('messages.user.phone').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::tel('phone', null, ['class' => 'form-control','onkeyup' => 'if (/\D/g.test(this.value)) this.value = this.value.replace(/\D/g,"")','id'=>'phoneNumber','required']) }}
        {{ Form::hidden('region_code',null,['id'=>'prefix_code']) }}
        <span id="valid-msg" class="d-none text-success d-block fw-400 fs-small mt-2">{{__('messages.phone.valid_number')}}</span>
        <span id="error-msg" class="d-none text-danger d-block fw-400 fs-small mt-2"></span>
       
    </div>
     <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('ceo', __('messages.company.ceo_name').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::text('ceo', (isset($company->ceo) ? $company->ceo: "ninguno"), ['class' => 'form-control', 'placeholder' => __('messages.company.ceo_name')]) }}
    </div> 
    <!-- <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('industry_id', __('messages.company.industry').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('industry_id', $data['industries'],isset($company->industry_id)?$company->industry_id:null, ['id'=>'industryId','data-control'=>'select2','class' => 'form-select','placeholder' => __('messages.company.select_industry')]) }}
    </div> -->
    <!-- <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('ownership_type_id', __('messages.company.ownership_type').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('ownership_type_id', $data['ownerShipTypes'], isset($company->ownership_type_id)?$company->ownership_type_id:null, ['id'=>'ownershipTypeId','class' => 'form-select','placeholder' => __('messages.company.select_ownership_type'),'data-control'=>'select2','required']) }}
    </div> -->
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('company_size_id', __('messages.company.company_size').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('company_size_id', $data['companySize'], isset($company)?$company->company_size_id:null, ['id'=>'companySizeId','class' => 'form-select','placeholder' => __('messages.company.select_company_size'),'data-control'=>'select2']) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('country', __('messages.company.country').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('country_id', $data['countries'], null, ['id'=>'countryId','class' => 'form-select','data-control'=>'select2','placeholder' => __('messages.company.select_country')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('state', __('messages.company.state').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('state_id', (isset($states) && $states!=null?$states:[]), null, ['id'=>'stateId','class' => 'form-select','data-control'=>'select2','placeholder' => __('messages.company.select_state')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('city', __('messages.company.city').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::select('city_id', (isset($cities) && $cities!=null?$cities:[]), null, ['id'=>'cityId','class' => 'form-select','data-control'=>'select2','placeholder' => __('messages.company.select_city')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('established_in', __('messages.company.established_in').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::selectYear('established_in', date('Y'), 2000, (isset($company->established_in)) ? $company->established_in : '', ['class' => 'form-select','data-control'=>'select2', 'id' => 'establishedIn']) }}
    </div>
    <div class="col-xl-12 col-md-12 col-sm-12 mb-5">
        {{ Form::label('details', __('messages.company.employer_details').':', ['class' => 'form-label']) }}
        <div id="editEmployeeDetails"></div>
        {{ Form::hidden('details', $company->details, ['id' => 'editEmployerDetail']) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5">
        {{ Form::label('location', __('messages.company.location').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::text('location', (isset($company->location) ? $company->location: null), ['class' => 'form-control', 'placeholder' => __('messages.company.location')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('location2', __('messages.company.location2').':', ['class' => 'form-label']) }}
        {{ Form::text('location2', (isset($company) ? $company->location2: null), ['class' => 'form-control', 'placeholder' => __('messages.company.location2')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('no_of_offices', __('messages.company.no_of_offices').':', ['class' => 'form-label']) }}
        <span class="required"></span>
        {{ Form::text('no_of_offices', (isset($company->no_of_offices) ? $company->no_of_offices: 1), ['class' => 'form-control', 'required', 'placeholder' => __('messages.company.no_of_offices') , 'onkeyup' => 'if (/\D/g.test(this.value)) this.value = this.value.replace(/\D/g,"")']) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('website', __('messages.company.website').':', ['class' => 'form-label']) }}
        {{ Form::text('website', (isset($company) ? $company->website: null), ['class' => 'form-control', 'placeholder' => __('messages.company.website')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('fax', __('messages.company.fax').':', ['class' => 'form-label']) }}
        {{ Form::text('fax',(isset($company) ? $company->fax: null), ['class' => 'form-control', 'placeholder' => __('messages.company.fax')]) }}
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('facebook_url', __('messages.company.facebook_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-facebook-f facebook-fa-icon text-primary"></i>
            </div>
            {{ Form::text('facebook_url', isset($company->user->facebook_url)?$company->user->facebook_url:null, ['class' => 'form-control','id'=>'facebookUrl','placeholder'=>'https://www.facebook.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('twitter_url', __('messages.company.twitter_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-twitter twitter-fa-icon text-primary"></i>
            </div>
            {{ Form::text('twitter_url', isset($company->user->twitter_url)?$company->user->twitter_url:null, ['class' => 'form-control','id'=>'twitterUrl','placeholder'=>'https://www.twitter.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('linkedin_url', __('messages.company.linkedin_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-linkedin-in linkedin-fa-icon text-primary"></i>
            </div>
            {{ Form::text('linkedin_url', isset($company->user->linkedin_url)?$company->user->linkedin_url:null, ['class' => 'form-control','id'=>'linkedInUrl','placeholder'=>'https://www.linkedin.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('google_plus_url', __('messages.company.google_plus_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-google-plus-g google-plus-fa-icon text-danger"></i>
            </div>
            {{ Form::text('google_plus_url', isset($company->user->google_plus_url)?$company->user->google_plus_url:null, ['class' => 'form-control','id'=>'googlePlusUrl','placeholder'=>'https://www.plus.google.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5 d-none">
        {{ Form::label('pinterest_url', __('messages.company.pinterest_url').':', ['class' => 'form-label']) }}
        <div class="input-group">
            <div class="input-group-text border-0">
                <i class="fab fa-pinterest-p pinterest-fa-icon text-danger"></i>
            </div>
            {{ Form::text('pinterest_url', isset($company->user->pinterest_url)?$company->user->pinterest_url:null, ['class' => 'form-control','id'=>'pinterestUrl','placeholder'=>'https://www.pinterest.com']) }}
        </div>
    </div>
    <div class="col-xl-6 col-md-6 col-sm-12 mb-5" io-image-input="true">
        <label for="company_logo" class="form-label">
            {{__('messages.company.company_logo').':'}}
            <span class="text-danger">*</span>
            <span data-bs-toggle="tooltip" data-placement="top" data-bs-original-title="{{  __('messages.setting.image_validation') }}">
                <i class="fas fa-question-circle ml-1  general-question-mark"></i>
            </span>
        </label>
        <div class="d-block">
            <div class="image-picker">
                <div class="image previewImage" id="logoPreview" style="background-image: url('{{!empty($company->company_url)) ? $company->company_url : asset('assets/img/infyom-logo.png'}}')">
                </div>
                <span class="picker-edit rounded-circle text-gray-500 fs-small" data-bs-toggle="tooltip" data-placement="top" data-bs-original-title="{{__("messages.tooltip.change_app_logo")}}">
                    <label>
                        <i class="fa-solid fa-pen" id="profileImageIcon"></i>
                        {{ Form::file('image',['id'=>'logo','class' => 'image-upload d-none', 'accept' => '.png, .jpg, .jpeg']) }}
                    </label>
                </span>
            </div>
        </div>
    </div>
                <!-- FACTURACION -->
                <h3 class="pt-3 pb-2">Facturación</h3>


<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_name', __('messages.company.billing_name').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_name', isset($company->billing_name) ? $company->billing_name : null, ['class' => 'form-control','id'=>'billing_name','placeholder'=>'Razón Social']) }}
    </div>
</div>

<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_address', __('messages.company.billing_address').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_address', isset($company->billing_address) ? $company->billing_address : null, ['class' => 'form-control','id'=>'billing_name','placeholder'=>'Dirección de Facturación']) }}
    </div>
</div>
<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_municipio', __('messages.company.billing_municipio').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_municipio', isset($company->billing_municipio) ? $company->billing_municipio : null, ['class' => 'form-control','id'=>'billing_municipio','placeholder'=>'Municipio']) }}
    </div>
</div>
<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_provincia', __('messages.company.billing_provincia').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_provincia', isset($company->billing_provincia) ? $company->billing_provincia : null, ['class' => 'form-control','id'=>'billing_provincia','placeholder'=>'Provincia']) }}
    </div>
</div>
<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_postal_code', __('messages.company.billing_postal_code').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_postal_code', isset($company->billing_postal_code) ? $company->billing_postal_code : null, ['class' => 'form-control','id'=>'billing_postal_code','placeholder'=>'Código Postal']) }}
    </div>
</div>
<div class="col-xl-6 col-md-6 col-sm-12 mb-5">
    {{ Form::label('billing_dni', __('messages.company.billing_dni').':', ['class' => 'form-label']) }}
    <div class="input-group">
        {{ Form::text('billing_dni', isset($company->billing_dni) ? $company->billing_dni : null, ['class' => 'form-control','id'=>'billing_dni','placeholder'=>'CIF/NIF/DNI/NIE']) }}
    </div>
</div>   
    <!-- Submit Field -->
    <div class="d-flex justify-content-end">
        {{ Form::submit(__('messages.common.save'), ['class' => 'btn btn-primary me-3']) }}
        <a href="{{ route('company.edit.form', \Illuminate\Support\Facades\Auth::user()->owner_id) }}"
           class="btn btn-secondary me-2">{{__('messages.common.cancel')}}</a>
    </div>
    <script>
    if (typeof miVariable === "undefined") {
        let intervalo;
    } 
    intervalo = setInterval(() => {
        let elemento = document.querySelector("div.ql-editor.ql-blank");
        if (elemento) {
            clearInterval(intervalo);
            
            elemento.setAttribute("data-placeholder", "Añadir Texto");
            
        }
    }, 1000);
  
</script>
</div>
