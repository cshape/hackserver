require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
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

// var mongoDB = process.env.MONGO_SECRETS;

console.log("hello");
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

//passport setup


passport.use(new GoogleTokenStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret
}, function(accessToken, refreshToken, profile, done){
  if (profile._json.hd === "clio.com"){
    console.log(profile);
    Users.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user)
    })
  } else {
    return done(err, console.log("bad email probably"))
  }
}));

//login

app.post('/api/google',
  passport.authenticate('google-token', 
    {session: false, domain: 'clio.com'}), function(req, res, next) {
    if (!req.user) {
      console.log("some fuckin error");
      return res.send(401, 'User Not Authenticated god dammit');
  }
  req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);

//already logged in login auth from token

app.post('/api/google/auth', function(req, res) {
  var token = req.body.token;
  console.log(token);
    if (!token) {
      return res.status(401).json({message: 'Must pass token'})
    }
      Users.findById(req.body.id, function(err, user) {
        console.log(user.fullName)
        res.setHeader('user-id', user._id);
        res.setHeader('user-name', user.fullName);
        res.setHeader('user-email', user.email);
        return res.status(200).send(JSON.stringify(user));
  });
});

//ideas

app.get('/api/ideas', function(req, res) {
   Ideas.find({ 
    deleted: false
}).then(ideas => {
    res.json(ideas);
    })
  });

//single idea

app.get('/api/idea/:id', function(req, res) {
    console.log(req.params.id);
    let ideaQuery = Ideas.findById(req.params.id);

    ideaQuery.where('deleted').eq(false).exec(function(err, idea){
      res.send(idea);
    });
  });

  // like idea

app.post('/api/idea/:id', function(req, res, next) {
    Ideas.findByIdAndUpdate(req.params.id,
      {$inc: { likes: 1 }}).then(idea => {
        res.json(idea._id);
        console.log("like added");
      }).catch(err => {
        res.send(err);
        console.log(err);
      })
    })



  //delete member

  app.post('/api/ideas/members/:id', function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input);

    var IdeaId = req.params.id;
    var memberId = input.deletionId;
     Ideas.findByIdAndUpdate(IdeaId,
            
            {$pull: {members: {_id: memberId}}},
            function(err, data){
               if(err) return err;
               res.send({data:data});
               console.log(req.body);
        });
    })

//post new idea

app.post('/api/ideas', function(req, res, next) {
  console.log(req);
  Ideas.create({
    name: req.body.name,
    leader: req.body.leader,
    description: req.body.description,
    id: req.body.id,
    deleted: false,
    hacksession: req.body.hacksession
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
    console.log(req.body);
  });
});




//delete idea

app.delete('/api/idea/:id', function(req, res) {
  Ideas.findByIdAndUpdate(req.params.id,
  {$set: { deleted: true }}).then(idea => {
    res.json(idea)
    console.log("idea deleted");
    console.log(req.body);
  });
});




var port = process.env.PORT || 3001;
app.listen(port, function() {
	console.log("running on port 3001")
});

module.exports = app;
