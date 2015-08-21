/**
 * Provides custom matchers for jasmine tests
 * @author Martin Koster [paysdoc@gmail.com], created on 18/08/15.
 * Licensed under the MIT license.
 */
var _ = require('lodash');
(function (module){
    module.exports = {
        toHaveProperties : function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {

                    var recursiveComparison = function(actual, expected) {
                        var result = {pass: true};
                        _.forOwn(expected, function(value, key) {
                            var actualVal = actual[key];
                            if (actualVal) {
                                if (_.isPlainObject(actualVal) && _.isPlainObject(value)) {
                                    return recursiveComparison(actualVal, value);
                                } else if (Array.isArray(actualVal) && Array.isArray(value)) {
                                    if (actualVal.length === value.length) { //just check the length of the arrays, deeper comparison should not be necessary
                                        return result;
                                    }
                                } else if (actualVal === value) {
                                    return result;
                                }
                            }
                            result.pass = false;
                            result.message = 'expected ' + JSON.stringify(actual) + ' to have property {' + key + ': ' + JSON.stringify(value) + '}';
                        });
                        return result;
                    };
                    if (!_.isObject(expected)) {
                        return {message: '\'expected\' should be an object'};
                    }

                    return recursiveComparison(actual, expected);
                }
            }
        }
    };
})(module);