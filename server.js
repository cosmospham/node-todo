// =============================================================================
// set up ======================================================================
// =============================================================================
var express  = require('express');
var app      = module.exports = express(); 				// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var passport = require('passport'); 					// passport for authentication

var port = process.env.PORT || 8080;

// =============================================================================
// configuration ===============================================================
// =============================================================================
mongoose.connect('mongodb://node:node@mongo.onmodulus.net:27017/uwO3mypu'); 	// connect to mongoDB database on modulus.io

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 					// log every request to the console
	app.use(express.bodyParser()); 						// pull information from html in POST
	app.use(express.methodOverride()); 					// simulate DELETE and PUT

	// session
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' }));

	// passport config
	app.use(passport.initialize());
	app.use(passport.session());
});

var auth = require('./config/passport.js')(passport); 	// load passport config and pass in passport

// =============================================================================
// define model ================================================================
// =============================================================================
var Todo = require('./models/todo.js');
var User = require('./models/user.js');

// =============================================================================
// routes ======================================================================
// =============================================================================

	// -------------------------------------------------------------------------
	// API ROUTES --------------------------------------------------------------
	// -------------------------------------------------------------------------
	// get all todos
	app.get('/api/todos', function(req, res) {

		// use mongoose to get all todos in the database
		Todo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(todos); // return all todos in JSON format
		});
	});

	// create todo and send back all todos after creation
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err);
				res.json(todos);
			});
		});

	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err);
				res.json(todos);
			});
		});
	});

	// -------------------------------------------------------------------------
	// AUTH ROUTES -------------------------------------------------------------
	// -------------------------------------------------------------------------

	// local auth signup
		// showing the view handled by angular frontend

		// process the signup form (return JSON)
		app.post('/auth/signup',
			passport.authenticate('local'),
			function(req, res) {
				res.send(true)
			});

	// local auth login
		// showing the view handled by angular frontend

		// process the signup form (return JSON)
		app.post('/auth/signup',
			passport.authenticate('local'),
			function(req, res) {
				res.send(true)
			});

	// facebook login
	app.get('/auth/facebook', passport.authenticate('facebook'));
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/#/todos',
		failureRedirect: '/#/login'
	}, function(req, res) {
		console.log('hello');
	}));

	// google login

	// -------------------------------------------------------------------------
	// application -------------------------------------------------------------
	// -------------------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

// =============================================================================
// listen (start app with node server.js) ======================================
// =============================================================================
app.listen(port);
console.log("App listening on port " + port);
