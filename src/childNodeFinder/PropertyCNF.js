/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('./ChildNodeFinder');

    var PropertyChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    PropertyChildNodeFinder.prototype.find = function() {
        var childNodes = [];

        _.forEach(this._astNode.properties, function (property) {
            childNodes.push(property.value);
        }, this);

        return childNodes;
    };

    module.exports = PropertyChildNodeFinder;
})(module);
