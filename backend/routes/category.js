const express = require('express');
const connection = require('../connection');
const router = express.Router()

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