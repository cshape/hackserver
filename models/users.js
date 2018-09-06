var mongoose = require('mongoose');


// Define schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('UserModel', UserSchema );