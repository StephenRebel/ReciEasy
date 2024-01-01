/*
File to contain all the various hadnlers for my server as to declutter the
main server routing, and the fucntions handling processing.
*/

const axios = require('axios')
const sqlite3 = require('sqlite3').verbose()
const zlib = require('zlib')
var db = new sqlite3.Database('data/recipeAppDB.db')

const apiKey = 'f05d2e4e83c642708f2a67e67a3cb8e5'
let lastReq = {}

//Get request handlers, all check for a authenticated user

//Load the dashboard
exports.dashboard = (req, res) => {
    if(!(req.session.authenticated)) {
        res.redirect('/login')
    } else {
        priviledge = req.session.role === 'master chef'
        console.log('Admin User: ', priviledge)
        res.render('main', {
            title: 'Dashboard',
            user: req.session.userId,
            admin: priviledge,
            page: { dash: true }
        })
    }
}

//Load client login page
exports.clientLogin = (req, res) => {
    if(req.session.authenticated) {
        res.redirect('/dashboard')
    } else {
        res.render('authPage', {
            title: 'Client Login Page',
            header: 'Login',
            scriptPath: '<script src="/js/listenHandleLoginEvents.js"></script>',
            useLogin: true
        })
    }
}

//Load client registration page
exports.createAcc = (req, res) => {
    if(req.session.authenticated) {
        res.redirect('/dashboard')
    } else {
        res.render('authPage', {
            title: 'Client Registration Page',
            header: 'Create New Account',
            scriptPath: '<script src="js/listenHandleCreateAccEvents.js"></script>',
            useLogin: false
        })
    }
}

//Load recipe search page
exports.recipeSearch = (req, res) => {
    if(req.session.authenticated) {
        res.render('main', {
            title: 'Search Recipe',
            page: { rSearch: true },
            scriptPath: '<script src="/js/listenHandleSearchEvents.js"></script>'
        })
    } else {
        res.redirect('/login')
    }
}

