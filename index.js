var platform = require('platform');
var http = require('http');
var fs = require('fs');
var jsonfile = require('jsonfile');

var _ = require('lodash');
var async = require('async');

var tjgl = require('travis-json-git-log');

exports.defaultConfig = {
  build:
    process && process.env && process.env.TRAVIS_BUILD_ID
      ? process.env.TRAVIS_BUILD_ID
      : undefined,
  job:
    process && process.env && process.env.TRAVIS_JOB_ID
      ? process.env.TRAVIS_JOB_ID
      : undefined
};

exports.parseSuite = function(event, config) {
  config = _.defaults(config, exports.defaultConfig);
  var results = [];
  var max = 0;
  for (var b = 0; b < event.currentTarget.length; b++) {
    var result = {
      build: config.build,
      job: config.job,
      platform: platform.name,
      version: platform.version,
      layout: platform.layout,
      os: platform.os.toString(),
      suite: event.currentTarget.name,
      benchmark: event.currentTarget[b].name,
      speed: parseInt(
        event.currentTarget[b].hz.toFixed(
          event.currentTarget[b].hz < 100 ? 2 : 0
        ),
        10
      ),
      distortion: event.currentTarget[b].stats.rme.toFixed(2),
      sampled: event.currentTarget[b].stats.sample.length
    };
    if (event.currentTarget[b].error) {
      result.error = event.currentTarget[b].error.stack;
    }
    if (result.speed > max) max = result.speed;
    results.push(result);
  }
  for (var result of results) {
    result.percent = Math.round((1 + (result.speed - max) / max) * 100);
  }
  return results;
};

exports.wrapSuite = function(suite, callback, config) {
  suite.on('cycle', function(event) {
    console.log(String(event.target), event.target.error ? event.target.error.stack : '');
  });
  suite.on('complete', function(event) {
    console.log(`Suite ${event.currentTarget.name} completed.`);
    var data = exports.parseSuite(event);
    tjgl.tjgl(
      _.extend({}, { data, filename: process && process.env && process.env.TRAVIS_BUILD_ID }, config),
      function(error, context, config) {
        if (callback) callback(error, context, config);
      }
    );
  });
};
