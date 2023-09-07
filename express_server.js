const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("login");
  }
});


// Authentication
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: findUserById(req.cookies["user_id"])
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("400 - Please enter a valid email and password.");
  }

  if (userExists(email)) {
    return res
      .status(400)
      .send("400 - This email is already registered.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = { id, email, password: hashedPassword };
  res
    .cookie("user_id", id)
    .redirect("/urls");
});


app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: findUserById(req.cookies["user_id"])
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingUser = findUserByEmail(email);
  const isPasswordValid = existingUser && bcrypt.compareSync(password, existingUser.password);

  if (!email || !password) {
    return res
      .status(400)
      .send("400 - Please enter a valid email and password.");
  } else {
    if (!existingUser) {
      return res
        .status(403)
        .send("403 - Could not find an account with this email.");
    } else if (!isPasswordValid) {
      return res
        .status(403)
        .send("403 - Invalid password.");
    }
    res.cookie("user_id", existingUser.id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res
    .clearCookie("user_id")
    .redirect("login");
});



// Urls list
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("401 - Please log in or register to access saved short URLs.");
  }

  const userId = req.cookies["user_id"];
  const templateVars = {
    user: findUserById(userId),
    urls: urlsForUser(userId)
  };
  res.render("urls_index", templateVars);
});


// New url page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: findUserById(req.cookies["user_id"])
  };
  res.render("urls_new", templateVars);
});


// Delete url
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("401 - Please log in to delete short URLs");
  }

  const urlId = req.params.id;
  const userId = req.cookies["user_id"];
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("400 - The requested short URL does not exist.");
  } else if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("401 - You can only delete URLs created using your currently logged in account.");
  }

  delete urlDatabase[urlId];
  console.log(urlDatabase);
  res.redirect("/urls");
});


// Edit url page
app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("401 - Please log in to edit URLs");
  }

  const urlId = req.params.id;
  const userId = req.cookies["user_id"];
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("400 - The requested short URL does not exist.");
  } else if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("401 - You can only edit URLs created using your currently logged in account.");
  }

  const templateVars = {
    user: findUserById(userId),
    id: urlId,
    longURL: urlDatabase[urlId].longURL
  };
  res.render("urls_show", templateVars);
});


// Save edited urls
app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("401 - Please log in to edit URLs");
  }

  const userId = req.cookies["user_id"];
  const urlId = req.params.id;
  const longURL = req.body.longURL;
  if (!urlDatabase[urlId]) {
    return res
      .status(400)
      .send("400 - The requested short URL does not exist.");
  } else if (urlDatabase[urlId].userId !== userId) {
    return res
      .status(401)
      .send("401 - You can only edit URLs created using your currently logged in account.");
  }
  urlDatabase[urlId].longURL = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});


// Return to urls list upon creating
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("401 - Please log in to create short URLs");
  }

  const longURL = req.body["longURL"];
  const shortURL = generateRandomString();
  const userId = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL, userId };
  res.redirect(`/urls/${shortURL}`);
});


// Open long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (!Object.keys(urlDatabase).includes(id)) {
    return res
      .status(400)
      .send("400 - The requested short URL does not exist.");
  }
  res.redirect(urlDatabase[id].longURL);
});



// Start listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// Find user
function findUserById(userId) {
  for (const id in users) {
    if (id === userId) {
      return users[id];
    }
  }
}

function userExists(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
}

function findUserByEmail(email) {
  for (const id in users) {
    if (users[id].email === email) {
      console.log("existing user found.");
      return users[id];
    }
  }
}

function urlsForUser(userId) {
  const urlsForUser = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      urlsForUser[urlId] = urlDatabase[urlId];
    }
  }
  return urlsForUser;
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