<div class="d-flex justify-content-center">
    <a href="{{ route('download.all-resume', $row->id) }}" data-turbo="false" class="download-link p-1"
       data-bs-toggle="tooltip" title={{__('messages.common.download')}}>
        <i class="fas fa-download download-margin text-primary fs-3"></i>
    </a>
    <a href="{{ route('admin.resumen.approve', $row->id) }}" class="text-success p-1"   data-bs-toggle="tooltip" title="Aprobar"><i class="fas fa-check"></i></a>
    <a href="{{ route('admin.resumen.decline', $row->id) }}" class="text-danger p-1"   data-bs-toggle="tooltip" title="Rechazar"><i class="fas fa-ban"></i></a>
</div>