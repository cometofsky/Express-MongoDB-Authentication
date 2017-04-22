let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let mongoStore = require('connect-mongo')(session);

let app = express();



mongoose.connect(`mongodb://localhost:27017/bookworm`);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



// use sessions for tracking logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new mongoStore({
      mongooseConnection: db
  })
}));


app.use((req, res, next) => {

    res.locals.currentUser = req.session.userId;
    next();
});



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static(`${__dirname}/public`))


app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);


let routes = require(`./routes/index`);
app.use('/', routes);


app.use((req, res, next) => {

    let err = new Error('File Not Found!');
    app.status = 404;
    next(err);
});


app.use((err, req, res, next) => {

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(3000, () => {

    console.log(`Express app listening on port 3000`);
});