# travis-benchmark

Generate json results for [benchmark.js](https://github.com/bestiejs/benchmark.js).

[![NPM](https://img.shields.io/npm/v/travis-benchmark.svg)](https://www.npmjs.com/package/travis-benchmark)
[![Build Status](https://travis-ci.org/evolvator/travis-benchmark.svg?branch=master)](https://travis-ci.org/evolvator/travis-benchmark)

## About

- Dont work outside the travis environment.
- Write results to `buildId.json` file of `process.env.TJGL_BRANCH` branch in current or `process.env.TJGL_REPO_SLUG` git repository. Create file if not exists. 
- Config same as in [travis-json-git-log](https://github.com/evolvator/travis-json-git-log), but with `build` and `job` fields.

## Example

```js
var Benchmark = require('benchmark');
var tb = require('travis-benchmark');

var suite = new Benchmark.Suite('suiteName');
tb.wrapSuite(suite/*, callback, config*/);
.run({ 'async': true });
```

or

```js
var Benchmark = require('benchmark');
var tb = require('travis-benchmark');

var suite = new Benchmark.Suite('suiteName');
suite.add('benchmarkName', function() {})
.on('complete', function(event) {
  var data = exports.parseSuite(event);
  tjgl.tjgl(
    _.extend({}, { data, filename: process && process.env && process.env.TRAVIS_BUILD_ID }, config),
    function(error, context, config) {}
  );
})
.run({ 'async': true });
```

## Results

Result json file will contains:

- build: number
- job: number
- platform: string
- version: string
- layout: string?
- os: string
- suite: string?
- benchmark: string?
- speed: number
- distortion: number
- sampled: number
- percent: number
- error?: string
