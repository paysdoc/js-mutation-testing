/**
 * modifies an AST Node with the given mutations and returns a mutation description for each mutation done
 * @author Martin Koster, created on 07/06/15.
 * Licensed under the MIT license.
 */
(function (module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperatorHandler = require('./MutationOperatorHandler'),
        JSParserWrapper = require('./JSParserWrapper'),
        log4js = require('log4js');

    var logger = log4js.getLogger('Mutator');
    var Mutator = function(src) {
        this._brackets = _.filter(JSParserWrapper.tokenize(src, {range: true}), function(token) {
            return token.type === "Punctuator" && token.value.match(/^[\(\)]$/gm);
        });
        this._handler = new MutationOperatorHandler();
    };

    /**
     * Mutates the code by applying each mutation operator in the given set
     * @param mutationOperatorSet set of mutation operators which can be executed to effect a mutation on the code
     * @returns {*} a mutation description detailing which part of the code was mutated and how
     */
    Mutator.prototype.mutate = function(mutationOperatorSet) {
        var self = this,
            mutationDescriptions;

        this.unMutate();
        logger.trace('handler:', this._handler, mutationOperatorSet);
        mutationDescriptions = this._handler.applyMutation(mutationOperatorSet);
        logger.trace('applied mutation', mutationDescriptions);
        return _.reduce(mutationDescriptions, function(result, mutationDescription) {
            result.push(_.merge(mutationDescription, calibrateBeginAndEnd(mutationDescription.begin, mutationDescription.end, self._brackets)));
            return result;
        }, []);
    };

    /**
     * undo previous mutation operation, will do nothing if there is no mutation
     */
    Mutator.prototype.unMutate = function() {
        this._handler.revertMutation();
    };

    /**
     * This function fixes a calibration issue with arithmetic operators.
     * See https://github.com/jimivdw/grunt-mutation-testing/issues/7
     *
     * Though this issue will no longer break the code (as mutations are now done on the AST) it is still useful to
     * calibrate the brackets for reporting purposes.
     * @param begin start of the range
     * @param end end of the range
     * @param brackets bracket tokens with their ranges
     * @returns {object} a calibrated mutation description
     */
    function calibrateBeginAndEnd(begin, end, brackets) {
        //return {begin: begin, end: end};
        var beginBracket = _.find(brackets, function (bracket) {
                return bracket.range[0] === begin;
            }),
            endBracket = _.find(brackets, function (bracket) {
                return bracket.range[1] === end;
            });

        return {
            begin: beginBracket && beginBracket.value === ')' ? begin + 1 : begin,
            end: endBracket && endBracket.value === '(' ? end - 1 : end
        };
    }

    module.exports = Mutator;

})(module);