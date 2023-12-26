const express = require('express');
const connection = require('../connection');
const router = express.Router()

require('dotenv').config();

const auth = require('../services/auth');
const admin = require('../services/admin');

router.post('/add', auth.authenticateToken, admin.checkRole, (req, res) => {
    let { name, categoryId, description, price } = req.body;
    var query = "Insert into product (name, categoryId, description, price, status) values(?, ?, ?, ?, 'true')";
    connection.query(query, [name, categoryId, description, price], (err, results) => {
        if (!err){
            return res.status(200).json({Message: "Product Added Successfully."});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/get', auth.authenticateToken, (req, res) => {
    var query = "Select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c WHERE p.categoryId = c.id";
    connection.query(query, (err, results) => {
        if (!err){
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, admin.checkRole, (req, res) => {

});

module.exports = router;