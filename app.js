const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const myRouter = require('./routes/myrouter.js'); 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true
}));

app.use(myRouter); 

app.listen(8080, () => {
    console.log("🚀 Starting server at port: 8080");
});