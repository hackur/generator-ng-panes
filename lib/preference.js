'use strict';
/**
 * 2015-08-26 new feature
 * Save user project preference.
 * Check for ~/.panes/preference.json
 * if found then show them list of project before
 * if not at the end of generate project, they will be given a chance to
 * store project.
 */
var fs = require('fs');
var path = require('path');
var existsFile = require('exists-file');
var _ = require('underscore');

var filename = '~/.panes/ng-panes-preference.json';
var Preference = module.exports;

/**
 * allow user to set a new filename internal use for our own save preference
 */
Preference.set = function(newFileName)
{
	filename = newFileName;
};

/**
 * keep everything in one place
 */
Preference.dialog = function(that , cb , lang)
{
	var firstMsg = (lang==='cn') ? '找到你之前的项目设置' : 'Found your project setting';

	var finalMsg = (lang==='cn') ? '你想把这个项目的设置保存吗?' : 'Would you like to save this project setting?';

};


/**
 * search for preference json file
 */
Preference.find = function()
{
	if (existsFile(filename)) {
		var file_content = fs.readFileSync(filename);
		return JSON.parse(file_content);
	}
	return false;
};

/**
 * save preference json file
 */
Preference.save = function(json)
{
	try {
		var data = JSON.stringify(json);
		return fs.writeFileSync(filename, data);
	} catch(e) {
		console.log(e);
		return false;
	}
};

/**
 * update preference json file @TODO
 */
Preference.update = function(fileIdx , json)
{
	var data = Preference.find();
	if (!_.isUndefined(data[fileIdx])) {
		var newData = _.merge(data[fileIdx] , json);
	}
	return false;
};
