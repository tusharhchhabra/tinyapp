const { assert } = require('chai');

const { getUserByEmail, findUserById, getUrlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe('findUserById', function() {
  it('should return a user for valid id', function() {
    const user = findUserById("userRandomID", testUsers);
    const expectedUserEmail = "user@example.com";
    assert.strictEqual(user.email, expectedUserEmail);
  });

  it('should return undefined for invalid id', function() {
    const user = findUserById("user3RandomID", testUsers);
    assert.strictEqual(user, undefined);
  });
});


const testUrls = {
  "x": { longURL: "https://google.com", userId: "a" },
  "y": { longURL: "https://microsoft.com", userId: "a" },
  "z": { longURL: "https://www.apple.com", userId: "b" }
};

describe('getUrlsForUser', function() {
  it('should return urls for valid userId', function() {
    const urls = getUrlsForUser("a", testUrls);
    const expected = {
      "x": { longURL: "https://google.com", userId: "a" },
      "y": { longURL: "https://microsoft.com", userId: "a" }
    };
    assert.deepEqual(urls, expected);
  });

  it('should return empty object for invalid userId', function() {
    const urls = getUrlsForUser("c", testUrls);
    assert.deepEqual(urls, {});
  });
});