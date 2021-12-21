//has to be the same name as in passport.js file JWTStrategy!
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
passport = require('passport');

//your local passport file:
require('./passport.js');



let generateJWTToken =(user) => {
  return jwt.sign(user, jwtSecret, {
//the username that is being encoded in the JWT:
    subject: user.Username,
    expiresIn: '7d',
// the algorithm used to 'sign' or encode the values of the JWT:
    algorithm: 'HS256'
  });
};


//POST login
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
