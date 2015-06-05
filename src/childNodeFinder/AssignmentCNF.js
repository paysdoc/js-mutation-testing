/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ChildNodeFinder = require('ChildNodeFinder');

    var _super = ChildNodeFinder.prototype;
    var ArrayChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    ArrayChildNodeFinder.prototype.find = function() {
        var childNodes = [];
        if (canMutate(this._astNode, this.loopVariables)) {
            childNodes = _super.find.call(this);
        }
        return childNodes;
    };

    function canMutate(astNode, loopVariables) {
        var left = astNode.left;
        if (left && left.type === 'Identifier') {
            return (loopVariables.indexOf(left.name) < 0);
        }
        return true;
    }

    module.exports = ArrayChildNodeFinder;
})(module);
