const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substr(2, 6);
};

const getUserID = (cookie, users) => {
  let foundUser;
  for (const user in users) {
    if (user.id === cookie) {
      foundUser = users[user];
    }
  }
  return foundUser;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "p0k3m4": {
    id: "p0k3m4",
    email: "pokeguy@gmail.com",
    password: "poke123"
  }
};

// ^^ above code is middleware, requirements, or functions/constants set for use within the app
// create a .json file containing our key-value pairs within the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render the template for our urls homepage, using the urlDatabase
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserID(req.cookies["user_id"], users)
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// render the form to add a new short-longURL value pair to our database
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: getUserID(req.cookies["user_id"], users)
  };
  res.render("urls_new", templateVars);
});

// show user the data for their short/longURL value pair, also contains form to edit the data or redirect to the original longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: getUserID(req.cookies["user_id"], users)
  };
  res.render("urls_show", templateVars);
});

// redirect user to the longURL stored within the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// render page for user registration
app.get("/register", (req, res) => {
  res.render("registration");
});

// handle a post to register a new user
app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_id', newUserID);
  res.redirect("/urls");
});

// handle a post to /login the user
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.user_id);
  res.redirect('/urls');
});

// handle a post to /logout the user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// ADD NEW URLs
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; // save the shortURL-longURL pair to the database when it recieves a post request
  res.redirect(`/urls/${newShortURL}`); // redirect to new shortURL, created by random string generator
});

// EDIT URLS
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


// DELETE URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// app is listening...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});