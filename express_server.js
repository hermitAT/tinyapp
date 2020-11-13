const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { generateRandomString, getUserFromID, emailLookup, passwordLookup, userIDLookup, urlsForUser, urlDatabase, users } = require("./helper-functions");
// ^^ requirements and modules ...

const PORT = 8080;

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");

// ^^ above code is middleware, requirements, or functions/constants set for use within the app ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~ RENDER / REDIRECT URL TEMPLATE ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// create a .json file containing our key-value pairs within the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// redirect user to /urls or /login page, whether or not there are already logged into the app
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// render the template for our urls homepage, using the urlDatabase
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.userID, urlDatabase),
    user: getUserFromID(req.session.userID, users)
  };
  res.render("urls_index", templateVars);
});

// render the form to add a new short-longURL value pair to our database
app.get("/urls/new", (req, res) => {
  if (!getUserFromID(req.session.userID, users)) {
    res.redirect("/login");
  }

  const templateVars = {
    user: getUserFromID(req.session.userID, users)
  };
  res.render("urls_new", templateVars);
});

// show user the data for their short/longURL value pair, also contains form to edit the data or redirect to the original longURL
app.get("/urls/:shortURL", (req, res) => {
  const user = getUserFromID(req.session.userID, users);
  if (!user) {
    res.redirect("/login");
  }
  
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  for (const url in urlDatabase) {
    if (url === shortURL) {
      const templateVars = {
        shortURL,
        longURL: urlDatabase[shortURL].longURL,
        user,
      };
      res.render("urls_show", templateVars);
    }
  }
  res.status(404).send('<h2>Sorry, we can\'t find that URL in our database...</h2>' + '<img src="https://http.cat/404" alt="STATUS CODE 404 CAT" style="height:500px;width:600px;"/>');
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
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).send('<h2>Sorry, please confirm both fields have been entered correctly!</h2>' + '<img src="https://http.cat/400" alt="STATUS CODE 400 CAT" style="height:500px;width:600px;"/>');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (emailLookup(email, users)) {
    res.status(400).send('<h2>Sorry, that email is already in use!</h2>' + '<img src="https://http.cat/400" alt="STATUS CODE 400 CAT" style="height:500px;width:600px;"/>');
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: hashedPassword
    };
    req.session.userID = newUserID;
    res.redirect("/urls");
  }
});

// handle a post to /login the user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!emailLookup(email, users)) {
    res.status(403).send('<h2>Sorry, we couldn\'t find that email within our database...</h2>' + '<img src="https://http.cat/403" alt="STATUS CODE 403 CAT" style="height:500px;width:600px;"/>');
  } else if (!passwordLookup(password, users, emailLookup(email, users))) {
    res.status(403).send('<h2>Sorry, the password entered did not match!</h2>' + '<img src="https://http.cat/403" alt="STATUS CODE 403 CAT" style="height:500px;width:600px;"/>');
  } else {
    req.session.userID = userIDLookup(users, email, password);
    res.redirect('/urls');
  }
});

// handle a post to /logout the user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ADD / EDIT / DELETE URL ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ADD NEW URLs
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    res.status(401).send('<h2>Sorry, please login before trying that!</h2>' + '<img src="https://http.cat/401" alt="STATUS CODE 401 CAT" style="height:500px;width:600px;"/>');
  }
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID
  };
  res.redirect(`/urls/${newShortURL}`);
});

// EDIT URLS
app.put("/urls/:shortURL", (req, res) => {
  if (!req.session.userID) {
    res.status(401).send('<h2>Sorry, please login before trying that!</h2>' + '<img src="https://http.cat/401" alt="STATUS CODE 401 CAT" style="height:500px;width:600px;"/>');
  }

  if (urlDatabase[req.params.shortURL].userID !== req.session.userID) {
    res.status(401).send('<h2>Sorry, you cannot edit another user\'s URLs!</h2>' + '<img src="https://http.cat/401" alt="STATUS CODE 401 CAT" style="height:500px;width:600px;"/>');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});


// DELETE URLs
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.userID) {
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