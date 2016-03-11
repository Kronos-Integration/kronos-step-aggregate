/* jslint node: true, esnext: true */

"use strict";

exports.registerWithManager = manager => manager.registerStep(Object.assign({}, require('kronos-step').Step, {
	"name": "kronos-aggregate",
	"description": "aggregates requests from several endpoints",

	_start() {
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
				responses.forEach(r => Object.assign(result, r));
				return Promise.resolve(result);
			})
		);

		return Promise.resolve();
	}
}));
