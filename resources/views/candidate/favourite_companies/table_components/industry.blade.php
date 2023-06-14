@if(!empty($row->company))
<div class="badge bg-light-info">
    <div> {{ count($row->company->jobs->where('status',1)) }}</div>
    <!-- {{ $row->company->jobs->where('status',1) }} -->
</div>
@else
    <div class="badge bg-light-info">
        <div> N/A</div>
    </div>
@endif