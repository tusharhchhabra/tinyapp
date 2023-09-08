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


module.exports = {
  findUserById,
  getUserByEmail,
  getUrlsForUser,
  generateRandomString
};