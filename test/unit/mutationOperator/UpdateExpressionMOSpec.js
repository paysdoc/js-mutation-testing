/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('UpdateExpressionMO', function() {
    var proxyquire = require('proxyquire'),
        MutationUtils = require('../../../src/utils/MutationUtils'),
        UpdateExpressionMO,
        createMutationSpy,
        node = {
            "type": "UpdateExpression",
            "operator": "++",
            "argument": {
                "range": [42,45],
                "type": "Identifier",
                "name": "a",
                "loc": {"end" : {"line": 3, "column": 7}}
            },
            "loc": {"end" : {"line": 3, "column": 5}},
            "prefix": true
        };

    beforeEach(function() {
        createMutationSpy = spyOn(MutationUtils, 'createMutation').and.returnValue({});
        UpdateExpressionMO = proxyquire('../../../src/mutationOperator/UpdateExpressionMO', {
            '../utils/MutationUtils': {createMutation: createMutationSpy}
        });
    });

    it('creates an empty list of mutation operators', function() {
        instances = UpdateExpressionMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates \'++x\' to \'--x\' and back again', function() {
        testUpdateExpressionMO(42);
    });

    it('mutates \'x++\' to \'x--\' and back again', function() {
        delete node.prefix;
        testUpdateExpressionMO(45);
    });

    function testUpdateExpressionMO(replacement) {
        var instances = UpdateExpressionMO.create(node);
        expect(instances.length).toEqual(1);

        instances[0].apply();
        expect(node.operator).toEqual('--');
        instances[0].apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toEqual('--');

        instances[0].revert();
        expect(node.operator).toEqual('++');
        instances[0].revert(); //reverting again should have no effect
        expect(node.operator).toEqual('++');

        expect(createMutationSpy.calls.count()).toEqual(1);
        expect(createMutationSpy).toHaveBeenCalledWith(node, replacement, '++', '--');
    }
});