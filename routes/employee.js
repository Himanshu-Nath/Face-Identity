var multer = require('multer');
var async = require('async');

require('../models/employee');
var Employee = mongoose.model('employee');
var consts = require('../const/const');
let uuidv4 = require('uuid/v4');
var fs = require("fs");

var employeeBL = require('../businesslogic/employeeBL');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '_' + req.body.empId + '.jpg');
    }
});

var upload = multer({ storage: storage }).array('photo', 5);
//var upload = multer({ storage: storage }).single('photo');  //for single file upload

module.exports = {
    //add Employee
    addEmployee: function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                console.log(err)
                return res.end("Error uploading file.");
            } else {
                //console.log(req.file); //for single file upload
                //console.log(req.files); //for multi file upload    
                // enrollInKairos(new Buffer(fs.readFileSync(req.file.path)).toString("base64"), uuidv4(), req.body.name, req.body.empId, req.file.filename, res);
                if (req.files.length != 0) {
                    async.map(req.files, function (file, callback) {
                        employeeBL.enrollInKairos(new Buffer(fs.readFileSync(file.path)).toString("base64"), uuidv4(), req.body.name, req.body.empId, file.filename, res, function (result) {
                            console.log(file.path)
                            callback(null, result);
                        });

                    }, function (err, results) {
                        if (err) {
                            console.log('A file failed to process');
                            res.send({ status: false, message: consts.fail });
                        } else {
                            console.log(results)
                            uploadSuccess = 0;
                            uploadFail = 0;
                            for (let i = 0; i < results.length; i++) {
                                if (results[i] == true)
                                    uploadSuccess+= 1;
                                if (results[i] == false)
                                    uploadFail+= 1;
                            }
                            res.send({ status: true, message: consts.success, totalImage: results.length, uploadSuccess: uploadSuccess, uploadFail: uploadFail });
                        }
                    });
                } else {
                    return res.end("Please Send Image");
                }
            }
        });
    },
    //recognize Employee
    recognizeEmployee: function (req, res) {
        employeeBL.recognizeInKairos(req.body.image, res)
    },
    //gallery List
    galleryList: function (req, res) {
        employeeBL.galleryInKairos(function (result) {
            if (result.hasOwnProperty("Errors")) {
                res.status(406).send({ status: false, message: consts.fail, result });
            } else {
                res.send({ status: true, message: consts.success, result });
            }
        })
    },
    //employee List
    employeeList: function (req, res) {
        employeeBL.employeeInKairos(res);
    },
    //delete Gallery
    deleteGallery: function (req, res) {
        employeeBL.deleteGalleryInKairos(res, req.body.name);
    },
    //delete Employee
    deleteEmployee: function (req, res) {
        Employee.findOneAndRemove({ empId: req.body.empId }, function (err, result) {
            if (err) {
                res.status(404).send({ status: false, message: consts.fail, err });
            } else {
                employeeBL.deleteEmployeeInKairos(res, result.subjectId);
            }
        })
    },
    //get Employee
    getEmployee: function (req, res) {
        Employee.findOne({ empId: req.params.empId }, function (err, result) {
            if (err) {
                res.status(404).send({ status: false, message: consts.fail, err });
            } else {
                res.send({ status: true, message: consts.success, result });
            }
        })
    }
};