@if(!empty($row->company->companySize->size))
    {{ $row->company->companySize->size }}
@else
    N/A
@endif