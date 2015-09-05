'use strict';
/**
 * this is going to query the git package for the latest version and compare with our local
 * we will only check it once a day
 */
var https = require('https');
var chalk = require('chalk');
var q = require('q');

module.exports = function(yo , url)
{
    var defer = q.defer();
    try {
        var localVersion = require('../package.json').version;
        setTimeout(function()
        {
            defer.resolve('timeout');
        },5000); // max only gives it 5 seconds
        https.get(url , function(res) {
            var code = res.statusCode;
            res.setEncoding('utf8');
            res.on('data', function(d) {
                if (code===200) {
                    //process.stdout.write(d);
                    if (d.version && localVersion!==d.version) {
                        yo.log(chalk.yellow('New version'));
                    }
                }
                defer.resolve(d);
            });
        }).on('error', function(e) {
            yo.log.error(e);
            defer.resolve(e);
        });
    } catch (e) {
        defer.resolve(true);
    }
    return defer.promise;
};
