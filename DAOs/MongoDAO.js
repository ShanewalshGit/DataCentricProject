// Initialize express
var express = require('express');
var app = express();

// Mongo connection
const MongoClient = require('mongodb').MongoClient;
var db, coll;

MongoClient.connect('mongodb://127.0.0.1:27017')
    .then(client => {
        db = client.db('proj2023MongoDB');
        coll = db.collection('managers');
    })
    .catch(error => {
        console.log(error);
    })

// send back mongo data
var findAll = function () {
    return new Promise((resolve, reject) => {
        var cursor = coll.find()
        cursor.toArray()
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// send back mongo data by id
var findOne = function (id) {
    return new Promise((resolve, reject) => {
        var cursor = coll.find({ _id: id })
        cursor.toArray()
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error + "error")
            })
    })
}

// add manager function
function addManager(_id, name, salary) {
    return new Promise((resolve, reject) => {
        // mongo code to add manager
        coll.insertOne({ _id: _id, name: name, salary: salary })
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = { findAll, findOne, addManager };