//Load the recipe disaply page
//API information from: https://spoonacular.com/food-api/docs#Get-Recipe-Information and other Documentation pages
exports.recipeInfo = async (req, res) => {
    if(req.session.authenticated) {
        let urlSplit = req.url.split('/')
        let recipeId = urlSplit[urlSplit.length - 1]

        //Get Api data
        try {
            let apiResponse = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`)
            let recipeData = apiResponse.data

            //Store the most recent recipe request in the users session history to save the recipe.
            req.session.recipeInfo = {}
            req.session.recipeInfo.id = recipeData.id
            req.session.recipeInfo.name = recipeData.title
            req.session.recipeInfo.imgLink = recipeData.image
            req.session.recipeInfo.instructions = recipeData.instructions
            req.session.recipeInfo.ingredients = recipeData.extendedIngredients

            res.render('main', {
                title: 'Recipe Information',
                recipeSearchFail: false,
                searched: true,
                recipe: req.session.recipeInfo,
                scriptPath: '<script src="/js/listenHandleRecipeSaveEvents.js"></script>',
                page: { recipeDisp: true }
            })

        } catch(err) {
            console.error(`Error making API request: ${error.message}`)
            res.render('main', {
                title: 'Recipe Search Failed',
                recipeSearchFail: true,
                searched: true,
                page: { recipeDisp: true },
                scriptPath: '<script src="/js/listenHandleRecipeSaveEvents.js"></script>'
            })
        }
    } else {
        res.redirect('/login')
    }
}

//Display the users cookbooks
exports.showCookbooks = (req, res) => {
    if(req.session.authenticated) {
        db.all('select cookbook_title, cookbook_id from cookbooksNew where user_id = ?', [req.session.userId], (err, rows) => {
            if(err) {
                console.error(err)
                res.render('main', {
                    title: 'Display Cookbooks Failed',
                    failed: true,
                    page: { vCookbook: true },
                    scriptPath: '<script src="/js/listenHandleCookbookViewEvents.js"></script>'
                })
                return;
            } else {
                console.log(rows)
                res.render('main', {
                    title: 'View Cookbooks',
                    user: req.session.userId,
                    page: { vCookbook: true },
                    cookbooks: rows,
                    scriptPath: '<script src="/js/listenHandleCookbookViewEvents.js"></script>'
                })
            }
        })
    } else {
        res.redirect('/login')
    }
}

//Display all recipes in a selected cookbook
function generateCBRecipes(req, res, id, row) {
    db.all('select * from cookbookRecipes where cookbook_id = ?', [id], (err, rows) => {
        if(err) {
            res.render('main', {
                title: 'Display Recipes Failed',
                failed: true,
                page: { cookbookR: true },
                scriptPath: '<script src="/js/listenHandleCookbookRecipesEvents.js"></script>'
            })
        } else {
            res.render('main', {
                title: 'Display Reipes',
                cookbook: row.cookbook_title,
                page: { cookbookR: true },
                recipes: rows,
                scriptPath: '<script src="/js/listenHandleCookbookRecipesEvents.js"></script>'
            })
        }
    })
}

//First step of getting the cookbook and needed information to display the recipes based on the user and selected cookbook
exports.showCookbookRecipes = (req, res) => {
    if(req.session.authenticated) {
        let urlSplit = req.url.split('/')
        let cookbookId = urlSplit[urlSplit.length - 1]

        db.get('select user_id, cookbook_title from cookbooksNew where cookbook_id = ?', [cookbookId], (err, row) => {
            if(err) {
                console.error(err)
                res.redirect('/cookbooks')
            } else {
                if(row) {
                    if(req.session.userId === row.user_id) {
                        generateCBRecipes(req, res, cookbookId, row)
                    } else {
                        res.redirect('/cookbooks')
                    }
                } else {
                    res.redirect('/cookbooks')
                }
            }
        })
    } else {
        res.redirect('/login')
    }
}

//Display a recipe saved to the database
//Function left open as to be useful in the furture if a generic search engin was implemented to search all recipes
//saved to the database by users.
exports.displayRecipe = (req, res) => {
    if(req.session.authenticated) {
        let urlSplit = req.url.split('/')
        let recipeId = urlSplit[urlSplit.length - 1]

        db.get('select recipe_file from recipes where recipe_id = ?', [recipeId], (err, row) => {
            if(err) {
                console.error(err)
                res.render('main', {
                    title: 'Recipe Search Failed',
                    searched: false,
                    recipeSearchFail: true,
                    page: { recipeDisp: true },
                    scriptPath: '<script src="/js/listenHandleRecipeSaveEvents.js"></script>'
                })
            } else {
                let recipeDecompressed = zlib.inflateSync(Buffer.from(row.recipe_file, 'base64')).toString()
                let recipeData = JSON.parse(recipeDecompressed)
                console.log("Parsed, ", recipeData.id,", " ,recipeData.name)
                res.render('main', {
                    title: 'Recipe Information',
                    recipeSearchFail: false,
                    searched: false,
                    recipe: recipeData,
                    scriptPath: '<script src="/js/listenHandleRecipeSaveEvents.js"></script>',
                    page: { recipeDisp: true }
                })
            }
        })
    } else {
        res.redirect('/login')
    }
}

//Display the admin page, shows user and recipe information.
exports.adminPage = (req, res) => {
    if(req.session.authenticated && req.session.role === 'master chef') {
        let users = null;
        let recipes = null;
        let userNum = 0;
        let recipeNum = 0;

        db.all('select * from users', (err, rows) => {
            if(err) {
                console.error(err)
                res.render('main', {
                    title: 'Admin Page Error',
                    failed: true,
                    page: { adminPg: true },
                    scriptPath: '<script src="/js/listenHandleAdminEvents.js"></script>'
                })
            } else {
                users = rows
                userNum = rows.length
                db.all('select recipe_name, recipe_id from recipes', (err, rows) => {
                    if(err) {
                        console.error(err)
                        res.render('main', {
                            title: 'Admin Page Error',
                            failed: true,
                            page: { adminPg: true },
                            scriptPath: '<script src="/js/listenHandleAdminEvents.js"></script>'
                        })
                    } else {
                        recipes = rows
                        recipeNum = rows.length
                        res.render('main', {
                            title: 'Admin Page',
                            userQuery: users,
                            userNum: userNum,
                            recipeQuery: recipes,
                            recipeNum: recipeNum,
                            page: { adminPg: true },
                            scriptPath: '<script src="/js/listenHandleAdminEvents.js"></script>'
                        })
                    }
                })
            }
        })
    } else {
        res.redirect('/dashboard')
    }
}

//POST request hadnlers

//Handle users request to login
exports.login = (req, res) => {
    let username = req.body.username
    let password = req.body.password

    db.get('select * from users where user_id = ?', [username], (err, row) => {
        if(err) {
            console.error(err);
            res.status(500).send('Server Side Error Occured. Please Try Again Later.')
            return;
        }

        if(row) {
            if(password === row.password) {
                req.session.authenticated = true
                req.session.userId = row.user_id
                req.session.role = row.role
                res.json({ validated: true, newPage: 'http://localhost:3000/dashboard' })
            } else {
                res.json({ validated: false })
            }
        } else {
            res.json({ validated: false })
        }
    })
}

//Helper function to create a new cookbook for a newly registered user
function newBook(username, req, res, callBack) {
    db.get('select max(cookbook_id) as id from cookbooksNew', (err, row) => {
        if(err) {
            console.error(err)
            setTimeout(() => newBook(username, req, res, callBack), 1000)
        } else {
            db.run('insert into cookbooksNew values(?, ?, ?)', [username, `${username}Cookbook`, (row.id + 1)], (err) => {
                if(err) {
                    console.error(err)
                    setTimeout(() => newBook(username, req, res, callBack), 100)
                } else {
                    callBack(req, res)
                }
            })
        }
    })
}

//Handle users request to register
exports.register = (req, res) => {
    let username = req.body.username
    let password = req.body.passwordF
    let rePassword = req.body.passwordS

    if(password !== rePassword) {
        res.json({ registered: false, validated: false, reason: 'Passwords Do Not Match' })
        return;
    }

    db.run('insert into users values(?, ?, ?)', [username, password, 'line cook'], (err) => {
        if(err) {
            if(err.code === 'SQLITE_CONSTRAINT') {
                res.json({ registered: false, validated: false, reason: 'Invalid Username' })
            } else {
                console.error(err)
                res.status(500).send('Server Side Error Occured. Please Try Again Later.')
                return;
            }
        } else {

            newBook(username, req, res, () => {

                db.get('select * from users where user_id = ?', [username], (err, row) => {
                    if(err) {
                        console.error(err)
                        res.status(500).send('Server Side Error Occured. Your Account Has Been Created But Could Not Log You In At The Moment. Try Logging In Later.')
                        return;
                    } else {
                        if(row) {
                            req.session.authenticated = true
                            req.session.userId = row.user_id
                            req.session.role = row.role
                            res.json({ registered: true, validated: true, newPage: 'http://localhost:3000/dashboard' })
                        } else {
                            res.json({ registered: true, validated: false, newPage: 'http://localhost:3000/login' })
                        }
                    }
                })
            })
        }
    })
}

//Handle users request to logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err)
            res.redirect('back')
        } else {
            res.clearCookie('sid')
            res.redirect('login')
        }
    })
}

//Handle users request to search for types of recipes
//Contacts api for recipes with instructions and returns the top 5 results
exports.searchR = async (req, res) => {
    console.log(req.body.keyTerm)
    try {
        let apiResponse = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${req.body.keyTerm}&number=5&instructionsRequired=true`)

        lastReq = { results: [] }
        for(let recipe of apiResponse.data.results) {
            let recipeObj = {}
            recipeObj.id = recipe.id
            recipeObj.name = recipe.title
            lastReq.results.push(recipeObj)
        }

        apiResponse.data.success = true
        console.log(apiResponse.data)

        res.contentType('application/json').json(apiResponse.data)
    } catch(error) {
        console.error(`Error making API request: ${error.message}`)
        res.json({ success: false })
    }

}

