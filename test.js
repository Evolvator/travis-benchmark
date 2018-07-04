var Benchmark = require('benchmark');
var assert = require('chai').assert;
var tb = require('./');
var tjgl = require('travis-json-git-log');
var async = require('async');
var jsonfile = require('jsonfile');

describe('travis-benchmark', function() {
  it('lifecycle', function(done) {
    var time = new Date().valueOf();
    var suite = new Benchmark.Suite('lifecycle suite');
    suite.add('errored benchmark', function() {
      throw new Error('message');
    });
    suite.add('empty benchmark', function() {});
    tb.wrapSuite(suite, (error, _context, config) => {
      if (error) throw error;
      var context = {};
      async.series([
        tjgl.prepareDir(context, config),
        tjgl.clone(context, config),
        tjgl.findFile(context, config),
        (next) => {
          jsonfile.readFile(context.filepath, function(error, json) {
            assert.deepEqual(json, config.data);
            next();
          });
        },
        tjgl.clean(context, config),
      ], (error) => {
        if (error) throw error;
        done();
      });
    }, {
      repo_slug: 'evolvator/travis-benchmark',
      filename: ''+time
    });
    suite.run({ async: true });
  });
});
