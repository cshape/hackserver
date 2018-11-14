var mongoose = require('mongoose');


// Define schema
var Schema = mongoose.Schema;

var IdeaSchema = new Schema({
  name: String,
  leader: String,
  description: String,
  members: [{ name: String,
              role: String
        }],
  comments: [{
  				author: String,
  				text: String,
  				date: Date
  			}],
  likes: [{
    user: String,
    date: Date
  }]
});


// Virtual for idea's URL
IdeaSchema
.virtual('url')
.get(function () {
  return '/ideas/' + this.name;
});

//Export function to create "IdeaModel" model class
module.exports = mongoose.model('IdeaModel', IdeaSchema );
