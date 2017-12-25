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

  for (const o of ['out1', 'out2']) {
    const oe = step.endpoints[o];
    const outEndpoint = new ReceiveEndpoint(`${o}-test`, nameIt('test'));
    oe.connected = outEndpoint;

    outEndpoint.receive = async request => {
      return {
        [o]: `value of ${o}`
      };
    };
  }

  return { owner, step, inEndpoint };
}
