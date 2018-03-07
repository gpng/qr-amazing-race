const mongoose = require('mongoose');
const to = require('await-to-js').to;

const passwords = require('../config/game').passwords;
const order = require('../config/game').order;
const Stations = mongoose.model('station');

module.exports = app => {
  app.get('/', (req, res) => {
    res.send('hello world');
  });

  /**
   * Verifies password
   * @param {string} password
   */
  app.post('/api/auth', async (req, res) => {
    const team = passwords.indexOf(req.body.password) + 1;
    const station_id = req.body.station_id;
    if (team !== 0) {
      let err, existingStation;
      [err, existingStation] = await to(
        Stations.findOne({
          teams: team,
          uuid: station_id
        })
      );
      if (err) {
        console.log(err);
        res.send({ success: false, data: 'error connecting to database' });
      }
      if (existingStation) {
        res.send({
          success: true,
          data: {
            question: existingStation.question,
            answers: existingStation.answers,
            team
          }
        });
      } else {
        res.send({
          success: false,
          data: 'wrong station'
        });
      }
    } else {
      res.send({ success: false, data: 'invalid password' });
    }
  });

  /**
   * Verifies answer station and team answer
   * @param {uuid} stationId
   * @param {integer} team
   * @param {integer} answer
   */
  app.post('/api/answer', async (req, res) => {
    const team = req.body.team;
    const station_id = req.body.station_id;
    const answer = req.body.answer;

    let err, existingStation;
    [err, existingStation] = await to(
      Stations.findOne({
        correctAnswer: answer,
        uuid: station_id
      })
    );
    if (err) {
      console.log(err);
      res.send({ success: false, data: 'error connecting to database' });
    }
    if (existingStation) {
      const nextStationIndex =
        order[team - 1].indexOf(existingStation.stationNumber) + 1;
      const nextStationNumber = order[team - 1][nextStationIndex];
      let nextStation;
      [err, nextStation] = await to(
        Stations.findOne({
          stationNumber: nextStationNumber
        })
      );
      if (err) {
        console.log(err);
        res.send({ success: false, data: 'error connecting to database' });
      }
      if (nextStation) {
        if (nextStation.teams.indexOf(team) === -1) {
          nextStation.teams.push(team);
          nextStation.save();
        }
        res.send({
          success: true,
          data: {
            hint: nextStation.hint
          }
        });
      } else {
        res.send({
          success: true,
          data: 'congratulations'
        });
      }
    } else {
      res.send({
        success: false,
        data: 'wrong answer'
      });
    }
  });
};
