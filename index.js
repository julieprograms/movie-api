const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const {check, validationResult} = require('express-validator');

//take a look at the capitalization of movie and user later!
const Movies = Models.movie;
const Users = Models.user;

/* Local database connection:
mongoose.connect('mongodb://localhost:27017/watchIt', {useNewUrlParser: true, useUnifiedTopology: true});
*/
//connects to mongodb atlas:
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//adding CORS to allow access from various domains:
const cors = require('cors');
app.use(cors());

//enables authentication (HTTP and JWT)
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

//using morgan to log user data (Date and Time, Request method, URL, response code, number of character)
app.use(morgan('common'));


// GET requests (app.METHOD(PATH, HANDLER)) returns JSON (remove functions as well add arrow after req.res/movies/err)

/**
 * @description Endpoint to get data for all movies.<br>
 * Requires authorization JWT.
 * @method GETAllMovies
 * @param {string} endpoint - /movies
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for all movies. Refer to the 
 *   Genre: { Name: <string>, Description: <string> },    
 *   Director: { Name: <string>, Bio: <string>, Birth: <string>, Death: <string>},    
 *   _id: <string>,   
 *   Title: <string>,   
 *   Description: <string>,   
 *   Featured: <boolean>,   
 *   ImagePath: <string> (uses URL),  
 * ]}
 */
app.get('/movies' , passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * @description Endpoint to get data about a single movie, by movie title.<br>
 * Requires authorization JWT.
 * @method GETOneMovie
 * @param {string} endpoint - /movies/:Title
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for one movie. 
 * {
 *   Genre: { Name: <string>, Description: <string> },  
 *   Director: { Name: <string>, Bio: <string>, Birth: <string>, Death: <string>},    
 *   _id: <string>,    
 *   Title: <string>,  
 *   Description: <string>,  
 *   Featured: <boolean>,  
 *   ImagePath: <string> (uses URL),  
 */
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



/**
 * @description Endpoint to get info about a genre<br>
 * Requires authorization JWT.
 * @method GETOneGenre
 * @param {string} endpoint - /genres/:Genre
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for one genre. 
 * { Name: <string>, Description: <string> }
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.find({'Genre.Name': req.params.Name})
  .then((genre) => {
    res.status(201).json(genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



/**
 * @description Endpoint to get info about a director<br>
 * Requires authorization JWT.
 * @method GETOneDirector
 * @param {string} endpoint - /directors/:Director
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for one director. 
 * { Name: <string>, Bio: <string>, Birth: <string> , Death: <string>}
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', {session:false}), (req,res) => {
  Movies.find({'Director.Name': req.params.Name})
  .then((director) => {
    res.status(200).json(director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



/*
 * @description Endpoint to get data for all users.<br>
 * Requires authorization JWT.
 * @method GETAllUsers
 * @param {string} endpoint - /users
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for all users. 
 * {[  _id: <string>,   
 *     Username: <string>,   
 *     Password: <string> (hashed),   
 *     Email: <string>,  
 *     Birthday: <string>  
 *     Watchlist: [<string>]  
 * ]}  
* app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
*  Users.find()
*    .then((users) => {
*      res.status(201).json(users);
*    })
*    .catch((err) => {
*      console.error(err);
*      res.status(500).send('Error: ' + err);
*    });
* });
*/


/**
 * @description Endpoint to add a new user<br>
 * @method POSTRegisterUser
 * @param {string} endpoint - /users/register
 * @param {req.body} object - The HTTP body must be a JSON object formatted as below (Birthday optional):<br>
 * {<br>
 * "Username": "testUser",<br>
 * "Password": "testPassword",<br>
 * "Email" : "testUser@gmail.com",<br>
 * "Birthday" : "1999-09-09"<br>
 * }
 * @returns {object} - JSON object containing data for the new user. 
 * { _id: <string>,  
 *   Username: <string>,  
 *   Password: <string> (hashed),  
 *   Email: <string>, 
 *   Birthday: <string>  
 *   Watchlist: []  
 * }
 */
app.post('/users',
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



/**
 * @description Endpoint to update users info<br>
 * Requires authorization JWT.
 * @method PUTUpdateUser
 * @param {string} endpoint - /users/:Username
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @param {req.body} object - The HTTP body must be a JSON object formatted as below (all fields are optional):<br>
 * {<br>
 * "Username": "testUser",<br>
 * "Password": "testPassword",<br>
 * "Email" : "testUser@gmail.com",<br>
 * "Birthday" : "1999-09-09"<br>
 * }
 * @returns {object} - JSON object containing updated user data. 
 * { _id: <string>,   
 *   Username: <string>,   
 *   Password: <string> (hashed),   
 *   Email: <string>,  
 *   Birthday: <string>  
 *   Watchlist: [<string>]  
 * }
 */
app.put('/users/:Username', passport.authenticate('jwt', {session:false}), [
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



/**
 * @description Endpoint to delete a user's account by username<br>
 * Requires authorization JWT.
 * @method DELETEUserAccount
 * @param {string} endpoint - /users/:Username
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {string} - A string containing the message: "<Username> was deleted"
 */
app.delete('/users/:Username', passport.authenticate('jwt', {session:false}), (req, res) => {
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



/**
 * @description Endpoint to add a movie to a user's Watchlist by id<br>
 * Requires authorization JWT.
 * @method POSTAddFavoriteMovie
 * @param {string} endpoint - /users/:Username/movies/:MovieID
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing updated user data. 
 * { _id: <string>,   
 *   Username: <string>,   
 *   Password: <string> (hashed),   
 *   Email: <string>,  
 *   Birthday: <string>  
 *   Watchlist: [<string>]  
 * }  
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session:false}), (req, res) => {
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



/**
 * @description Endpoint to remove a movie from Watchlist by id <br>
 * Requires authorization JWT.
 * @method DELETERemoveFavoriteMovie
 * @param {string} endpoint - /users/:Username/movies/:MovieID
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing updated user data. 
 * { _id: <string>,   
 *   Username: <string>,   
 *   Password: <string> (hashed),   
 *   Email: <string>,  
 *   Birthday: <string>  
 *   Watchlist: [<string>]  
 * }  
 */
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', {session:false}), (req, res) => {
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

/**
 * @description Endpoint to get data for a user.<br>
 * Requires authorization JWT.
 * @method GETOneUser
 * @param {string} endpoint - /users/:Username
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing data for the user. 
 * { _id: <string>,   
 *   Username: <string>,   
 *   Password: <string> (hashed),   
 *   Email: <string>,  
 *   Birthday: <string>  
 *   Watchlist: [<string>]  
 * }
 */
 app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



/**
 * @description Endpoint to get an user's Watchlist<br>
 * Requires authorization JWT.
 * @method GETfavoriteMovies
 * @param {string} endpoint - /users/:Username/movies/
 * @param {req.headers} object - headers object containing the JWT formatted as below:<br>
 * { "Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object containing an array of movie ID strings.<br>
 * [<br>
 * "61b94820b6cbf913e479f71c",<br>
 * "61b95b6bb6cbf913e479f724",<br>
 * "61b95968b6cbf913e479f723"<br>
 * ]
 */
 app.get('/users/:Username/movies/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user.Watchlist);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
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
