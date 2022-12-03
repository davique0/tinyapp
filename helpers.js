

//Check if email and password arent empty and if they are already in the database
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

module.exports = { getUserByEmail };