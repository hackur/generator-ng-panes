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

var dir = '.panes';
var filename = path.join(dir , 'ng-panes-preference.json');
var Preference = module.exports;

/**
 * check where is the user directory
 * FROM: http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
 */
var getUserHome = function()
{
   return process.env.HOME || process.env.USERPROFILE;
};

/**
 * allow user to set a new filename internal use for our own save preference
 */
Preference.set = function(newFileName)
{
	file = newFileName;
};

/**
 * keep everything in one place
 */
Preference.dialog = function(type , lang)
{
    var msg = {};
	msg.first = (lang==='cn') ? '找到你之前的项目设置' : 'Found your project setting';
	msg.final = (lang==='cn') ? '你想把这个项目的设置保存吗?' : 'Would you like to save this project setting?';
    return (msg[type] ? (msg[type][lang] ? msg[type][lang] : false) : false);
};

/**
 * search for preference json file
 */
Preference.find = function()
{
	var home = getUserHome();
	var search = path.join(home , filename);
	if (existsFile(search)) {
		return require(search);
	}
	return false;
};

/**
 * save preference json file
 */
Preference.save = function(json , callback)
{
	try {
		var key = (new Date()).toUTCString();
		var savedData = Preference.find();
		var toSave = {};
		toSave[key] = json;
		var data = toSave;
		if (savedData!==false) {
			data = _.merge(savedData , toSave);
		}
		var home = getUserHome();
		var _path = path.join(home , dir);

		if (!existsFile(_path)) {
			fs.mkdirSync(_path);
		}
		return fs.writeFile(path.join(home , filename) , JSON.stringify(data , null , 2) , callback);
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
