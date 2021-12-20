const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  Watchlist: [{type: mongoose.Schema.Types.ObjectId, ref: 'movie'}]
});

//adding encryption to sensitive data through bcrypt:
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

let movie = mongoose.model('movie', movieSchema);
let user = mongoose.model('user', userSchema);

module.exports.movie = movie;
module.exports.user = user;
