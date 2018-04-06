# qr-amazing-race

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> An implementation of the Amazing Race that consists of teams answering questions and collecting hints to other stations by scanning QR codes at each station. Backend features include real-time status and updates to facilitate game masters.

Frontend using ReactJS bootstrapped by [create-react-app](https://github.com/facebook/create-react-app) and Redux, API served using ExpressJS, and [mLab](https://mlab.com/) MongoDB as database.

Socket.io is for real time tracking on status page.

[Telegram Bot API](https://core.telegram.org/bots/api) used for real time updates to a Telegram chat group.

App is configured for deployment to [Heroku](https://core.telegram.org/bots/api).

## Table of Contents

* [Background](#background)
* [Install](#install)
* [Usage](#usage)
* [Maintainers](#maintainers)
* [Contribute](#contribute)
* [License](#license)

## Background

Developed in a rush over a few days of free time due to last minute idea by events committee.

Hardcoded constants scattered in code due to limited timeframe for development, ideally a config file or collection should be used.

## How the game works

Teams have to visit stations in a certain order, guided by hints to the next station gained through answering questions at each station.

Each station will have a qr code that simply directs to a url "http://\<your url here\>/\<station_uuid\>"

Each team is given a password that is used to unlock each station after scanning the qr code.

The app itself tracks the stations unlocked by each team, according to a predefined order. If the team has not unlocked a station, it alerts with a "Wrong Station" message.

Updates are provided to a Telegram chat group when a team completes a station.

## Install

1.  `npm install`
2.  Setup questions according to Station model in `models/Stations.js`
3.  Setup passwords and station order for each team in `config/game.js`
4.  Configure Mongo URI, Telegram Token and Chat ID in `config/dev.js`

## Usage

```
npm run dev
```

### Frontend routes

/:uuid - Stations

/activity - Activity log table for all team actions

/status - Status table to show each team's status

## Maintainers

[@gpng](https://github.com/gpng)

## Contribute

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2018 Png Weijie Gerald
