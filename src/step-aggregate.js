import {} from 'kronos-endpoint';
import { Step } from 'kronos-step';

export class AggregateStep extends Step {
  static get name() {
    return 'kronos-aggregate';
  }
  static get description() {
    return 'aggregates requests from several endpoints';
  }

  static get configurationAttributes() {
    return createAttributes({
      aggregate: {
        type: 'string',
        description:
          'flat means all results will be collected as attributes in the resulting object',
        default: 'flat'
      }
    });
  }

  constructor(...args) {
    super(...args);

    const outEndpoints = this.outEndpoints;

    this.inEndpoints.filter(e => !e.isDefault).forEach(
      ie =>
        (ie.receive = async request => {
          const responses = await Promise.all(
            outEndpoints.map(o => o.receive(request))
          );
          if (this.aggregate === 'flat') {
            return responses.reduce((a, c) => Object.assign(a, c), {});
          }

          const result = {};
          for (let i = 0; i < outEndpoints.length; i++) {
            result[outEndpoints[i].name] = responses[i];
          }
          return result;
        })
    );
  }

  /*
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
      }
      */
}

export async function registerWithManager(manager) {
  return manager.registerStep(AggregateStep);
}
