const express = require('express'); //add express library
const app = express(); //define our app as an instance of express
const PORT = 8080; //defines port at 8080
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs'); //set EJS as our template engine
app.use(express.urlencoded({ extended: true })); //Make buffer readable
app.use(cookieParser());

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
  const templateVars = { urls: urlDatabase,
  username: req.cookies['username'] 
  };
  
  res.render('urls_index', templateVars);
});

//add a new route to 'new' page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let id = generateRandomString(); //generate random ID
  urlDatabase[id] = req.body['longURL']; //store ID and long URL into urlDatabase object
  res.redirect(`/urls/${id}`) // Redirect to new url with id as a path
});

//add a new route for any ID that goes after urls and doesnt exist yet
app.get('/urls/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username'] };
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

//Login information into a cookie
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls')
});

//logout, clearing out cookies
app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
});

//New User registration
app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies['username'] 
  }
  
  res.render('urls_register', templateVars)
})

app.post('/register', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  console.log(userEmail, userPass)
})


//add routes from urlDarabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//set server with port and sends message with port number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});