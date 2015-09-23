/**
 * Configuration for Mutation testing
 * @author Martin Koster [paysdoc@gmail.com], created on 15/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';

    var _ = require('lodash'),
        JSParserWrapper = require('./JSParserWrapper');

    var Configuration = function(src, config) {
        var ignore = config && config.discardDefaultIgnore ? []: [/('use strict'|"use strict");/],
            configIgnore = config ? config.ignore : [];

        // merge given config with defaults
        this._config = _.merge({
            logLevel: 'INFO',
            reporters: {console: true},
            maxReportedMutationLength: 80,
            ignoreReplacement: null,
            excludeMutations: null,
            mutateProductionCode: false,
            discardDefaultIgnore: false,
            test: null
        }, config);

        Array.prototype.push.apply(ignore, ensureArray(configIgnore));
        this._config.ignore = ignore;
        this._src = src;

        createGetters(this);
    };

    Configuration.prototype.isInIgnoredRange = function(node) {
        return _.any(getIgnoredRanges(this._config, this._src), function (ignoredRange) {
            return ignoredRange.coversRange(node.range);
        });
    };

    Configuration.prototype.isReplacementIgnored = function(replacement) {
        var ignoredReplacements = this._config.ignoreReplacement;

        return _.any(ensureArray(ignoredReplacements), function(ignoredReplacement) {
            ignoredReplacement = _.isRegExp(ignoredReplacement) ? ignoredReplacement : new RegExp(ignoredReplacement);
            ignoredReplacement.lastIndex = 0; //reset the regex
            return ignoredReplacement.test(replacement);
        });
    };

    function ensureArray(val) {
        return val ? _.isArray(val) ? val : [val] : [];
    }

    function getIgnoredRanges(opts, src) {
        function IgnoredRange(start, end) {
            this.start = start;
            this.end = end;

            this.coversRange = function(range) {
                return this.start <= range[0] && range[1] <= this.end;
            };
        }

        var ignoredRanges = [],
        // Convert to array of RegExp instances with the required options (global and multiline) set
            ignore = _.map(ensureArray(opts.ignore), function(ignorePart) {
                if(_.isRegExp(ignorePart)) {
                    return new RegExp(ignorePart.source, 'gm' + (ignorePart.ignoreCase ? 'i' : ''));
                } else {
                    return new RegExp(ignorePart.replace(/([\/\)\(\[\]\{\}'"\?\*\.\+\|\^\$])/g, function(all, group) {return '\\' + group;}), 'gm');
                }
            });

        _.forEach(ignore, function(ignorePart) {
            var match;
            while(match = ignorePart.exec(src)) {
                ignoredRanges.push(new IgnoredRange(match.index, match.index + match[0].length));
            }
        });

        return ignoredRanges;
    }

    function createGetters(ctx) {
        _.forOwn(ctx._config, function(value, prop) {
            Configuration.prototype['get' + _.capitalize(prop)] = function() {
                return value;
            };
        });
    }

    module.exports = Configuration;
})(module);

