const mongoose = require('mongoose');
const to = require('await-to-js').to;
const Stations = mongoose.model('station');
const Activity = mongoose.model('activity');
const shuffle = require('lodash/shuffle');
const forEachRight = require('lodash/forEachRight');
const find = require('lodash/find');
const includes = require('lodash/includes');
const range = require('lodash/range');
const axios = require('axios');

const keys = require('../config/keys');
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
        sendTelegramUpdate(
          `Team ${team} has completed station ${
            existingStation.stationNumber
          }. Heading to station ${nextStationNumber}`
        );
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
        sendTelegramUpdate(`Team ${team} has completed station all stations.`);
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

  const sendTelegramUpdate = message => {
    const url = `https://api.telegram.org/bot${keys.botToken}/sendMessage`;
    axios.post(url, {
      chat_id: keys.chatId,
      text: message
    });
  };

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
      } else {
        station.teams = range(1, 26);
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
    res.send(await getResults());
  });

  const getResults = async () => {
    let err, result;
    [err, result] = await to(Activity.find());
    if (err) {
      console.log('error getting activities', err);
      return {
        success: false,
        data: 'error connecting to database'
      };
    }
    if (result) {
      let resArr = [];
      for (let i = 1; i <= passwords.length; i++) {
        let teamActivities = result.filter(x => x.team === i);
        const firstTiming = getTimeDiffBetweenStations(i, teamActivities, 1, 7);
        let completed = false;
        if (
          find(teamActivities, {
            correct: true,
            station: order[i - 1][order[i - 1].length - 1]
          })
        ) {
          completed = true;
        }
        // count points for answers
        let points = 0;
        if (teamActivities.filter(x => x.correct === true).length > 0) {
          order[i - 1].forEach(question => {
            const questionActivity = teamActivities.filter(
              x => x.station === question
            );
            if (questionActivity) {
              let thisPoints = 10;
              questionActivity.forEach(ans => {
                if (thisPoints > 0) {
                  if (!ans.correct) {
                    thisPoints -= 5;
                  }
                }
              });
              points += thisPoints;
            }
          });
        }
        resArr.push({
          team: i,
          right_answers: teamActivities.filter(x => x.correct === true).length,
          wrong_answers: teamActivities.filter(x => x.correct === false).length,
          total_timing: firstTiming || null,
          completed: completed,
          points: points
        });
      }
      return { success: true, data: resArr };
    } else {
      return { success: false, data: [] };
    }
  };

  const getTimeDiffBetweenStations = (teamNo, teamActivities, start, end) => {
    const startStation = find(teamActivities, {
      correct: true,
      station: order[teamNo - 1][start]
    });
    const endStation = find(teamActivities, {
      correct: true,
      station: order[teamNo - 1][end]
    });
    if (startStation && endStation) {
      return (
        new Date(endStation.created_at) - new Date(startStation.created_at)
      );
    }
    return null;
  };

  app.get('/api/status', async (req, res) => {
    res.send(await getStatus());
  });

  const getStatus = async () => {
    let err,
      result,
      resultArr = [];
    [err, result] = await to(Stations.find());
    if (err) {
      console.log('erring getting stations', err);
      return {
        success: false,
        data: 'error connecting to database'
      };
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
              stationsCompleted: index,
              lastStationNumber: lastStation.stationNumber,
              lastStationQuestion: lastStation.question,
              nextStationNumber: nextStation.stationNumber,
              nextStationQuestion: nextStation.question
            });
            return false;
          }
        });
      }
      const currentResults = await getResults();
      if (currentResults.success && currentResults.data) {
        for (let i = 0; i < resultArr.length; i++) {
          if (currentResults.data[i].completed) {
            resultArr[i].lastStationQuestion = resultArr[i].nextStationQuestion;
            resultArr[i].lastStationNumber = resultArr[i].nextStationNumber;
            resultArr[i].nextStationQuestion = '';
            resultArr[i].nextStationNumber = '';
          }
          resultArr[i] = {
            ...resultArr[i],
            ...currentResults.data[i]
          };
        }
      }
      return { success: true, data: resultArr };
    }
  };

  app.post(`/api/${keys.botToken}`, async (req, res) => {
    if (!req.body.message) {
      res.send();
      return;
    }
    if (
      req.body.message.new_chat_members &&
      req.body.message.new_chat_members.length > 0
    ) {
      sendTelegramUpdate(
        'Available Commands:\n/status <team no.> for team status\n/question <station no.> for question and answer\n/password <team no.> for password'
      );
      res.send();
      return;
    }
    if (!req.body.message || !req.body.message.text) {
      res.send();
      return;
    }
    const message = req.body.message.text.split(' ');
    if (message[0] === '/status') {
      if (message.length < 2) {
        sendTelegramUpdate('Enter a team number');
        res.send();
        return;
      }
      const teamNum = parseInt(message[1], 10);
      const allStatus = await getStatus();
      if (allStatus.success) {
        const team = find(allStatus.data, { team: teamNum });
        if (team) {
          let newMessage = `Team ${teamNum} completed ${
            team.stationsCompleted
          } stations. `;
          if (team.lastStationNumber || team.lastStationNumber >= 0) {
            newMessage += `Last completed station ${team.lastStationNumber} `;
            if (team.nextStationNumber !== '') {
              newMessage += `and heading to station ${
                team.nextStationNumber
              }. `;
            } else {
              newMessage += `and heading to campus 301. `;
            }
          }
          newMessage += `Number of correct answers: ${
            team.right_answers
          }, wrong answers: ${team.wrong_answers}. `;
          if (team.total_timing) {
            newMessage += `Total time taken: ${team.total_timing}ms`;
          }
          sendTelegramUpdate(newMessage);
        } else {
          sendTelegramUpdate('Unable to find team data');
        }
        res.send();
        return;
      }
    }
    if (message[0] === '/question') {
      if (message.length < 2) {
        sendTelegramUpdate('Enter a question number');
        res.send();
        return;
      }
      const stationNumber = message[1];
      const station = await Stations.findOne({ stationNumber: stationNumber });
      if (station) {
        sendTelegramUpdate(
          `Question for station ${stationNumber}: ${
            station.question
          }.\nAnswer: ${station.correctAnswer}`
        );
      } else {
        sendTelegramUpdate('Unable to find question');
      }
      res.send();
      return;
    }
    if (message[0] === '/password') {
      if (message.length < 2) {
        sendTelegramUpdate('Enter a team number');
        res.send();
        return;
      }
      const teamNumber = message[1];
      if (teamNumber > passwords.length) {
        sendTelegramUpdate('Unable to find team');
        res.send();
      }
      const password = passwords[teamNumber - 1];
      if (password) {
        sendTelegramUpdate(`Password for team ${teamNumber} is: ${password}`);
      } else {
        sendTelegramUpdate('Unable to find team');
      }
      res.send();
      return;
    }
    res.send();
    return;
  });

  // app.get('/shuffle', (req, res) => {
  //   const list = [1, 2, 3, 4, 5, 6];
  //   let resultList = [];
  //   for (let i = 0; i < 25; i++) {
  //     let shuffled = shuffle(list);
  //     while (resultList.indexOf(shuffled) > 0) {
  //       shuffled = shuffle(list);
  //     }
  //     resultList.push(shuffled);
  //   }
  //   console.log(resultList);
  //   res.send(resultList);
  // });
};
