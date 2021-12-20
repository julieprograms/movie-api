const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js/models.js');

const {check, validationResult} = require('express-validator');

//take a look at the capitalization of movie and user later!
const Movies = Models.movie;
const Users = Models.user;

mongoose.connect('mongodb://localhost:27017/watchIt', {useNewUrlParser: true, useUnifiedTopology: true});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//adding CORS to allow access from various domains:
const cors = require('cors');
app.use(cors());

//enables authentication (HTTP and JWT)
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

//using morgan to log user data (Date and Time, Request method, URL, response code, number of character)
app.use(morgan('common'));




// GET requests (app.METHOD(PATH, HANDLER)) returns JSON
app.get('/movies', passport.authenticate('jwt', {session:false}),(req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets the data about a single movie, by movie title
app.get('/movies/:Title', passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movieTitle) => {
    res.status(201).json(movieTitle);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//get movies by genre
app.get('/movies/Genres/:Name', passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.find({'Genre.Name': req.params.Name})
  .then((genre) => {
    res.status(201).json(genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//get info about director:name, bio, birth year, death year
app.get('/movies/Directors/:Name', passport.authenticate('jwt', {session:false}), (req,res) => {
  Movies.find({'Director.Name': req.params.Name})
  .then((director) => {
    res.status(200).json(director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//get all users
app.get('/Users', passport.authenticate('jwt', {session:false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add a user
/* We’ll expect JSON in this format
{
  (ID: Integer, => will be send back to user on successful register)
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/Users',
//validation Logic
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters that are not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
//check validation for errors:
let errors = validationResult(req);

if(!errors.isEmpty()) {
  return res.status(422).json({errors: errors.array()});
}
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


//LOOK AT PASSWORD : NEEDS HASHED?
//Allow user to update info by username
app.put('/Users/:Username', passport.authenticate('jwt', {session:false}), [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters that are not allowed').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req,res) => {
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      email: req.body.email,
      Birthdate: req.body.Birthdate
    }
  },
  { new: true }, //this line ensures the updated document is returned to the user
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/// Delete a user by username
app.delete('/Users/:Username', passport.authenticate('jwt', {session:false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Add a movie to a user's Watchlist by id
app.post('/Users/:Username/Watchlist/:MovieID', passport.authenticate('jwt', {session:false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { Watchlist: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.status(201).json(updatedUser);
    }
  });
});


//remove movie from watchlist by id
app.delete("/Users/:Username/Watchlist/:MovieID", passport.authenticate('jwt', {session:false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { Watchlist: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.status(200).json(updatedUser);
      }
    });
});


//get public:documentation,...
app.use(express.static('public'));

//error middleware function should come second to last (just before listen)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Somehow broken!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
