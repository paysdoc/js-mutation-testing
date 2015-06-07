/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function (module){
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('ChildNodeFinder');

    var ArrayChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    ArrayChildNodeFinder.prototype.find = function() {
        var childNodes = [];
        _.forOwn(this._astNode, function (child) {
            childNodes.push(child);
        }, this);
        return childNodes;
    };

    module.exports = ArrayChildNodeFinder;
})(module);