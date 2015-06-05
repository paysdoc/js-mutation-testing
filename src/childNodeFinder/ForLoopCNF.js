/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ChildNodeFinder = require('ChildNodeFinder');

    var ForLoopChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    ForLoopChildNodeFinder.prototype.find = function() {
        return ([
            // only return the 'body' and 'init' nodes as mutating either 'test' or 'update' nodes introduce too great a risk of resulting in an infinite loop
            {node: this._astNode.init, loopVariables: this.loopVariables},
            {node: this._astNode.body, loopVariables: this.loopVariables}
        ]);
    };

    module.exports = ForLoopChildNodeFinder;
})(module);
