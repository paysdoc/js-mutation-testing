/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("ArrayCNF", function(){

    var ArrayCNF = require('../../../src/childNodeFinder/ArrayCNF');

    it("finds the right child node on a given array node", function() {
        var node = {"type": "ArrayExpression",
            "elements": ["elem1","elem2",{"type": "BinaryExpression", "operator": "*"}]};
        expect(new ArrayCNF(node).find()).toEqual([ 'elem1', 'elem2', { type: 'BinaryExpression', operator: '*' }]);
    });
});
