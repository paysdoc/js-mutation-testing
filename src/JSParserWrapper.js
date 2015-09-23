/**
 * This module provides an abstraction for the JS parser, making it easier to switch parsers
 * if the need arises (e.g. ES6 support)
 * @author Martin Koster [paysdoc@gmail.com], created on 17/06/15.
 * Licensed under the MIT license.
 */
(function(exports){
    'use strict';

    var _ = require('lodash'),
        esprima = require('esprima'),
        escodegen = require('escodegen');

    /**
     * Parses the source
     * @param {string} src to be parsed
     * @param {object} [options] parsing options are: range (default = true), loc (default = true), tokens (default = false), comments (default = true)
     * @returns {*}
     */
    function parse(src, options) {
        var ast = esprima.parse(src, _.merge({range: true, loc: true, tokens: true, comment: true}, options || {})),
            result = escodegen.attachComments(ast, ast.comments, ast.tokens);

        return options && options.tokens ? result : _.omit(result, 'tokens');
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