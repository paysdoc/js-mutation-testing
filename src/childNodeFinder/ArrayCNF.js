/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function (module){
    'use strict';

    var _ = require('lodash'),
        ChildNodeFinder = require('./ChildNodeFinder');

    var ArrayChildNodeFinder = function(astNode, property) {
        ChildNodeFinder.call(this, astNode, property);
    };

    ArrayChildNodeFinder.prototype.find = function() {
        var collection = this._property ? this._astNode[this._property] : this._astNode,
            childNodes = [];
        _.each(collection, function (element) {
            childNodes.push(element);
        }, this);
        return childNodes;
    };

    module.exports = ArrayChildNodeFinder;
})(module);