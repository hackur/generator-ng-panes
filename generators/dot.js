'use strict';
/**
 * create a dot loading images
 */

var chalk = require('chalk');
// var moment = require('moment');

// var q = require('q');
// var progress = require('progress');

/**
 * @param (object) config:
 *                        color: color you want to display according to chalk (default magenta),
 *                        str: what you want to use to show (default: .)
 *                        max: once it count to max restart clean and restart again? (@TODO)
 *                        beforeMsg: 'a message to show before start',
 *                        beforeMsgColor: color of message according to chalk
 */

var Dot = function(config)
{
	config = config || {};
	this.color = config.color || 'magenta';
	this.beginning = config.beginning || 'downloading';
	this.str   = config.str || '.';
	this.stream = config.stream || process.stderr;
	this.refresh = config.refresh || 1000;
	this.max = config.max || 60;
	this.interval = null;
	this.startTime = this.getSeconds();
	this.callback = config.callback || this.finishMsg;
	if (config.beforeMsg) {
		this.beforeMsg = config.beforeMsg;
	}
	if (config.beforeMsgColor) {
		this.beforeMsgColor = config.beforeMsgColor;
	}
	// run!
	this.run();
};
/**
 * start running
 */
Dot.prototype.run = function()
{
	var me = this;
	if (me.beforeMsg) {
		var color = me.beforeMsgColor || 'yellow';
		console.log(chalk[color](me.beforeMsg));
	}

	me.interval = setInterval(function()
	{
		var str = me.lastDraw || me.beginning;
		if (str.length >= me.max) {
			str = me.beginning;
		}
		else {
			str += me.str;
		}
		me.draw(str);
	},this.refresh);
}

Dot.prototype.getSeconds = function()
{
	return Math.round(new Date().getTime()/1000);
};

Dot.prototype.finishMsg = function()
{
	var now = this.getSeconds(),
		time = now - this.startTime;
	console.log('It took: ' + time + ' seconds, Bye!');
};

Dot.prototype.draw = function(str)
{
	if (this.lastDraw !== str) {
    	this.stream.cursorTo(0);
    	this.stream.write(str);
    	this.stream.clearLine(1);
    	this.lastDraw = str;
  	}
};

/**
 * idea from progress
 */
Dot.prototype.finish = function()
{
	clearInterval(this.interval);

    this.stream.clearLine();
    this.stream.cursorTo(0);

};

module.exports = Dot;
