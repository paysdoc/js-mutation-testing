/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('EqualityOperatorMO', function() {
    var proxyquire = require('proxyquire'),
        EqualityOperatorMO,
        MutationUtilsSpy,
        node = {
            "type": "BinaryExpression",
            "operator": "!==",
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
        EqualityOperatorMO = proxyquire('../../../src/mutationOperator/EqualityOperatorMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = EqualityOperatorMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = EqualityOperatorMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        expect(instances.length).toEqual(1);

        instances[0].apply();
        expect(node.operator).toEqual('===');
        instances[0].apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toEqual('===');

        node.someStuff = 'otherStuff';

        instances[0].revert();
        expect(node.operator).toEqual('!==');
        expect(node.someStuff).toEqual('otherStuff');

        instances[0].revert(); //reverting again should have no effect
        expect(node.operator).toEqual('!==');

        expect(MutationUtilsSpy.createOperatorMutation.calls.count()).toEqual(1);
    });
});