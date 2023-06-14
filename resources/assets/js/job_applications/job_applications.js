document.addEventListener('turbo:load', loadJobApplicationData);

function loadJobApplicationData() {
    if (!$('#indexJobApplicationData').length) {
        return;
    }
    $('#filterStatus').select2();
    // $('.table-responsive').removeClass('table-responsive');
    
    $('#jobStageId').select2({
        width: '100%',
        dropdownParent: $('#changeJobStageModal'),
    });

    let changeJobStage = $('#changeJobStage').val();

    listenHiddenBsModal('#changeJobStageModal', function () {
        $('#jobStageId').val('').trigger('change');
    });

    listenClick('.change-job-stage', function () {
        let jobApplicationId = $(this).data('id');
        $.ajax({
            url: route('stage-check', jobApplicationId),
            type: 'GET',
            success: function (result) {
                let data = result.data;
                let current_stage = '';
                if (data.current_stage != null) {
                    let jobStages = data.job_stages;
                    $.each(jobStages, function (key, val) {
                        if (val == data.job_stages[data.current_stage]) {
                            current_stage = key;
                            return true;
                        }
                    });
                } else {
                    current_stage = Object.keys(data.job_stages)[0];
                }
                let nextStage = parseInt(current_stage) + parseInt(1);
                let jobStageAttr = $('#jobStageId')
                jobStageAttr.empty();
                jobStageAttr.append(`<option value="">${Lang.get('messages.common.select_job_stage')}</option>`);
                let stageIndex = Object.keys(data.job_stages)[0];
                $.each(data.job_stages, function (key, val) {
                    let disabled = (data.current_stage_cleared == true && nextStage != stageIndex) || (data.current_stage_cleared == false && current_stage != stageIndex) ? 'disabled' : '';
                    jobStageAttr.
                        append(
                            `<option value="${key}" ${disabled}>${val}</option>`);
                    stageIndex++;
                });

                //selection and show modal
                $('#jobApplicationId').val(jobApplicationId);
                jobStageAttr.val(current_stage).trigger('change');
                $('#changeJobStageModal').appendTo('body').modal('show');
            },
        });
    })
}

listenSubmit('#changeJobStageForm', function (e) {
    e.preventDefault();
    processingBtn('#changeJobStageForm', '#changeJobStageBtnSave', 'loading');
    $.ajax({
        url: $('#changeJobStage').val(),
        type: 'POST',
        data: $(this).serialize(),
        success: function (result) {
            if (result.success) {
                displaySuccessMessage(result.message);
                $('#changeJobStageModal').modal('hide');
                window.livewire.emit('refreshDatatable')
            }
        },
        error: function (result) {
            displayErrorMessage(result.responseJSON.message);
        },
        complete: function () {
            processingBtn('#changeJobStageForm', '#changeJobStageBtnSave');
        },
    });
});


listenClick('#resetFilter', function () {
    $('#filterStatus').val('').trigger('change');
    $('.select2-chosen').select2('data')[0].text;
});

listenClick('.job-application-action-delete', function (event) {
    let jobApplicationId = $(event.currentTarget).attr('data-id');
    deleteItem(route('job.application.destroy', jobApplicationId), Lang.get('messages.job_application.job_application'));
});

listenClick('.job-application-short-list', function (event) {
    let jobApplicationId = $(event.currentTarget).data('id');
    let applicationStatus = 4;
    changeJobApplicationStatus(jobApplicationId, applicationStatus);
});

listenClick('.job-application-action-completed', function (event) {
    let jobApplicationId = $(event.currentTarget).data('id');
    let applicationStatus = 3;
    selectedJobApplicationItem(jobApplicationId, applicationStatus);
});

listenClick('.job-application-action-decline', function (event) {
    let jobApplicationId = $(event.currentTarget).data('id');
    let applicationStatus = 2;
    rejectedJobApplicationItem(jobApplicationId, applicationStatus);
});

function changeJobApplicationStatus (jobApplicationId, applicationStatus) {
    $.ajax({
        url: route('change-job-application-status',
            { 'id': jobApplicationId, 'status': applicationStatus }),
        method: 'get',
        cache: false,
        success: function (result) {
            if (result.success) {
                livewire.emit('refreshDatatable');
            }
        },
        error: function error (result) {
            displayErrorMessage(result.responseJSON.message);
        },
    });
};

