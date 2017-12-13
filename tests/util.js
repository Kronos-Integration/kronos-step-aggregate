export function nameIt(name) {
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

export function StreamPromise(stream, result) {
  return new Promise((fullfilled, rejected) =>
    stream.on('end', () => fullfilled(result))
  );
}

export async function setup(mode, done) {
  const owner = {};
  const step;
  
  /*
    aggregate = .createInstance(
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
  return { owner, step };
}
