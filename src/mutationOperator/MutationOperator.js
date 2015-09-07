/**
 * This command processes default nodes. All it does is expose its child nodes.
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash');

    function MutationOperator(astNode) {
        var body = astNode.body;

        /* while selecting a command requires the node, the actual processing may
         * in some cases require the body of the node, which is itself a node */
        this._astNode = body && _.isArray(body) ? body : astNode;
    }

    MutationOperator.prototype.getReplacement = function() {
        return null;
    };

    module.exports = MutationOperator;
})(module);
