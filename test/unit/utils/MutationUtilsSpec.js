/**
 * spec for the MutationUtils class
 * @author Martin Koster [paysdoc@gmail.com], created on 24/09/15.
 * Licensed under the MIT license.
 */
describe('MutationUtils', function() {
    var MutationUtils = require('../../../src/utils/MutationUtils'),
        astNode = {
            value: 'someVal',
            range: [12, 46],
            loc: {start: {line: 3, column: 7}, end: {line: 3, column: 12}},
            left: {range: [12, 33]},
            right: {range: [36, 46]}
        };

    it('creates a mutation description', function() {
        var mutationDescription = MutationUtils.createMutation(astNode, 34, 'foo', 'bar');
        expect(mutationDescription).toEqual({range: [12,46], begin: 12, end: 34, line: 3, col: 7, original: 'foo', replacement: 'bar'});
    });

    it('creates an operator mutation description', function() {
        var originalNode = {
            "range": [116, 121],
            "loc": {
                "start": {"line": 5, "column": 15},
                "end": {"line": 5, "column": 20}
            },
            "type": "Literal",
            "value": "bla",
            "raw": "'bla'"
        };

        var mutationDescription = MutationUtils.createOperatorMutation(astNode, originalNode, 'bar');
        expect(mutationDescription).toEqual({range: [12, 46], begin: 33, end: 36, line: 3, col: 12, original: '\'bla\'', replacement: 'bar'});
    });

    it('creates a unary operator mutation description', function() {
        var mutationDescription = MutationUtils.createUnaryOperatorMutation(astNode, 'foo');
        expect(mutationDescription).toEqual({range: [12, 46], begin: 12, end: 13, line: 3, col: 12, original: 'foo', replacement: ''});
    });
});