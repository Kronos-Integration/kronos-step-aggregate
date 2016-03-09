/* global describe, it, xit, before */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const testStep = require('kronos-test-step'),
  ksm = require('kronos-service-manager'),
  endpoint = require('kronos-endpoint');

function StreamPromise(stream, result) {
  return new Promise((fullfilled, rejected) => stream.on('end', () => fullfilled(result)));
}


let aggregate;
let manager;
let inEndpoint;
let out1Endpoint;
let out2Endpoint;

before(done => {
  ksm.manager({}, [require('../aggregate')]).then(m => {
    aggregate = m.steps['kronos-aggregate'].createInstance({
      name: "myStep",
      type: "kronos-aggregate",
      endpoints: {
        "in": {
          "in": true
        },
        "out1": {
          "out": true
        },
        "out2": {
          "out": true
        }
      }
    }, m);

    inEndpoint = new endpoint.SendEndpoint('in-test');
    inEndpoint.connected = aggregate.endpoints.in;

    out1Endpoint = new endpoint.ReceiveEndpoint('out1-test');
    aggregate.endpoints.out1.connected = out1Endpoint;

    out1Endpoint.receive = (request, before) => {};

    manager = m;
    done();
  });
});

it('test spec', () => {
  describe('static', () => testStep.checkStepStatic(manager, aggregate));

  describe('live-cycle', () => {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, aggregate, (step, state, livecycle, done) => {
      if (state === 'running' && !wasRunning) {
        wasRunning = true;
      }

      if (state === 'stopped' && wasRunning) {}

      done();
    });
  });
});
