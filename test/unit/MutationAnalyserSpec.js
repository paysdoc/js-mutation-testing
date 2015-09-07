/**
 * Specification for the Mutation analyser
 * @author Martin Koster [paysdoc@gmail.com], created on 01/09/15.
 * Licensed under the MIT license.
 */
describe('MutationAnalyser', function() {
    var proxyquire = require('proxyquire'),
        MutationOperatorRegistry = require('../../src/MutationOperatorRegistry'),
        BlockStatementMO = require('../../src/mutationOperator/BlockStatementMO'),
        ArithmeticOperatorMO = require('../../src/mutationOperator/ArithmeticOperatorMO'),
        LiteralMO = require('../../src/mutationOperator/LiteralMO'),
        mutationAnalyser, ExclusionsSpy, MutationConfigurationSpy, selectMutationOperatorsSpy, selectChildNodeFinderSpy;

    var ast = {
        "type": "Program",
        "body": [
            {
                "type": "VariableDeclaration",
                "declarations": [
                    {
                        "type": "VariableDeclarator",
                        "id": { "type": "Identifier", "name": "x"},
                        "init": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "defaults": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": [{
                                    "type": "ReturnStatement",
                                    "argument": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {"type": "Identifier", "name": "b"},
                                        "right": {"type": "Literal", "value": 1, "raw": "1"}
                                    }
                                }]
                            },
                            "generator": false,
                            "expression": false
                        }
                    }
                ],
                "kind": "var"
            }
        ]
    };

    beforeEach(function() {
        var MutationAnalyser;

        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));

        ExclusionsSpy = jasmine.createSpyObj('ExclusionUtils', ['getExclusions']);
        MutationConfigurationSpy = jasmine.createSpyObj('MutationConfiguration', ['isInIgnoredRange', 'isReplacementIgnored']);
        selectMutationOperatorsSpy = spyOn(MutationOperatorRegistry, 'selectMutationOperators').and.callThrough();
        selectChildNodeFinderSpy = spyOn(MutationOperatorRegistry, 'selectChildNodeFinder').and.callThrough();
        MutationAnalyser = proxyquire('../../src/MutationAnalyser', {
            './utils/ExclusionUtils': ExclusionsSpy,
            './MutationOperatorRegistry': MutationOperatorRegistry
        });
        mutationAnalyser = new MutationAnalyser(ast, MutationConfigurationSpy);
    });

    it('finds all eligible mutation operators in the given AST', function() {
        var mutationOperatorSets = mutationAnalyser.collectMutations({LITERAL: true});
        expect(mutationOperatorSets.length).toEqual(4);
        expect(ExclusionsSpy.getExclusions.calls.count()).toBe(25);

        //if we call collect again the mutation collection should have been cached and returned => ExclusionSpy.getExclusions should not have been called any more times
        mutationAnalyser.collectMutations({LITERAL: true});
        expect(ExclusionsSpy.getExclusions.calls.count()).toBe(25);
    })
});