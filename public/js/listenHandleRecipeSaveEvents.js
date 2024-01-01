//Funtion to request server to sabe the displayed recipe to the users cookbook.
function saveRecipe() {
    //Send request to server to do some sqlite stuff.
    fetch('http://localhost:3000/saveRecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        //Could expand this later where users have mutiple cookboos and they select one,
        //For now this is redundant as users have a single cookbook.
        body: JSON.stringify({ cookbookName: 'default' })
    })
    .then((resp) => resp.json())
    .then((data) => {
        let resultB = document.getElementById('resultDisp')
        //Generate small message to display the result of the request.
        //Users most liekly do not want to be redirected so change is dynimcally displayed.
        if(data.error) {
            resultB.innerText = data.error
            resultB.style.color = "#8a0000"
            resultB.style.border = "1px solid #8a0000"
            resultB.style.backgroundColor = "#e58f8f"
            resultB.style.opacity = 1
        } else {
            resultB.innerText = data.success
            resultB.style.color = "#12521b"
            resultB.style.border = "1px solid #12521b"
            resultB.style.backgroundColor = "#5be76e"
            resultB.style.opacity = 1
        }

        setTimeout(() => {
            resultB.style.opacity = 0
        }, 5000)
    })
    //Server send back a yes or no, and we disaply result
}

function goBack() {
    history.back()
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    //first button may or may not exist, but should not cause issues if it does not.
    const saveButton = document.getElementById('saveButton')
    if(saveButton) {
        saveButton.addEventListener('click', saveRecipe)
    }
    document.getElementById('backButton').addEventListener('click', goBack)
})