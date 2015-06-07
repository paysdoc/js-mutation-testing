/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ChildNodeFinder = require('ChildNodeFinder');

    var LeftRightChildNodeFinder = function(astNode) {
        ChildNodeFinder.call(this, astNode);
    };

    LeftRightChildNodeFinder.prototype.find = function() {
        return [
            this._astNode.left,
            this._astNode.right
        ];
    };

    module.exports = LeftRightChildNodeFinder;
})(module);
