const express = require('express'); //add express library
const app = express(); //define our app as an instance of express
const PORT = 8080; //defines port at 8080

app.set('view engine', 'ejs'); //set EJS as our template engine
app.use(express.urlencoded({ extended: true })); //Make buffer readable

const urlDatabase = {
  'bZxVnZ': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//Generate 5 random characters string
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomStr;
};

//set server request for root path
app.get("/", (req, res) => {
  res.send('Hello!');
});

//add route for /urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//add a new route to 'new' page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  let id = generateRandomString(); //generate random ID
  urlDatabase[id] = req.body['longURL']; //store ID and long URL into urlDatabase object
  res.redirect(`/urls/${id}`) // Redirect to new url with id as a path
});

//add a new route for any ID that goes after urls and doesnt exist yet
app.get('/urls/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//redirect ID to longURL website
app.get('/u/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.redirect(templateVars.longURL)
});

//update URL with a new URL entered in form
app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect('/urls')
});

//delete record
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//add routes from urlDarabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//set server with port and sends message with port number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});