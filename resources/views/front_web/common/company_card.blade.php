<div class="col-lg-4 col-md-6 px-xl-3 mb-40">
    <div class="card py-30">
        @if($company->activeFeatured)
            <span><i class="fas fa-bookmark bookmark-class"></i></span>
        @endif
        <div class="row align-items-center">
            <div class="col-3">
                <img src="{{ $company->company_url }}" class="card-img" alt="">
            </div>
            <div class="col-9">
                <div class="card-body p-0">
                    <a href="{{ route('front.company.details', $company->unique_id) }}" class="text-secondary primary-link-hover">
                        <h5 class="card-title fs-18 mb-0">
                            {!! $company->user->first_name !!}</h5>
                    </a>
                </div>
            </div>
        </div>
        <div class="card-desc mt-4">
            @if(!empty($company->industry->name))
                <div class="desc d-flex mb-2">
                    <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                    <p class="fs-14 text-gray mb-0">{{$company->industry->name}}</p>
                </div>
            @endif
            @if(!empty($company->location) || !empty($company->location2))
                <div class="desc d-flex">
                    <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                    <p class="fs-14 text-gray">
                        {{ (isset($company->location)) ? html_entity_decode(Str::limit($company->location,10,'...')) : __('messages.common.n/a') }}{{ (isset($company->location2)) ? ','.html_entity_decode(Str::limit($company->location2,10,'...')) : '' }}</p>
                </div>
            @endif
            @php
                $open_jobs = $company->jobs->where('status', App\Models\Job::STATUS_OPEN)->count()
            @endphp
            <div class="desc d-flex mt-2">
                <p class="text text-primary fs-14 mb-0 me-3">
                    {{ __('web.companies_menu.opened_jobs') }} - {{ $open_jobs }}</p>
            </div>
        </div>
    </div>
</div>
