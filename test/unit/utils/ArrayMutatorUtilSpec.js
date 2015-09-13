/**
 * Specification for the array mutator
 * @author Martin Koster [paysdoc@gmail.com], created on 13/09/15.
 * Licensed under the MIT license.
 */
describe('ArrayMutatorUtil', function() {
    var _ = require('lodash'),
        ArrayMutatorUtil = require('../../../src/utils/ArrayMutatorUtil'),
        original,
        idA = {"type": "Identifier","name": "a"},
        idB = {"type": "Identifier","name": "b"},
        fnExpr = {
            "type": "FunctionExpression",
            "id": null,
            "params": [{"type": "Identifier", "name": "c"}],
            "defaults": [],
            "body": {
                "type": "BlockStatement",
                "body": [{
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": { "type": "Identifier", "name": "c"},
                        "right": {"type": "Literal", "value": 1, "raw": "1"}
                    }
                }
                ]
            },
            "generator": false,
            "expression": false
        };

    beforeEach(function() {
        original = [idA, 'foo', idB, fnExpr, 'foo', idB, 'foo', 3, false];
    });

    it('Applies a given mutation on a given array by finding the element in the array and removing is', function() {
        var callbackSpy = jasmine.createSpy('callback'),
            array = _.clone(original);

        ArrayMutatorUtil.removeElement(array, fnExpr, callbackSpy);
        expect(array).toEqual([idA, 'foo', idB, 'foo', idB, 'foo', 3, false]);
        expect(callbackSpy.calls.count()).toBe(1);
    });

    it('throws an exception if an attempt is made to remove an element that is not in the array', function() {
        var callbackSpy = jasmine.createSpy('callback'),
            array = _.clone(original);

        function remodeInvalid() {
            ArrayMutatorUtil.removeElement(array, 'fnExpr', callbackSpy);
        }

        expect(remodeInvalid).toThrow('Element to be removed not found in array: fnExpr');
    });

    it('returns elements into an array as close as possible to their original position', function() {
        var array = [3];
        ArrayMutatorUtil.restoreElement(array, idB, original);
        expect(array).toEqual([{"type": "Identifier","name": "b"}, 3]);

        ArrayMutatorUtil.restoreElement(array, fnExpr, original);
        ArrayMutatorUtil.restoreElement(array, 'foo', original);
        ArrayMutatorUtil.restoreElement(array, 'foo', original);
        ArrayMutatorUtil.restoreElement(array, idA, original);
        ArrayMutatorUtil.restoreElement(array, false, original);
        ArrayMutatorUtil.restoreElement(array, idB, original);
        ArrayMutatorUtil.restoreElement(array, 'foo', original);
        expect(array).toEqual(original);
    });

    it('ignores an element if all of its instances are already in the array', function() {
        var array = _.clone(original);
        ArrayMutatorUtil.restoreElement(array, 'foo', original); //all 'foo's are already added - this one should be ignored
        expect(array).toEqual(original);
    });

    it('throws an exception if an element is restored to the array which was not in the original', function() {
        var array = [{foo: 'foo'}];
        function returnInvalid() {
            ArrayMutatorUtil.restoreElement(array, ['bla', 'ble', 'bli'], original);
        }

        expect(returnInvalid).toThrow('Element to be restored not found in original array: bla,ble,bli');
    })
});