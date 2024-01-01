function goBack() {
    history.back()
}

//Send request to server to delete selected user, then update the div with the new list of users.
function deleteUser() {
    let user = document.getElementById('deleteUserSelect').value

    fetch('/adminDelete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user })
    })
    .then(response => response.text())
    .then(data => {
        if(data.includes('DeletionFailed')) {
            alert("Deletion Failed")
            console.log("Deletion Failed")
        } else if (data.includes('FailedLoadingResults')){
            alert("FailedLoadingResults")
            console.log("FailedLoadingResults")
        } else {
            document.getElementById('adminUserDiv').innerHTML = data
            let select = document.getElementById('deleteUserSelect')
            let remove = document.querySelector(`#deleteUserSelect option[value='${user}']`)

            select.removeChild(remove)
            select.selectedIndex = 0
        }
    })
    .catch(error => {
        console.log("Deletion Error: ", error)
    })
}


//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    document.getElementById('backButton').addEventListener('click', goBack)
    document.getElementById('deleteUserButton').addEventListener('click', deleteUser)
})