function rejectedJobApplicationItem (jobApplicationId, applicationStatus) {
    swal({
        title: Lang.get('messages.common.rejected') + ' !',
        text: Lang.get('messages.common.are_you_sure_want_to_reject') + ' "' +
            Lang.get('messages.job_application.job_application') + '" ?',
        icon: 'warning',
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        confirmButtonColor: '#6777ef',
        cancelButtonColor: '#d33',
        buttons: {
            confirm: Lang.get('messages.common.yes'),
            cancel: Lang.get('messages.common.no')
        },
    }).then((result) => {
        if (result) {
            changeJobApplicationStatus(jobApplicationId, applicationStatus);
            swal({
                title: Lang.get('messages.common.rejected') + ' !',
                text: Lang.get('messages.job_application.job_application') +
                    ' ' + Lang.get('messages.common.has_been_rejected'),
                type: 'success',
                icon: 'success',
                buttons: {
                    confirm:Lang.get('messages.common.ok'),
                },
                reverseButtons: true,
                confirmButtonColor: '#F62947',
                timer: 2000,
            });
        }
    });
    // swal({
    //         title: Lang.get('messages.common.rejected')+' !',
    //         text:  Lang.get('messages.common.are_you_sure_want_to_reject') +'"'+Lang.get('messages.job_application.job_application')+'" ?',
    //         type: 'warning',
    //         showCancelButton: true,
    //         closeOnConfirm: false,
    //         showLoaderOnConfirm: true,
    //         confirmButtonColor: '#6777ef',
    //         cancelButtonColor: '#d33',
    //         cancelButtonText: Lang.get('messages.common.no'),
    //         confirmButtonText: Lang.get('messages.common.yes'),
    //     },
    //     function () {
    //         changeJobApplicationStatus(id,applicationStatus);
    //         swal({
    //             title: Lang.get('messages.common.rejected') + ' !',
    //             text: Lang.get('messages.job_application.job_application') + ' ' +Lang.get('messages.common.has_been_rejected'),
    //             type: 'success',
    //             confirmButtonColor: '#6777ef',
    //             timer: 2000,
    //         });
    //     });
};

function selectedJobApplicationItem (jobApplicationId, applicationStatus) {
    swal({
        title: Lang.get('messages.common.selected') + ' !',
        text: Lang.get('messages.common.are_you_sure_want_to_select') + ' "' +
            Lang.get('messages.job_application.job_application') + '" ?',
        icon: 'warning',
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        confirmButtonColor: '#6777ef',
        cancelButtonColor: '#d33',
        buttons: {
            confirm: Lang.get('messages.common.yes'),
            cancel: Lang.get('messages.common.no')
        },
    }).then((result) => {
        if (result) {
            changeJobApplicationStatus(jobApplicationId, applicationStatus);
            swal({
                title: Lang.get('messages.common.selected') + ' !',
                text: Lang.get('messages.job_application.job_application') +
                    ' ' + Lang.get('messages.common.has_been_selected'),
                type: 'success',
                icon: 'success',
                buttons: {
                    confirm:Lang.get('messages.common.ok'),
                },
                reverseButtons: true,
                confirmButtonColor: '#F62947',
                timer: 2000,
            });
        }
    });
    // swal({
    //         title: Lang.get('messages.common.selected')+' !',
    //         text: Lang.get('messages.common.are_you_sure_want_to_select') +'"'+Lang.get('messages.job_application.job_application')+'" ?',
    //         type: 'warning',
    //         showCancelButton: true,
    //         closeOnConfirm: false,
    //         showLoaderOnConfirm: true,
    //         confirmButtonColor: '#6777ef',
    //         cancelButtonColor: '#d33',
    //         cancelButtonText: Lang.get('messages.common.no'),
    //         confirmButtonText: Lang.get('messages.common.yes'),
    //     },
    //     function () {
    //         changeJobApplicationStatus(id,applicationStatus);
    //         swal({
    //             title: Lang.get('messages.common.selected') + ' !',
    //             text: Lang.get('messages.job_application.job_application') + ' ' +Lang.get('messages.common.has_been_selected'),
    //             type: 'success',
    //             confirmButtonColor: '#009ef7',
    //             timer: 2000,
    //         });
    //     });
};

// listenClick('#actionDropDown',function(){
//     $('.table-responsive').css( "overflow", "unset" );
// })
// $(document).on('click', '.change-job-stage', function () {
//     let id = $(this).attr('data-id');
//     $.ajax({
//         url: getJobStage,
//         type: 'POST',
//         data: {'_token': $('meta[name="csrf-token"]').attr('content'),
//                 'jobApplicationId': id,},
//         success: function (result) {
//             if (result.success) {
//                 let stageId = result.data.job_stage_id
//                 $('#jobApplicationId').val(id);
//                 $('#jobStageId').val(stageId).trigger('change');
//                 $('#changeJobStageModal').appendTo('body').modal('show');
//             }
//         },
//         error: function (result) {
//             displayErrorMessage(result.responseJSON.message);
//         },
//     });
// });
