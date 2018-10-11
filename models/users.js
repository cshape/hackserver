var mongoose = require('mongoose');
var bcrypt = require('bcrypt');


// Define schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    leader: String,
    member: String
});

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

//Export function to create "SomeModel" model class
module.exports = mongoose.model('UserModel', UserSchema );