const express = require('express');
const morgan = require('morgan');
const app = express();

//currently a template until I have a concept in mind!
let topMovies = [
  {
    title: 'Lord of the Rings 1',
    director: 'J.R.R. Tolkien (not really)'
  },
  {
    title: 'Lord of the Rings 2',
    director: 'J.R.R. Tolkien (not really)'
  },
  {
    title: 'Lord of the Rings 3',
    director: 'J.R.R. Tolkien (not really)'
  },
  {
    title: 'Harry Potter 1',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 2',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 3',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 4',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 5',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 6',
    director: 'J.K. Rowling (not really)'
  },
  {
    title: 'Harry Potter 7',
    director: 'J.K. Rowling (not really)'
  },
];

//using morgan to log user data (Date and Time, Request method, URL, response code, number of character)
app.use(morgan('common'));


// GET requests (app.METHOD(PATH, HANDLER)) returns JSON
app.get('/movies', (req, res) => {
  res.json(topMovies);
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
