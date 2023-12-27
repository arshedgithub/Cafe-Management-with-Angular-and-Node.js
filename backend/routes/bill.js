const express = require('express');
const connection = require('../connection');
const router = express.Router();

let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
let uuid = require('uuid');
const { authenticateToken } = require('../services/auth');

router.post('/generateReport', authenticateToken, (req, res) => {
    const generatedUuid = uuid.v1();
    
    // get orderDetails by destructuring
    const {name, email, contactNumber, paymentMethod, totalAmount, productDetails } = req.body;
    const productDetailsReport = JSON.parse(productDetails);

    var query = "Insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)";
    connection.query(query, [name, generatedUuid, email, contactNumber, paymentMethod, totalAmount, productDetails, res.locals.email], (err, results) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname,'', 'report.ejs'), {productDetails: productDetailsReport, name, email, contactNumber, paymentMethod, totalAmount }, (err, data) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    pdf.create(data).toFile('./generate_pdf/'+ generatedUuid+'.pdf', (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({ uuid: generatedUuid });
                        }
                    });
                }
            });
        } else {
            return res.status(500).json(err);   
        }
    })
});

module.exports = router;