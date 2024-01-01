//Function request the server to provide recipes based on search term
//Dynamically creates divs to display the results in the page as to handle errors.
//Could be subject to change and refurbishment.
function searchRequest() {
    let keyWord = document.getElementById('recipeKeyWord').value.trim()

    if(keyWord === '') return

    let recipeDiv = document.getElementById('recipesDiv')

    fetch('http://localhost:3000/searchRecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ keyTerm: keyWord })
    })
    .then((response) => response.json())
    .then(data => {
        recipeDiv.innerHTML = ''
        if(data.success) {
            for(let recipe of data.results) {
                let newDiv = document.createElement('div')
                newDiv.classList.add('recipeLink')
                newDiv.innerHTML = `<img src=${recipe.image} alt="Food Picture" style="width: 100px; height: 75px"><p><a href="/recipe/${recipe.id}">${recipe.title}</a></p>`
                recipeDiv.appendChild(newDiv)
            }
        } else {
            recipeDiv.innerHTML = '<h1>Request Failed</h1>'
        }
    })
}

function goBack() {
    history.back()
}

//Handle enter key press, treated as submit button press.
function handleKeyDown(e) {
    const ENTER_KEY = 13
    if (e.keyCode === ENTER_KEY) {
        searchRequest()
        return false
    }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page

    //add listener to buttons
    document.getElementById('searchRecipeButton').addEventListener('click', searchRequest)
    document.getElementById('backButton').addEventListener('click', goBack)

    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
})