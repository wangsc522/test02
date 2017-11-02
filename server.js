
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , bodyParser = require('body-parser')
  , http = require('http')
  , path = require('path');

var app = express();
var loginAccount = {
        userName: 'GUEST'
       ,password: 'pass'
       ,point:'0'   
    }; // 設定帳號及密碼

//增加認證元件
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

// 環境設定
var config = require('./test01.json');


app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());

//實作seesion的認證
app.use(express.cookieParser());
app.use(express.session({secret: '192.168.173.5', cookie: { maxAge: 60000 }}));
app.use(passport.initialize());
app.use(passport.session());

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true  })); 
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

passport.use('local', new LocalStrategy(
	    function (username, password, done) {
	        var isMatch = false;
	        try {
	        	config.users.forEach(function(entry) 
	        		{
	        		  //	console.log(entry.userName + ' ' + entry.password);
	        			if (username == entry.userName && password == entry.password) {
	        				loginAccount.userName = entry.userName;
	        				loginAccount.password = entry.password;
	        				loginAccount.point = entry.point;
	        				isMatch =true;
	        				throw "done";
	        				}
	        		});
	        } catch (e) { if (e != "done") throw e; }			
	        		
	        if (! isMatch){return done(null, false, { message: '密碼錯誤.' });}
	        return done(null, user);
	        
	    }
	));

	passport.serializeUser(function (user, done) {//保存user对象
	    done(null, user);//可以通过数据库方式操作
	});

	passport.deserializeUser(function (user, done) {//删除user对象
	    done(null, user);//可以通过数据库方式操作
	});


app.all('/secure/*', function (req, res, next) {
    if (req.isAuthenticated())
        {return next();}
    res.redirect('/');
});

app.get('/', routes.index);

app.get('/users', user.list);
app.get('/secure/logout', function (req, res) {
	    req.logout();
		loginAccount.userName = "GUEST";
		loginAccount.password = "pass";
		loginAccount.point = "0";
	    res.redirect('/');
	});
app.get('/test', function(req, res) {
       res.render('test', { title: 'Express !!!!',titlename:"wsc" })});

app.get('/users', user.list);
app.get('/secure/queryAccount', function(req, res){
	  res.render('queryAccout', { title: '點數系統',userName: loginAccount.userName,point:loginAccount.point,
		  jsonData:config.users })});
		  //		  jsonData:[{account:'wsc'},{account:'dowyvr'}] })});

app.get('/queryAccount', function(req, res){
	  res.render('queryAccout', { title: '點數系統',userName: loginAccount.userName,point:loginAccount.point })});

app.post('/login',
	    passport.authenticate('local', {
	        successRedirect: '/secure/queryAccount',
	        failureRedirect: '/'
	    }));

app.post('/secure/changePassword',function(req, res){
        try {
        	config.users.forEach(function(entry) 
        		{
        		//  	console.log(req.body.pwd+' '+entry.userName+' '+loginAccount.userName);
        			if (entry.userName == loginAccount.userName ) 
        			{
        				entry.password = req.body.newPwd;
        				var fs = require('fs');
        				var outputFilename = './test01.json';

        				fs.writeFile(outputFilename, JSON.stringify(config, null, 4), function(err) {
        				if(err) {
        				console.log(err);
        				} else {
        				console.log("JSON saved to " + outputFilename);
        				}
        				});
        				
        				isMatch =true;
        				throw "done";
        				}
        		});
        } catch (e) { if (e != "done") throw e; }
        res.redirect('/secure/queryAccount');

	  });


app.post('/secure/transfer',function(req, res){
	console.log("transfer!!!!");
    try {
    	var outputMatch =false;
    	var inputMatch = false;
    	config.users.forEach(function(entry) 
    		{
    			if (entry.userName == loginAccount.userName ) 
    			{
    				entry.point = parseInt(entry.point,10) - parseInt(req.body.transPoint,10);
    				loginAccount.point = entry.point;
    				outputMatch =true;
    				console.log(entry.point+" "+req.body.transPoint);
    				if (inputMatch) { throw "done"; }
    			}
    			if (entry.userName == req.body.transAccount ) 
    			{
    				entry.point = parseInt(entry.point,10)+parseInt(req.body.transPoint,10);
    				inputMatch =true;
    				console.log(entry.point+" "+req.body.transPoint);
    				if (outputMatch) { throw "done"; }
    			}
    		});
    } catch (e) { if (e != "done") throw e; }
    if (inputMatch &&outputMatch ) {
    	var fs = require('fs');
    	var outputFilename = './test01.json';
    	fs.writeFile(outputFilename, JSON.stringify(config, null, 4), function(err) {
    		if(err) {
    			console.log(err);
    		} else {
    			console.log("JSON saved to " + outputFilename);
    		}
    	})
    }
    res.redirect('/secure/queryAccount');

  }); 

app.post('/testpage', function(req, res) {
    var name = req.body.user,
        color = req.body.password;
    console.log('test !!!!');
    res.render('index', { title: name });
});
http.createServer(app).listen(app.get('port'), function(){
	  console.log('Point server listening on port ' + app.get('port'));
	});