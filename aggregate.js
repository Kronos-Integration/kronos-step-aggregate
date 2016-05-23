/* jslint node: true, esnext: true */

'use strict';

const endpoint = require('kronos-endpoint');

exports.registerWithManager = manager => manager.registerStep(Object.assign({}, require('kronos-step').Step, {
	name: 'kronos-aggregate',
	description: 'aggregates requests from several endpoints',

	initialize(manager, name, stepDefinition, props) {
		props.aggregate = {
			value: stepDefinition.aggregate || 'flat'
		};
	},

	endpointOptions(name, def) {
		let options = {};

		const step = this;

		if (def.opposite) {
			if (def.in) {
				options.opposite = new endpoint.SendEndpoint(name, this, {
					hasBeenOpened() {
							step.trace({
								endpoint: this,
								state: 'open'
							});
						},
						willBeClosed() {
							step.trace({
								endpoint: this,
								state: 'close'
							});
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

		// route back all opposite endpoints
		inEndpoints.forEach(ie => {
			if (ie.opposite) {
				outEndpoints.forEach(oe => {
					if (oe.opposite) {
						if (this.aggregate === 'flat') {
							oe.opposite.receive = ie.opposite.receive;
						} else {
							oe.opposite.receive = request => {
								// TODO how to enshure connection is present
								if (!ie.opposite.isConnected) return Promise.reject(new Error(`${ie.opposite} is not connected`));
								return ie.opposite.receive({
									[oe.name]: request
								});
							};
						}
					}
				});
			}
		});

		inEndpoints.forEach(ie =>
			ie.receive = request =>
			Promise.all(outEndpoints.map(o => o.receive(request))).then(responses => {
				const result = {};

				if (this.aggregate === 'flat') {
					responses.forEach(r => Object.assign(result, r));
				} else {
					for (let i = 0; i < outEndpoints.length; i++) {
						result[outEndpoints[i].name] = responses[i];
					}
				}
				return Promise.resolve(result);
			})
		);

		return Promise.resolve();
	}
}));
