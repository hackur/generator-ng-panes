'use strict';
/**
 * this is going to query the git package for the latest version and compare with our local
 * we will only check it once a day
 */
var https = require('https');

//
module.export = function(yo , url)
{
    var localVersion = require('./package.json').version;
    // 
    https.get(url , function(res) {
        yo.log("statusCode: ", res.statusCode);
        yo.log("headers: ", res.headers);

        res.on('data', function(d) {
            //process.stdout.write(d);
            yo.log(d);
        });

    }).on('error', function(e) {
        yo.log.error(e);
    });

};
