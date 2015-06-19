/**
 * Configuration for Mutation testing
 * @author Martin Koster [paysdoc@gmail.com], created on 15/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';

    var _ = require('lodash');

    var Configuration = function(config) {
        this._config = config || {};
    };

    Configuration.prototype.checkIgnore = function(srcFragment) {
        var ignorePatterns;

        if (!this._config.ignore) {
            return false;
        }

        ignorePatterns = ensureRegExpArray(this._config.ignore);
        return _.any(ignorePatterns, function (ignorePattern) {
            return ignorePattern.test(srcFragment);
        });
    };

    function ensureRegExpArray(value) {
        var array = _.isArray(value) ? value : [value];
        return array.map(function (stringOrRegExp) {
            return _.isString(stringOrRegExp) ? new RegExp('^' + stringOrRegExp + '$') : stringOrRegExp;
        });
    }

    module.exports = Configuration;
})(module);

