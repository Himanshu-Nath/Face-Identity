var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name : String,
    empId : { type: Number, unique: true },
    role : String,
    image: [],
    subjectId: [],
    cot: {type: Date, default: Date.now},
    mot: {type: Date, default: Date.now}
});
mongoose.model('employee', UserSchema);