const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const {
  findUserById,
  getUserByEmail,
  getUrlsForUser,
  generateRandomString
} = require("./helpers");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["6vIZ4LBoxgBEl7WI", "udbos1kxog4AEub4"], // Hardcoding keys here for project evaluation (to be avoided in production)
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("login");
  }
});


// REGISTER - GET
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: findUserById(req.session.user_id, users)
  };
  res.render("register", templateVars);
});


// REGISTER - POST
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("<h2>Error 400 - Please enter a valid email and password.</h2>");
  }

  if (getUserByEmail(email, users)) {
    return res
      .status(400)
      .send("<h2>Error 400 - This email is already registered.</h2>");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = { id, email, password: hashedPassword };

  req.session.user_id = id;
  res.redirect("/urls");
});


// LOGIN - GET
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: findUserById(req.session.user_id, users)
  };
  res.render("login", templateVars);
});


// LOGIN - POST
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingUser = getUserByEmail(email, users);
  const isPasswordValid = existingUser && bcrypt.compareSync(password, existingUser.password);

  if (!email || !password) {
    return res
      .status(400)
      .send("<h2>Error 400 - Please enter a valid email and password.</h2>");
  } else {
    if (!existingUser) {
      return res
        .status(403)
        .send("<h2>Error 403 - Could not find an account with this email.</h2>");
    } else if (!isPasswordValid) {
      return res
        .status(403)
        .send("<h2>Error 403 - Invalid password.</h2>");
    }
    req.session.user_id = existingUser.id;
    res.redirect("/urls");
  }
});


// LOGOUT
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("login");
});



// /URLS - GET
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("<h2>Error 401 - Please log in or register to access saved short URLs.</h2>");
  }

  const userId = req.session.user_id;
  const templateVars = {
    user: findUserById(userId, users),
    urls: getUrlsForUser(userId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});


// NEW URL GET
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: findUserById(req.session.user_id, users)
  };
  res.render("urls_new", templateVars);
});


// DELETE URL
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("<h2>Error 401 - Please log in to delete short URLs</h2>");
  }

  const urlId = req.params.id;
  const userId = req.session.user_id;
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("<h2>Error 400 - The requested short URL does not exist.</h2>");
  } else if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("<h2>Error 401 - You can only delete URLs created using your currently logged in account.</h2>");
  }

  delete urlDatabase[urlId];
  res.redirect("/urls");
});


// EDIT URL GET
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("<h2>401 - Please log in to edit URLs</h2>");
  }

  const urlId = req.params.id;
  const userId = req.session.user_id;
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("<h2>Error 400 - The requested short URL does not exist.</h2>");
  } else if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("<h2>Error 401 - You can only edit URLs created using your currently logged in account.</h2>");
  }

  const templateVars = {
    user: findUserById(userId, users),
    id: urlId,
    longURL: urlDatabase[urlId].longURL
  };
  res.render("urls_show", templateVars);
});


// EDIT URL POST
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("<h2>Error 401 - Please log in to edit URLs</h2>");
  }

  const userId = req.session.user_id;
  const urlId = req.params.id;
  const longURL = req.body.longURL;

  if (!longURL) {
    return res
      .status(400)
      .send("<h2>Error 400 - The URL field cannot be empty.</h2>");
  }
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("<h2>Error 400 - The requested short URL does not exist.</h2>");
  }
  if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("<h2>Error 401 - You can only edit URLs created using your currently logged in account.</h2>");
  }

  urlDatabase[urlId].longURL = longURL;
  res.redirect(`/urls`);
});


// NEW URL POST
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("<h2>Error 401 - Please log in to create short URLs</h2>");
  }

  const longURL = req.body.longURL;
  if (!longURL) {
    return res
      .status(400)
      .send("<h2>Error 400 - The URL field cannot be empty.</h2>");
  }

  const shortURL = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userId };
  res.redirect(`/urls/${shortURL}`);
});


// OPEN LONG URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res
      .status(400)
      .send("<h2>Error 400 - The requested short URL does not exist.</h2>");
  }

  res.redirect(urlDatabase[id].longURL);
});


// Start listening
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});