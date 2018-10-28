var mongoose = require('mongoose');


// Define schema
var Schema = mongoose.Schema;

var IdeaSchema = new Schema({
  name: String,
  leader: String,
  description: String,
  members: [{ member: String }],
  comments: [{
  				author: String,
  				text: String,
  				date: Date
  			}],
  votes: Number,
});


// Virtual for idea's URL
IdeaSchema
.virtual('url')
.get(function () {
  return '/ideas/' + this.name;
});

//Export function to create "IdeaModel" model class
module.exports = mongoose.model('IdeaModel', IdeaSchema );
