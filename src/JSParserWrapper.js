/**
 * This module provides an abstraction for the JS parser, making it easier to switch parsers
 * if the need arises (e.g. ES6 support)
 * @author Martin Koster [paysdoc@gmail.com], created on 17/06/15.
 * Licensed under the MIT license.
 */
(function(exports){
    'use strict';

    var esprima = require('esprima'),
        escodegen = require('escodegen');

    function parse(src) {
        var ast = esprima.parse(src, {range: true, loc: true, tokens: true, comment: true});

        return escodegen.attachComments(ast, ast.comments, ast.tokens);
    }

    function tokenize(src, options) {
        return esprima.tokenize(src, options);
    }

    function stringify(ast) {
        return escodegen.generate(ast);
    }

    exports.parse = parse;
    exports.stringify = stringify;
    exports.tokenize = tokenize;
})(module.exports);