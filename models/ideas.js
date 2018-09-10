var mongoose = require('mongoose');


// Define schema
var Schema = mongoose.Schema;

var IdeaSchema = new Schema({
    name: String,
    leader: String,
    description: String
});

// Virtual for idea's URL
IdeaSchema
.virtual('url')
.get(function () {
<<<<<<< HEAD
  return '/ideas/' + this.name;
=======
  return '/ideas/' + this._id;
>>>>>>> bc7a27b5be91d15c92226af9b943c6f65878dc45
});

//Export function to create "IdeaModel" model class
module.exports = mongoose.model('IdeaModel', IdeaSchema );