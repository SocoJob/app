document.addEventListener('turbo:load', loadAdminData);

function loadAdminData(){

}

listenClick('.changeAdminStatus', function (event) {
    displaySuccessMessage(Lang.get('messages.flash.status_change'));
});

listenClick('.admins-delete-btn', function (event) {
    let adminId = $(this).attr('data-id');
    deleteItem(route('admin.destroy', adminId), Lang.get('messages.notification_settings.admin'));
});


listenSubmit('#createAdminForm , #editAdminForm', function () {
    if (!$('#last_name').val().trim().length) {
        displayErrorMessage('Last name field is required');
        return false;
    }

    return true;
})
