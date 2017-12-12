import {} from 'kronos-endpoint';
import { Step } from 'kronos-step';

export class AggregateStep extends Step {
  static get name() {
    return 'kronos-aggregate';
  }
  static get description() {
    return 'aggregates requests from several endpoints';
  }
}

export async function registerWithManager(manager) {
  return manager.registerStep(AggregateStep);
}

/*
        props.aggregate = {
          value: definition.aggregate || 'flat'
        };
      },

      endpointOptions(name, def) {
        let options = {};

        const step = this;

        function outOpposite(f) {
          for (const en in step.endpoints) {
            const e = step.endpoints[en];
            if (e.isOut && e.opposite && !e.isDefault) {
              f(e.opposite);
            }
          }
        }

        if (def.opposite) {
          if (def.in) {
            options.opposite = new endpoint.SendEndpoint(name, this, {
              hasBeenOpened() {
                step.info({
                  endpoint: this.identifier,
                  state: 'open'
                });

                if (this.aggregate === 'flat') {
                  outOpposite(e => (e.receive = this.receive));
                } else {
                  outOpposite(
                    e =>
                      (e.receive = request =>
                        this.receive({
                          [e.name]: request
                        }))
                  );
                }
              },
              willBeClosed() {
                step.info({
                  endpoint: this.identifier,
                  state: 'close'
                });

                outOpposite(e => (e.receive = undefined));
              }
            });
          } else {
            options.createOpposite = true;
          }
        }

        return options;
      },

      finalize() {
        const byEndpoint = true;
        const inEndpoints = [];
        const outEndpoints = [];

        for (const en in this.endpoints) {
          const e = this.endpoints[en];
          if (!e.isDefault) {
            if (e.isIn) {
              inEndpoints.push(e);
            }
            if (e.isOut) {
              outEndpoints.push(e);
            }
          }
        }

        inEndpoints.forEach(
          ie =>
            (ie.receive = request =>
              Promise.all(outEndpoints.map(o => o.receive(request))).then(
                responses => {
                  const result = {};
                  if (this.aggregate === 'flat') {
                    responses.forEach(r => Object.assign(result, r));
                  } else {
                    for (let i = 0; i < outEndpoints.length; i++) {
                      result[outEndpoints[i].name] = responses[i];
                    }
                  }
                  return Promise.resolve(result);
                }
              ))
        );

*/

