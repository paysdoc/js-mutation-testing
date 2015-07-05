/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("LeftRightCNF", function(){

    var LeftRightCNF = require('../../../src/childNodeFinder/LeftRightCNF');

    it("finds the right child nodea on a given binary expression node", function() {
        var node = {
            "type": "BinaryExpression",
            "operator": "*",
            "left": {
                "type": "Literal",
                "value": 6,
                "raw": "6"
            },
            "right": {
                "type": "Literal",
                "value": 7,
                "raw": "7"
            }
        };
        expect(new LeftRightCNF(node).find()).toEqual([{ type: 'Literal', value: 6, raw: '6' }, { type: 'Literal', value: 7, raw: '7' }]);
    });
});

