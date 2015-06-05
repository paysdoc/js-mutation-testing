/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('ChildNodeFinder');

    var CallExpressionChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    CallExpressionChildNodeFinder.prototype.find = function() {
        var childNodes = [];

        _.forEach(this._astNode['arguments'], function(arg) {
            childNodes.push({node: arg, loopVariables: this.loopVariables});
        }, this);
        childNodes.push({node: astNode.callee, loopVariables: this.loopVariables});
        return childNodes;
    };

    module.exports = CallExpressionChildNodeFinder;
})(module);
