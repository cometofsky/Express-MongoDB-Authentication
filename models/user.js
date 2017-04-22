let mongoose = require('mongoose');
let bcrypt   = require('bcrypt');



let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    favoriteBook: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});



//hash password before saving to database
UserSchema.pre('save', function (next) {
    
    let user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {

        if (err)
            return next(err);
        
        user.password = hash;
        next();
    });
});


UserSchema.statics.authenticate = (email, password, callback) => {

    User.findOne({email: email})
        .exec((error, user) => {
            
            if (error)
                return callback(error);
            
            if (!user) {

                let err = new Error('User not found!');
                err.status = 401;
                return callback(err);
            }

            bcrypt.compare(password, user.password, (error, result) => {

                if (result === true)
                    return callback(null, user);
                
                return callback();
            })
        })
};


let User = mongoose.model('User', UserSchema);
module.exports = User;