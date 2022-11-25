const express = require("express"); //add express library
const app = express(); //define our app as an instance of express
const PORT = 8080; //defines port at 8080

const urlDatabase = {
  'bZxVnZ': 'http://www.lighthouse.ca',
  '9sm5xK': 'http://www.google.com'
};

//set server request for root path
app.get("/", (req, res) => {
  res.send("Hello!");
});

//add routes from urlDarabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
});

//set server with port and sends message with port number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});