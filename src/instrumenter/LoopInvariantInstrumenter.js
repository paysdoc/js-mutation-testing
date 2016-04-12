/**
 * Instruments mutated code containing For, While od Do..while loops by adding a back door to ensure that these loops
 * don't run indefinitely if the loop invariant has been mutated
 * Created by martin on 29/03/16.
 */
(function (module) {
    'use strict';

    var JSParserWrapper = require('../JSParserWrapper'),
        MutationOperatorRegistry = require('../MutationOperatorRegistry');

    var tallyDeclaration = '___js_mutation_test_tallies___';
    var tallyId = 1;

    /* ***********************************************************
     *            var ___js_mutation_test_tallies___ = {}
     * ***********************************************************/
    var defineTallies = {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": tallyDeclaration
                },
                "init": {
                    "type": "ObjectExpression",
                    "properties": []
                }
            }
        ],
        "kind": "var"
    };

    /* *********************************************************************************************
     *        ___js_mutation_test_tallies___[#id#] = ___js_mutation_test_tallies___[#id#] || 1;
     *        if (___js_mutation_test_tallies___['#id#']++ > #someVal#) { break; }
     * *********************************************************************************************
     * (#id# and #someVal# are replaced later)
     */
    var backdoor = [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": true,
                    "object": {
                        "type": "Identifier",
                        "name": tallyDeclaration
                    },
                    "property": {
                        "type": "Literal",
                        "value": "#id#",
                        "raw": "'#id#'"
                    }
                },
                "right": {
                    "type": "LogicalExpression",
                    "operator": "||",
                    "left": {
                        "type": "MemberExpression",
                        "computed": true,
                        "object": {
                            "type": "Identifier",
                            "name": tallyDeclaration
                        },
                        "property": {
                            "type": "Literal",
                            "value": "#id#",
                            "raw": "'#id#'"
                        }
                    },
                    "right": {
                        "type": "Literal",
                        "value": 1,
                        "raw": "1"
                    }
                }
            }
        },
        {
            "type": "IfStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": ">",
                "left": {
                    "type": "UpdateExpression",
                    "operator": "++",
                    "argument": {
                        "type": "MemberExpression",
                        "computed": true,
                        "object": {
                            "type": "Identifier",
                            "name": tallyDeclaration
                        },
                        "property": {
                            "type": "Literal",
                            "value": "#id#",
                            "raw": "'#id#'"
                        }
                    },
                    "prefix": false
                },
                "right": {
                    "type": "Literal",
                    "value": 1000,
                    "raw": "1000"
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
            },
            "alternate": null
        }
    ];

    function addBackDoor(astNode, tallyId, maxIterations) {
        var backdoorClone = JSON.parse(JSON.stringify(backdoor)), //make a deep copy to ensure that the values are unique
            tallyIdString = '' + tallyId;

        backdoorClone[0].expression.left.property.value = tallyIdString;
        backdoorClone[0].expression.left.property.raw = '\'' + tallyIdString + '\'';
        backdoorClone[0].expression.right.left.property.value = tallyIdString;
        backdoorClone[0].expression.right.left.property.raw = '\'' + tallyIdString + '\'';
        backdoorClone[1].test.left.argument.property.value = tallyIdString;
        backdoorClone[1].test.left.argument.property.raw = '\'' + tallyIdString + '\'';
        backdoorClone[1].test.right.value = maxIterations;
        backdoorClone[1].test.right.raw = '' + maxIterations;
        Array.prototype.splice.apply(astNode.body, [0, 0].concat(backdoorClone));
    }

    module.exports = {
        addInitialization: function (astNode) {
            astNode.body.splice(0, 0, defineTallies);
        },
        doInstrumentation: function (astNode, maxIterations) {

            // add back door to node if it's a loop itself (assuming that the initialization was done on the parent node)
            if (astNode && (astNode.type === 'WhileStatement' || astNode.type === 'DoWhileStatement' || astNode.type === 'ForStatement')) {
                addBackDoor(astNode.body, tallyId++, maxIterations); //pass the body of the root node as new node
            }
        }
    };
})(module);