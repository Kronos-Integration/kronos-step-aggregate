/* jslint node: true, esnext: true */

'use strict';

exports.registerWithManager = manager => manager.registerStep(Object.assign({}, require('kronos-step').Step, {
	name: 'kronos-aggregate',
	description: 'aggregates requests from several endpoints',

	initialize(manager, name, stepDefinition, props) {
		props.aggregate = {
			value: stepDefinition.aggregate || 'flat'
		};
	},

	_start() {
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
