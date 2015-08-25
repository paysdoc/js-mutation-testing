/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('UnaryExpressionMO', function() {
    var proxyquire = require('proxyquire'),
        UnaryExpressionMO,
        MutationUtilsSpy,
        node = {
            "type": "UpdateExpression",
            "operator": "-",
            "argument": {
                "range": [42,45],
                "type": "Identifier",
                "name": "a"
            },
            "prefix": true
        };

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createUnaryOperatorMutation']);
        UnaryExpressionMO = proxyquire('../../../src/mutationOperator/UnaryExpressionMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
    });

    it('creates an empty list of mutation operators', function() {
        var instances = UnaryExpressionMO.create({node: {properties: ['a', 'b']}});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instances = UnaryExpressionMO.create({node: node}),
            instance;

        expect(instances.length).toEqual(1);
        instance = instances[0];

        instance.apply();
        expect(node.operator).toBeFalsy();
        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toBeFalsy();
        expect(MutationUtilsSpy.createUnaryOperatorMutation.calls.count()).toEqual(1);

        instance.revert();
        expect(node.operator).toEqual('-');
        instance.revert(); //reverting again should have no effect
        expect(node.operator).toEqual('-');

        expect(MutationUtilsSpy.createUnaryOperatorMutation).toHaveBeenCalledWith(node, undefined, '');
    });
});