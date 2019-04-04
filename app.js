var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var url = require('url');
var host = ( 'localhost');
var port = ( 9000);
var http=require('http');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

app.use('/', indexRouter);
//app.use('/users', usersRouter);
function validateUrl(value) {
  return /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(value);
}


function createHTML(json, isArray){
  var html = '<ul>';
  for(var key in json){
    if(typeof json[key] == 'object'){

      html += '<li>' + (!isArray ? '<strong>'+ key +'</strong>' : '') + '</li>' + createHTML(json[key], (json[key] instanceof Array ? 1 : 0));
    } else {
      html += '<li>'+ json[key] +'</li>';
    }
  }
  return html+'</ul>';

}


app.post('/sitemap',function(req,res){
  console.log("Sending request to API" + req.body.url);
  var request_url = req.body.url;
  console.log("Received data"+request_url)
  if (request_url === null || request_url === '') {
    console.log("Request contains null value");
    res.write("Please request some URL")
    res.end()
  }
  else{
    console.log("Entering functionality")
    validation_res=validateUrl(request_url);
    if(!validation_res){
      console.log("Please enter valid URL");
      res.write("Please enter valid URL")
      res.end()
    }
    else {

      data = JSON.stringify({
        "url": request_url
      });
      properties = [];

      options = {
        port: 5000,
        path: '/sitemap',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      // console.log(options)

      var requestapi = http.request(options, function (responseapi) {
        console.log("Sending request")
        // res.setEncoding('utf8');
        responseapi.on('data', function (chunk) {
          console.log("body: " + chunk);
          properties += chunk;
          console.log("******************** Result ******************");
          console.log(properties);
        });
        responseapi.on('end', function (err, result) {
          if (!err) {
            // console.log("Properties" + properties);
            // res.write(properties);
            // res.end();



            var data = JSON.parse(properties);

            var output = {};
            var current;
            // console.log(data[0])

            for(var a=0; a<data.length; a++) {
              var s = data[a].split('/');
              // console.log("S is==="+s)
              current = output;
              for(var i=0; i<s.length; i++) {
                // console.log("S[i]=="+s[i])
                if(s[i] != '') {
                  // console.log("current[s[i]]==="+JSON.stringify(current[s[i]]))
                  if(current[s[i]] == null)
                    current[s[i]] = {};
                  current = current[s[i]];
                  // console.log("CUrrent & output==="+JSON.stringify(current)+",,,,,,,,,,,,,,,,,,"+JSON.stringify(output))
                }
              }
            }

          console.log(output)

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(createHTML(output,false));
          res.end();


          } else {
            console.log("Error: Server is not responding at this point in time");
            res.write("Error: Server is not responding at this point in time")
            res.end()
          }

        });
      })
          .on('error', function (err) {
            console.log('error ' + err)
            res.write("Error fetching data" + err)
            res.end();
          });
      requestapi.write(data);
      requestapi.end();
    }
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, host);
console.log('App started on port ' + port);

module.exports = app;
