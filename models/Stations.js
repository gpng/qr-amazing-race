const mongoose = require('mongoose');
const { Schema } = mongoose;

const StationSchema = new Schema({
  uuid: String,
  question: String,
  answers: [String],
  correctAnswer: String,
  teams: [Number],
  stationNumber: Number,
  hint: String
});

mongoose.model('station', StationSchema);

/*
Stations
0: d3abd0bc-75b1-4ef6-bd89-d8bb3b537261
1: 90af0dfc-6cb7-4933-b0fa-7e997dd3331e
2: 2dbc6820-30c5-4369-acab-194040d59e07
*/
