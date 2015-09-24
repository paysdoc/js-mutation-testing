/**
 * Spec for the Mutation operator handler
 * @author Martin Koster [paysdoc@gmail.com], created on 24/09/15.
 * Licensed under the MIT license.
 */
describe('MutationOperatorHandler', function() {
    var MutationOperatorHandler = require('../../src/MutationOperatorHandler'),
        _ = require('lodash'),
        moHandler, apply1, apply2, revert1, revert2;

    beforeEach( function() {
        apply1 = jasmine.createSpy('apply');
        apply2 = jasmine.createSpy('apply');
        revert1 = jasmine.createSpy('revert');
        revert2 = jasmine.createSpy('revert');
        moHandler = new MutationOperatorHandler();
    });

    it('applies a mutation and adds it to its stack', function(){
        moHandler.applyMutation([{code: 'mutationA', apply: apply1, revert: revert1}]);

        expect(apply1).toHaveBeenCalled();
        expect(moHandler._moStack[0][0].code).toEqual('mutationA');
    });

    it('applies mutation sets, and reverts them all in the order in which they have been applied', function(){
        moHandler.applyMutation([{code: 'mutationA', apply: apply1, revert: revert1}, {code: 'mutationB', apply: apply2, revert: revert2}]);
        moHandler.applyMutation([{code: 'mutationC', apply: apply1, revert: revert1}, {code: 'mutationD', apply: apply2, revert: revert2}]);
        expect(apply1.calls.count()).toBe(2);
        expect(apply2.calls.count()).toBe(2);
        expect(revert1.calls.count()).toBe(0);
        expect(revert2.calls.count()).toBe(0);

        expect(moHandler._moStack.length).toBe(2);
        expect(_.pluck(moHandler._moStack[0], 'code')).toEqual(['mutationA', 'mutationB']);
        expect(_.pluck(moHandler._moStack[1], 'code')).toEqual(['mutationC', 'mutationD']);

        moHandler.revertMutation();
        expect(revert1.calls.count()).toBe(1);
        expect(revert2.calls.count()).toBe(1);
        expect(moHandler._moStack.length).toBe(1);
        expect(_.pluck(moHandler._moStack[0], 'code')).toEqual(['mutationA', 'mutationB']);

        moHandler.revertMutation();
        expect(revert1.calls.count()).toBe(2);
        expect(revert2.calls.count()).toBe(2);
        expect(moHandler._moStack.length).toBe(0);
    });
});
