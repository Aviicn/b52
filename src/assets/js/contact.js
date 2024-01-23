function submitData () {
    const name = document.getElementById('inputName').value
    const email = document.getElementById('inputEmail').value
    const phone = document.getElementById('inputPhone').value
    const subject = document.getElementById('inputSubject').value
    const message = document.getElementById('inputMessage').value

    // keadaan jika salah satu input kosong
    if(!name) {
        alert('Name harap diisi');
    } else if (!email) {
        alert('Email harap diisi');
    } else if (!phone) {
        alert('Phone number harap diisi');
    } else if (!subject) {
        alert('Subject harap diisi');
    } else if (!message) {
        alert('Massage harap diisi');
    } else {
       
        const emailReceiver = "vcienna09@gmail.com";
        let a = document.createElement('a');
        a.href = `mailto:${emailReceiver}?subject=${subject}&body=${message}`;
        a.click();
    }
}