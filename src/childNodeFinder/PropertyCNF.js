/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('ChildNodeFinder');

    var PropertyChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    PropertyChildNodeFinder.prototype.find = function() {
        var childNodes = [];

        _.forEach(this._astNode.properties, function (property) {
            childNodes.push({node: property.value, loopVariables: this.loopVariables});
        }, this);

        return childNodes;
    };

    module.exports = PropertyChildNodeFinder;
})(module);
