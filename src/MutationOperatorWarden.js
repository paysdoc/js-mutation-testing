/**
 * There are several ways in which a mutation can be prevented from being applied:
 * - it is excluded via global options
 * - the comments of the source code to be mutated contain an explicit exclusion for a certain section
 * - one or more regex patterns determine sections of code for which mutations should be ignored
 *
 * A mutation operator can therefore have one of the following statuses: allowed, ignored or excluded.
 * The MutationOperatorWarden applies the rules above to determine that status
 *
 * @author Martin Koster [paysdoc@gmail.com], created on 28/09/15.
 * Licensed under the MIT license.
 */
(function (module){

    var _ = require('lodash'),
        ExclusionUtils = require('./utils/ExclusionUtils');

    function MutationOperatorWarden(src, config, mutationOperatorTypes) {
        this._src = src;
        this._excludedMutations = config.getExcludeMutations();
        this._ignore = config.getIgnore();
        this._ignoreReplacements = config.getIgnoreReplacements();
        this._mutationOperatorTypes = mutationOperatorTypes;
    }

    MutationOperatorWarden.prototype.getMOStatus = function(node, mutationOperator, mutationCode) {
        var excludes = _.merge(
            getDefaultExcludes(this._mutationOperatorTypes),
            this._excludedMutations,
            ExclusionUtils.getExclusions(node)
        );
        if(isInIgnoredRange(node, this._src, this._ignore) || isReplacementIgnored(mutationOperator.getReplacement(), this._ignoreReplacements)) {
            return "ignore";
        } else if (excludes[mutationCode]) {
            return "exclude";
        }

        return 'include';
    };

    function isInIgnoredRange(node, src, ignore) {
        return _.any(getIgnoredRanges(ignore, src), function (ignoredRange) {
            return ignoredRange.coversRange(node.range);
        });
    }

    function isReplacementIgnored(replacement, ignoreReplacements) {
        return _.any(ignoreReplacements, function(ignoredReplacement) {
            ignoredReplacement = _.isRegExp(ignoredReplacement) ? ignoredReplacement : new RegExp(ignoredReplacement);
            ignoredReplacement.lastIndex = 0; //reset the regex
            return ignoredReplacement.test(replacement);
        });
    }

    function getIgnoredRanges(ignore, src) {
        function IgnoredRange(start, end) {
            this.start = start;
            this.end = end;

            this.coversRange = function(range) {
                return this.start <= range[0] && range[1] <= this.end;
            };
        }

        var ignoredRanges = [],
        // Convert to array of RegExp instances with the required options (global and multiline) set
            ignoreParts = _.map(ignore, function(ignorePart) {
                if(_.isRegExp(ignorePart)) {
                    return new RegExp(ignorePart.source, 'gm' + (ignorePart.ignoreCase ? 'i' : ''));
                } else {
                    return new RegExp(ignorePart.replace(/([\/\)\(\[\]\{}'"\?\*\.\+\|\^\$])/g, function (all, group) {return '\\' + group;}), 'gm');
                }
            });

        _.forEach(ignoreParts, function(ignorePart) {
            var match;
            while(match = ignorePart.exec(src)) {
                ignoredRanges.push(new IgnoredRange(match.index, match.index + match[0].length));
            }
        });

        return ignoredRanges;
    }

    /**
     * returns the default exclusion status of each mutation command
     * @returns {object} a list of mutation codes [key] and whether or not they're excluded [value]
     */
    function getDefaultExcludes(mutationOperatorTypes) {
        var excludes = {};
        _.forEach(mutationOperatorTypes, function(operator){
            if(operator.code) {
                excludes[operator.code] = !!operator.exclude;
            } else {
                throw new TypeError('expected a MutationOperation class with a code, but code was ' + operator.code);
            }
        });
        return excludes;
    }

    module.exports = MutationOperatorWarden;
})(module);