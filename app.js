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

// var indexRouter = require('./routes/index');
// var ideasRouter = require('./routes/ideas');

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Set up default mongoose connection
var mongoDB = "mongodb://cshape:Slaveship1%21@ds245082.mlab.com:45082/hackvoting";
mongoose.connect("mongodb://cshape:Slaveship1%21@ds245082.mlab.com:45082/hackvoting", { useNewUrlParser: true });

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'wat is de error:'));



//root directory

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function(req, res) {
  res.json('you did it');
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





var port = process.ENV.port || 3001;
app.listen(port, function() {
	console.log("running on port 3001")
});

module.exports = app;
