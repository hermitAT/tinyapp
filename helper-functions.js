const bcrypt = require("bcrypt");

// function to generate random string of 6 alphanumeric characters
const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substr(2, 6);
};

// return the user object associated with the user currently in session
const getUserID = (cookie, users) => {
  for (const user in users) {
    if (users[user].id === cookie) {
      return users[user];
    }
  }
};

// return the ID of the user based the submitted email
const emailLookup = (email, users) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
};

// determine if the submitted password is the same as the hashed password within our database
const passwordLookup = (subPassword, users, user) => {
  for (const item in users) {
    if (item === user && bcrypt.compareSync(subPassword, users[item].password)) {
      return true;
    }
  }
};

// return the userID based on the email and password submitted, assuming it passes hash checks
const userIDLookup = (users, email, subPassword) => {
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(subPassword, users[user].password)) {
      return users[user].id;
    }
  }
};

// return the URLs registered to the user in session as an object, in order to populate the index page table
const urlsForUser = (id, database) => {
  const myUrls = {};
  if (!id) {
    return false;
  }
  for (const url in database) {
    if (database[url].userID === id) {
      myUrls[url] = database[url];
    }
  }
  return myUrls;
};

// database containing URLs and their associated info
const urlDatabase = {};

// database containing users and their associated info
const users = {};

// export all below!
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