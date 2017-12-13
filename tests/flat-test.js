import {SendEndpoint} from 'kronos-endpoint';

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
  return new Promise((fullfilled, rejected) =>
    stream.on('end', () => fullfilled(result))
  );
}

let aggregate, inEndpoint, manager;

async function setup(mode, done) {
  const owner = {};

  /*
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
  });
*/
  return {owner, step};

}

test('flat', t => {
  {} = await setup('flat');

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

            inEndpoint.opposite.receive = request => {
              console.log(`opposite receive: ${request}`);
            };

            inEndpoint.receive({}).then(r => {
              assert.deepEqual(r, {
                out1: 'value of out1',
                out2: 'value of out2'
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
