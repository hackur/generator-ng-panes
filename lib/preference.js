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
var q = require('q');
// var child_process = require('child_process');
var chalk = require('chalk');
var async = require('async');
var npmview = require('npmview');
var dir = '.panes';
var filename = path.join(dir , 'ng-panes-preference.json');
var packageName = 'generator-ng-panes';
// define the main
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

var searchFile = function()
{
    var home = getUserHome();
    var search = path.join(home , filename);
    if (existsFile(search)) {
        return search;
    }
    return false;
};

/**
 * get a date string
 */
var getDate = function()
{
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
};

/**
 * query the package info
 */
var viewPackage = function(_package)
{
    var defer = q.defer();
    var resolved = {timeout: false};
    setTimeout(function() {
        resolved.timeout = true;
        defer.resolve('timeout');
    },5000); // if that didn't execute in 5 seconds then just bail

    npmview(_package , function(err , version , moduleInfo)
    {
        if (!resolved.timeout) {
            if (err) {
                version = false;
            }
            defer.resolve(version);
        }
    });
    return defer.promise;
};

/**
 * run a remote check
 */
var runVersionCheck = function(localVersion , checkDate , lang)
{
    var defer = q.defer();
    var toDay = getDate();
    // run remote checks - always run this now, since nobody is going run this 10 times a day anyway
    viewPackage(packageName).then(function(result) {
        if (result && result!==localVersion) {
            var msg = chalk.white( (lang==='cn') ? '现时安装的版本为' : 'Your installed version is: ');
                 msg += chalk.yellow(localVersion);
                 msg += chalk.white( (lang==='cn') ? '最新的版本为' : '. The latest version is ');
                 msg += chalk.yellow(result);
                 msg += chalk.white( (lang==='cn') ? '如需升级、请用这指令' : '. To upgrade please run ');
                 msg += chalk.yellow('npm install ' + packageName + ' -g');
            console.log(msg);
        }
        defer.resolve(1);
    });
    return defer.promise;
};

/**
 * take the chunk of code out from init
 */
var initProjectFile = function(localVersion , today)
{
    var defer = q.defer();
    var home = getUserHome();
    var search = path.join(home , filename);
    if (!existsFile(search)) {
        var data = {
            app: {version: localVersion , date: today},
            projects: {}
        };
        write(data , function(err)
        {
            if (err) {
                console.log(chalk.red('fail to init file') , err);
            }
            // always resolve it
            defer.resolve(err || data);
        });
    }
    else {
        var json = Preference.find();
        defer.resolve(upgradeProjectFile(json , localVersion , today));
    }
    return defer.promise;
};

/**
 * since this feature been out for a while, so we need to create a upgrade config file upgrade method
 */
var upgradeProjectFile = function(json , localVersion , today)
{
    if (_.isUndefined(json.app)) {
        var home = getUserHome();
        var data = {
            app: {version: localVersion , date: today},
            projects: json
        };
        fs.writeFile(path.join(home , filename) , JSON.stringify(data , null , 2) , function(err)
        {
            if (err) {
                console.log(chalk.red(err));
            }
        });
        return data;
    }
    return json;
};

/**
 * wrapper to write to file
 */
var write = function(data , callback)
{
    var home = getUserHome();
    var _path = path.join(home , dir);

    if (!existsFile(_path)) {
        fs.mkdirSync(_path);
    }
    return fs.writeFile(path.join(home , filename) , JSON.stringify(data , null , 2) , callback);
};

/**
 * the top level methods, check if we need to init preference file, upgrade also check for the version and notify user that they should upgrade
 */
Preference.init = function(lang)
{
    var defer = q.defer();
    var localVersion = require('../package.json').version;
    var today = getDate();

    async.waterfall([
        function(callback) {
            initProjectFile(localVersion , today).then(function(result)
            {
                return callback(null , result);
            });
        },
        function(result , callback) {
            runVersionCheck(localVersion , result.app.date , lang).then(function(done)
            {
                return callback(null , done);
            });
        }
    ] , function(err , result) {
        defer.resolve(result);
    });
    return defer.promise;
};

/**
 * search for preference json file
 * @param (Boolean) if this is integrate project from panesjs then only return those mark with panesjs===true
 */
Preference.find = function()
{
    try {
    	var home = getUserHome();
    	var search = path.join(home , filename);
    	if (existsFile(search)) {
    		var json = require(search);
            return json;
        }
    	return false;
    } catch (e) {
        return false;
    }
};
/**
 * get the actual projects
 */
Preference.findProjects = function(panes)
{
    var json = Preference.find();
    if (json) {
        var sort = {};
        _.each(json.projects , function(value , date)
        {
            if (panes && !_.isUndefined(value.panesjs)) {
                sort[date] = value;
            }
            else {
                sort[date] = value;
            }
        });
        return _.isEmpty(sort) ? false : sort;
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
		if (savedData===false) {
            console.log(chalk.red('fail init error!'));
            return;
        }
        savedData.projects = _.extend(savedData.projects , toSave);
		return write(savedData , callback);
	} catch(e) {
		console.log(e);
		return false;
	}
};

/**
 * remove projects
 */
Preference.remove = function(toDelete)
{
    if (toDelete.length>0) {
        var json = Preference.find();
        if (json) {
            var projects = _.pick(json.projects , function(val , key , obj)
            {
                return !_.contains(toDelete , key);
            });
            json.projects = projects;
            write(json , function(err) {
                if (err) {
                    console.log(chalk.red('fail to update preference file!'));
                }
            });
        }
    }
};

/**
 * get local config for the ng-panes
 */
Preference.getConfig = function(key)
{
    try {
        var config = require('./.ng-panes-config.json');
        if (key && config[key]) {
            return config[key];
        }
        return config;
    } catch(e) {
        console.log('Preferene.getConfig error:' , e);
        return false;
    }
};

/**
 * lets check if the user issue yo ng-panes inside another panesjs command
 */
Preference.checkPanesjs = function()
{
    try {
    	var search = path.join(process.cwd() , '.panesjs-config.json');
        if (existsFile(search)) {
            return require(search); // return the json to set some default options
        }
        return false;
    } catch(e) {
        return false;
    }
};
