var args = require("./../code/arguments");

describe('Arguments', function () {
    it('containsName', function () {
        var result = args.containsName([
            {name: 'Nora'},
            {name: 'Marco'}
        ], 'Steve');
        expect(result).toBeFalsy();
    });
});
