/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('ChildNodeFinder');

    var CallExpressionChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    CallExpressionChildNodeFinder.prototype.find = function() {
        var childNodes = [];

        _.forEach(this._astNode['arguments'], function(arg) {
            childNodes.push(arg);
        }, this);
        childNodes.push(astNode.callee);
        return childNodes;
    };

    module.exports = CallExpressionChildNodeFinder;
})(module);
