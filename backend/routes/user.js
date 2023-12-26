const express = require('express');
const connection = require('../connection');
const router = express.Router()

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "INSERT INTO user(name, contactNumber, email, password, status, role ) values(?, ?, ?, ?, 'true', 'user');"
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfuly registered." })
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({ message: "Email already exist." })
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

router.post('/login', (req, res) => {
    const user = req.body;
    query = "Select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect username or password" })
            } else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Wait for admin approval" })
            } else if (results[0].password == user.password) {
                const {email, role} = results[0];
                const response = {email, role};
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn: '8h'});
                return res.status(200).json({token: accessToken})
            } else {
                return res.status(400).json({ message: 'Something went wrong. Please try again later.' })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
});

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "Select email, password from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0){
                return res.status(400).json({message: "Email is not registered here."})
            } else {
                var emailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: "Password by Cafe Management System",
                    html: `<p><b>Your login details for cafe management system</b><br>Email : ${results[0].email}<br>Password : ${results[0].password}<br><a href="http://localhost:${process.env.PORT}/user/login">click here to login</a></p>`
                }

                transporter.sendMail(emailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("email sent " + info.response);
                    }
                });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;