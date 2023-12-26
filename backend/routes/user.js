const express = require('express');
const connection = require('../connection');
const router = express.Router()

router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email],(err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "INSERT INTO user(name, contactNumber, email, password, status, role ) values(?, ?, ?, ?, 'false', 'user');"
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({message: "Successfuly registered."}) 
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({message: "Email already exist."}) 
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

router.post('/login', (req,res) => {
    const user = req.body;
    query = "Select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password){
                return res.status(401).json("Incorrect username or password")
            } else if (results[0].status === 'false'){
                return res.status(401).json("Wait for admin approval")
            } else if (results[0].password == user.password){
                // should create a jwt token
            } else {
                return res.status(400).json({message: 'Something went wrong. Please try again later.'})
            }
            return res.status(500).json(err)
        }
    })
})

module.exports = router;