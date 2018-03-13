const mongoose = require('mongoose');
const to = require('await-to-js').to;
const Stations = mongoose.model('station');
const Activity = mongoose.model('activity');
const shuffle = require('lodash/shuffle');
const forEachRight = require('lodash/forEachRight');
const find = require('lodash/find');
const includes = require('lodash/includes');

const passwords = require('../config/game').passwords;
const order = require('../config/game').order;

module.exports = (app, io) => {
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
            answers: shuffle(existingStation.answers),
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
        logActivity({
          uuid: station_id,
          team: team,
          correct: true
        });
        res.send({
          success: true,
          data: {
            hint: nextStation.hint
          }
        });
      } else {
        logActivity({
          uuid: station_id,
          team: team,
          correct: true
        });
        res.send({
          success: true,
          data: { hint: 'congratulations' }
        });
      }
    } else {
      logActivity({
        uuid: station_id,
        team: team,
        correct: false
      });
      res.send({
        success: false,
        data: 'wrong answer'
      });
    }
  });

  /**
   * Resets all teams to [] except station 0
   */
  app.get('/reset', async (req, res) => {
    let err, stations;
    [err, stations] = await to(Stations.find());
    res.send('reset');
    stations.forEach(station => {
      if (station.stationNumber !== 0) {
        station.teams = [];
        station.save();
      }
    });
  });

  const logActivity = async activity => {
    let err, station;
    [err, station] = await to(
      Stations.findOne({
        uuid: activity.uuid
      })
    );
    if (err) {
      console.log('error', err);
    }
    if (station) {
      io.emit('NewActivity');
      Activity.create({
        station: station.stationNumber,
        correct: activity.correct,
        team: activity.team
      });
    }
  };

  app.get('/api/activity', async (req, res) => {
    let err, result;
    [err, result] = await to(Activity.find());
    if (err) {
      console.log('error getting activities', err);
      res.send({
        success: false,
        data: 'error connecting to database'
      });
    }
    if (result) {
      res.send({ success: true, data: result });
    } else {
      res.send({ success: false, data: [] });
    }
  });

  app.get('/api/results', async (req, res) => {
    let err, result;
    [err, result] = await to(Activity.find());
    if (err) {
      console.log('error getting activities', err);
      res.send({
        success: false,
        data: 'error connecting to database'
      });
    }
    if (result) {
      let resArr = [];
      for (let i = 1; i <= passwords.length; i++) {
        let teamActivities = result.filter(x => x.team === i);
        resArr.push({
          team: i,
          right_answers: teamActivities.filter(x => x.correct === true).length,
          wrong_answers: teamActivities.filter(x => x.correct === false).length
        });
      }
      res.send({ success: true, data: resArr });
    } else {
      res.send({ success: false, data: [] });
    }
  });

  app.get('/api/status', async (req, res) => {
    let err,
      result,
      resultArr = [];
    [err, result] = await to(Stations.find());
    if (err) {
      console.log('erring getting stations', err);
      res.send({
        success: false,
        data: 'error connecting to database'
      });
    }
    if (result) {
      for (let i = 0; i < order.length; i++) {
        const team = i + 1;
        let lastStation, nextStation;
        forEachRight(order[i], (stationNo, index) => {
          const station = find(result, { stationNumber: stationNo });
          if (station && includes(station.teams, team)) {
            nextStation = station;
            if (index === 0) {
              lastStation = {
                lastStationNumber: '',
                lastStationQuestion: ''
              };
            } else {
              const lastStationNumber = order[i][index - 1];
              lastStation = find(result, {
                stationNumber: lastStationNumber
              });
            }
            resultArr.push({
              team: team,
              lastStationNumber: lastStation.stationNumber,
              lastStationQuestion: lastStation.question,
              nextStationNumber: nextStation.stationNumber,
              nextStationQuestion: nextStation.question
            });
            return false;
          }
        });
      }
      res.send({ success: true, data: resultArr });
    }
  });
};
