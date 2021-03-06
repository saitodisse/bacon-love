'use strict';

var verify = require('../../verify.js');
var Bacon = require('baconjs');
var _ = require('lodash');

var clicks = new Bacon.Bus();
var asyncTask = new Bacon.Bus();
var startAsyncTask = function () {
  return asyncTask;
};

function invert(fun) {
  return function (v) {
    return fun(!v);
  };
}

var run = {
  input: [clicks, startAsyncTask],
  expect: function (streams, ex, assert) {
    var unsub = streams
      .sampledBy(clicks.skip(1))
      .onValue(assert);

    clicks.push(1);
    clicks.push(2);
    unsub();
  }
};

var testing = {
  'Should not display spinner while idle': {
    input: run.input,
    expect: function (streams, ex, assert) {
      var unsub = streams
        .onValue(invert(assert));
      unsub();
    }
  },
  'Should display spinner while waiting for result of async task': {
    input: run.input,
    expect: function (streams, ex, assert) {
      var unsub = streams
        .sampledBy(clicks)
        .onValue(assert);

      clicks.push(1);
      unsub();
    }
  },
  'Should not display spinner when task has returned': {
    input: run.input,
    expect: function (streams, ex, assert) {
      var unsub = streams
        .sampledBy(asyncTask)
        .onValue(invert(assert));

      clicks.push(1);
      asyncTask.push(1);
      unsub();
    }
  },
  'Should display spinner when first task has returned while waiting for second task': {
    input: run.input,
    expect: function (streams, ex, assert) {
      var unsub = streams
        .sampledBy(clicks.skip(1))
        .onValue(assert);

      clicks.push(1);
      asyncTask.push(1);
      clicks.push(1);
      unsub();
    }
  }
};

module.exports = verify(testing, run);
