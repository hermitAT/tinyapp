const bcrypt = require("bcrypt");

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substr(2, 6);
};

const getUserID = (cookie, users) => {
  let foundUser;
  for (const user in users) {
    if (users[user].id === cookie) {
      foundUser = users[user];
    }
  }
  return foundUser;
};

const emailLookup = (email, users) => {
  for (const user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};

const passwordLookup = (subPassword, users) => {
  for (const user in users) {
    if (bcrypt.compareSync(subPassword, users[user].password)) {
      return true;
    }
  }
  return false;
};

const userIDLookup = (users, email, subPassword) => {
  let foundID;
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(subPassword, users[user].password)) {
      foundID = users[user].id;
    }
  }
  return foundID;
};

const urlsForUser = (id) => {
  let myUrls = {};
  if (!id) {
    return false;
  }
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      myUrls[url] = urlDatabase[url];
    }
  }
  return myUrls;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "p0k3m4" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "p0k3m4" }
};

const users = {
  "p0k3m4": {
    id: "p0k3m4",
    email: "pokeguy@gmail.com",
    password: bcrypt.hashSync("poke123", 10)
  }
};

module.exports = {
  generateRandomString,
  getUserID,
  emailLookup,
  passwordLookup,
  userIDLookup,
  urlsForUser,
  urlDatabase,
  users
};