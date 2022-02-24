const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomArr = [];
  while (randomArr.length < 6) {
    randomArr.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }
  return randomArr.join("");
};

const findEmail = function(email, database) {
  for (key in database) {
    if (database[key].email === email) {
      return database[key].email;
    }
  }
  return false;
};

const urlsForUser = function(id, database) {
  const found = {};
  for (key in database) {
    if (database[key].user_ID === id) {
      found[key] = database[key].longURL;
    }
  }
  return found;
};

module.exports = { generateRandomString, findEmail, urlsForUser };
