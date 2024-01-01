//Request a login to the server responds with an authentication token.
//Redirects on success to the dashboard, or displays an error message.
function attemptLogin() {
    let usr = document.getElementById('username').value.trim()
    let pswd = document.getElementById('password').value.trim()

    if(usr === '' || pswd === '') return

    fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({
        username: usr,
        password: pswd
    })})
    .then((response) => response.json())
    .then((data) => {
        if(data.validated) {
            window.location.href = data.newPage
        } else {
            document.getElementById('password').value = ''
            document.getElementById("errorMsg").style.opacity = 1
        }
    })
}

//Switch page
function requestNewUsr() {
    window.location.href = 'http://localhost:3000/register'
}

//Handle enter key press, treated as submit button press.
function handleKeyDown(e) {
    const ENTER_KEY = 13
    if (e.keyCode === ENTER_KEY) {
        attemptLogin()
        return false
    }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    document.getElementById('loginButton').addEventListener('click', attemptLogin)
    document.getElementById('createNewAcc').addEventListener('click', requestNewUsr)

    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
})