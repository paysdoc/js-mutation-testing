/**
 * specification for the mutation operator registry
 * @author Martin Koster [paysdoc@gmail.com], created on 25/08/15.
 * Licensed under the MIT license.
 */
describe('MutationOperatorRegistry', function() {
    var proxyquire = require('proxyquire'),
        _ = require('lodash'),
        MutationOperatorRegistry = require('../../src/MutationOperatorRegistry'),
        ComparisonOperatorMO = require('../../src/mutationOperator/ComparisonOperatorMO'),
        EqualityOperatorMO = require('../../src/mutationOperator/EqualityOperatorMO'),
        ArithmeticOperatorMO = require('../../src/mutationOperator/ArithmeticOperatorMO'),
        MockEqualityOperatorMO;

    function mockCreate(create, key) {
        if (_.isFunction(create)) {
            return function(node) {
                return create(node).length ? [key] : [];
            };
        } else {
            return function() {return create};
        }
    }

    beforeEach(function() {
        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));
        MockEqualityOperatorMO = {
            code: "EQUALITY",
            exclude: true,
            create: mockCreate(EqualityOperatorMO.create, 'equality')
        };
        MutationOperatorRegistry = proxyquire('../../src/MutationOperatorRegistry', {
            './mutationOperator/ComparisonOperatorMO': {code: "COMPARISON", create: mockCreate(ComparisonOperatorMO.create, 'comparison')},
            './mutationOperator/EqualityOperatorMO': MockEqualityOperatorMO,
            './mutationOperator/ArithmeticOperatorMO': {code: "MATH", create: mockCreate(ArithmeticOperatorMO.create, 'math')},
            './mutationOperator/ArrayExpressionMO': {code: "ARRAY", create: mockCreate("array")},
            './mutationOperator/BlockStatementMO': {code: "BLOCK_STATEMENT", create: mockCreate("block_statement")},
            './mutationOperator/ObjectMO': {code: "OBJECT", create: mockCreate("object")},
            './mutationOperator/LiteralMO': {code: "LITERAL", create: mockCreate("literal")},
            './mutationOperator/UnaryExpressionMO': {code: "UNARY_EXPRESSION", create: mockCreate("unary_expression")},
            './mutationOperator/LogicalExpressionMO': {code: "LOGICAL_EXPRESSION", create: mockCreate("logical_expression")},
            './mutationOperator/CallExpressionMO': {code: "METHOD_CALL", create: mockCreate("method_call")},
            './mutationOperator/UpdateExpressionMO': {code: "UPDATE_EXPRESSION", create: mockCreate("update_expression")},
            './childNodeFinder/ArrayCNF': function() {return {type: "ArrayCNF"}},
            './childNodeFinder/CallExpressionCNF': function() {return {type: "CallExpressionCNF"}},
            './childNodeFinder/ChildNodeFinder': function() {return {type: "ChildNodeFinder"}},
            './childNodeFinder/ForLoopCNF': function() {return {type: "ForLoopCNF"}},
            './childNodeFinder/IterationCNF': function() {return {type: "IterationCNF"}},
            './childNodeFinder/LeftRightCNF': function() {return {type: "LeftRightCNF"}},
            './childNodeFinder/PropertyCNF': function() {return {type: "PropertyCNF"}}
        });
    });

    it('returns all mutation operators that are excluded by default', function() {
        expect(MutationOperatorRegistry.getDefaultExcludes()).toHaveProperties({EQUALITY: true});
    });

    it('throws an exception if it comes across a MutationOperator class without a code', function() {
        delete MockEqualityOperatorMO.code;
        expect(MutationOperatorRegistry.getDefaultExcludes).toThrowError('expected a MutationOperation class with a code, but code was undefined');
    });

    it('returns all mutation mutation codes that are not excluded by default', function() {
        expect(MutationOperatorRegistry.getAllMutationCodes()).toEqual([
            'BLOCK_STATEMENT',
            'METHOD_CALL',
            'OBJECT',
            'ARRAY',
            'MATH',
            'COMPARISON',
            'EQUALITY',
            'UPDATE_EXPRESSION',
            'LITERAL',
            'UNARY_EXPRESSION',
            'LOGICAL_EXPRESSION'
        ]);
    });

    it('returns a mutation operator and fitting childNodeFinder for a block statement', function() {
        var node = {"body": []};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['block_statement']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ArrayCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for a while / do...while statement', function() {
        var node = {"type": "WhileStatement"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('IterationCNF');

        node = {"type": "DoWhileStatement"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('IterationCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for a \'for\' loop', function() {
        var node = {"type": "ForStatement"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ForLoopCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for an assignment expression', function() {
        var node = {"type": "AssignmentExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ChildNodeFinder');
    });

    it('returns a mutation operator and fitting childNodeFinder for a call expression', function() {
        var node = {"type": "CallExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['method_call']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('CallExpressionCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for a block statement', function() {
        var node = {"type": "ObjectExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['object']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('PropertyCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for a block statement', function() {
        var node = {"type": "ArrayExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['array']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ArrayCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for an arithmetic expression', function() {
        var node = {"type": "BinaryExpression", "operator": "+"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toContain('math');
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns mutation operators and a fitting childNodeFinder for a comparison expression', function() {
        var node = {"type": "BinaryExpression", "operator": ">="};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toContain('comparison');
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns mutation operators and a fitting childNodeFinder for a comparison expression', function() {
        var node = {"type": "BinaryExpression", "operator": "=="},
            result = MutationOperatorRegistry.selectMutationOperators({node: node, excludes: ['EQUALITY']});

        expect(result.operators.length).toEqual(0);
        expect(result.excludes).toEqual(['EQUALITY']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns a mutation operator and no childNodeFinder for an update expression', function() {
        var node = {"type": "UpdateExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['update_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });


    it('returns a mutation operator and no childNodeFinder for a literal', function() {
        var node = {"type": "Literal"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['literal']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });

    it('returns a mutation operator and no childNodeFinder for an unary expression', function() {
        var node = {"type": "UnaryExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['unary_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });

    it('returns a mutation operator and fitting childNodeFinder for an logical expression', function() {
        var node = {"type": "LogicalExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual(['logical_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns no mutation operators and a fitting childNodeFinder for an unrecognized type', function() {
        var node = {"type": "FooExpression"};

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ChildNodeFinder');
    });

    it('returns a mutation operator and fitting childNodeFinder for an unrecognized type', function() {
        var node = "Foo";

        expect(MutationOperatorRegistry.selectMutationOperators({node: node}).operators).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });
});