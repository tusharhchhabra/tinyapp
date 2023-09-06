const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};


app.get("/", (req, res) => {
  res.redirect("/urls");
});


// Authentication
app.get("/register", (req, res) => {
  const templateVars = {
    user: findUser(req.cookies["user_id"])
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("400 - Please enter a valid email and password.");
  } else {
    if (userExists(email)) {
      return res
        .status(400)
        .send("400 - This email is already registered.");
    }
    const id = generateRandomString();
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const existingUserId = findUserId(email);

  if (!email) {
    res
      .status(400)
      .send("403 - Please enter a valid email.");
  } else if (!existingUserId) {
    res
      .status(400)
      .send("400 - This email is not registered.");
  } else {
    res
      .cookie("user_id", existingUserId)
      .redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res
    .clearCookie("user_id")
    .redirect("/urls");
});



// Read urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: findUser(req.cookies["user_id"]),
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Create new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: findUser(req.cookies["user_id"])
  };
  res.render("urls_new", templateVars);
});

// Edit url
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    user: findUser(req.cookies["user_id"]),
    id: id,
    longURL: urlDatabase[id]
  };
  res.render("urls_show", templateVars);
});

// Save edited urls
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls`);
});

// Return to urls after creating new url
app.post("/urls", (req, res) => {
  const longURL = req.body["longURL"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Open long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(urlDatabase[id]);
});



// Start listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// Find user
function findUser(userId) {
  for (const id in users) {
    if (id === userId) {
      return users[id];
    }
  }
}

function userExists(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      console.log("existing user found.");
      return true;
    }
  }
}

function findUserId(email) {
  for (const id in users) {
    if (users[id].email === email) {
      console.log("existing user found.");
      return id;
    }
  }
}



// Generate random string
function generateRandomString() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
}