/* jslint node: true, esnext: true */

"use strict";

exports.registerWithManager = manager => manager.registerStep(Object.assign({}, require('kronos-step').Step, {
	"name": "kronos-aggrgate",
	"description": "aggrgates requests from several endpoints",
	"endpoints": {
		"in": {
			"in": true
		}
	},
}));
