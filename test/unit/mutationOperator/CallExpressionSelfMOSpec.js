/**
 * specification for a call expression mutation operator that mutates the expression itself
 * @author Martin Koster [paysdoc@gmail.com], created on 10/09/15.
 * Licensed under the MIT license.
 */
describe('CallExpressionSelfMO', function() {
    var proxyquire = require('proxyquire'),
        CallExpressionSelfMO, MutationUtilsSpy,
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
            "type": 'Literal',
            "value": 'a',
            "raw": '\'a\''
        }],
        node = {
            "range": [0, 16],
            "type": 'CallExpression',
            "callee": callee,
            "arguments": args
        },
        instance;

    beforeEach(function() {
        jasmine.addMatchers(require('../../util/JasmineCustomMatchers'));
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        CallExpressionSelfMO = proxyquire('../../../src/mutationOperator/CallExpressionSelfMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instance = CallExpressionSelfMO.create(node, node.arguments[0]);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {

        instance.apply();
        expect(node).toEqual(args[0]);

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node).toEqual(args[0]);

        instance.revert();
        expect(node.type).toBe("CallExpression");
        expect(node.callee).toBe(callee);
        expect(node.arguments).toBe(args);

        instance.revert(); //reverting again should have no effect
        expect(node.type).toBe("CallExpression");
        expect(node.callee).toBe(callee);
        expect(node.arguments).toBe(args);

        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);
        expect(MutationUtilsSpy.createMutation).toHaveBeenCalledWith(node, 16, node, args[0].value);
    });

    it('retrieves the replacement value and its coordinates', function() {
        expect(instance.getReplacement()).toEqual({value: args[0], begin: 0, end: 16});
    });
});