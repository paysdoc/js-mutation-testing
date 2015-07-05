/**
 * Spec for the array child node finder
 * @author Martin Koster [paysdoc@gmail.com], created on 29/06/15.
 * Licensed under the MIT license.
 */
describe("PropertyCNF", function(){

    var PropertyCNF = require('../../../src/childNodeFinder/PropertyCNF');

    it("finds the right child node on a given object expression node", function() {
        var node = {
            "type": "ObjectExpression",
            "properties": [
                {
                    "type": "Property",
                    "key": {
                        "type": "Literal",
                        "value": "1",
                        "raw": "\"1\""
                    },
                    "computed": false,
                    "value": {
                        "type": "BinaryExpression",
                        "operator": "*",
                        "left": {
                            "type": "Literal",
                            "value": 6,
                            "raw": "6"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 7,
                            "raw": "7"
                        }
                    },
                    "kind": "init",
                    "method": false,
                    "shorthand": false
                },
                {
                    "type": "Property",
                    "key": {
                        "type": "Literal",
                        "value": "2",
                        "raw": "\"2\""
                    },
                    "computed": false,
                    "value": {
                        "type": "BinaryExpression",
                        "operator": "*",
                        "left": {
                            "type": "Literal",
                            "value": 3,
                            "raw": "3"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 4,
                            "raw": "4"
                        }
                    },
                    "kind": "init",
                    "method": false,
                    "shorthand": false
                }
            ]
        };
        expect(new PropertyCNF(node).find()).toEqual([{
            type: 'BinaryExpression',
            operator: '*',
            left: Object({type: 'Literal', value: 6, raw: '6'}),
            right: Object({type: 'Literal', value: 7, raw: '7'})
        }, {
            type: 'BinaryExpression',
            operator: '*',
            left: Object({type: 'Literal', value: 3, raw: '3'}),
            right: Object({type: 'Literal', value: 4, raw: '4'})
        }]);
    });
});

