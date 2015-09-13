/**
 * Specification for the call expression mutation operator
 * @author Martin Koster [paysdoc@gmail.com], created on 17/08/15.
 * Licensed under the MIT license.
 */
describe('CallExpressionMO', function() {
    var JSParserWrapper = require('../../../src/JSParserWrapper'),
        proxyquire = require('proxyquire'),
        LiteralUtilsSpy, CallExpressionSelfMOSpy, CallExpressionArgsMOSpy,
        CallExpressionMO;

    beforeEach(function() {
        jasmine.addMatchers(require('../../util/JasmineCustomMatchers'));
        LiteralUtilsSpy = spyOn(require('../../../src/utils/LiteralUtils'), ['determineReplacement']).and.returnValue('MUTATION!');
        CallExpressionArgsMOSpy = jasmine.createSpyObj('CallExpressionArgsMO', ['create']);
        CallExpressionSelfMOSpy = jasmine.createSpyObj('CallExpressionSelfMO', ['create']);
        CallExpressionMO = proxyquire('../../../src/mutationOperator/CallExpressionMO', {
            '../utils/LiteralUtils': LiteralUtilsSpy,
            './CallExpressionArgsMO': CallExpressionArgsMOSpy,
            './CallExpressionSelfMO': CallExpressionSelfMOSpy
        });
    });

    it('creates no mutation operators for a call expression without arguments', function() {
        var ast = JSParserWrapper.parse('callThis();'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create(callExpression);

        expect(mos.length).toEqual(0);
    });

    it('creates two mutation operators for a call expression with one argument', function() {
        var ast = JSParserWrapper.parse('callThis(a);'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create(callExpression);

        expect(mos.length).toEqual(2);
        expect(CallExpressionArgsMOSpy.create.calls.count()).toBe(1);
        expect(CallExpressionSelfMOSpy.create.calls.count()).toBe(1);
        expect(CallExpressionArgsMOSpy.create).toHaveBeenCalledWith(callExpression, {type: 'Literal', value: 'MUTATION!', raw: '\'MUTATION!\''}, 0);
        expect(CallExpressionSelfMOSpy.create).toHaveBeenCalledWith(callExpression, callExpression.arguments[0]);
    });

    it('creates 3 mutation operators for a call with one argument to a member of an object', function() {
        var ast = JSParserWrapper.parse('callThis.member(a);'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create(callExpression);

        expect(mos.length).toEqual(3);
        expect(CallExpressionArgsMOSpy.create.calls.count()).toBe(1);
        expect(CallExpressionSelfMOSpy.create.calls.count()).toBe(2);
        expect(CallExpressionArgsMOSpy.create).toHaveBeenCalledWith(callExpression, {type: 'Literal', value: 'MUTATION!', raw: '\'MUTATION!\''}, 0);
        expect(CallExpressionSelfMOSpy.create).toHaveBeenCalledWith(callExpression, callExpression.arguments[0]);
        expect(CallExpressionSelfMOSpy.create).toHaveBeenCalledWith(callExpression, callExpression.callee.object);
    });

    it('creates 3 mutation operators for a call with one literal argument to a member of an object', function() {
        var ast = JSParserWrapper.parse('callThis.member(\'a\');'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create(callExpression);

        expect(mos.length).toBe(3);
        expect(CallExpressionArgsMOSpy.create.calls.count()).toBe(1);
        expect(CallExpressionSelfMOSpy.create.calls.count()).toBe(2);
        expect(CallExpressionArgsMOSpy.create).toHaveBeenCalledWith(callExpression, 'MUTATION!', 0);
        expect(CallExpressionSelfMOSpy.create).toHaveBeenCalledWith(callExpression, callExpression.arguments[0]);
        expect(CallExpressionSelfMOSpy.create).toHaveBeenCalledWith(callExpression, callExpression.callee.object);
    });
});