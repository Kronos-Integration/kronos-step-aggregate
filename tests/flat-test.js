import test from 'ava';
import { SendEndpoint } from 'kronos-endpoint';
import { setup } from './util';

test('flat', async t => {
  const { owner, step } = await setup('flat');

  const result = await step.endpoints.in.receive({});

  t.deepEqual(result, {
    out1: 'value of out1',
    out2: 'value of out2'
  });
});
