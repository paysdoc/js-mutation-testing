/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
(function(module) {
    'use strict';

    var ChildNodeFinder = require('ChildNodeFinder');

    var IterationChildNodeFinder = function(astNode, loopVariables) {
        ChildNodeFinder.call(this, astNode, loopVariables);
    };

    IterationChildNodeFinder.prototype.find = function() {
        return ([
            // only return the 'body' node as mutating 'test' node introduces too great a risk of resulting in an infinite loop
            {node: this._astNode.body, loopVariables: this.loopVariables}
        ]);
    };

    module.exports = IterationChildNodeFinder;
})(module);
