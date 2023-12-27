const express = require('express');
const connection = require('../connection');
const router = express.Router();

const fs = require('fs');
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
let uuid = require('uuid');
const { authenticateToken } = require('../services/auth');
const { checkRole } = require('../services/admin');

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
                    pdf.create(data).toFile('./generated_pdf/'+ generatedUuid+'.pdf', (err, data) => {
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

router.post('/getPdf', authenticateToken, (req, res) => {
    const { uuid, productDetails, name, email, contactNumber, paymentMethod, totalAmount } = req.body;
    const pdfPath = `./generated_pdf/${uuid}.pdf`;

    if (fs.existsSync(pdfPath)) {
        res.contentType('application/pdf');
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(productDetails);
        ejs.renderFile(path.join(__dirname,'', 'report.ejs'), {productDetails: productDetailsReport, name, email, contactNumber, paymentMethod, totalAmount }, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                pdf.create(data).toFile('./generate_pdf/'+ uuid +'.pdf', (err, data) => {
                    if (err) {
                        console.log('err');
                        return res.status(500).json(err);
                    } else {
                        res.contentType('application/pdf');
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                });
            }
        });

    }
});

router.get('/getBills', authenticateToken, (req, res) => {
    var query = "Select * from bill";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err)
        }
    });
});

router.delete('/delete/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "Delete from bill where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json("Bill id does not found");
            }
            return res.status(200).json("bill deleted successfully.");
        } else {
            return res.status(500).json(err)
        }
    });
})

module.exports = router;