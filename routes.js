const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();

const {
  forwardAuthenticated,
  ensureAuthenticated
} = require("./passport/authenticate");

const User = require("./models/User"); //load user model

//GET home
router.get("/", forwardAuthenticated, (req, res) => {
  res.render("homepage");
});
// GET resgister
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});
//POST register
router.post("/register", (req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];

//Conditions ---------------------------------------
  if (!username || !password || !password2) {
    errors.push(" Please enter all fields");
  }

  if (password != password2) {
    errors.push(" Passwords must match");
  }

  if (password && password.length < 6) {
    errors.push(" Password must be a least 6 characters long");
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      userValue: username,
      passwordValue: password,
      password2Value2: password2
    });
  } else {
    User.findOne({ name: username }).then(user => { //name (comes from mongoose schema)
      if (user) {                                   //userValue (is part of the form)
        errors.push(" User already exists");        //username is a value of the req body
        res.render("register", {
          errors,
          userValue: username,
          passwordValue: password,
          password2Value2: password2
        });
      } else {
        const newUser = new User({
          name: username,
          password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }

            newUser.password = hash;

            newUser.save().then(
              res.render("login", {
                message: "All done! User may log in now."
              })
            );
          });
        });
      }
    });
  }
});
// GET login
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", { message: req.flash("error") });
});
//POST login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
    failureFlash: "Login failed"
  })(req, res, next);
});

router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "User logged out.");
  res.redirect("/login");
});

module.exports = router;