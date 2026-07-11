const response = await fetch('/client/save-client/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
});

const data = await response.json();

if (data.sucess) {

    showToast(data.mensage, 'success');

    setTimeout(() => {
        window.location.href = '/client/';
    }, 1500);

    return;
}

const errorSource = data.mensage;

if (
    errorSource &&
    typeof errorSource === 'object' &&
    !Array.isArray(errorSource)
) {

    if (errorSource.mens_code)
        showFieldError('regCode','errCode',errorSource.mens_code);

    if (errorSource.mens_name)
        showFieldError('regName','errName',errorSource.mens_name);

    if (errorSource.mens_doc_type)
        showFieldError('regDocType','errDocType',errorSource.mens_doc_type);

    if (errorSource.mens_doc)
        showFieldError('regDoc','errDoc',errorSource.mens_doc);

    if (errorSource.mens_contact)
        showFieldError('regContact','errContact',errorSource.mens_contact);

    if (errorSource.mens_email)
        showFieldError('regEmail','errEmail',errorSource.mens_email);

    if (errorSource.mens_state_register)
        showFieldError(
            'regStateRegister',
            'errStateRegister',
            errorSource.mens_state_register
        );

}
else {

    showToast(errorSource,'error');

}