//Helper funtion to save a recipe to a users cookbook when requested to save
function saveToCookbook(req, res) {
    let cBName
    if(req.body.cookbookName === 'default') {
        cBName = `${req.session.userId}Cookbook`
    } else {
        cBName = req.body.cookbookName
    }

    db.get('select cookbook_id from cookbooksNew where cookbook_title = ? and user_id = ?', [cBName, req.session.userId], (err, row) => {
        if(err) {
            res.json({ error: 'Could not ssave recipe. Try again later.' })
            return;
        } else {
            let cookbookId = row.cookbook_id

            db.run('insert into cookbookRecipes values(?, ?, ?)', [cookbookId, req.session.recipeInfo.id, req.session.recipeInfo.name], (err) => {
                if(err) {
                    if(err.code === 'SQLITE_CONSTRAINT') {
                        res.json({ error: 'Recipe Alread Saved' })
                    } else {
                        console.error(err)
                        res.json({ error: 'Could not ssave recipe. Try again later.' })
                        return;
                    }
                } else {
                    res.json({ success: 'Recipe saved' })
                }
            })
        }
    })
}

//Handle users request to save a recipe, adds to the database if not already saved
exports.saveRecipe = (req, res) => {
    let recipeStr = JSON.stringify(req.session.recipeInfo)
    let data = zlib.deflateSync(recipeStr).toString('base64')
    db.run('insert into recipes values(?, ?, ?)', [req.session.recipeInfo.id, req.session.recipeInfo.name, data], (err) => {
        if(err) {
            if(err.code === 'SQLITE_CONSTRAINT') {
                saveToCookbook(req, res)
            } else {
                console.error(err)
                res.json({ error: 'Could not save recipe. Try again later.' })
                return;
            }
        } else {
            saveToCookbook(req, res)
        }
    })
}

