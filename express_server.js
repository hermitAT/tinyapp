const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserID, emailLookup, passwordLookup, userIDLookup, urlsForUser, urlDatabase, users } = require("./helper-files");

const PORT = 8080; // default port 8080

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
// ^^ above code is middleware, requirements, or functions/constants set for use within the app ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~ RENDER / REDIRECT URL TEMPLATE ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// create a .json file containing our key-value pairs within the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// render the template for our urls homepage, using the urlDatabase
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    user: getUserID(req.cookies.user_id, users)
  };
  res.render("urls_index", templateVars);
});

// render the form to add a new short-longURL value pair to our database
app.get("/urls/new", (req, res) => {
  const user = getUserID(req.cookies.user_id, users);
  const templateVars = {
    user
  };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// show user the data for their short/longURL value pair, also contains form to edit the data or redirect to the original longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: getUserID(req.cookies.user_id, users)
  };
  res.render("urls_show", templateVars);
});

// redirect user to the longURL stored within the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~LOGIN / USER REGISTRATION ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// renger page for user login
app.get("/login", (req, res) => {
  res.render("login");
});

// render page for user registration
app.get("/register", (req, res) => {
  res.render("registration");
});

// handle a post to register a new user
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('<h2>Sorry, please confirm both fields have been entered correctly!</h2>' + '<img src="https://http.cat/400" alt="STATUS CODE 400 CAT" style="height:500px;width:600px;"/>');
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (emailLookup(req.body.email, users)) {
    res.status(400).send('<h2>Sorry, that email is already in use!</h2>' + '<img src="https://http.cat/400" alt="STATUS CODE 400 CAT" style="height:500px;width:600px;"/>');
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: hashedPassword
    };
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});

// handle a post to /login the user
app.post("/login", (req, res) => {
  if (!emailLookup(req.body.email, users)) {
    res.status(403).send('<h2>Sorry, we couldn\'t find that email within our database...</h2>' + '<img src="https://http.cat/403" alt="STATUS CODE 403 CAT" style="height:500px;width:600px;"/>');
  } else if (!passwordLookup(req.body.password, users)) {
    res.status(403).send('<h2>Sorry, the password entered did not match!</h2>' + '<img src="https://http.cat/403" alt="STATUS CODE 403 CAT" style="height:500px;width:600px;"/>');
  } else {
    console.log(users);
    res.cookie('user_id', userIDLookup(users, req.body.email, req.body.password));
    res.redirect('/urls');
  }
});

// handle a post to /logout the user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ADD / EDIT / DELETE URL ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ADD NEW URLs
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${newShortURL}`);
});

// EDIT URLS
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    res.status(401).send('<h2>Sorry, you cannot edit another user\'s URLs!</h2>' + '<img src="https://http.cat/401" alt="STATUS CODE 401 CAT" style="height:500px;width:600px;"/>');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});


// DELETE URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    res.status(401).send('<h2>Sorry, you cannot delete another user\'s URLS!</h2>' + '<img src="https://http.cat/401" alt="STATUS CODE 401 CAT" style="height:500px;width:600px;"/>');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ app is listening... ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});