<!-- <a href="{{ route('company.show',$row->user->company->id) }}">{{ $row->user->email }}</a> -->
<div class="d-flex align-items-center">
    <a href="{{ route('company.show',$row->user->company->id) }}">
        <div class="image image-circle image-mini me-3">
            <img src="{{$row->user->company->company_url}}" alt="user" class="user-img">
        </div>
    </a>
    <div class="d-flex flex-column">
        <a href="{{ route('company.show',$row->user->company->id) }}" class="mb-1 text-decoration-none fs-6">
            {{$row->user->full_name}}
        </a>
 
      <span class="fs-6">{{$row->user->email}}</span>
    </div>
</div>