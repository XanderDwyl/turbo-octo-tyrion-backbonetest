var express = require('express'),
        app = express();
var MongoClient = require('mongodb').MongoClient;


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};



app.use(allowCrossDomain);
app.use(app.router);

// Open the connection to the server
MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {    
    if(err) throw err;

    var collection = db.collection('contacts');

    app.get('/contacts', function (req, res) {
        collection.find().toArray(function (err, doc){
            res.json(doc);
        })
    });

    app.post('/contacts', function (req, res) {
        
    });

    app.delete('/contacts/:id', function (req, res) {
        
    });

    app.put('/contacts/:id', function (req, res) {
        
    });
});

app.listen(3000, function () {
    console.log('App listening on localhost:3000');
});