exports.app_id =  "fd976ca9";
exports.app_key =  "09844479892df2413b595985a36cb2d4";
exports.gallery_name =  "ATMECS-Gallery";

exports.port = 5000;

exports.success = "SUCCESS";
exports.fail = "FAILED";
exports.added = "ADDED";
exports.deleted = "DELETED";
exports.file_upload = "File is uploaded Successfully";
exports.record_not_found = "Record not found";

exports.headerDetails = {
    'Content-Type': 'application/json',
    'app_id': exports.app_id,
    'app_key': exports.app_key
}

exports.post = "POST";
exports.get = "GET";
exports.put = "PUT";
exports.delete = "DELETE";

exports.URL = "https://api.kairos.com/";

exports.high = "HIGH";
exports.medium = "MEDIUM";
exports.low = "LOW";

exports.local_db_url = "mongodb://localhost/IOTFace";
exports.cloud_db_url = "mongodb://faceidentity:faceidentity@cluster0-shard-00-00-7i7ht.mongodb.net:27017,cluster0-shard-00-01-7i7ht.mongodb.net:27017,cluster0-shard-00-02-7i7ht.mongodb.net:27017/IOTFace?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin"