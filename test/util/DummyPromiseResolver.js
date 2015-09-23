/**
 * Creates a dummy promise and resolves in the requested manner
 * valid resolutions are 'resolve', 'reject' and 'notify'. Default (of on unknown resolution) is resolve
 * @author Martin Koster [paysdoc@gmail.com], created on 19/07/15.
 * Licensed under the MIT license.
 */
(function (module) {
    var Q = require('q');

    module.exports = {
        resolve : function(resolution, info) {
            return Q.Promise(function(resolve, reject, notify) {
                if (resolution === 'reject') {
                    reject(info);
                } else if (resolution === 'notify') {
                    notify(info);
                } else {
                    resolve(info);
                }
            });
        }
    };

})(module);