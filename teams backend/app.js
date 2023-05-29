require('dotenv').config();
const {LocalStorage} = require("node-localstorage");
 var localStorage = new LocalStorage('./scratch'); 
var path = require('path');
const express = require('express');
var session = require('express-session');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
const async = require('hbs/lib/async');

// initialize express
var app = express();

/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */

 app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set this to true on production
    }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", async (request, response) => {
    console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    response.header("Access-Control-Allow-Origin", "*");
    response.send("CORS is enabled for this route.");
});

/*
** Getting the access token from the local storage.
*/
var access_Token = localStorage.getItem('accessToken');
const options = {
    headers: {
      'Authorization': 'Bearer ' + access_Token
    }
  };

  /*
  ** Getting the list of teams form microsoft teams .
  */
app.get('/teams',
// isAuthenticated, // check if user is authenticated
(req, res) => {
   
    
    axios.get('https://graph.microsoft.com/v1.0/groups', options)
    .then(response => {
        if (response.headers['content-type'].indexOf('application/json') !== -1) {
            console.log('responseresponseresponseresponse ===== ' , response.data.value);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({teams: response.data.value}));
        }
    })
    .catch(error => {
      console.error('error : === ' , error);
      res.status(500).send('Error fetching data from Teams API');
    });
}
);

/*
** getting the list of members from a team .
*/

app.get('/members/:id',
// isAuthenticated, // check if user is authenticated
async function (req, res, next) {
    const id= req.params.id;
    console.log("===id===",id);
    try {
        axios.get(`https://graph.microsoft.com/v1.0/teams/${id}/members`, options).then(response => {
            if (response.headers['content-type'].indexOf('application/json') !== -1) {
                // console.log('responseresponseresponseresponse ===== ' , response.data.value);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // if(response.url)
                return res.end(JSON.stringify({members: response.data.value}));
            }
            //  response.json;
        })
        .catch(error => {
          console.error('error : === ' , error);
          res.status(500).send('Error fetching data from Teams API');
        });
    } catch (error) {
        next(error);
    }
}
); 


/* 
**getting the channels of a team.
*/

app.get('/channels/:id',
// isAuthenticated, // check if user is authenticated
async function (req, res, next) {
    const id= req.params.id;
    try {
        axios.get(`https://graph.microsoft.com/v1.0/teams/${id}/allChannels`, options).then(response => {
            if (response.headers['content-type'].indexOf('application/json') !== -1) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({members: response.data.value}));
            }
        })
        .catch(error => {
          console.error('error : === ' , error);
          res.status(500).send('Error fetching data from Teams API');
        });
    } catch (error) {
        next(error);
    }
}
); 

/*
** Getting the messages of a particular channel.
*/
app.get('/messages/:teamId/:channelId',
// isAuthenticated, // check if user is authenticated
async function (req, res, next) {
    console.log('req params == ' , req.params)
    const teamId1= req.params.teamId;
    const channelId1= req.params.channelId;
    console.log('teamId1 ==================== ' , teamId1);
    console.log('channelId1 ==================== ' , channelId1);
    try {
        axios.get(`https://graph.microsoft.com/v1.0/teams/${teamId1}/channels/${channelId1}/messages`, options).then(response => {
            if (response.headers['content-type'].indexOf('application/json') !== -1) {
                console.log('responseresponseresponseresponse ===== ' , response);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({messages: response.data.value}));
            }
        })
        .catch(error => {
          console.error('error : === ' , error);
          res.status(500).send('Error fetching data from Teams API');
        });
    } catch (error) {
        next(error);
    }
}
); 

module.exports = app;
