<div id="candidateResumeModal" class="modal fade" role="dialog" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ __('messages.candidate_profile.upload_resume') }}</h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
            </div>
            {{ Form::open(['id'=>'addCandidateResumeForm']) }}
            <div class="modal-body">
                <div class="alert alert-danger hide d-none" id="validationErrorsBox">
                    <i class='fa-solid fa-face-frown me-4'></i>
                </div>
                <div class="mb-5">
                    {{ Form::label('title',__('messages.candidate_profile.title').(':'), ['class' => 'form-label']) }}
                    <span class="required"></span>
                    <select class="form-control" name="title" id="uploadResumeTitle">
                        <option value="">Seleccionar</option>
                        <option value="Título de socorrista">Título de socorrista </option>
                        <option value="Registro Oficial de Profesionales del Deporte de Cataluña (ROPEC)">Registro Oficial de Profesionales del Deporte de Cataluña (ROPEC)</option>
                        <option value="Inscripción en el registro profesional del personal de socorrismo, información y primeros auxilios de Galicia">Inscripción en el registro profesional del personal de socorrismo, información y primeros auxilios de Galicia</option>
                        <option value="Registro de Socorristas Deportivos de la Región de Murcia">Registro de Socorristas Deportivos de la Región de Murcia</option>
                        <option value="Carné Profesional de Socorrismo en Espacios Acuáticos Naturales e Instalaciones Acuáticas Comunidad Autónoma de las Islas Baleares">Carné Profesional de Socorrismo en Espacios Acuáticos Naturales e Instalaciones Acuáticas Comunidad Autónoma de las Islas Baleares</option>
                        <option value="Registro de profesionales dedicados al socorrismo de Madrid">Registro de profesionales dedicados al socorrismo de Madrid</option>
                        <option value="Título de monitor de natación">Título de monitor de natación</option>
                        <option value="Formación en DESA">Formación en DESA</option>
                    </select>
                    <!-- {{ Form::text('title', null, [ 'id'=>"uploadResumeTitle",'class' => 'form-control','required','maxlength'=>'150','placeholder'=>__('messages.candidate_profile.title')]) }} -->
                </div>
                <div class="mb-5">
                    <div>
                        {{ Form::label('customFile',__('messages.common.choose_file').(':'), ['class' => 'form-label']) }}
                        <span class="required"></span>
                        <input type="file" class="form-control custom-file-input" id="customFile" name="file" required>
                    </div>
                </div>
                <div style="visibility: hidden;height: 0;">
                    {{ Form::label('is_default', __('messages.job_experience.is_default').':', ['class' => 'form-label']) }}
                    <br>
                    <div class="form-check form-switch">
                        <input class="form-check-input" name="is_default" type="checkbox" value="1" id="default">
                    </div>
                </div>
            </div>
            <div class="modal-footer pt-0">
                {{ Form::button(__('messages.common.save'), ['type' => 'submit','class' => 'btn btn-primary m-0','id' => 'candidateSaveBtn','data-loading-text' => "<span class='spinner-border spinner-border-sm'></span> ".__('messages.common.process')]) }}
                <button type="button" class="btn btn-secondary my-0 ms-5 me-0"
                        data-bs-dismiss="modal">{{ __('messages.common.cancel') }}
                </button>
            </div>
        </div>
    </div>
</div>

{{ Form::close() }}

