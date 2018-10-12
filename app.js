var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');


var Ideas = require('./models/ideas.js');
var Users = require('./models/users.js');

var app = express();

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

//sign up user

app.post('/api/users/signup', (req, res, next) => {
    const { body } = req;
    const { password } = body;
    let { email } = body;

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }
    email = email.toLowerCase();
    email = email.trim();
    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    Users.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: sucks to be you, man.'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Error: Account already exist.'
        });
      }
      // Save the new user
      const newUser = new Users();
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.save((err, user) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error u bad man'
          });
        }
        return res.send({
          success: true,
          message: 'Signed up'
        });
      });
    });
  });

// sign in

app.post('/api/users/signin', (req, res, next) => {
    const { body } = req;
    const {
      password
    } = body;
    let {
      email
    } = body;
    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }
    email = email.toLowerCase();
    email = email.trim();
    Users.find({
      email: email
    }, (err, users) => {
      if (err) {
        console.log('err 2:', err);
        return res.send({
          success: false,
          message: 'Error: server error'
        });
      }
      if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      }
      const user = users[0];
      if (!user.validPassword(password)) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      }
      // Otherwise correct user
      return res.send({
        success: true,
        message: 'Success! Logged in!'
      })
    });
  });




// app.post('/api/users', function(req, res, next) {
//   Users.create({
//     email: req.body.username,
//     password: req.body.password,
//     firstname: req.body.firstname,
//     lastname: req.body.lastname
//   }).then(user => {
//     res.json(user)
//   });
// });

//log in user



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
