// Initialize the database connection
var express = require('express');
var app = express();
var pmysql = require('promise-mysql'); // promise-mysql module
var pool; // global pool variable

// create a pool connection
pmysql.createPool({ // createPool() method to create a pool of connections
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
})
    .then(p => {
        pool = p
        console.log("pool created")
    })
    .catch(e => {
        console.log("pool error:" + e)
    })

// Get all products from the database
function getProducts() {
    return new Promise((resolve, reject) => {
        // mysql code to get product
        pool.query("SELECT p.pid, p.productdesc, ps.sid, s.location, ps.Price FROM product p LEFT JOIN product_store ps ON p.pid = ps.pid LEFT JOIN store s ON ps.sid = s.sid")
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Check if product is in any store
function isProductInAnyStore(pid) {
    return new Promise((resolve, reject) => {
        // mysql code to get product
        pool.query("SELECT * FROM product_store WHERE pid = ?", [pid])
            .then(isInStore => {
                resolve(isInStore)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// If the products table is out of deletable products, here's an example command for you to paste into the SQL Database
//INSERT INTO `product` (`pid`, `productdesc`, `supplier`) VALUES ('PROJ23', 'Scooby Snacks', 'Mystery Inc');

// delete product from database by pid if it is not in any stores
function deleteProduct(pid) {
    return new Promise((resolve, reject) => {
        // mysql code to delete product
        pool.query("DELETE FROM product WHERE pid = ?", [pid])
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Get all stores from the database
function getStores() {
    return new Promise((resolve, reject) => {
        pool.query("select * from store")
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// If the stores table is clogged up, here's an example command for you to paste into the SQL Database to delete a store
//DELETE FROM `store` WHERE `store`.`sid` = 'STORE1';

// function for grabbing a store id
function getStoreById(sid) {
    return new Promise((resolve, reject) => {
        pool.query("select * from store where sid = ?", [sid])
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// function for grabbing a store by manager id
function getStoreByManagerId(mgrid) {
    return new Promise((resolve, reject) => {
        pool.query("select * from store where mgrid = ?", [mgrid])
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// function for editing a store, used in editStore route
function editStore(sid, location, mgrid) {
    return new Promise((resolve, reject) => {
        // Update the store
        pool.query("UPDATE store SET sid = ?, location = ?, mgrid = ? WHERE sid = ?", [sid, location, mgrid, sid])
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
        .catch(error => {
            reject(error)
        })
}

// function for adding a store, used in addStore route
function addStore(sid, location, mgrid) {
    return new Promise((resolve, reject) => {
        // mysql code to add store
        pool.query("INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)", [sid, location, mgrid])
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = { getProducts, isProductInAnyStore, deleteProduct, getStores, editStore, getStoreById, getStoreByManagerId, addStore}; // export the functions