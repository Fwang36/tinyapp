const { assert } = require('chai');
const res = require('express/lib/response');

const { findEmail, urlsForUser} = require("../helpers.js")

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

describe('findEmail', function() {
  it('should return an email if an email is found', function() {
    const email = findEmail("user@example.com", testUsers)
    assert.equal(email, "user@example.com")
  });

  it('should return false if email not found', function() {
    const result = findEmail("123@gmail.com", testUsers)
    assert.equal(result, false)
  })
});

const testUrls = {
  "b6UTxQ": {
    "longURL": "https://www.tsn.ca",
    "user_ID": "2evgrs"
  },

  "denqop": {
    "longURL": "https://www.youtube.com",
    "user_ID": "2evgrs"
  },

  "32jdiw": {
    "longURL": "newtest.com",
    "user_ID": "abcd2e"
  }
};

describe('urlsForUser', () => {
  it('should return of longURL of inputted user', () => {
    const result = urlsForUser("2evgrs", testUrls)
    assert.equal(result["b6UTxQ"], "https://www.tsn.ca")
  }) 

  it('should not return urls of other user_ids', () => {
    const result = urlsForUser("2evgrs", testUrls)
    assert.equal(result["32jdiw"], undefined)
  })
})