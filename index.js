const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());

//currently a template until I have a concept in mind!
let topMovies = [
  {
    title: 'Lord of the Rings 1',
    director: {
      name:'J.R.R. Tolkien (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
    },
    genre: 'fantasy'
  },
  {
    title: 'Lord of the Rings 2',
    director: {
      name:'J.R.R. Tolkien (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
    },
    genre: 'fantasy'
  },
  {
    title: 'Lord of the Rings 3',
    director: {
      name:'J.R.R. Tolkien (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
    },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 1',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 2',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 3',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 4',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 5',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 6',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
  {
    title: 'Harry Potter 7',
    director: {
      name: 'J.K. Rowling (not really)',
      birth:'Long long ago',
      death:'quite a while ago, I think'
  },
    genre: 'fantasy'
  },
];

//using morgan to log user data (Date and Time, Request method, URL, response code, number of character)
app.use(morgan('common'));


// GET requests (app.METHOD(PATH, HANDLER)) returns JSON
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Gets the data about a single movie, by movie title
app.get('/movies/:title', (req, res) => {
  res.json(topMovies.find((movie) =>
    { return movie.title === req.params.title }));
});

//get movies by genre (in future will return all movies of the genre..I think):
app.get('/genres/:genre', (req,res) => {
  let genreList = Object.values(movies.genre); // Object.values() filters out object's keys and keeps the values that are returned as a new array
  genreList.forEach(movie =>{
    res.status(200).json(topMovies.find((genre) => {
      return genre.genre === req.params.genre
    }));
  });
});


//get info about director:bio, birth year, death year
app.get('/directors/:name', (req,res) => {
  res.status(200).json(topMovies.find((director) => {
    return director.director.name === req.params.name
  }));
});

let users =[
  {
  name: 'Jane Doe',
  id: 'JD',
  password: 'guest'
}
];
// Adds data for a newUser to userList: name, id (by UUID), password, email?
app.post('/users', (req, res) => {
  res.send('added User');
/*  let newUser = req.body;

  if (!newUser.name) {
    const message = 'Name yourself, stranger';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send('Welcome ' + newUser.name);
  } */
});

//update userName (add password confirmation somehow...):
app.put('/users/:name', (req,res) => {
  res.send('updated Username');
});
//delete User(add password/id confirmation somehow...later):
app.delete('/users/:name', (req,res) => {
  res.send('farewell old friend');
});

//add new movie to personal watchlist somehow later:
app.post('/watchlist/:title', (req,res) => {
  res.send('added ' + watchlist.title + ' to watchlist')
});

//delete movie from watchlist:
app.delete('/watchlist/:title', (req,res) => {
  res.send('removed ' + watchlist.title + ' from watchlist')
});
//get documentation
/*
app.get('/documentation', function (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});
*/

app.use(express.static('public'));

//error middleware function should come second to last (just before listen)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Somehow broken!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
