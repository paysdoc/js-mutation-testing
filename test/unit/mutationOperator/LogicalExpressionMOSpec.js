/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('LogicalExpressionMO', function() {
    var proxyquire = require('proxyquire'),
        LogicalExpressionMO,
        MutationUtilsSpy,
        node =  {
            "range": [42,50],
            "type": "LogicalExpression",
            "operator": "||",
            "left": {
                "range": [42,43],
                "type": "Identifier",
                "name": "a"
            },
            "right": {
                "range": [47,50],
                "type": "Literal",
                "value": "a",
                "raw": "'a'"
            }
        },
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createOperatorMutation']);
        LogicalExpressionMO = proxyquire('../../../src/mutationOperator/LogicalExpressionMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = LogicalExpressionMO.create({node: node});
    });

    it('creates an empty list of mutation operators', function() {
        instances = LogicalExpressionMO.create({node: {}});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        expect(instances.length).toEqual(1);

        instances[0].apply();
        expect(node.operator).toEqual('&&');
        instances[0].apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toEqual('&&');

        node.someStuff = 'otherStuff';

        instances[0].revert();
        expect(node.operator).toEqual('||');
        expect(node.someStuff).toEqual('otherStuff');

        instances[0].revert(); //reverting again should have no effect
        expect(node.operator).toEqual('||');

        expect(MutationUtilsSpy.createOperatorMutation.calls.count()).toEqual(1);
    });
});