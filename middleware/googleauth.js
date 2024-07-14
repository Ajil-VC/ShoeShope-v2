const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET} = require('../config/config');
const { User } = require('../models/models');

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:2000/google/callback",
    passReqToCallback: true
  },
  async function(request,accessToken, refreshToken, profile, cb) {
    console.log(profile)
    try {
        const user = await User.findOne({ email: profile._json.email }).exec();
        
        if(user) {
          // User exists, authenticate
          console.log("User found");

          if(user.isBlocked){
            console.log("User is blocked.");
            return cb(null,false);
          }
          return cb(null, user);
        } else {
          // User does not exist, create a new user
          console.log("Creating new user");
          const newUser = new User({
            firstName: profile.name.givenName,
            lastName : profile.name.familyName,
            email: profile._json.email,
            isVerified : 1,
            google_id   : profile.id
          });
          await newUser.save();
          return cb(null, newUser);
        }
      } catch (error) {
        console.log("Internal server error while google authentication", error);
        return cb(error, null);
      }
  

  }

));

passport.serializeUser(function(user,done) {

    done(null,user);
})
passport.deserializeUser(function(user,done) {

    done(null,user);
})

module.exports = {passport}