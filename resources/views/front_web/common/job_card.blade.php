<div class="col-lg-4 col-md-6 px-xl-3 mb-40">
    <div class="card py-30">
        <div class="row align-items-center">
            <div class="col-3">
                <img src="{{$job->company->company_url}}" class="card-img" alt="...">
            </div>
            <div class="col-8">
                <div class="card-body p-0">
                    @if(Str::length($job->job_title) < 35)
                        <a href="{{ route('front.job.details',$job->job_id) }}" class="text-secondary primary-link-hover">
                            <h5 class="card-title fs-18 mb-0">
                                {{ html_entity_decode($job->job_title) }}
                            </h5>
                        </a>
                    @else
                        <a href="{{ route('front.job.details',$job->job_id) }}"
                           data-toggle="tooltip" data-placement="bottom" class="hover-color"
                           title="{{ html_entity_decode($job->job_title) }}">
                            <h5 class="card-title fs-18 mb-0">
                                {{ Str::limit(html_entity_decode($job->job_title),30,'...') }}
                            </h5>
                        </a>
                    @endif
                </div>
            </div>
            @if($job->activeFeatured)
                <div class="col-1 icon position-relative pe-0">
                    <i class="text-primary fa-solid fa-bookmark"></i>
                </div>
            @endif
        </div>
        <div class="card-desc mt-4">
            <div class="desc d-flex mb-2">
                <i class="fa-solid fa-briefcase text-gray me-3 fs-18"></i>
                <p class="fs-14 text-gray mb-0">{{$job->jobCategory->name}}</p>
            </div>
            @if($job->country_name)
                <div class="desc d-flex">
                    <i class="fa-solid fa-location-dot text-gray me-3 fs-18"></i>
                    @if(Str::length($job->full_location) < 45)
                        <p class="fs-14 text-gray"> {{ $job->full_location }} </p>
                    @else
                        <p class="fs-14 text-gray" data-toggle="tooltip" data-placement="bottom"
                           title="{{$job->full_location}}">
                            {{ Str::limit($job->full_location,45,'...') }}
                        </p>
                    @endif
                </div>
            @endif
            <div class="desc d-flex mt-2">
                @foreach($job->jobsSkill->take(1) as $skills)
                    <p class="text text-primary fs-14 mb-0 me-3">{{$skills->name}}</p>
                    @if(count($job->jobsSkill) -1 > 0)
                        <p class="fs-14 text text-primary mb-0">
                            {{'+'.(count($job->jobsSkill) -1)}}</p>
                    @endif
                @endforeach
            </div>
        </div>
    </div>
</div>
