const express = require('express');
const connection = require('../connection');
const router = express.Router()

require('dotenv').config();

const auth = require('../services/auth')
const admin = require('../services/admin')