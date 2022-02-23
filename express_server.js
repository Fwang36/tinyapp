const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const users = {
  "2evgrs" : {
    id: "2evgrs",
    email: "fran@gmail.com",
    password: "123"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "32kf8s": "http://www.youtube.com"
};

app.get("/login", (req, res) => {
  const templateVars = {user: {
    user_id: users[req.cookies['user_id']],
    users: users
    }
  }
  res.render("urls_login", templateVars)
})

app.post("/login", (req, res) => {
  const templateVars = {user: {
    user_id: users[req.cookies['user_id']],
    users: users
    }
  }
  for (key in users) {
  if (findEmail(req.body.email)) {
    if (users[key].password === req.body.password) {
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

app.get("/registration", (req,res) => {
  const templateVars = {user: {
    user_id: users[req.cookies['user_id']],
    users: users
    }
  }
  res.render("urls_registration", templateVars)
})

app.post("/register", (req,res) => {
  if(!req.body.email || !req.body.password) {
    res.sendStatus(400)
    return
  }
  if (findEmail(req.body.email)) {
    res.sendStatus(400)
    return
  }
  let newID = generateRandomString()
  users[newID] = { 
    id: newID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", newID)
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { user: {
    user_id: users[req.cookies['user_id']],
    users: users
  }}
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username']};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect("/urls")
})

app.post("/urls", (req, res) => {
  let short = generateRandomString()
  urlDatabase[short] = req.body.longURL  // Log the POST request body to the console
  res.redirect(`/urls/${short}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user:{
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

const findEmail = function(email) {
  for (key in users) {
    if (users[key].email === email) {
      return users[key].email
    }
  }
  return false
}

