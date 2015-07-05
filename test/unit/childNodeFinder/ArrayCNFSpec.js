/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("ArrayCNF", function(){

    var ArrayCNF = require('../../../src/childNodeFinder/ArrayCNF');

    it("finds the right child node on a given array node", function() {
        var node = {1: "bla", 2: "blo", 3: "blu"};
        expect(new ArrayCNF(node).find()).toEqual(["bla", "blo", "blu"]);
    });
});

