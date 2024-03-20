// Modules and dependencies
const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const csrf = require('csurf');
const createError = require('http-errors');

// Routers
const router = require('./routes/router');


// Constants
const serverPort = 8022;

// App and server setup
const app = express();
const server = http.createServer(app);
server.listen(serverPort);

// View engine setup
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));




// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

// >TODO move to .env
// Session and CSRF protection
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 432000 }
}));

const i18n = require('i18n');
const twig = require('twig');

// Configure i18n
i18n.configure({
    locales: ["en", "jp"],
    directory: __dirname + "/locales",
    defaultLocale: "en",
    cookie: "locale",
    objectNotation: true,
});

// Use i18n middleware
app.use(i18n.init);

// Add middleware to set the language cookie based on the query parameter
app.use((req, res, next) => {
    if (req.query.lang) {
        res.cookie("locale", req.query.lang);
    }
    next();
});

global.translate = function(key) {
    return i18n.__(key);
};

app.use(i18n.init);
app.use((req, res, next) => {
    res.locals.currentLocale = i18n.getLocale(req);
    next();
});

app.set('twig options', {
    allow_async: true,
    strict_variables: false
});


app.use(csrf({ cookie: { httpOnly: false, sameSite: 'strict' } }));

// Routes
app.use('/', router);

// 404 error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Pass i18n to the twig.extendFunction
twig.extendFunction('translate', function(key) {
    console.log('key:', key);
    return i18n.__(key);
});