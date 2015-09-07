/**
 * Specification for a literal Mutation operator
 * @author Martin Koster [paysdoc@gmail.com], created on 21/08/15.
 * Licensed under the MIT license.
 */
describe('LiteralMO', function() {
    var proxyquire = require('proxyquire'),
        LiteralUtils = require('../../../src/utils/LiteralUtils'),
        shouldReturnAValue,
        LiteralMO, MutationUtilsSpy, determineReplacementSpy, node, mos;

    function returnAValue() {
        return shouldReturnAValue ? 'MUTATION' : null;
    }

    beforeEach(function() {
        determineReplacementSpy = spyOn(LiteralUtils, 'determineReplacement').and.callFake(returnAValue);
        shouldReturnAValue = true;
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        LiteralMO = proxyquire('../../../src/mutationOperator/LiteralMO', {
            '../utils/LiteralUtils': {determineReplacement: determineReplacementSpy},
            '../utils/MutationUtils': MutationUtilsSpy
        });

        node = {type: "Literal", value: "a", raw: "'a'", range: [5,7]};
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        mos = LiteralMO.create(node);
        expect(mos.length).toEqual(1);

        mos[0].apply();
        expect(node.value).toEqual('MUTATION');
        mos[0].apply(); //it shouldn't repeat the mutation
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);

        mos[0].revert();
        expect(node.value).toEqual('a');
        mos[0].revert(); //it shouldn't repeat the mutation
        expect(node.value).toEqual('a');

    });

    it('doesn\'t mutate a node if no valid replacement can be found', function() {
        shouldReturnAValue = false;
        mos = LiteralMO.create(node);
        mos[0].apply(); // should do nothing
        expect(node.value).toEqual('a');
        expect(determineReplacementSpy.calls.count()).toEqual(1);
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(0);

        mos[0].revert(); // should do nothing
        expect(node.value).toEqual('a');

    });
});