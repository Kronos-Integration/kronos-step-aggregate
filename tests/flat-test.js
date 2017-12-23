import test from 'ava';
import { SendEndpoint } from 'kronos-endpoint';
import { setup } from './util';

test('flat', async t => {
  const { owner, step, inEndpoint } = await setup('flat');

  step.endpoints.in.opposite.receive = request => {
    t.deepEqual(request, {
      out1: 'opposite value of out1'
    });
  };

  step.endpoints.in.opposite.receive = request =>
    console.log(`opposite receive: ${request}`);

  const result = await step.endpoints.in.receive({});

  t.deepEqual(result, {
    out1: 'value of out1',
    out2: 'value of out2'
  });

  step.endpoints.in.opposite.receive = undefined;
});
