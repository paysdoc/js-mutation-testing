/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('ArrayExpressionMO', function() {
    var proxyquire = require('proxyquire'),
        first = {
            "range": [48, 60],
            "type": "ObjectExpression",
            "properties": [
                {
                    "range": [49, 59],
                    "key": {
                        "type": "Identifier",
                        "name": "foo"
                    },
                    "value": {
                        "type": "Literal",
                        "value": "foo",
                        "raw": "'foo'"
                    }
                }
            ]
        },
        second = {
            "range": [62, 67],
            "type": "Literal",
            "value": "bar"
        },
        third = {
            "range": [69, 76],
            "type": "ArrayExpression",
            "elements": [
                {
                    "range": [70, 75],
                    "type": "Literal",
                    "value": "baz"
                }
            ]
        },
        arrayElements = [first, second, third],
        node = {elements: arrayElements, someStuff: 'someStuff'},
        ArrayExpressionMO,
        MutationUtilsSpy,
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        ArrayExpressionMO = proxyquire('../../../src/mutationOperator/ArrayExpressionMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = ArrayExpressionMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = ArrayExpressionMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instance;

        expect(instances.length).toEqual(3);
        instance = instances[1];

        instance.apply();
        expect(node.elements.length).toBe(2);
        expect(node.elements[0]).toBe(first);
        expect(node.elements[1]).toBe(third);

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.elements).toEqual([first, third]);

        node.someStuff = 'otherStuff';
        instance.revert();
        expect(node.elements).toEqual([first, second, third]);
        expect(node.someStuff).toEqual('otherStuff');

        instance.revert(); //reverting again should have no effect
        expect(node.elements).toEqual([first, second, third]);

        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);
        expect(MutationUtilsSpy.createMutation).toHaveBeenCalledWith(arrayElements[1], 67, arrayElements[1]);
    });

    it('retrieves the replacement value and its coordinates', function() {
        expect(instances[0].getReplacement()).toEqual({value: null, begin: 48, end: 60});
        expect(instances[2].getReplacement()).toEqual({value: null, begin: 69, end: 76});
    });
});