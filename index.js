require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
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

//Routes ----------------------------------
app.use("/", require("./routes"));

//--------------------------*/

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up on port ${port}.`));
