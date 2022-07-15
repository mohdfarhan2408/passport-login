if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// the data of the users, in real-life we use database.
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false })) 
app.use(flash())

//passport needs these following setup/middleware (except (_method)) to save user data after auth session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
})) //basic express session ({..}) initialization
app.use(passport.initialize()) //init passport on every route call
app.use(passport.session()) //allow passport to use "express-session"
app.use(methodOverride('_method'))


//home
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})


//login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', { //using passport
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


//register
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({ //store data inside the users.array
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})


//logout
app.delete('/logout', (req, res) => {
    req.logout(function(err) { //new documentation from express, need to read.
        if (err) { 
            return next(err); }
            res.redirect('/login');
    });
})


//middleware

//req.isAuthenticated can be used to protect routes that can be accessed only after a user is logged in, eg: dashboard;
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
    return next()
    }
    res.redirect('/login') //if not log in, then redirect to login page
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { //if user already login, then redirect to home page
        return res.redirect('/')
    }
    next()
}



app.listen(3000, () => console.log('listen port 3000'))

