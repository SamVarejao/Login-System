const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/User");

module.exports = function(passport) {
  passport.use(
    //Check if user exists
    
    new LocalStrategy({ name: "name" }, (name, password, done) => {
      User.findOne({
        name: name
      }).then(user => {
        if (!user) {
          return done(null, false );
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );
  passport.serializeUser((user, done)=> {
    done(null, user.id);
  });

  passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=> {
      done(err, user);
    });
  });
};
