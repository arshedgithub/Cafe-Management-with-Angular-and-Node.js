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

router.get('/getByCategory/:id', auth.authenticateToken, (req, res) => {
    var categoryId = req.params.id;
    var query = "Select id, name, description, price from product where categoryId=? and status='true'";
    connection.query(query,[categoryId], (err, results) => {
        if (!err){
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/getById/:id', auth.authenticateToken, (req, res) => {
    var productId = req.params.id;
    var query = "Select id, name, description, price from product where id=?";
    connection.query(query,[productId], (err, results) => {
        if (!err){
            return res.status(200).json(results[0]);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, admin.checkRole, (req, res) => {
    const { name, categoryId, description, price, id } = req.body;
    var query = "Update product set name=?, categoryId=?, description=?, price=? where id=?";
    connection.query(query, [name, categoryId, description, price, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0){
                return res.status(404).json({message: "Product id does not found."});
            }
            return res.status(200).json({message: "Product updated successfully."});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id', auth.authenticateToken, admin.checkRole, (req, res, next) => {
    const id = req.params.id;
    var query = "Delete from product where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0){
                return res.status(404).json({message: "Product id does not found."});
            }
            return res.status(200).json({message: "Product updated successfully."});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/updateStatus', auth.authenticateToken, admin.checkRole, (req, res) => {
    const { status, id } = req.body;
    var query = "Update product set status=? where id=?";
    connection.query(query, [status, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0){
                return res.status(404).json({message: "Product id does not found."});
            }
            return res.status(200).json({message: "Status updated successfully."});
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;