'use strict';
var expect = require("chai").expect;
var Preference = require("../lib/preference.js");

describe("Preference", function()
{
	describe('#dialog()' , function()
	{
		it('should return false if type is not presented internally' , function()
		{
			expect(Preference.dialog('wrong' , 'cn')).to.equal(false);
		});
	});
});
