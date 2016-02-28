var assert = require("chai").assert;
var args = require("./../code/arguments");

describe('Arguments', function () {
    it('containsName', function () {
        var result = args.containsName([
            {name: 'Nora'},
            {name: 'Marco'}
        ], 'Steve');
        assert.equal(result, false);
    });
});
