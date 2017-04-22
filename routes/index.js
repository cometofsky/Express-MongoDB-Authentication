let express = require('express');

let router  = express.Router();

let User       = require(`../models/user`);
let middleware = require(`../middleware`);



router.get('/', (req, res, next) => {

    return res.render('index', {title: 'Home'});
});


router.get('/about', (req, res, next) => {

    return res.render('about', {title: 'About'});
});


router.get('/contact', (req, res, next) => {

    return res.render('contact', {title: 'Contact'});
});


router.get('/register', middleware.loggedOut, (req, res, next) => {

    return res.render('register', {title: 'Registration'});
});


router.post('/register', (req, res, next) => {

    if (req.body.email === '' ||
    req.body.name === '' ||
    req.body.favoriteBook === '' ||
    req.body.password === '' ||
    req.body.confirmPassword === '') {

        let err = new Error('All fields are required!');
        err.status = 400;
        return next(err);
    }

    if (req.body.password !== req.body.confirmPassword) {

        let err    = new Error('Passwords do not match!');
        err.status = 400;
        return next(err);
    }

    let userData = {
        email       : req.body.email,
        name        : req.body.name,
        favoriteBook: req.body.favoriteBook,
        password    : req.body.password
    };

    User.create(userData, (error, user) => {
        if(error)
            return next(error)
        
        req.session.userId = user._id;
        return res.redirect('/profile');
    });
});


router.get(`/login`, middleware.loggedOut, (req, res, next) => {

    return res.render(`login`, {title: 'Log In'});
});


router.post(`/login`, (req, res, next) => {

    if (req.body.email === '' || req.body.password === '') {

        let err = new Error('Email and password both are required!');
        err.status = 401;
        return next(err);
    }

    User.authenticate(req.body.email, req.body.password, (error, user) => {

        if (error || !user) {

            let err = new Error('Wrong email or password');
            err.status = 401;
            return next(err);
        }

        req.session.userId = user._id;
        return res.redirect('/profile');
    })
});


router.get('/logout', (req, res, next) => {

    if (req.session) {

        req.session.destroy((err) => {

            if (err)
                return next(err);
            
            return res.redirect('/login');
        });
    }
});


router.get("/profile", middleware.isLoggedIn, (req, res, next) => {

    User.findById(req.session.userId)
        .exec((error, user) => {

            if (error)
                return next(error);
            
            return res.render('profile', {title: 'Profile',
                                          name: user.name,
                                          favorite: user.favoriteBook})
        })
});






module.exports = router;