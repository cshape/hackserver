var mongoose = require('mongoose');
// var bcrypt = require('bcrypt');


// Define schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    fullName: String,
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    leader: String,
    member: String,
    googleProvider: {
            type: {
                id: String,
                token: String
            },
            select: false
        }
});

UserSchema.set('toJSON', {getters: true, virtuals: true});

UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
        var that = this;
        return this.findOne({
            'googleProvider.id': profile.id
        }, function(err, user) {
            // no user was found, lets create a new one
            if (!user) {
                var newUser = new that({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    googleProvider: {
                        id: profile.id,
                        token: accessToken
                    }
                });

                newUser.save(function(error, savedUser) {
                    if (error) {
                        console.log(error);
                    }
                    return cb(error, savedUser);
                });
            } else {
                return cb(err, user);
            }
        });
    };

//Export function to create "SomeModel" model class
module.exports = mongoose.model('UserModel', UserSchema );