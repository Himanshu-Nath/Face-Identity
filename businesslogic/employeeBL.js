var async = require('async');

require('../models/employee');
require('../models/logs');
var Employee = mongoose.model('employee');
var Logs = mongoose.model('logs');
var consts = require('../const/const');

exports.enrollInKairos = function(img, subjectId, name, empId, fileName, res, callback) {
    request({
        method: consts.post,
        url: consts.URL+'enroll',
        headers: consts.headerDetails,
        body: JSON.stringify({image: img, subject_id: subjectId, gallery_name: consts.gallery_name})        
    }, function (error, response, kairosResult) {
        kairosResult = JSON.parse(kairosResult);
        if(kairosResult.hasOwnProperty("Errors")){
            callback(false);
        } else {
            enrollInDB(name, empId, fileName, subjectId, res, function(result){
                if(result == false){
                    callback(false);
                } else {
                    callback(true);
                }
            })
        }
    })
}

exports.recognizeInKairos = function(img, res) {
    let data = {
        name: "",
        empId: "",
        subjectId: "",
        confidence: "",
        matchStatus: false,
        img: img,
        errorMessage: ""
    }

    // saveRequest(img, function(saveResponse) {
    //     if(saveResponse) {
    //         console.log("Request saved");
    //     } else {
    //         console.log("Request failed to saved");
    //     }
    // });
    request({
        method: consts.post,
        url: consts.URL + 'recognize',
        headers: consts.headerDetails,
        body: JSON.stringify({ image: img, gallery_name: consts.gallery_name })
    }, function (error, response, kairosResult) {
        kairosResult = JSON.parse(kairosResult);
        if (kairosResult.hasOwnProperty("Errors")) {
            data.errorMessage = "Error from kairos"            
            saveResponse(data);
            res.status(406).send({ status: false, message: consts.fail, kairosResult });
        } else {
            if (kairosResult.images[0].transaction.status == "failure") {
                data.errorMessage = "Employee not found in kairos"                
                saveResponse(data);
                res.send({ status: false, message: "Employee Not Found", authentication: false, kairosMessage: kairosResult.images[0].transaction})
            } else {
                let confidence;
                Employee.findOne({ subjectId: kairosResult.images[0].transaction.subject_id }, function (err, queryResult) {
                        if (err) {
                            data.errorMessage = "User not found in DB"                            
                            saveResponse(data);
                            res.status(500).send({ status: false, message: consts.fail, err });
                        } else {
                            if (queryResult != null) {
                                
                                data.name = queryResult.name,
                                data.empId = queryResult.empId,
                                data.subjectId = kairosResult.images[0].transaction.subject_id,
                                data.confidence = kairosResult.images[0].transaction.confidence,
                                data.matchStatus = true,
                                data.img = img
                                saveResponse(data);
                                if (kairosResult.images[0].transaction.confidence >= 0.7)
                                    confidence = consts.high;
                                else if (kairosResult.images[0].transaction.confidence <= 0.7 && kairosResult.images[0].transaction.confidence >= 0.4)
                                    confidence = consts.medium;
                                else
                                    confidence = consts.low;
                                res.send({ status: true, message: consts.success, authentication: true, confidence: confidence, queryResult, kairosResult });
                            }
                        }
                })
            }
        }
    })
}

exports.galleryInKairos = function(callback) {
    request({
        method: consts.post,
        url: consts.URL + 'gallery/list_all',
        headers: consts.headerDetails
    }, function (error, response, result) {
        result = JSON.parse(result);
        console.log('Response:', result);
        callback(result);
    })
}

exports.employeeInKairos = function(res) {
    request({
        method: consts.post,
        url: consts.URL + 'gallery/view',
        headers: consts.headerDetails,
        body: JSON.stringify({ gallery_name: consts.gallery_name })
    }, function (error, response, result) {
        result = JSON.parse(result);
        console.log('Response:', result);
        if (result.hasOwnProperty("Errors")) {
            res.status(406).send({ status: false, message: consts.fail, result });
        } else {
            res.send({ status: true, message: consts.success, result });
        }
    })
}

exports.deleteGalleryInKairos = function(res, name) {
    request({
        method: consts.post,
        url: consts.URL + 'gallery/remove',
        headers: consts.headerDetails,
        body: JSON.stringify({ gallery_name: name })
    }, function (error, response, result) {
        result = JSON.parse(result);
        console.log('Response:', result);
        if (result.hasOwnProperty("Errors")) {
            res.status(406).send({ status: false, message: consts.fail, result });
        } else {
            Employee.remove({}, function (err, removeResult) { });
            res.send({ status: true, message: consts.success, result });
        }
    })
}

exports.deleteEmployeeInKairos = function(res, subjectIds) {
    async.every(subjectIds, function(subjectId, callback) {
        request({
            method: consts.post,
            url: consts.URL + 'gallery/remove_subject',
            headers: consts.headerDetails,
            body: JSON.stringify({ gallery_name: consts.gallery_name, subject_id: subjectId })
        }, function (error, response, kairosResult) {
            kairosResult = JSON.parse(kairosResult);
            if (kairosResult.hasOwnProperty("Errors")) {
                res.status(406).send({ status: false, message: consts.fail, kairosResult });
            } else {
                callback(null, !error)
            }
        })
    }, function(err, result) {
        if (err) {
            console.log(err)
        }
        res.send({ status: true, message: consts.success});
    });


    // var count = 0;
    // for (let i = 0; i < subjectId.length; i++) {
    //     request({
    //         method: consts.post,
    //         url: consts.URL + 'gallery/remove_subject',
    //         headers: consts.headerDetails,
    //         body: JSON.stringify({ gallery_name: consts.gallery_name, subject_id: subjectId[i] })
    //     }, function (error, response, result) {
    //         result = JSON.parse(result);
    //         console.log('Response:', result);
    //         if (result.hasOwnProperty("Errors")) {
    //             res.status(406).send({ status: false, message: consts.fail, result });
    //         } else {
    //             count = count + 1;
    //         }
    //     })
    //     console.log(i)
    //     console.log(count)
    //     console.log(subjectId.length)
    //     if (i + 1 == subjectId.length) {
    //         res.send({ status: true, message: consts.success, count: count });
    //     }
    // }
}

function enrollInDB(name, empId, fileName, subjectId, res, callback) {
    Employee.count({empId: empId}, function(err, empCount){
        console.log("------empCount = "+empCount)
        if(err){
            callback(false);
        } else {
            if(empCount == 0){
                var employee = new Employee({
                    name: name,
                    empId: empId,
                    image: fileName,
                    subjectId: subjectId
                });
                employee.save(function (err, result) {
                    if (err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                })                
            } else {
                Employee.update({empId: empId},{$push:{subjectId: subjectId, image: fileName}}, function(err, updateResult){
                    if (err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                })                
            }
        }
    }) 
}

// function saveRequest(img, callback) {
//     var log = new Logs({
//         image: img
//     });
//     log.save(function(err, result) {
//         if(err) {
//             callback(false);
//         } else {
//             callback(true);
//         }
//     });
// }

function saveResponse(data) {
    var log = new Logs({
        image: data.img,
        name : data.name,
        empId : data.empId,
        subjectId: data.subjectId,
        confidence: data.confidence,
        matchStatus: data.matchStatus,
        errorMessage: data.errorMessage,
    });
    log.save(function(err, result) {
        if(err) {
            console.log("Response not saved");
        } else {
            console.log("Response saved");
        }
    });
}