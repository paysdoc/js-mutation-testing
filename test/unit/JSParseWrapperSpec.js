/**
 * Specification for the JSParseWrapepr
 * @author Martin Koster [paysdoc@gmail.com], created on 31/08/15.
 * Licensed under the MIT license.
 */
describe('JSParseWrapper', function () {
    var JSParserWrapper = require('../../src/JSParserWrapper');
    var tokens = [{
        "type": "Keyword",
        "value": "function",
        "range": [22, 30]
    }, {
        "type": "Identifier",
        "value": "a",
        "range": [31, 32]
    }, {
        "type": "Punctuator",
        "value": "(",
        "range": [32, 33]
    }, {
        "type": "Punctuator",
        "value": ")",
        "range": [33, 34]
    }, {
        "type": "Punctuator",
        "value": "{",
        "range": [35, 36]
    }, {
        "type": "Keyword",
        "value": "var",
        "range": [36, 39]
    }, {
        "type": "Identifier",
        "value": "a",
        "range": [40, 41]
    }, {
        "type": "Punctuator",
        "value": "=",
        "range": [42, 43]
    }, {
        "type": "Numeric",
        "value": "3",
        "range": [44, 45]
    }, {
        "type": "Punctuator",
        "value": "+",
        "range": [46, 47]
    }, {
        "type": "Numeric",
        "value": "2",
        "range": [48, 49]
    }, {
        "type": "Punctuator",
        "value": ";",
        "range": [49, 50]
    }, {
        "type": "Punctuator",
        "value": "}",
        "range": [50, 51]
    }];
    var expected = {
        "type": "Program",
        "body": [{
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "a",
                "range": [31, 32]
            },
            "params": [],
            "defaults": [],
            "body": {
                "type": "BlockStatement",
                "body": [{
                    "type": "VariableDeclaration",
                    "declarations": [{
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "name": "a",
                            "range": [40, 41]
                        },
                        "init": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                                "type": "Literal",
                                "value": 3,
                                "raw": "3",
                                "range": [44, 45]
                            },
                            "right": {
                                "type": "Literal",
                                "value": 2,
                                "raw": "2",
                                "range": [48, 49]
                            },
                            "range": [44, 49]
                        },
                        "range": [40, 49]
                    }],
                    "kind": "var",
                    "range": [36, 50]
                }],
                "range": [35, 51]
            },
            "rest": null,
            "generator": false,
            "expression": false,
            "range": [22, 51]
        }],
        "range": [22, 51],
        "comments": [{
            "type": "Line",
            "value": "some silly function",
            "range": [0, 21]
        }],
        "tokens": tokens,
        "leadingComments": [{
            "type": "Line",
            "value": "some silly function",
            "range": {"0": 0, "1": 21},
            "extendedRange": [0, 22]
        }]
    };

    beforeEach(function () {
        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));
    });

    it('parses a valid piece of source code', function () {
        var ast = JSParserWrapper.parse('//some silly function\nfunction a() {var a = 3 + 2;}', {tokens: true});
        expect(ast).toHaveProperties(expected);
    });

    it('throws and error if an invalid piece of source code is offered for parsing', function () {
        function parseInvalid() {
            return JSParserWrapper.parse('function a() {var a = 3 + ;}');
        }

        expect(parseInvalid).toThrowError('Line 1: Unexpected token ;');
    });

    it('tokenizes a valid piece of source code', function () {
        var ast = JSParserWrapper.tokenize('//bla\nfunction a() {var a = 3 + 2;}');
        expect(ast).toHaveProperties(tokens);
    });

    it('stringifies an AST Node', function() {
        expect(JSParserWrapper.stringify(expected)).toEqual('function a() {\n    var a = 3 + 2;\n}');
    });

    it('throws an error if an invalid AST node is passed to the stringify function', function() {
        function stringifyInvalid() {
            return JSParserWrapper.stringify({daft: 'old object'});
        }
        expect(stringifyInvalid).toThrowError('Unknown node type: undefined');
    });

});