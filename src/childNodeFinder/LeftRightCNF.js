/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ChildNodeFinder = require('ChildNodeFinder');

    var LeftRightChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    LeftRightChildNodeFinder.prototype.find = function() {
        return [
            {node: this._astNode.left, loopVariables: this.loopVariables},
            {node: this._astNode.right, loopVariables: this.loopVariables}
        ];
    };

    module.exports = LeftRightChildNodeFinder;
})(module);
