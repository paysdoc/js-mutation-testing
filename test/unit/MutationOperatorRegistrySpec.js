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
        mockStatus, mockMOWarden = {getMOStatus: function() {return mockStatus}},
        MockEqualityOperatorMO, MockMutationConfiguration, getMOStatusSpy;

    function mockCreate(create, key) {
        if (_.isFunction(create)) {
            return function(node) {
                return create(node).length ? [{code: key, getReplacement: function() {return {value: null, begin: 0, end: 0};}}] : [];
            };
        } else {
            return function() {return [{code: create, getReplacement: function() {return {value: null, begin: 0, end: 0};}}];};
        }
    }

    beforeEach(function() {
        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));

        mockStatus = 'include';
        getMOStatusSpy = spyOn(mockMOWarden, 'getMOStatus').and.callThrough();
        MockMutationConfiguration = jasmine.createSpyObj('MutationConiguration', ['isInIgnoredRange', 'isReplacementIgnored']);
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
            './childNodeFinder/ArrayCNF': function() {return {type: "ArrayCNF"};},
            './childNodeFinder/CallExpressionCNF': function() {return {type: "CallExpressionCNF"};},
            './childNodeFinder/ChildNodeFinder': function() {return {type: "ChildNodeFinder"};},
            './childNodeFinder/ForLoopCNF': function() {return {type: "ForLoopCNF"};},
            './childNodeFinder/IterationCNF': function() {return {type: "IterationCNF"};},
            './childNodeFinder/LeftRightCNF': function() {return {type: "LeftRightCNF"};},
            './childNodeFinder/PropertyCNF': function() {return {type: "PropertyCNF"};}
        });
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
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['block_statement']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ArrayCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for a while / do...while statement', function() {
        var node = {"type": "WhileStatement"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('IterationCNF');

        node = {"type": "DoWhileStatement"};
        selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('IterationCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for a \'for\' loop', function() {
        var node = {"type": "ForStatement"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ForLoopCNF');
    });

    it('returns no mutation operator and a fitting childNodeFinder for an assignment expression', function() {
        var node = {"type": "AssignmentExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ChildNodeFinder');
    });

    it('returns a mutation operator and fitting childNodeFinder for a call expression', function() {
        var node = {"type": "CallExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['method_call']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('CallExpressionCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for a block statement', function() {
        var node = {"type": "ObjectExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['object']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('PropertyCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for a block statement', function() {
        var node = {"type": "ArrayExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['array']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ArrayCNF');
    });

    it('returns a mutation operator and fitting childNodeFinder for an arithmetic expression', function() {
        var node = {"type": "BinaryExpression", "operator": "+"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toContain('math');
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns mutation operators and a fitting childNodeFinder for a comparison expression', function() {
        var node = {"type": "BinaryExpression", "operator": ">="};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toContain('comparison');
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns mutation operators and a fitting childNodeFinder for a equality expression', function() {
        var node = {"type": "BinaryExpression", "operator": "==", "range": [23, 24]},
            result;

        mockStatus = 'exclude';
        result = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);
        expect(result.included.length).toEqual(0);
        expect(result.excluded).toEqual([[23, 24]]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns a mutation operator and no childNodeFinder for an update expression', function() {
        var node = {"type": "UpdateExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['update_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });


    it('returns a mutation operator and no childNodeFinder for a literal', function() {
        var node = {"type": "Literal"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['literal']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });

    it('returns a mutation operator and no childNodeFinder for an unary expression', function() {
        var node = {"type": "UnaryExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['unary_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });

    it('returns a mutation operator and fitting childNodeFinder for an logical expression', function() {
        var node = {"type": "LogicalExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual(['logical_expression']);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('LeftRightCNF');
    });

    it('returns no mutation operators and a fitting childNodeFinder for an unrecognized type', function() {
        var node = {"type": "FooExpression"};
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node).type).toEqual('ChildNodeFinder');
    });

    it('returns a list of ignored mutation operators', function() {
        var selectedMO;

        mockStatus = 'ignore';
        MockMutationConfiguration = {isInIgnoredRange: function() {return false;}, isReplacementIgnored: function() {return true;}};
        selectedMO = MutationOperatorRegistry.selectMutationOperators({"type": "LogicalExpression"}, mockMOWarden);
        expect(selectedMO.ignored).toEqual([[0,0]]);
    });

    it('returns a mutation operator and fitting childNodeFinder for an unrecognized type', function() {
        var node = "Foo";
        var selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);

        expect(_.pluck(selectedMO.included, 'code')).toEqual([]);
        expect(MutationOperatorRegistry.selectChildNodeFinder(node)).toEqual(null);
    });

    it('excludes a mutation operator if its code is set to be excluded', function(){
        var node = {"type": "Literal", range: [3, 7]},
            selectedMO;

        mockStatus = 'exclude';
        selectedMO = MutationOperatorRegistry.selectMutationOperators(node, mockMOWarden);
        expect(selectedMO.excluded).toEqual([[3, 7]]);
    });
});