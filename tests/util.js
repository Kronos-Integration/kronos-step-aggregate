import { AggregateStep } from '../src/step-aggregate';
import { SendEndpoint, ReceiveEndpoint } from 'kronos-endpoint';

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

export async function setup(mode) {
  const owner = {};

  const step = new AggregateStep(
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
    owner
  );

  const inEndpoint = new SendEndpoint('test-in', owner);
  inEndpoint.connected = step.endpoints.in;
  step.endpoints.in.opposite.receive = async request => {
    console.log(`in.opposite.receive: ${JSON.stringify(request)}`);
  };

  for (const o of ['out1', 'out2']) {
    const oe = step.endpoints[o];
    const outEndpoint = new ReceiveEndpoint(`${o}-test`, nameIt('test'));
    oe.connected = outEndpoint;

    outEndpoint.receive = async request => {
      if (oe.opposite) {
        oe.opposite.receive({
          [o]: `opposite value of ${o}`
        });
      }

      return {
        [o]: `value of ${o}`
      };
    };
  }

  return { owner, step, inEndpoint };
}
