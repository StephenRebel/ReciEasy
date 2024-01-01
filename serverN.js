/*
COMP2406 term project
Author: Stephen Rebel, 101260646

This will be the server side of the app which will handle authentication of users.
It will also serve the static files to build the webpages.
The main use will allow users to interact with a data base and either request or add information to it.
There will also be admin level access which will help moderate the database and in general have more power.
*/

const express = require('express')
const session = require('express-session')
const path = require('path')
const favicon = require('serve-favicon')
const hbs = require('hbs')

const routes = require('./routes/routeFuncs')
const helpers = require('./routes/helpers')

const app = express()
const PORT = 3000 || process.env.PORT;
const ROOT_DIR = 'public'

// view engine setup
hbs.registerPartials(path.join(__dirname, 'views/partials'))
hbs.registerHelper('ifNotEquals', helpers.ifNotEquals)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser

//Set up session
app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: '2406securefinal',
    cookie: {
        maxAge: 1000*60*60*3,
        sameSite: true,
        secure: false,
    }
}))

//Set up middleware
app.use(express.json())
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, ROOT_DIR)))

//Get Routes
app.get('/dashboard', routes.dashboard)
app.get('/login', routes.clientLogin)
app.get('/register', routes.createAcc)
app.get('/searchRecipes', routes.recipeSearch)
app.get('/recipe/*', routes.recipeInfo)
app.get('/cookbooks', routes.showCookbooks)
app.get('/cookbookRecipes/*', routes.showCookbookRecipes)
app.get('/displayRecipe/*', routes.displayRecipe)
app.get('/adminPage', routes.adminPage)

//Post Routes
app.post('/login', routes.login)
app.post('/register', routes.register)
app.post('/searchRecipe', routes.searchR)
app.post('/saveRecipe', routes.saveRecipe)
app.post('/adminDelete', routes.adminDelete)
app.post('/logout', routes.logout)

//Initialize server
app.listen(PORT, (err) => {
    if(err) {
        console.log(err)
      } else {
        console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
        console.log(`Open a brower to: http://localhost:${PORT}/login`)
        console.log('Use the following accounts for testing:')
        console.log("Admin: 'sabrADl22', Password: '#^Sj4r9B%eooqr*rSq(3qEH'")
        console.log("User: 'Bob', Password: 'strongpass93'")
        console.log("User: 'Steve', Password: 'foodYummy27'")
      }
})