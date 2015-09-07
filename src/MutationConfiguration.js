/**
 * Configuration for Mutation testing
 * @author Martin Koster [paysdoc@gmail.com], created on 15/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';

    var _ = require('lodash'),
        JSParserWrapper = require('./JSParserWrapper');

    var Configuration = function(config) {
        // merge given config with defaults
        this._config = _.merge({
            logLevel: 'INFO',
            reporters: {console: true},
            maxReportedMutationLength: 80,
            ignore: /('use strict'|"use strict");/,
            ignoreReplacement: null,
            excludeMutations: null,
            mutateProductionCode: false,
            discardDefaultIgnore: false,
            test: null
        }, config);
        createGetters(this);
    };

    Configuration.prototype.isInIgnoredRange = function(node) {
        var ignoredRanges = getIgnoredRanges(this._config, JSParserWrapper.stringify(node));

        return _.any(ignoredRanges, function(ignoredRange) {
            return ignoredRange.coversRange(mutation.begin, mutation.end);
        });
    };

    Configuration.prototype.isReplacementIgnored = function(mutationOperator) {
        var ignoredReplacements = this._config.ignoreReplacement;

        return _.any(ensureArray(ignoredReplacements), function(ignoredReplacement) {
            ignoredReplacement = _.isRegExp(ignoredReplacement) ? ignoredReplacement : new RegExp(ignoredReplacement);
            return ignoredReplacement.test(mutationOperator.getReplacement());
        });
    };

    function ensureArray(val) {
        return val ? _.isArray(val) ? val : [val] : [];
    }

    function getIgnoredRanges(opts, src) {
        function IgnoredRange(start, end) {
            this.start = start;
            this.end = end;

            this.coversRange = function(start, end) {
                return start < this.end && end > this.start;
            };
        }

        var ignoredRanges = [],
        // Convert to array of RegExp instances with the required options (global and multiline) set
            ignore = _.map(ensureArray(opts.ignore), function(ignorePart) {
                if(_.isRegExp(ignorePart)) {
                    return new RegExp(ignorePart.source, 'gm' + (ignorePart.ignoreCase ? 'i' : ''));
                } else {
                    return new RegExp(ignorePart, 'gm');
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
            }
        })
    }

    module.exports = Configuration;
})(module);

