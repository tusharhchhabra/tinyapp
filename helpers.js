// Find methods
function findUserById(userId, users) {
  for (const id in users) {
    if (id === userId) {
      return users[id];
    }
  }
}

function getUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      console.log("existing user found.");
      return users[id];
    }
  }
}

function getUrlsForUser(userId, urls) {
  const urlsForUser = {};
  for (const urlId in urls) {
    if (urls[urlId].userId === userId) {
      urlsForUser[urlId] = urls[urlId];
    }
  }
  return urlsForUser;
}


// Create user
function createUser(id, email, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return { id, email, password: hashedPassword };
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


module.exports = { createUser, findUserById, getUserByEmail, getUrlsForUser, generateRandomString }