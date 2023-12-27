const express = require('express');
const connection = require('../connection');
const router = express.Router();

require('dotenv').config();

const auth = require('../services/auth')
const admin = require('../services/admin')

router.post('/add', auth.authenticateToken, admin.checkRole, (req, res, next) => {
    const category = req.body;
    var query = "insert into category(name) values(?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({message: "category added successfully."})
        } else {
            return res.status(500).json(err); 
        }
    });
})

router.get('/get', auth.authenticateToken, (req, res, next) => {
    var query = "Select * from category order by name";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results)
        } else {
            return res.status(500).json(err); 
        }
    });
});

router.patch('/update', auth.authenticateToken, admin.checkRole, (req, res, next) => {
    const {name, id} = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query, [name, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "category id doesn't found." })
            }
            return res.status(200).json({message: "category updated successfully."})
        } else {
            return res.status(500).json(err); 
        }
    });
});

module.exports = router;