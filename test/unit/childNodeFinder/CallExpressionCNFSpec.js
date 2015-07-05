/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("CallExpressionCNF", function(){

    var CallExpressionCNF = require('../../../src/childNodeFinder/CallExpressionCNF');

    it("finds the right child node on a given array node", function() {
        var node = {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "functionx"
                },
                "arguments": [
                    {
                        "type": "Identifier",
                        "name": "answer"
                    }
                ]
        };
        expect(new CallExpressionCNF(node).find()).toEqual([{ type: 'Identifier', name: 'answer' }, { type: 'Identifier', name: 'functionx' } ]);
    });
});

