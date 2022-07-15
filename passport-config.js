const LocalStrategy = require('passport-local').Strategy //cloud which is similar to local db
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => { //done is a callback, that means every params are done. then we need to return the done()

    //rule or statement

    //iniate user;
    const user = getUserByEmail(email)

    //for user that are not register/no email
    if (user == null) {
      return done(null, false, { message: 'No user with that email' }) //first params = error on server, in this case no error, 2nd para = user we found, last = message (<err>, <user>, <message>)
    }

    //try catch
    try {
      if (await bcrypt.compare(password, user.password)) { // if password == user.password, return the user data. we use callback done() to return the data.
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  //use passport to define auth strategy
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)) //new LocalStrategy(function)
  passport.serializeUser((user, done) => done(null, user.id)) //allow auth user to be "attached" to a unique session.
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id)) //"req.user" will contain the auth user obj for that session
  })
}

module.exports = initialize;

//example

//req.session.passport.user = 12
// user.id = 12

//req.session.passport.password = 1234
// user.password= 12