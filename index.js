require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require('connect-flash');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.set("views", "./views");

//Conection---------------------------
mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
// Connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./passport/strategy")(passport);
const {
  forwardAuthenticated,
  ensureAuthenticated
} = require("./passport/authenticate");

//Routes ----------------------------------
const User = require("./models/User"); //load user model

//GET home
app.route("/").get(forwardAuthenticated, (req, res) => {
  res.render("homepage");
});
// GET resgister
app.route("/register").get(forwardAuthenticated, (req, res) => {
  res.render("register");
});
//POST register
app.route("/register").post((req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];

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
    User.findOne({ name: username }).then(user => {
      if (user) {
        errors.push(" User already exists");
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
app.route("/login").get(forwardAuthenticated, (req, res) => {
  res.render("login", {message:req.flash("error")});
});
//POST login
app.route("/login").post((req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
    failureFlash:'Login failed'
  })(req, res, next);
});

app.route("/profile").get(ensureAuthenticated, (req, res) => {
  res.render("profile");
});

app.route("/logout").get((req, res) => {
  req.logout();
  req.flash("error","User logged out.")
  res.redirect("/login");
});

//--------------------------*/

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up on port ${port}.`));
