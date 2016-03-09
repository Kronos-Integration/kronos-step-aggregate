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

    for (const o of['out1', 'out2']) {
      const outEndpoint = new endpoint.ReceiveEndpoint(`${o}-test`);
      aggregate.endpoints[o].connected = outEndpoint;
      outEndpoint.receive = request => {
        return Promise.resolve({
          [o]: `value of ${o}`
        });
      };
    }

    manager = m;
    done();
  }).catch(console.log);
});

it('test spec', () => {
  describe('static', () => testStep.checkStepStatic(manager, aggregate));

  describe('live-cycle', () => {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, aggregate, (step, state, livecycle, done) => {

      if (state === 'running' && !wasRunning) {
        wasRunning = true;

        inEndpoint.receive({}).then(r => {
          assert.deepEqual(r, {
            "out1": "value of out1",
            "out2": "value of out2"
          });
          //console.log(`response: ${JSON.stringify(r)}`);
          done();
        });

        return;
      }

      done();
    });
  });

});
