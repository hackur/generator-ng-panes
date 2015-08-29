'use strict';
var expect = require("chai").expect;
var Dot = require("../lib/dot.js");

describe("Dot", function()
{
	it('should have properties' , function()
	{
		var results = new Dot({dontRun: true , color: 'yellow'});

		expect(results).to.have.a.property('color', 'yellow');
	});
});
