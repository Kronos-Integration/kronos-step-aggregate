/* global describe, it, xit, before */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const testStep = require('kronos-test-step'),
  ksm = require('kronos-service-manager'),
  endpoint = require('kronos-endpoint');

/* simple owner with name */
function nameIt(name) {
  return {
    toString() {
        return name;
      },
      get name() {
        return name;
      },
      endpointIdentifier(e) {
        if (name === undefined) return undefined;
        return `${this.name}/${e.name}`;
      }
  };
}

function StreamPromise(stream, result) {
  return new Promise((fullfilled, rejected) => stream.on('end', () => fullfilled(result)));
}

let aggregate, manager, inEndpoint;

function setup(mode, done) {
  function _setup(m, mode) {
    aggregate = m.steps['kronos-aggregate'].createInstance({
      name: 'myStep',
      type: 'kronos-aggregate',
      aggregate: mode,
      endpoints: { in : { in : true, opposite: true
        },
        out1: {
            out: true,
            opposite: true
          },
          out2: {
            out: true,
            opposite: false
          }
      }
    }, m);

    inEndpoint = new endpoint.SendEndpoint('in-test');
    inEndpoint.connected = aggregate.endpoints.in;

    aggregate.endpoints.in.opposite.receive = request => {
      console.log(`in.opposite.receive: ${JSON.stringify(request)}`);
    };

    for (const o of['out1', 'out2']) {
      const oe = aggregate.endpoints[o];
      const outEndpoint = new endpoint.ReceiveEndpoint(`${o}-test`, nameIt('test'));
      oe.connected = outEndpoint;

      //console.log(`${o} -> ${outEndpoint}`);

      outEndpoint.receive = request => {
        if (oe.opposite) {
          oe.opposite.receive({
            [o]: `opposite value of ${o}`
          });
        }

        return Promise.resolve({
          [o]: `value of ${o}`
        });
      };
    }
  }

  if (manager) {
    _setup(manager, mode);
    done();
  } else {
    ksm.manager({}, [require('../aggregate')]).then(m => {
      _setup(m, mode);
      manager = m;
      done();
    });
  }
}

describe('flat', () => {
  before(done => {
    setup('flat', done);
  });

  it('response', () => {
    describe('static', () => testStep.checkStepStatic(manager, aggregate));
    describe('live-cycle', () => {
      let wasRunning = false;
      testStep.checkStepLivecycle(manager, aggregate, (step, state, livecycle, done) => {

        if (state === 'running' && !wasRunning) {
          wasRunning = true;

          inEndpoint.receive({}).then(r => {
            console.log(`response: ${JSON.stringify(r)}`);
            /*assert.deepEqual(r, {
              out1: 'value of out1',
              out2: 'value of out2'
            });
            */
            done();
          }).catch(e => console.log(e));

          return;
        }
        done();
      });
    });
  });
});


describe('by-endpoint-name', () => {
  before(done => {
    setup('by-endpoint-name', done);
  });
  it('response', () => {
    describe('static', () => testStep.checkStepStatic(manager, aggregate));
    describe('live-cycle', () => {
      let wasRunning = false;
      testStep.checkStepLivecycle(manager, aggregate, (step, state, livecycle, done) => {

        step.endpoints.in.opposite.receive = request => {
          assert.deepEqual(request, {
            out1: {
              out1: 'opposite value of out1'
            }
          });
        };

        if (state === 'running' && !wasRunning) {
          wasRunning = true;

          inEndpoint.receive({}).then(r => {
            //console.log(`response: ${JSON.stringify(r)}`);
            assert.deepEqual(r, {
              out1: {
                out1: 'value of out1'
              },
              out2: {
                out2: 'value of out2'
              }
            });
            done();
          });

          return;
        }

        done();
      });
    });
  });
});
