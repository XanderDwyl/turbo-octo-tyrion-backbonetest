var express = require('express'),
        app = express();
var mongoose = require('mongoose');

mongoose.connection.once('open', function () {
    console.log('MongoDB connection opened.');
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error: '));
mongoose.connect('mongodb://localhost:27017/test');

var ContactSchema = new mongoose.Schema({
    name: String,
    number: String,
    username: String
});

var contact = mongoose.model('contacts', ContactSchema);

var corsSettings = function(req, res, next) {
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

app.use(corsSettings);
app.use(express.bodyParser());

function listContacts(req, res) {
    var options = {};
    if (req.query.skip) {
        options.skip = req.query.skip;
    }
    if (req.query.limit) {
        options.limit = req.query.limit;
    }
    contact.find(null, null, options, function (err, docs) {
        if (err) {
            console.log(err);
            res.send(500, err);
        } else {
            res.send(200, docs);
        }
    });
}

function createContact(req, res) {
    contact.create(req.body, function (err, doc) {
        if (err) {
            console.log(err);
            res.send(500, err);
        } else {
            res.send(200, doc);
        }
    });
}

function contactByUsername(req, res) {
    console.log(req.params.id);
    contact.findById(req.params.id, function (err, doc) {
        if (err) {
            console.log(err);
            res.send(500, err);
        } else {
            res.send(200, doc);
        }
    })
}

function deleteContactById(req, res) {
    var id = req.params.id;
    contact.findByIdAndRemove(id, function (err, doc) {
        if (err) {
            console.log(err);
            res.send(404, err);
        } else {
            res.send(200, doc);
        }
    })
}

function updateContactById(req, res) {
    var id = req.params.id;
    var newData = {
        name: req.body.name,
        number: req.body.number,
        username: req.body.username
    };
    contact.findByIdAndUpdate(id, newData, function (err, doc) {
        if (err) {
            console.log(err);
            res.send(404, err);
        } else {
            res.send(200, doc);
        }
    });
}

function welcome(req, res) {
    res.json("Welcome to Contact Manager - Rest API!");
}

app.get('/', welcome);
app.get('/contacts', listContacts);
app.get('/contacts/:id', contactByUsername);
app.post('/contacts', createContact);
app.put('/contacts/:id', updateContactById);
app.delete('/contacts/:id', deleteContactById);

app.listen(3000, function () {
    console.log('App listening on localhost:3000');
});