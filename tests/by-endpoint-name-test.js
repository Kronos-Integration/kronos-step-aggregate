import test from 'ava';
import { SendEndpoint } from 'kronos-endpoint';
import { setup } from './util';

test('by-endpoint-name', async t => {
  const { owner, step } = await setup('by-endpoint-name');

  const result = await step.endpoints.in.receive({});

  t.deepEqual(result, {
    out1: { out1: 'value of out1' },
    out2: { out2: 'value of out2' }
  });
});
