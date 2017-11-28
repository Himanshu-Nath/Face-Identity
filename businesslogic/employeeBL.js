require('../models/employee');
var Employee = mongoose.model('employee');
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
                console.log(result)
                if(result == false){
                    callback(false);
                } else {
                    callback(true);
                }
            })
        }
    })
}

function enrollInDB(name, empId, fileName, subjectId, res, callback) {
    Employee.count({empId: empId}, function(err, empCount){
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


exports.recognizeInKairos = function(img, res) {
    let matchStatus = false;
    request({
        method: consts.post,
        url: consts.URL + 'recognize',
        headers: consts.headerDetails,
        body: JSON.stringify({ image: img, gallery_name: consts.gallery_name })
    }, function (error, response, kairosResult) {
        kairosResult = JSON.parse(kairosResult);
        if (kairosResult.hasOwnProperty("Errors")) {
            res.status(406).send({ status: false, message: consts.fail, kairosResult });
        } else {
            if (kairosResult.images[0].transaction.status == "failure") {
                res.send({ status: false, message: "Employee Not Found", authentication: false, kairosMessage: kairosResult.images[0].transaction})
            } else {
                let confidence;
                Employee.findOne({ subjectId: kairosResult.images[0].transaction.subject_id }, function (err, queryResult) {
                        if (err) {
                            res.status(500).send({ status: false, message: consts.fail, err });
                        } else {
                            if (queryResult != null) {
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

exports.deleteEmployeeInKairos = function(res, subjectId) {
    var count = 0;
    for (let i = 0; i < subjectId.length; i++) {
        request({
            method: consts.post,
            url: consts.URL + 'gallery/remove_subject',
            headers: consts.headerDetails,
            body: JSON.stringify({ gallery_name: consts.gallery_name, subject_id: subjectId[i] })
        }, function (error, response, result) {
            result = JSON.parse(result);
            console.log('Response:', result);
            if (result.hasOwnProperty("Errors")) {
                res.status(406).send({ status: false, message: consts.fail, result });
            } else {
                count = count + 1;
            }
        })
        console.log(i)
        console.log(count)
        console.log(subjectId.length)
        if (i + 1 == subjectId.length) {
            res.send({ status: true, message: consts.success, count: count });
        }
    }
}