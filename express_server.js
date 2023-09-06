const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// URL Database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body["longURL"];
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.redirect(`/urls/${shortURL}`);
});


// New URL 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// URL Show Detail
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(urlDatabase[id]);
});

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