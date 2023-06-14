@if(is_null($row->description))
    N/A
@else
    {!! nl2br( \Illuminate\Support\Str::limit($row->description,190) ) !!}
@endif
