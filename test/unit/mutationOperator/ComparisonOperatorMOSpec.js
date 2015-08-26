/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('ComparisonOperatorMO', function() {
    var proxyquire = require('proxyquire'),
        ComparisonOperatorMO,
        MutationUtilsSpy,
        node = {
            "type": "BinaryExpression",
            "operator": "<",
            "left": {
                "type": "Identifier",
                "name": "a"
            },
            "right": {
                "type": "Identifier",
                "name": "b"
            },
            someStuff: 'someStuff'
        },
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createOperatorMutation']);
        ComparisonOperatorMO = proxyquire('../../../src/mutationOperator/ComparisonOperatorMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = ComparisonOperatorMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = ComparisonOperatorMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        expect(instances.length).toEqual(2);

        instances[0].apply();
        expect(node.operator).toEqual('<=');
        instances[1].apply();
        expect(node.operator).toEqual('>=');

        instances[1].apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toEqual('>=');

        node.someStuff = 'otherStuff';
        instances[1].revert();
        expect(node.operator).toEqual('<=');
        expect(node.someStuff).toEqual('otherStuff');

        instances[0].revert();
        expect(node.operator).toEqual('<');
        instances[0].revert(); //reverting again should have no effect

        expect(MutationUtilsSpy.createOperatorMutation.calls.count()).toEqual(2);
    });
});