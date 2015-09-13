/**
 * Specification for the mutation configuration
 * @author Martin Koster [paysdoc@gmail.com], created on 04/09/15.
 * Licensed under the MIT license.
 */
describe('MutationConfiguration', function() {

    var MutationConfiguration = require('../../src/MutationConfiguration');
    var node = {
        "range": [68, 111],
        "type": "BlockStatement",
        "body": [
            {
                "range": [72, 85],
                "type": "ExpressionStatement",
                "expression": {
                    "range": [72, 84],
                    "type": "Literal",
                    "value": "use strict",
                    "raw": "'use strict'"
                }
            },
            {
                "range": [88, 109],
                "type": "VariableDeclaration",
                "declarations": [
                    {
                        "range": [92, 108],
                        "type": "VariableDeclarator",
                        "id": {
                            "range": [92, 100],
                            "type": "Identifier",
                            "name": "question"
                        },
                        "init": {
                            "range": [103, 108],
                            "type": "Literal",
                            "value": "uh?",
                            "raw": "'uh?'"
                        }
                    }
                ],
                "kind": "var"
            }
        ]
    };

    it('creates getters from all properties in config', function() {
        var config = new MutationConfiguration();
        expect(config.getLogLevel()).toBe('INFO');
        expect(config.getReporters().console).toBeTruthy();
        expect(config.getIgnore().toString()).toBe('/(\'use strict\'|"use strict");/');
    });

    it('ignores the \'use strict\' statement', function() {
        expect(new MutationConfiguration().isInIgnoredRange(node)).toBeFalsy();
        expect(new MutationConfiguration().isInIgnoredRange(node.body[0])).toBeTruthy();
    });
});