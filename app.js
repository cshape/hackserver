var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var passport = require('passport');
var Strategy = require('passport-google-oauth20').Strategy;
var cors = require('cors');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var config = require('./config');
var { generateToken, sendToken } = require('./utils/token.utils');


const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');


var Ideas = require('./models/ideas.js');
var Users = require('./models/users.js');

var app = express();

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



// Set up default mongoose connection
var mongoDB = "mongodb://cshape:Slaveship1!@ds245082.mlab.com:45082/hackvoting";

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

//list users

app.get('/api/users', function(req, res) {
  Users.find({}).then(eachOne => {
    res.json(eachOne);
    })
  });

//passport authorization

//passport setup


passport.use(new GoogleTokenStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret
        },
        function (accessToken, refreshToken, profile, done) {
            Users.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
                return done(err, user);
            });
        }));

app.post('/api/google',
  passport.authenticate('google-token', {session: false}), function(req, res, next) {
    if (!req.user) {
      console.log("some fuckin error");
      return res.send(401, 'User Not Authenticated god dammit');
  }
  req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);

//ideas

app.get('/api/ideas', function(req, res) {
  Ideas.find({}).then(eachOne => {
    res.json(eachOne);
    })
  });

  app.get('/api/idea/:id', function(req, res) {
    console.log(req.params.id)
    // idea = Ideas.findById(req.params.id);
    // res.json(idea);

    Ideas.findById(req.params.id).exec(function(err, Ideas){
      res.send(Ideas);
    });

    // Ideas.findById(req.params).then(idea => {
    //   res.json(idea);
    //   });
    //   .catch(function () {
    //     console.log("Promise Rejected");
    // });
  });

//post new idea

app.post('/api/ideas', function(req, res, next) {
  Ideas.create({
    name: req.body.name,
    leader: req.body.leader,
    description: req.body.description,
    id: req.body.id
  }).then(idea => {
    res.json(idea)
  });
});

//edit idea

app.put('/api/idea/:id', function(req, res, next) {
  Ideas.findByIdAndUpdate(req.params.id,
  {$set: req.body}).then(idea => {
    res.json(idea)
    console.log("idea updated");
  });
});

//post comment

app.post('/api/idea:id', function(req, res, next) {
  Ideas.findOneAndUpdate({ 'id': req.params.id }, {
    '$push': {
      comments: req.body
    }
  }).then(comment => {
    res.json(comment);
    console.log("comment posted");
  })
});

//delete ideas

app.delete('/api/idea/:id', function(req, res) {
  Ideas.deleteOne({ _id: req.params.id }
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
