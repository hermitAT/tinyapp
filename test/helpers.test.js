const { assert } = require('chai');
const bcrypt = require('bcrypt');
const { emailLookup, passwordLookup, userIDLookup, urlsForUser } = require('../helper-functions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testURLDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

describe('#emailLookup', () => {
  it('should return a user with valid email', () => {
    const user = emailLookup("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('a non-existant email should return undefined', () => {
    const user = emailLookup("", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

describe('#passwordLookup', () => {
  it('a non-existant password should return undefined', () => {
    const actual = passwordLookup("", testUsers, "UserRandomID");
    const expectedOutput = undefined;
    assert.strictEqual(actual, expectedOutput);
  });
  it('a valid password should return true', () => {
    const actual = passwordLookup("dishwasher-funk", testUsers, "user2RandomID");
    const expectedOutput = true;
    assert.strictEqual(actual, expectedOutput);
  });
});

describe('#userIDLookup', () => {
  it('an email and password not found in database should return undefined', () => {
    const actual = userIDLookup(testUsers, "a@gmail.com", "password");
    const expectedOutput = undefined;
    assert.strictEqual(actual, expectedOutput);
  });
  it('a valid email/password should return the ID of the user', () => {
    const actual = userIDLookup(testUsers, "user2@example.com", "dishwasher-funk");
    const expectedOutput = "user2RandomID";
    assert.strictEqual(actual, expectedOutput);
  });
});

describe('#urlsForUser', () => {
  it('return an object containing urls with the same id as the user', () => {
    const actual = urlsForUser("userRandomID", testURLDatabase);
    const expectedOutput = { "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" } };
    assert.deepEqual(actual, expectedOutput);
  });
  it('should return false if id is undefined', () => {
    const actual = urlsForUser(undefined, testURLDatabase);
    const expectedOutput = false;
    assert.strictEqual(actual, expectedOutput);
  });
});