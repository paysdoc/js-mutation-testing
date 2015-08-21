/**
 * Specification for the call expression mutation operator
 * @author Martin Koster [paysdoc@gmail.com], created on 17/08/15.
 * Licensed under the MIT license.
 */
describe('CallExpressionMO', function() {
    var JSParserWrapper = require('../../../src/JSParserWrapper'),
        proxyquire = require('proxyquire'),
        MutationUtilsSpy,
        CallExpressionMO;

    beforeEach(function() {
        jasmine.addMatchers(require('../../util/JasmineCustomMatchers'));
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        CallExpressionMO = proxyquire('../../../src/mutationOperator/CallExpressionMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
    });

    it('creates no mutation operators for a call expression without arguments', function() {
        var ast = JSParserWrapper.parse('callThis();'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create({node: callExpression});

        expect(mos.length).toEqual(0);
    });

    it('creates two mutation operators for a call expression with one argument', function() {
        var ast = JSParserWrapper.parse('callThis(a);'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create({node: callExpression});

        expect(mos.length).toEqual(2);

        mos[0].apply();
        expect(callExpression).toHaveProperties({arguments: [{type: 'Literal', value: 'MUTATION!', raw: '\'MUTATION!\''}]});

        mos[0].revert();
        expect(callExpression).toHaveProperties({arguments: [{type: 'Identifier', name: 'a'}]});
    });

    it('creates 3 mutation operators for a call with one argument to a member of an object', function() {
        var ast = JSParserWrapper.parse('callThis.member(a);'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create({node: callExpression});

        expect(mos.length).toEqual(3);

        mos[2].apply();
        expect(callExpression).toHaveProperties({"type":"Identifier","name":"callThis"});

        mos[2].revert();
        expect(callExpression).toHaveProperties({
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {"type": "Identifier", "name": "callThis"},
                "property": {"type": "Identifier", "name": "member"}
            },
            "arguments": [{"type": "Identifier", "name": "a"}]
        });
    });

    it('creates 3 mutation operators for a call with one literal argument to a member of an object', function() {
        var ast = JSParserWrapper.parse('callThis.member(\'a\');'),
            callExpression = ast.body[0].expression,
            mos = CallExpressionMO.create({node: callExpression});

        var originalProps = {
            "type": "CallExpression",
            "callee": {
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
            "arguments": [{
                "type": "Literal",
                "value": "a",
                "raw": "'a'"
            }]
        };
        var mutatedProps = {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {type: 'Identifier', name: 'callThis'},
                property: {type: 'Identifier', name: 'member'}
            },
            arguments: ['"MUTATION!"']
        };
        expect(mos.length).toEqual(3);
        mos[0].apply();
        expect(callExpression).toHaveProperties(mutatedProps);
        mos[1].apply();
        expect(callExpression).toHaveProperties({type: 'Literal', value: 'a', raw: '\'a\''});
        mos[2].apply();
        expect(callExpression).toHaveProperties({type: 'Identifier', name: 'callThis'});
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(3);
        mos[2].apply();
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(3); //extra call should not have been made

        mos[2].revert();
        expect(callExpression).not.toHaveProperties({type: 'Identifier', name: 'callThis'});
        mos[2].revert();
        expect(callExpression).not.toHaveProperties({type: 'Identifier', name: 'callThis'});
        expect(callExpression).toHaveProperties({type: 'Literal', value: 'a', raw: '\'a\''});
        mos[1].revert();
        expect(callExpression).not.toHaveProperties({type: 'Literal', value: 'a', raw: '\'a\''});
        expect(callExpression).toHaveProperties(mutatedProps);
        mos[0].revert();
        expect(callExpression).toHaveProperties(originalProps);
    });
});