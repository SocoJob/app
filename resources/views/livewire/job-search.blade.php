<div class="row justify-content-between">
    @forelse($jobs as $job)
        <div class="col-12 px-xl-3 mb-40">
            <div class="card py-30 border-0 ">
                <div class="row position-relative">
                    <div class="col-xl-1 col-md-2 col-3 mb-md-0 mb-3">
                        <img src="{{$job->company->company_url}}" class="card-img" alt="">
                    </div>
                    <div class="col-xl-10 col-md-9 col-sm-8 col-12">
                        <div class="card-body p-0 ps-xl-3">
                            <a href="{{route('front.job.details',$job['job_id']) }}" class="text-secondary primary-link-hover">
                                <h5 class="card-title fs-18 mb-0 d-inline-block">
                                    {{ html_entity_decode(Str::limit($job['job_title'], 50)) }}
                                </h5> 
                            </a>
                            <div class="col-xl-12">
                                <div class="card-desc d-flex flex-wrap mt-2 ">
                                    <div class="desc d-flex  me-4">
                                        <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-2">
                                            {{$job->jobCategory->name}}</p>
                                    </div>
                                    <div class="desc d-flex me-4">
                                        <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-2">
                                            {{ (!empty($job->full_location)) ? $job->full_location : 'Location Info. not available.'}}</p>
                                    </div>
                                    <div class="desc d-flex me-4">
                                        <i class="fa-solid fa-clock text-gray me-3 fs-18"></i>
                                        <p class="fs-14 text-gray mb-2">
                                            {{$job->created_at->locale('es')->diffForHumans()}}</p>
                                    </div>
                                    <div class="desc d-flex me-4">
                                        <i class="fas fa-money-bill-alt text-gray me-2 fs-18 px-1"></i>
                                        <span class="text-gray">
                                            {{$job->currency->currency_icon}}&nbsp</span>
                                        <p class="fs-14 text-gray mb-2">
                                            {{ $job->salary_from}} - {{$job->salary_to}}</p>
                                    </div>
                                    <div class="desc d-flex me-4">
                                        <i class="fas fa-file-signature text-gray me-2 fs-18 px-1"></i>
                                        <p class="fs-14 text-gray mb-2">
                                            {{$job->jobType->name}}
                                        </p>
                                    </div>
                                    @isset($job->jobShift)
                                    <div class="desc d-flex me-4">
                                        <i class="fa-solid fa-briefcase text-gray me-2 fs-18"></i>
                                        <p class="fs-14 text-gray mb-2">
                                            {{$job->jobShift->shift}}
                                        </p>
                                    </div>
                                    @endisset
                                </div>
                            </div>
                            <div class="desc d-flex flex-wrap">
                                @foreach($job->jobsSkill->take(1) as $jobSkill)
                                    <p class="text text-primary fs-14 mb-0 me-3">
                                        {{$jobSkill->name}}</p>
                                    @if(count($job->jobsSkill) - 1 > 0)
                                        <p class="fs-14 text text-primary mb-0">
                                            {{'+'.(count($job->jobsSkill) - 1)}}
                                        </p>
                                    @endif
                                @endforeach
                            </div>
                        </div>
                    </div>
                    @if($job->activeFeatured)
                        <div class="bookmark text-end position-absolute">
                            <i class="text-primary fa-solid fa-bookmark"></i>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    @empty
        <div class="col-md-12 text-center text-gray">
            @lang('web.job_menu.no_results_found')
        </div>
    @endforelse
    @if($jobs->count() > 0)
        {{$jobs->links() }}
    @endif
</div>
