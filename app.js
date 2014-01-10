// BW001: Framework starts with
// BW001: express --ejs --css less --force
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
// BW001: Added for accessing files
var fs = require('fs')
// xAPI Start
// BW001: Added to trick TinCan that we are in a browser
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

//var Config = JSON.parse( fs.readFileSync( path.join(__dirname, "config.json")));
var xAPI = require("./tincan");
xAPI.TinCan.DEBUG = true;
var xAPI1 = new xAPI.TinCan;
xAPI1.addRecordStore( 
  {
    endpoint: process.env.endpoint,
    username: process.env.authUser,
    password: process.env.authPassword
//                    version: this.allVersions[i]
  }
);
function MakeActor( email, actor)
{
  if ( /@*./.test(email)){
    return { 
      "objectType":"Agent", 
      // "openid":"https://africanoreuropean.com", 
      "account": {
	  "homePage": "https://twitter.com",
	  "name": email
      }
    }
  }
  else {
    return { 
      "objectType":"Agent", 
      "mbox": email, 
      "name": actor 
    }
  }
}
function syntaxHighlight( statement) {
  json = JSON.stringify( statement, undefined, 4);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
	  if (/:$/.test(match)) {
	      cls = 'key';
	  } else {
	      cls = 'string';
	  }
      } else if (/true|false/.test(match)) {
	  cls = 'boolean';
      } else if (/null/.test(match)) {
	  cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
  // http://stackoverflow.com/questions/8188645/javascript-regex-to-match-a-url-in-a-field-of-text
  var urlpattern = /((http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g
//  var urlpattern = /(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/g;
  json = json.replace( urlpattern, function (str, group1) 
	{
//		var url = URLRelocate(group1);
		var url = group1;
		return '<a href="' + url + '">' + group1 + '</a>';
	});
  return json;
}
// xAPI End

// Twitter authentication 1
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

// https://github.com/jaredhanson/passport-twitter/blob/master/examples/signin/app.js

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Twitter profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
// Twitter authentication 1 End

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// this added to support extension html instead of ejs
// app.engine('html', ejs);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
// Twitter authentication 2
  // We need cookies and session for Twitter authentication
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
// Twitter authentication 2 End

// This if and only if you are behind a reverse proxy (apache, nginx)
// app.enable('trust proxy');
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// start middleware for Articulate Storyline
var stlpages = require( path.join( __dirname , path.join( 'lib', 'stlpages'))).stlpages;
app.use( stlpages());

// Pages start
app.get('/', routes.index);
app.get('/users', user.list);

// example of a totally dynamic data page called by a story
app.get('/AS1Step1.html', function(request, response) {
	var Name = request.query.Name;
	var Class = request.query.Class;
	response.setHeader('Content-Type', 'text/plain');
	response.send( "OK for " + Name);
    });
// Access to Articulate Storyline End

// Twitter authentication 3
// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/registration');
  });

// Last stage of registration a page to welcome the registered user
app.get('/registration', function(request, response) {
    var d0 = new Date();
    var d = new Date( d0.getTime());

    var statement = 
    { 
	"verb":
	{ 
	    "id":"http://adlnet.gov/expapi/verbs/registered", 
	    "display":
	    { 
		"en":"registered"
	    } 
	}, 
	"result":
	{ 
	    "completion": true, 
	    "success": true 
	}, 
	"timestamp": d.toISOString(), // "2011-05-25T20:34:05.787000+00:00", 
	"object":
	{ 
	    "id": "http://xapijv.kneaver.com"
	}, 
	"actor": MakeActor( request.user.username, request.user.username)
    };
  var statements = [];
  statements.push( statement);
  var Buffer = JSON.stringify( statement, undefined, 4);
  console.log( Buffer);
  xAPI1.sendStatements( statements);

  var data = { 
	title: 'Registration',
	UserID : request.user.username,
	Statement : syntaxHighlight( statement),
	};
  console.log( request.user);
  response.render('registration.ejs', data);
})
;
// Twitter authentication 3 End


// Pages End

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
