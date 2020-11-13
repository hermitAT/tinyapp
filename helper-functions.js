const bcrypt = require("bcrypt");

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substr(2, 6);
};

const getUserID = (cookie, users) => {
  for (const user in users) {
    if (users[user].id === cookie) {
      return users[user];
    }
  }
};

const emailLookup = (email, users) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
};

const passwordLookup = (subPassword, users, user) => {
  for (const item in users) {
    if (item === user && bcrypt.compareSync(subPassword, users[item].password)) {
      return true;
    }
  }
};

const userIDLookup = (users, email, subPassword) => {
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(subPassword, users[user].password)) {
      return users[user].id;
    }
  }
};

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

const urlDatabase = {};

const users = {};

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