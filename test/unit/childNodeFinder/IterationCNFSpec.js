/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("IterationCNF", function(){

    var IterationCNF = require('../../../src/childNodeFinder/IterationCNF');

    it("finds the right child nodes on a given iteration node", function() {
        var node = {
            "type": "WhileStatement",
            "test": {"value": "test"},
            "body": {"value": "body"}
        };
        expect(new IterationCNF(node).find()).toEqual([{ value: 'body' }]);
    });
});

