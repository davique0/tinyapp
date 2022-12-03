const express = require('express'); //add express library
const app = express(); //define our app as an instance of express
const PORT = 8080; //defines port at 8080
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bycrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs'); //set EJS as our template engine
app.use(express.urlencoded({ extended: true })); //Make buffer readable
app.use(cookieSession({
  name: 'session',
  keys: ['monkeyPotato'],
}));

const urlDatabase = {
  'bZxVnZ': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'aJ48lW'
  }
};

//Generate 5 random characters string
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomStr;
};

//User Database
const userDatabase = {
  'randomUser1': {
    id: 'jk2701',
    email: 'email@example.com',
    password: '1234'
  }
};


//Returns personilized urls per user
const urlsForUser = (id) => {
  let userIdUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userIdUrls[urlId] = urlDatabase[urlId];
    }
  }
  return userIdUrls;
};

//set server request for root path
app.get("/", (req, res) => {
  res.send('Hello!');
});

//add route for /urls
app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  const user = userDatabase[userId];
  const userList = urlsForUser(userId);
  const templateVars = {
    urls: userList,
    user,
    error: null
  };
  //check if there isnt a user logged in
  if (!userId) {
    res.status(403);
    const templateVars = {
      urls: urlDatabase,
      user,
      error: 'You must login or register first'
    };
    res.render('urls_login', templateVars);
  }
  res.render('urls_index', templateVars);
});

//add a new route to 'new' page
app.get('/urls/new', (req, res) => {
  const userId = req.session['user_id'];
  const user = userDatabase[userId];
  const templateVars = {
    urls: urlDatabase.longURL,
    user,
    error: null
  };
  if (!userId) {
    const templateVars = {
      user: null,
      urls: null,
      error: 'You must login or register first'
    };
    res.render('urls_login', templateVars);
  }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const userId = req.session['user_id'];
  let id = generateRandomString(); //generate random ID
  //store ID and long URL into urlDatabase object
  urlDatabase[id] = {
    longURL: req.body['longURL'],
    userID: userId
  };
  
  urlDatabase[id].userID = userId;
  res.redirect(`/urls/${id}`);
});

//add a new route for any ID that goes after urls and doesnt exist yet
app.get('/urls/:id', (req, res) => {
  const userId = req.session['user_id'];
  const user = userDatabase[userId];
  const urlUserId = urlDatabase[req.params.id].userID;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    urls: urlDatabase,
    user
  };
  if (!userId) {
    const templateVars = {
      user: null,
      urls: null,
      error: 'You must login or register first'
    };
    res.render('urls_login', templateVars);
  }
  //Checks if the id belongs to that user
  if (userId !== urlUserId) {
    res.status(404).send('404 Page not found');
  }
  
  res.render('urls_show', templateVars);
});

//redirect ID to longURL website
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send('404 Page not found');
  }
  const templateVars = {
    id: id,
    longURL: longURL
  };
  res.redirect(templateVars.longURL);
});

//update URL with a new URL entered in form
app.post('/urls/:id/update', (req, res) => {
  const userId = req.session['user_id'];
  const urlUserId = urlDatabase[req.params.id].userID;
  //Checks if the id belongs to that user
  if (userId !== urlUserId) {
    res.status(404).send('404 Page not found');
  } else {
    urlDatabase[req.params.id].longURL = req.body['longURL'];
    res.redirect('/urls');
  }
});

//delete record
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session['user_id'];
  const urlUserId = urlDatabase[req.params.id].userID;
  //Checks if the id belongs to that user
  if (userId !== urlUserId) {
    res.status(404).send('404 Page not found');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

//Login information into a cookie
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = getUserByEmail(userEmail, userDatabase);
  if (!user) {
    res.status(403);
    const templateVars = {
      user: null,
      urls: null,
      error: 'User isn\'t registered'
    };
    res.render('urls_login', templateVars);
  }
  const passVal = bycrypt.compareSync(userPass, user.password);
  if (!userEmail || !userPass) {
    res.status(400);
    const templateVars = {
      user: null,
      urls: null,
      error: 'All fields must filled out'
    };
    res.render('urls_login', templateVars);
  }
  if (user && passVal) { //user.password === userPass
    //res.cookie('user_id', user.id);
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403);
    const templateVars = {
      user: null,
      urls: null,
      error: 'Wrong password'
    };
    res.render('urls_login', templateVars);
  }
});

//Render Login page
app.get('/login', (req, res) => {
  const userId = req.session['user_id'];
  const user = userDatabase[userId];
  const templateVars = {
    urls: urlDatabase,
    id: req.params.id,
    // longURL: urlDatabase[req.params.id].longURL,
    user,
    error: null
  };
  //if user already login it will be redirected to urls
  if (userId) res.redirect('/urls');
  res.render('urls_login', templateVars);
});

//logout, clearing out cookies
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

//New User registration
app.get('/register', (req, res) => {
  const userId = req.session['user_id'];
  const user = userDatabase[userId];
  const templateVars = {
    urls: urlDatabase,
    user,
    error: null,
  };
  //if user already login it will be redirected to urls
  if (userId) res.redirect('/urls');
  res.render('urls_register', templateVars);
});

//Create new user un userDatabase
app.post('/register', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const hashedPass = bycrypt.hashSync(userPass, 10);
  const id = generateRandomString();
  if (!userEmail || !userPass) {
    res.status(400);
    const templateVars = {
      user: null,
      urls: null,
      error: 'All fields must filled out'
    };
    res.render('urls_register', templateVars);
  } else {
    const user = getUserByEmail(userEmail, userDatabase);
    if (!user) {
      userDatabase[id] = {
        id,
        email: userEmail,
        password: hashedPass
      };
      // res.cookie('user_id', id);
      req.session.user_id = id;
      res.redirect('/urls');
    } else {
      const templateVars = {
        user: null,
        urls: null,
        error: 'Email already exists'
      };
      res.status(400);
      res.render('urls_register', templateVars);
    }
  }
});

//add routes from urlDarabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//set server with port and sends message with port number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

