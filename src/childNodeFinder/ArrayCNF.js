/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function (module){
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('./ChildNodeFinder');

    var ArrayChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    ArrayChildNodeFinder.prototype.find = function() {
        var childNodes = [];
        _.each(this._astNode.elements, function (element) {
            childNodes.push(element);
        }, this);
        return childNodes;
    };

    module.exports = ArrayChildNodeFinder;
})(module);