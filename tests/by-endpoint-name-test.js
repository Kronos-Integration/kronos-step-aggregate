import test from 'ava';
import { SendEndpoint } from 'kronos-endpoint';
import { setup } from './util';

test('by-endpoint-name', async t => {
  const { owner, step } = await setup('flat');

  step.endpoints.in.opposite.receive = request => {
    t.deepEqual(request, {
      out1: {
        out1: 'opposite value of out1'
      }
    });
  };

  const result = await inEndpoint.receive({});
  t.deepEqual(r, {
    out1: {
      out1: 'value of out1'
    },
    out2: {
      out2: 'value of out2'
    }
  });

  inEndpoint.opposite.receive = undefined;
});