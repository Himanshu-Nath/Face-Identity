mongoose = require('mongoose');
var consts = require( './const/const');
var db = require( './config/db');
request = require('request');
kairos = require('kairos-api');
const express = require('express')
const app = express()
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(bodyParser.json({limit: '50mb', parameterLimit: 1000000}));

var employee = require('./routes/employee');

app.post('/api/employee', employee.addEmployee);
app.post('/api/recognize', employee.recognizeEmployee);
app.get('/api/gallery/list', employee.galleryList);
app.get('/api/employee/list', employee.employeeList);
app.delete('/api/gallery', employee.deleteGallery);
app.delete('/api/employee', employee.deleteEmployee);
app.get('/api/employee/:empId', employee.getEmployee);
app.get('/api/allemployee', employee.getEmployeeListFromDB);

app.use('/', express.static(__dirname + '/'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(consts.port, function() {
  console.log("server started on port: "+consts.port);
});