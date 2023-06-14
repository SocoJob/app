<div class="d-flex align-items-center">
    <a href="{{route('front.company.details', $row->company->unique_id)}}">
        <div class="image image-circle image-mini me-3">
            <img src="{{$row->company->user->avatar}}" alt="user" class="user-img">
        </div>
    </a>
    <div class="d-flex flex-column">
            <a class="mb-1 text-decoration-none fs-6"  href="{{route('front.company.details', $row->company->unique_id)}}">
            {{$row->company->user->first_name}}
        </a>
        <!-- <span>{{$row->company->user->email}}</span> -->
    </div>
</div>
