function goBack() {
    history.back()
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    document.getElementById('backButton').addEventListener('click', goBack)
})