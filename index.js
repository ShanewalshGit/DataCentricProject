// initialize express
var express = require('express');
var app = express();

// import from mySQLDAO.js
var mySQLDAO = require('./DAOs/mySQLDAO.js');

// import Mongo from MongoDAO.js
var mongoDAO = require('./DAOs/MongoDAO.js');

// Ejs setup
let ejs = require('ejs');
app.set('view engine', 'ejs');

//body parser setup
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) { // default route
    res.render('index');
});

// Get all stores from the database
 app.get('/stores', function(req, res) {
     mySQLDAO.getStores()
         .then(data => {
             res.render('stores', { stores: data });
         })
         .catch(error => {
             console.log("Error: " + error);
         })
 });

 // Get all products from the database
 app.get('/products', function(req, res) {
     mySQLDAO.getProducts()
         .then(data => {
             res.render('products', { products: data, error: req.query.error });
         })
         .catch(error => {
             console.log("Error: " + error);
         })
 });

// Get all managers from the database
app.get('/managers', function(req, res) {
    mongoDAO.findAll()
        .then(data => {
            res.render('managers', { managers: data });
        })
        .catch(error => {
            console.log("Error: " + error);
        })
});

// delete product from database by pid if it is not in any stores
app.get('/products/delete/:pid', function(req, res) {
    mySQLDAO.isProductInAnyStore(req.params.pid)
        .then(isInStore => {
            if (isInStore.length == 0) {
                // product is not in any store, proceed with deletion
                mySQLDAO.deleteProduct(req.params.pid)
                    .then(() => {
                        res.redirect('/products');
                    })
                    .catch(error => {
                        console.log("Error: " + error);
                        res.redirect('/products?error=' + encodeURIComponent(error.message)); // redirect to products page with error message
                    });
            } else {
                // product is in a store, redirect with error message
                console.log("Error: " + req.params.pid + " is currently in stores and cannot be deleted");
                res.redirect('/products?error=' + encodeURIComponent(req.params.pid + " is currently in stores and cannot be deleted"));
            }
        })
        .catch(error => {
            console.log("Error: " + error);
            res.redirect('/products?error=' + encodeURIComponent(error.message));
        });
});

 // get store data by id for stores page
 app.get('/stores/edit/:sid', function(req, res) {
     mySQLDAO.getStoreById(req.params.sid)
         .then(data => {
             res.render('editStore', { store: data[0], error: req.query.error });
         })
         .catch(error => {
             console.log("Error: " + error);
             res.redirect('/stores'); // redirect to stores page
         })
});

// on submit of edit store form, update store
app.post('/stores/edit/:sid', async function (req, res) {
    const sid = req.params.sid;
    const { location, mgrid } = req.body;

    // Check if Manager ID is 4 characters
    if (mgrid.length !== 4) {
        console.log("Error: Manager ID must be 4 characters");
        res.redirect('/stores/edit/' + sid + '?error=' + encodeURIComponent("Manager ID must be 4 characters")); // redirect to edit store page with error message
        return;
    }

    // Check if Manager ID exists in MongoDB
    const db = mongoDAO.findAll();
    const manager = await db.then(data => {
        return data.find(manager => manager._id === mgrid);
    });

    if (!manager) {
        console.log("Error: Manager ID does not exist");
        res.redirect('/stores/edit/' + sid + '?error=' + encodeURIComponent("Manager ID does not exist in MongoDB")); // redirect to edit store page with error message
        return;
    }
    else {
        mySQLDAO.editStore(sid, location, mgrid)
            .then(data => {
                res.redirect('/stores');
            })
            .catch(error => {
                console.log("Error: " + error);
                res.redirect('/stores'); // redirect to stores page
            })
        }
});

// send to add store page
app.get('/stores/add', function(req, res) {
    res.render('addStore', { error: req.query.error });
});

// on submit of add store form, add store
app.post('/stores/add', async function(req, res) {

    // Check if Manager ID is 4 characters
    if (req.body.mgrid.length !== 4) {
        console.log("Error: Manager ID must be 4 characters");
        res.redirect('/stores/add?error=' + encodeURIComponent("Manager ID must be 4 characters"));
        return;
    }

    // Check if Manager ID exists in MongoDB
    const db = mongoDAO.findAll();
    const manager = await db.then(data => {
        return data.find(manager => manager._id === req.body.mgrid);
    });

    if (!manager) {
        console.log("Error: Manager ID does not exist");
        res.redirect('/stores/add?error=' + encodeURIComponent("Manager ID does not exist in MongoDB"));
        return;
    }
    else {
        mySQLDAO.addStore(req.body.sid, req.body.location, req.body.mgrid)
            .then(data => {
                res.redirect('/stores');
            })
            .catch(error => {
                console.log("Error: " + error);
                res.redirect('/stores'); // redirect to stores page
            })
        }
});

// send to add manager page
app.get('/managers/add', function(req, res) {
    res.render('addManager', { error: req.query.error });
});

// on submit of add manager form, add manager
app.post('/managers/add', function(req, res) {

    // Check if Manager ID is 4 characters
    if (req.body._id.length !== 4) {
        console.log("Error: Manager ID must be 4 characters");
        res.redirect('/managers/add?error=' + encodeURIComponent("Manager ID must be 4 characters"));
        return;
    }

    // Check if name is > 5 characters
    if (req.body.name.length < 5) {
        console.log("Error: Name must be > 5 characters");
        res.redirect('/managers/add?error=' + encodeURIComponent("Name must be > 5 characters"));
        return;
    }

    // check if salary is between 30000 and 70000
    if (req.body.salary < 30000 || req.body.salary > 70000) {
        console.log("Error: Salary must be between 30000 and 70000");
        res.redirect('/managers/add?error=' + encodeURIComponent("Salary must be between 30000 and 70000"));
        return;
    }

    // Check if Manager ID exists in MongoDB
    mongoDAO.addManager(req.body._id, req.body.name, req.body.salary)
        .then(data => {
            res.redirect('/managers');
        })
        .catch(error => {
            console.log("Error: " + error);
            res.redirect('/managers'); // redirect to managers page
        })
});


app.listen(3000, function() { // listen on port 3000
    console.log('Example app listening on port 3000!');
});