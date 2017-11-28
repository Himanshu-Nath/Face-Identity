var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name : String,
    empId : Number,
    image: [],
    subjectId: [],
    cot: {type: Date, default: Date.now},
    mot: {type: Date, default: Date.now}
});
mongoose.model('employee', UserSchema);