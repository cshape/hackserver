var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');


var Ideas = require('./models/ideas.js');
var Users = require('./models/users.js');

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Set up default mongoose connection
var mongoDB = process.env.MONGOLAB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true});

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'wat is de error:'));



//root directory

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*' );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function(req, res) {

  res.json('index');

});

//ideas

app.get('/api/ideas', function(req, res) {
  Ideas.find({}).then(eachOne => {
    res.json(eachOne);
    })
  });

//post new idea

app.post('/api/ideas', function(req, res, next) {
  Ideas.create({
    name: req.body.name,
    leader: req.body.leader,
    description: req.body.description
  }).then(idea => {
    res.json(idea)
  });
});

app.delete('/api/ideas', function(req, res) {
  console.log(req);
  Ideas.deleteOne({ name: `${req.body.name}` }
  , function(err) {
  	if (err)
  		res.send("this is your goddam error: ", err);
  	console.log("idea deleted")
  });
});



var port = process.env.PORT || 3001;
app.listen(port, function() {
	console.log("running on port 3001")
});

module.exports = app;
