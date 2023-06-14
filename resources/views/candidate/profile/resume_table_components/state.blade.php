@if (!empty($row->custom_properties) && $row->custom_properties['is_default']) 
<div class="text-primary py-2">@isset($row->custom_properties['state']) {{$row->custom_properties['state']}} @endisset </div>
@else

    @isset($row->custom_properties['state'])

        @if($row->custom_properties['state'] == 'pending')

        <span class="py-2 bg-warning text-white rounded px-2">Pendiente Aprobación</span>
        @elseif($row->custom_properties['state'] == 'approved')
        <span class="py-2 bg-success text-white rounded px-2">Aprobado</span>
        @else
        <span class="py-2 bg-danger text-white rounded px-2">Rechazado</span>
        @endif
    @endisset

@endif
