#! /usr/bin/env node

console.log('This script puts in some sample users and ideas. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Idea = require('./models/ideas')
var User = require('./models/users')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect("mongodb://cshape:Slaveship1%21@ds245082.mlab.com:45082/hackvoting", { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var ideas = []
var users = []

function userCreate(username, password, cb) {
  userinfo = { username: username,
               password: password
             }
  
  var user = new User(userinfo);
       
  user.save(function (err) {  
    if (err) {
      cb(err, null)
      return
    }
    console.log('New User: ' + user);
    users.push(user)
    cb(null, user)
  }  );
}


function ideaCreate(name, leader, description, cb) {
  ideainfo = { 
    name: name,
    leader: leader,
    description: description
  }    
    
  var idea = new Idea(ideainfo);

  idea.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Idea: ' + idea);
      cb(err, null)
      return
    }
    console.log('New Idea: ' + idea);
    ideas.push(idea)
    // cb(null, idea)
  }  );
}


function createUsers(cb) {
    async.parallel([
        function(callback) {
          userCreate('Boris', 'password1234', callback);
        },
        function(callback) {
          userCreate('Peter', 'borgy', callback);
        },
        function(callback) {
          userCreate('John', 'pen15', callback);
        }
        ],
        // optional callback
        cb);
}


function createIdeas(cb) {
    async.parallel([
        function(callback) {
          ideaCreate('automatic dunk tank for david perry', 'Boris', 'a more verbose description of this dunk tank', callback)
        },
        function(callback) {
          ideaCreate('penis pumps for dev team', 'Peter', 'big dick energy is a thing - lets 10x these dongs', 'in the description, we will flesh out this idea more - get it?', callback)
        },
        function(callback) {
          ideaCreate('dumb idea', 'John', 'tough to come up with dummy data', callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createUsers,
    createIdeas
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('IDEAS: '+ideainstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




