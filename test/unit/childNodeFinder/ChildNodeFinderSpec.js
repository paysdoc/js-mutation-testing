/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("ChildNodeFinder", function(){

    var ChildNodeFinder = require('../../../src/childNodeFinder/ChildNodeFinder');

    it("finds the right child node on a given child node", function() {
        var node = {1: "bla", 2: "blo", 3: "blu"};
        expect(new ChildNodeFinder(node).find()).toEqual(["bla", "blo", "blu"]);
    });

    it("finds the right child node on the body of a given child node", function() {
        var node = {"body": [{1: "bla", 2: "blo", 3: "blu"}]};
        expect(new ChildNodeFinder(node).find()).toEqual([{ 1: 'bla', 2: 'blo', 3: 'blu' }]);
    });
});

