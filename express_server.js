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

const usersDatabase = {};


app.get("/", (req, res) => {
  res.redirect("/urls");
});


// Authentication
app.post("/login", (req, res) => {
  const username = req.body.username;
  if (username) {
    res.cookie("username", username);
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .send("403 - Please enter a valid username");
  }
});



// URL Database
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body["longURL"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


// New URL 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



// CRUD

// Read
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { 
    username: req.cookies["username"],
    id: id, 
    longURL: urlDatabase[id] 
  };
  res.render("urls_show", templateVars);
});

//Create, Update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls`);
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Open Long URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(urlDatabase[id]);
});



// Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



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