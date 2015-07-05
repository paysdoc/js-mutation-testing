/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("ForLoopCNF", function(){

    var ForLoopCNF = require('../../../src/childNodeFinder/ForLoopCNF');

    it("finds the right child nodes on a given for loop", function() {
        var node = {
            "type": "ForStatement",
            "init": {"value":"init"},
            "test": {"value": "test"},
            "update": {"value": "update"},
            "body": {"value": "body"}
        };
        expect(new ForLoopCNF(node).find()).toEqual([{ value: 'init' }, { value: 'body' }]);
    });
});

