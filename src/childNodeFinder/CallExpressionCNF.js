/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ArrayCNF = require('./ArrayCNF'),
        ChildNodeFinder = require('./ChildNodeFinder');

    var CallExpressionChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    CallExpressionChildNodeFinder.prototype.find = function() {
        return new ArrayCNF(this._astNode, 'arguments').find().concat([this._astNode.callee]);
    };

    module.exports = CallExpressionChildNodeFinder;
})(module);
