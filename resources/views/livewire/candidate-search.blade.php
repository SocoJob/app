<div class="container">
    <div class="row">
        <div class="col-lg-4">
            <div class="latest-job-left br-10 px-40 bg-gray">
                <div class="form-group mb-md-4 mb-3">
                    <div class="d-flex flex-wrap mb-3 justify-content-between">
                        <label for="" class="fs-16 text-secondary my-auto pb-2">
                            {{ __('web.web_jobs.search_by_keywords') }}</label>
                        <button wire:click="resetFilter()" class="btn btn-sm btn-primary reset-filter text-nowrap mb-2" id="btnReset">{{ __('web.reset_filter') }}</button>
                    </div>
                    <input class="form-control fs-14 text-gray bg-white br-10 p-3" wire:model.debounce.100ms="searchByCandidate" type="search" id="searchByCandidate" autocomplete="off" placeholder="@lang('web.common.search_candidate')">
                </div>
                <div class="form-group mb-md-4 mb-3 ">
                    <label for="" class="fs-16 text-secondary mb-3">
                        {{ __('messages.candidate.candidate_skill') }}</label>
                    <input class="form-control fs-14 text-gray bg-white br-10 p-3 search-by-location" type="search" autocomplete="off" placeholder="@lang('web.web_jobSeeker.search_by_location')" name="min" wire:model="location">
                </div>
                <!-- <div class="form-group mb-md-4 mb-3 ">
                    <label for="" class="fs-16 text-secondary mb-3">
                        {{ __('messages.candidate.expected_salary') }}</label>
                    <input class="form-control fs-14 text-gray bg-white br-10 p-3" type="text" placeholder="Min" name="min" wire:model="min" autocomplete="off">
                    <input class="form-control fs-14 text-gray bg-white br-10 p-3 mt-2" type="text" placeholder="Max" name="max" wire:model="max" autocomplete="off">
                </div> -->
            
                <div class="form-group mb-md-4 mb-3 d-none">
                    <label for="" class="fs-16 text-secondary mb-3">
                        {{ __('messages.candidate.gender') }}</label>
                    <ul>
                        <li>
                            <input type="radio" name="gender" id="All" value="all" wire:click="changeFilter('gender','all')" wire:model="gender">
                            <label for="All" class="ms-1 my-1"><span class=""></span>{{ __('messages.common.all') }}</label>
                        </li>
                        <li>
                            <input type="radio" name="gender" id="Male" value="male" wire:click="changeFilter('gender','male')" wire:model="gender">
                            <label for="Male" class="ms-1 my-1"><span class=""></span>{{ __('messages.common.male') }}</label>
                        </li>
                        <li>
                            <input type="radio" name="gender" id="Female" value="female" wire:click="changeFilter('gender','female')" wire:model="gender">
                            <label for="Female" class="ms-1 my-1"><span class=""></span>{{ __('messages.common.female') }}
                            </label>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="content-column col-lg-8 col-md-12 col-sm-12">
            <div class="row">
                @forelse($candidates as $candidate)
                <div class="col-lg-6 col-md-6 col-sm-12 px-xl-3 mb-40">
                    <div class="card py-30">
                        <div class="row align-items-center">
                            <div class="col-3">
                                <a href="{{route('front.candidate.details',$candidate->unique_id)}}">
                                    <img src="{{ $candidate->candidate_url }}" class="card-img" alt="">
                                </a>
                            </div>
                            <div class="col-9">
                                <div class="card-body p-0">
                                    <a href="{{ route('front.candidate.details',$candidate->unique_id) }}">
                                        <h5 class="card-title text-dark fs-18 mb-0">
                                        {{ $candidate->user->first_name }} {{ Str::limit($candidate->user->last_name,1) }} </h5>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="card-desc mt-4">
                            @if(!empty($candidate->careerLevel))
                            <div class="desc d-flex mb-2">
                                <span><i class="fas fa-building text-gray me-2 fs-18"></i></span>
                                <p class="fs-14 text-gray mb-0"> {{__('messages.candidate_profile.experience')}}: {{ $candidate->careerLevel->level_name. ' '.__('messages.candidate_profile.years')}}</p>
                            </div>
                            @endif
                            @if(!empty($candidate->user->dob))
                                <div class="desc d-flex mb-2">
                                    <span><i class="fa-solid fa-clock text-gray me-2 fs-18"></i></span>
                                    <p class="fs-14 text-gray mb-0"> {{__('messages.candidate_profile.age')}}: {{!empty($candidate->user->dob) ?\Carbon\Carbon::parse($candidate->user->dob)->age. ' '.__('messages.candidate_profile.years') : __('messages.common.n/a')}}</p>
                                </div>
                            @endif
                            <div class="desc d-flex">
                                <span><i class="fa-solid fa-location-dot text-gray me-3"></i></span>
                                <p class="fs-14 text-gray mb-0">
                                    @if(!empty($candidate->full_location) || !empty($candidate->location2))
                                    {{ Str::limit($candidate->full_location,25,'..') }}
                                    @else
                                    <span>{{__('messages.candidate_dashboard.location_information')}}</span>
                                    @endif
                                </p>

                                @if(!empty($candidate->expected_salary))
                                <span><i class="fa-solid fa-money-bill-alt text-gray ms-3 me-2"></i></span>
                                <p class="fs-14 text-gray mb-0">{{ $candidate->expected_salary }}</p>
                                @endif
                            </div>
                            @if(count($candidate->getDocumentsAttribute())>0)
                            <div class="desc d-flex">
                                @foreach($candidate->getDocumentsAttribute() as $document)
                                @if(isset($document->custom_properties["state"]) && $document->custom_properties["state"] == 'approved')
                                <span><i class="fa-solid fa-file-alt text-gray me-3"></i></span>
                                <p class="fs-14 text-gray mb-0"> {{ $document->custom_properties["title"]}} </p>
                                @endif
                                @endforeach
                            </div>
                            @endif
                            <div class="d-flex mt-2 justify-content-center">
                                <a href="{{ route('front.candidate.details',$candidate->unique_id) }}" class="px-4 btn btn-primary">{{ __('web.web_jobSeeker.view_profile') }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                @empty
                <div class="col-md-12">
                    <h5 class="text-gray text-center">{{ __('web.candidates_menu.no_candidates_found') }}</h5>
                </div>
                @endforelse
            </div>
            @if($candidates->count() > 0)
            {{$candidates->links()}}
            @endif
        </div>
    </div>
</div>