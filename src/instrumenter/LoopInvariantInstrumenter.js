/**
 * Instruments mutated code containing For, While od Do..while loops by adding a back door to ensure that these loops
 * don't run indefinitely if the loop invariant has been mutated
 * Created by martin on 29/03/16.
 */
(function(module) {
    'use strict';

    var JSParserWrapper = require('../JSParserWrapper'),
        MutationOperatorRegistry = require('../MutationOperatorRegistry'),
        _ = require('lodash');

    //TODO: should we exit with a BreakStatement or throw an exception?
    var initialization = {                    // var tally = 0;
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "tally"
                    },
                    "init": {
                        "type": "Literal",
                        "value": 0,
                        "raw": "0"
                    }
                }
            ],
            "kind": "var"
        },
        backDoor = {                     // if (++tally > #someVal#) { break; } -> where #someVal# is substituted in later
            "type": "IfStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": ">",
                "left": {
                    "type": "UpdateExpression",
                    "operator": "++",
                    "argument": {
                        "type": "Identifier",
                        "name": "tally"
                    },
                    "prefix": true
                },
                "right": {
                    "type": "Literal"
                }
            },
            "consequent": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "BreakStatement",
                        "label": null
                    }
                ]
            }
        };

    function addBackDoor(astNode, maxIterations) {
        backDoor.test.right.value = maxIterations;
        backDoor.test.right.raw = '' + maxIterations;
        astNode.body.body.splice(0, 0, backDoor);
    }

    function addInitString(astNode) {
        astNode.body.splice(0, 0, initialization);
    }

    function isStandardLoop(astNode) {
        return astNode && (astNode.type === 'WhileStatement' || astNode.type === 'DoWhileStatement' || astNode.type === 'ForStatement');
    }
    module.exports = {
        doInstrumentation: function(astNode, maxIterations) {
            var childNodeFinder = MutationOperatorRegistry.selectChildNodeFinder(astNode);
            var hasLoopInNode = _.find(childNodeFinder && childNodeFinder.find(), function(node) {
                return isStandardLoop(node);
            });

            // add initialization if the node contains one or more child nodes that are loops
            if (hasLoopInNode) {
                addInitString(astNode);
            }

            // add back door to node if it's a loop itself (assuming that the initialization was done on the parent node)
            if (isStandardLoop(astNode)) {
                addBackDoor(astNode, maxIterations);
            }
        }
    };
})(module);