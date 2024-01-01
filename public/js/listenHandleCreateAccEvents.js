//Sends a request to the server to create a new account, redirects to the dashboard if successful.
//Otherwise displays an error message.
function attemptAccountCreation() {
    let usr = document.getElementById('username').value.trim()
    let pswd = document.getElementById('passwordF').value.trim()
    let rePswd = document.getElementById('passwordS').value.trim()

    if(usr === '' || pswd === '' || rePswd === '') return

    fetch('http://localhost:3000/register' , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
        username: usr,
        passwordF: pswd,
        passwordS: rePswd
    })})
    .then((res) => res.json())
    .then((data) =>{
        if(data.registered) {
            window.location.href = data.newPage
        } else {
            document.getElementById('passwordF').value = ''
            document.getElementById('passwordS').value = ''
            document.getElementById('errorMsg').innerHTML = data.reason + '<span id="errorMsg2">Reinput your credentials</span>'
            document.getElementById('errorMsg').style.opacity = 1
            if(data.reason === "Invalid Username") document.getElementById('username').value = ''
        }
    })
}

function back() {
    window.location.href = 'http://localhost:3000/login'
}

//Handle enter key press, treated as submit button press.
function handleKeyDown(e) {
    const ENTER_KEY = 13
    if (e.keyCode === ENTER_KEY) {
        attemptAccountCreation()
        return false
    }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    document.getElementById('createNewAcc').addEventListener('click', attemptAccountCreation)
    document.getElementById('goBack').addEventListener('click', back)

    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
})