function setup(mode, done) {
  ksm.manager({}, [require('../aggregate')]).then(m => {
    manager = m;

    aggregate = manager.steps['kronos-aggregate'].createInstance(
      {
        name: 'myStep',
        type: 'kronos-aggregate',
        aggregate: mode,
        endpoints: {
          in: {
            in: true,
            opposite: true
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
      },
      manager
    );

    inEndpoint = new endpoint.SendEndpoint('in-test', nameIt('test'), {
      createOpposite: true
    });

    inEndpoint.connected = aggregate.endpoints.in;

    aggregate.endpoints.in.opposite.receive = request => {
      console.log(`in.opposite.receive: ${JSON.stringify(request)}`);
    };

    for (const o of ['out1', 'out2']) {
      const oe = aggregate.endpoints[o];
      const outEndpoint = new endpoint.ReceiveEndpoint(
        `${o}-test`,
        nameIt('test')
      );
      oe.connected = outEndpoint;

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
    done();
  });
}

describe('by-endpoint-name', () => {
  before(done => {
    setup('by-endpoint-name', done);
  });

  it('response', () => {
    describe('static', () => testStep.checkStepStatic(manager, aggregate));
    describe('live-cycle', done => {
      let wasRunning = false;
      testStep.checkStepLivecycle(
        manager,
        aggregate,
        (step, state, livecycle, done) => {
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
        }
      );

      inEndpoint.opposite.receive = undefined;
    });
  });
});
