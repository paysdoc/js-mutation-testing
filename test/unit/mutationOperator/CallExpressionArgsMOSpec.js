/**
 * specification for a call expression mutation operator that mutates the expression itself
 * @author Martin Koster [paysdoc@gmail.com], created on 10/09/15.
 * Licensed under the MIT license.
 */
describe('CallExpressionSelfMO', function () {
    var proxyquire = require('proxyquire'),
        CallExpressionArgsMO, MutationUtilsSpy,
        callee = {
            "range": [5, 11],
            "type": "MemberExpression",
            "computed": false,
            "object": {
                "type": "Identifier",
                "name": "callThis"
            },
            "property": {
                "type": "Identifier",
                "name": "member"
            }
        },
        args = [{
            "range": [13, 14],
            "type": "Literal",
            "value": "a",
            "raw": "'a'"
        }],
        node = {
            "range": [0, 16],
            "type": "CallExpression",
            "callee": callee,
            "arguments": args
        },
        replacement = {type: 'Literal', value: 'MUTATION!', raw: '\'MUTATION!\''},
        instance;

    beforeEach(function () {
        jasmine.addMatchers(require('../../util/JasmineCustomMatchers'));
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        CallExpressionArgsMO = proxyquire('../../../src/mutationOperator/CallExpressionArgsMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instance = CallExpressionArgsMO.create(node, replacement, 0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function () {
        instance.apply();
        expect(node.arguments[0]).toEqual(replacement);

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.arguments[0]).toEqual(replacement);

        instance.revert();
        expect(node.type).toBe("CallExpression");
        expect(node.callee).toBe(callee);
        expect(node.arguments).toBe(args);

        instance.revert(); //reverting again should have no effect
        expect(node.type).toBe("CallExpression");
        expect(node.callee).toBe(callee);
        expect(node.arguments).toBe(args);

        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);
        expect(MutationUtilsSpy.createMutation).toHaveBeenCalledWith(args[0], 14, args[0], 'MUTATION!');
    });

    it('retrieves the replacement value and its coordinates', function () {
        expect(instance.getReplacement()).toEqual({value: replacement, begin: 13, end: 14});
    });

});