//Handles admin request to delete a user, requires the removal of a row from multiple tables, so must make sure all
//deletions are successful before commiting to the database.
//Returns an updated list of users to display on the admin page, or a failure message.
exports.adminDelete = (req, res) => {
    let userId = req.body.userId

    db.run('begin transaction');

    let cookbookId = '';
    db.get('select cookbook_id from cookbooksNew where user_id = ?', [userId], (err, row) => {
        if(err) {
            console.error(err)
            db.run('rollback')
            res.send('DeletionFailed')
        } else {
            cookbookId = row.cookbook_id
        }
    })

    db.run('delete from cookbookRecipes where cookbook_id = ?', [cookbookId], (err) => {
        if(err) {
            console.error(err)
            db.run('rollback')
            res.send('DeletionFailed')
        }
    })

    db.run('delete from cookbooksNew where user_id = ?', [userId], (err) => {
        if(err) {
            console.error(err)
            db.run('rollback')
            res.send('DeletionFailed')
        }
    })

    db.run('delete from users where user_id = ?', [userId], (err) => {
        if(err) {
            console.error(err)
            db.run('rollback')
            res.send('DeletionFailed')
        }
    })

    db.run('commit', (err) => {
        if(err) {
            console.error(err)
            db.run('rollback')
            res.send('DeletionFailed')
        } else {
            db.all('select * from users', (err, rows) => {
                if(err) {
                    console.error(err)
                    res.send('FailedLoadingResults')
                } else {
                    res.render('adminUserDiv', {
                        userNum: rows.length,
                        userQuery: rows
                    })
                }
            })
        }
    })

}