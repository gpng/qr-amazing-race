const mongoose = require('mongoose');
const { Schema } = mongoose;

const StationSchema = new Schema({
  uuid: String,
  question: String,
  answers: [String],
  correctAnswer: String,
  teams: [Number]
});

mongoose.model('station', StationSchema);

/*
station  0: d3abd0bc-75b1-4ef6-bd89-d8bb3b537261

*/
