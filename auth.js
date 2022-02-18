//has to be the same name as in passport.js file JWTStrategy!
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
passport = require('passport');

//your local passport file:
require('./passport.js');


/**
 * @description Generates a JWT for a user and returns the token as a string
 * @method generateJWTToken
 * @param {object} user Object containing all of the users data
 * @returns {string} - JWT for the logged in user
 */
let generateJWTToken =(user) => {
  return jwt.sign(user, jwtSecret, {
//the username that is being encoded in the JWT:
    subject: user.Username,
    expiresIn: '7d',
// the algorithm used to 'sign' or encode the values of the JWT:
    algorithm: 'HS256'
  });
};


/**
 * @description Endpoint to login the user<br>
 * @method POSTLoginUser
 * @param {string} endpoint - /login?Username=[Username]&Password=[Password]
 * @returns {object} - JSON object containing data for the user and a new JWT. 
 * { user: {  
 *   _id: <string>,  
 *   Username: <string>,
 *   Password: <string> (hashed),  
 *   Email: <string>,  
 *   Birthday: <string>,  
 *   Watchlist: [<string>]  
 *   },   
 *   token: <string>   
 * }
 */
module.exports = (router) => {
  //initiate passport middleware before the routes registration. From version 0.5.0 add the following line for express:
  router.use(passport.initialize());
  router.post('/login', (req,res) => {
    passport.authenticate('local', {
      session: false}, (error, user, info) => {
        if(error || !user) {
          return res.status(400).json({
            message: 'Something is not right',
            user: user
          });
        }
        req.login(user, {session: false}, (error) => {
          if(error) {
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token});
        });
      })(req,res);
  });
};
