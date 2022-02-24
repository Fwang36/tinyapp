const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.set("view engine", "ejs");

const users = {
  "2evgrs": {
    id: "2evgrs",
    email: "fran@gmail.com",
    password: bcrypt.hashSync("123", 10)
  }
}

const urlDatabase = {
  "b6UTxQ": {
    "longURL": "https://www.tsn.ca",
    "user_ID": "2evgrs"
  },

  "denqop": {
    "longURL": "https://www.youtube.com",
    "user_ID": "2evgrs"
  }
};


app.get("/login", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.cookies['user_id']],
      users: users
    }
  }
  res.render("urls_login", templateVars)
})

app.post("/login", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.cookies['user_id']],
      users: users
    }
  }
  for (key in users) {
    if (findEmail(req.body.email)) {
      if (bcrypt.compareSync(req.body.password, users[key].password)) {
        res.cookie("user_id", users[key].id)
        res.redirect("/urls")

      } else {
        return res.sendStatus(403)
      }
    } else {
      return res.sendStatus(403)
    }
  }
})

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/registration", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.cookies['user_id']],
      users: users
    }
  }
  res.render("urls_registration", templateVars)
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400)
    return
  }
  if (findEmail(req.body.email)) {
    res.sendStatus(400)
    return
  }
  let newID = generateRandomString()
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  }
  console.log(users)
  res.cookie("user_id", newID)
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.cookies['user_id']],
      users: users
    }
  }
  if (users[req.cookies['user_id']]) {
    res.render("urls_new", templateVars)
  } else {
    res.redirect("/urls")
  }
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: {
      user_id: users[req.cookies['user_id']],
      users: users
    },
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  }
  if (users[req.cookies['user_id']].id === urlDatabase[req.params.shortURL]["user_ID"]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Please Login")
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect("/urls")
})

app.post("/urls", (req, res) => {

  if (users[req.cookies['user_id']]) {
    let short = generateRandomString()
    urlDatabase[short] = {
      "longURL": req.body.longURL,
      "user_ID": req.cookies['user_id']
    }
    res.redirect(`/urls/${short}`);
  } else {
    res.sendStatus(403)
  }
});

app.get("/u/:shortURL", (req, res) => {
  for (key in urlDatabase) {
    console.log("all keys:", key)
    if (key === req.params.shortURL) {
      console.log("matching:", key)
      const longURL = urlDatabase[req.params.shortURL].longURL
      res.redirect(longURL);
    }
  }
  return res.sendStatus(404)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies['user_id']]) {

    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls")

  } else {
    res.sendStatus(403)
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies['user_id']), user: {
      user_id: users[req.cookies['user_id']],
      users: users
    }
  }
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const randomArr = []
  while (randomArr.length < 6) {
    randomArr.push(chars.charAt(Math.floor(Math.random() * chars.length)))
  }
  return randomArr.join("")
}

const findEmail = function (email) {
  for (key in users) {
    if (users[key].email === email) {
      return users[key].email
    }
  }
  return false
}

const urlsForUser = function (id) {
  const found = {}
  for (key in urlDatabase) {
    if (urlDatabase[key].user_ID === id) {
      found[key] = urlDatabase[key].longURL
    }
  }
  return found
}
