var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var uuid = require('uuid/v4');
var fs = require('fs');
var formidable = require('formidable');
var elasticsearch=require('elasticsearch');


//var jsdom = requite('jsdom')
//var Highcharts = require('highcharts');
//
/////////////////////////////////////////////
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
//////////////////////////////////////////////
var app = express();

var client = new elasticsearch.Client( {
  hosts: [
//    'http://localhost:9200/'
//      'https://y97deept:iwl1amugtrredgoq@ivy-3627020.us-east-1.bonsaisearch.net'
      'https://93wl2i9w:jzz09ozy6p8ox1qm@cherry-7404649.us-east-1.bonsaisearch.net'
  ]
});

app.set('elastic',client)

///////////////////////////////////////////////////
var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
////////////////////////////////////////////////////

// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(`${__dirname}/public/images/favicon.png`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(`${__dirname}/views`)); 		// statics
require(`./routes/routes.js`)(app, passport);						// routes

module.exports = app;

//var nombreFichero = Math.random().toString()
//form.multiples = false;
//form.on('file', function(field, file) {
//        fs.rename(file.path, path.join(form.uploadDir, nombreFichero));
//      });
//var path = process.cwd();
//      console.log(stdout);
//      execSync('bash '+path+'/executables/predict.sh '+nombreFichero+' && rm -r '+path+'/uploads/'+nombreFichero);
//      console.log(path+"/predictions/a.csv")
//      res.download(path+"/predictions/a.csv");

//      execSync("rm -r "+path+"/predictions/"+nombreFichero);

app.post(`/upload/:tagId`, function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = false;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');
//  var path_execution = process.cwd();

  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, req.params.tagId));
  });
  console.log("Uplods");
//  res.download("C:/Users/inigo.alon/workspace/web_fin_grado/predictions/a.csv");
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.get(`/download/:tagId`, function(req, res){
    var path_execution = process.cwd();
//    console.log("Download")
//    console.log(path_execution+"/predictions/a.csv")
//    execSync('bash '+path_execution+'/executables/predict.sh '+nombreFichero+' && rm -r '+path+'/uploads/'+nombreFichero);
    res.download(path_execution+"/predictions/predicted.csv",function(err){
                                                       if (err) {
                                                         console.log(err)
                                                       } else {
                                                         console.log("buen trabajo")
                                                       }
                                                     });
});

//client.cluster.health({},function(err,resp,status) {
//  console.log("-- Client Health --",resp);
//});
//
//client.indices.create({
//  index: 'gov'
//},function(err,resp,status) {
//  if(err) {
//    console.log(err);
//  }
//  else {
//    console.log("create",resp);
//  }
//});
//
//client.indices.delete({index: 'gov'},function(err,resp,status) {
//  console.log("delete",resp);
//});

//client.search({
//  index: 'logs'
//},function (error, response,status) {
//    var arr = [];
//    if (error){
//      console.log("search error: "+error)
//    }
//    else {
//      console.log("--- Response ---");
//      console.log(response);
//      console.log("--- Hits ---");
//      response.hits.hits.forEach(function(hit){
//        arr.push(hit['_type'])
//      })
//      let unique = [...new Set(arr)];
//      arr=unique
//      //console.log(arr);
//    }
//    return arr
//});