const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, findEmail, urlsForUser} = require("./helpers.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp']
}));

app.set("view engine", "ejs");

const users = {};
const urlDatabase = {};


app.get("/login", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.session.user_id],
      users: users
    }
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if (Object.keys(users).length === 0) {
    res.send("<h2>Please First Create An Account</h2>");
  }
  for (key in users) {
    if (findEmail(req.body.email, users)) {
      if (bcrypt.compareSync(req.body.password, users[key].password)) {
        req.session.user_id = users[key].id;
        res.redirect("/urls");

      } else {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }
  }
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/registration", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.session.user_id],
      users: users
    }
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
    return;
  }
  if (findEmail(req.body.email, users)) {
    res.sendStatus(400);
    return;
  }
  let newID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = newID;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.session.user_id],
      users: users
    }
  };
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {

    const templateVars = {
      user: {
        user_id: users[req.session.user_id],
        users: users
      },
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };

    if (users[req.session.user_id].id === urlDatabase[req.params.shortURL]["user_ID"]) {
     return res.render("urls_show", templateVars);
    }
  } else {
    res.send("<h2>Please Login For Access</h2>");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {

  if (users[req.session.user_id]) {
    let short = generateRandomString();
    urlDatabase[short] = {
      "longURL": req.body.longURL,
      "user_ID": req.session.user_id
    };
    res.redirect(`/urls/${short}`);
  } else {
    res.sendStatus(403);
  }
});

app.get("/u/:shortURL", (req, res) => {
  for (key in urlDatabase) {
    if (urlDatabase[key].user_ID === req.session.user_id) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      return res.redirect(longURL);
    }
  }
  return res.sendStatus(404);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_ID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase), user: {
      user_id: users[req.session.user_id],
      users: users
    }
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

