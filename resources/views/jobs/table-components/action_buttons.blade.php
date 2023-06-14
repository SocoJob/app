<div class="d-flex justify-content-center">
    <a href="{{ route('admin.job.edit', $row->id) }}" title="Editar"
       class="btn px-2 text-primary fs-3 ps-0 edit-btn" data-bs-toggle="tooltip">
        <i class="fa-solid fa-pen-to-square"></i>
    </a>
    <button type="button" title="Eliminar" data-id="{{ $row->id }}"
            class="delete-btn btn px-2 text-danger fs-3 pe-0" id="deleteUser" data-bs-toggle="tooltip">
        <i class="fa-solid fa-trash"></i>
    </button>
</div>
