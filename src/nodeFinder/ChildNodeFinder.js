/**
 * Finds the child nodes of a given node
 * @author Martin Koster
 * Created on 26/05/15.
 */
var _ = require('lodash'),
    ScopeUtils = require('../utils/ScopeUtils');

var ChildNodeFinder = function(astNode, loopVariables) {
    var body = astNode.body;

    /* The actual processing may in some cases require the body of the node, which is itself a node */
    this._astNode = body && _.isArray(body) ? body : astNode;
    this._loopVariables = loopVariables || [];

    if (body && ScopeUtils.hasNewScope(astNode)) {
        this._loopVariables = ScopeUtils.removeOverriddenLoopVariables(body, loopVariables || []);
    } else {
        this._loopVariables = loopVariables || [];
    }
};

ChildNodeFinder.prototype.find = function() {
    var childNodes = [];
    _.forOwn(this._astNode, function (child) {
        childNodes.push({node: child, loopVariables: this._loopVariables});
    }, this);
    return childNodes;
};

ChildNodeFinder.prototype.getLoopVariables = function() {
    return this._loopVariables;
};

module.exports = ChildNodeFinder;