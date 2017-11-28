var Schema   = mongoose.Schema;

var LogsSchema = new Schema({
    name : String,
    empId : Number,
    image: String,
    subjectId: [],
    confidence: Number,
    matchStatus: Boolean,
    errorMessage: String,
    inTime: Date,
    outTime: Date,
    cot: {type: Date, default: Date.now},
    mot: {type: Date, default: Date.now}
});
mongoose.model('logs', LogsSchema);