var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var parseSchema = require('mongodb-schema');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

// node connected to mongodb database using mongojs

var mongojs = require('mongojs');

// calling CORS
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended : false
	}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.post('/api', function (req, res) {

	var params = req.body;
	var databasename = params.databaseName;
	var db = mongojs(databasename);
	console.log(" req from client", params);

	var sortC = {};
	sortC[params.colName] = params.sort;
	console.log(params.startRow);
	if (params.colName) {
		console.log("inside sort");
		db.collection(params.CollectionName).find().sort(sortC).limit(40).skip(parseInt(params.startRow), function (err, response) {
			res.json(response);
		});
	} else {
		db.collection(params.CollectionName).find().limit(40).skip(parseInt(params.startRow), function (err, response) {
			res.json(response);
		});
	}
});

app.post('/api/collections',function(req,res){
	
	var params =req.body;
	var databasename = params.databaseName;
	var db = mongojs(databasename);
	
	db.getCollectionNames(function (err,response)
	{
		console.log(response);
		res.json(response);
	});
	
	
	
});

app.get('/api/schemas',function(req,res){
	
	var databasename = "mongodb://localhost:27017/photoidprod";
	var db = mongojs(databasename);
	
	db.getCollectionNames(function (err,response)
	{
		
		
		var data=[];
		/*
		for(i=0;i<response.length;i++)
		{		
			data.concat("abcd");
			parseSchema('dummy.admin', db.collection(response[i]).find().sort({$natural:-1}).limit(10), function(err, schema){
				
				
				data.concat(schema.fields);
				//console.log("hello");
				
			});			
			
		}
		*/
		
		response.forEach(function (eachName, index) {
			
			console.log("name",eachName);
			parseSchema('dummy.admin', db.collection(eachName).find().sort({$natural:-1}).limit(10), function(err, schema){
				console.log("data");
				data.push(schema.fields);
				
			});
			
		});
		
		res.json(data);	
		
	}); 

	/*
	parseSchema('dummy.admin', db.collection('OutboxMsg').find().sort({$natural:-1}).limit(10), function(err, schema){
		res.json(schema.fields[0]);
	});
	*/

});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message : err.message,
			error : err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message : err.message,
		error : {}
	});
});

module.exports = app;
