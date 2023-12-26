const express = require('express')
var cors = require('cors')
const connection = require('./connection');
const userRouter = require('./routes/User');
const categoryRouter = require('./routes/category');

const app = express();
app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use('/user', userRouter);
app.use('/category', categoryRouter);

module.exports = app;