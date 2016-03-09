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


let stdoutRequest;
let stderrRequest;
let sys;
let manager;
let stdinEndpoint;
let stdoutEndpoint;

before(done => {
  ksm.manager({}, [require('../aggregate')]).then(m => {
    sys = m.steps['kronos-aggregate'].createInstance({
      name: "myStep",
      type: "kronos-aggregate"
    }, m);

    stdinEndpoint = new endpoint.SendEndpoint('stdin-test');
    stdinEndpoint.connected = sys.endpoints.stdin;

    stdoutEndpoint = new endpoint.ReceiveEndpoint('stdout-test');
    sys.endpoints.stdout.connected = stdoutEndpoint;

    stdoutEndpoint.receive = (request, before) => {
      //console.log(`stdout: ${before.info.id}`);
      stdoutRequest = request;
      //stdoutRequest.stream.pipe(process.stdout);
      return StreamPromise(stdoutRequest.payload, {
        id: before.info.id,
        name: 'stdout'
      });
    };

    const stderrEndpoint = new endpoint.ReceiveEndpoint('stderr-test');
    sys.endpoints.stderr.connected = stderrEndpoint;

    stderrEndpoint.receive = (request, before) => {
      stderrRequest = request;
      return StreamPromise(request.payload, {
        id: before.info.id,
        name: 'stderr'
      });
    };

    manager = m;
    done();
  });
});

it('test spec', () => {
  describe('static', () => testStep.checkStepStatic(manager, sys));

  describe('live-cycle', () => {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, sys, (step, state, livecycle, done) => {
      if (state === 'running' && !wasRunning) {
        wasRunning = true;
      }

      if (state === 'stopped' && wasRunning) {}

      done();
    });
  });
});
