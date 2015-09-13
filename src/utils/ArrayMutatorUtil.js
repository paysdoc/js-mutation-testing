/**
 * utility class for removing array elements and adding them in the correct order
 *
 * Restoring the elements in the correct (original) order can be of crucial importance as it determines - in the case of a
 * block statement - the order in which statements are executed.
 *
 * The difficulty here is with comparing array elements.
 * @author Martin Koster [paysdoc@gmail.com], created on 13/09/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';
    var _ = require('lodash');

    /**
     * remove the element from the array
     * @param {Array} array array from which to remove the element
     * @param {*} element element to be removed
     * @param {Function} callback function to be called if provided
     * @returns {*} the result of the callback
     */
    function removeElement(array, element, callback) {
        var i = array.indexOf(element),
            cbResult;

        if (i == -1) {
            throw 'Element to be removed not found in array: ' + element;
        }

        cbResult = callback && callback();
        array.splice(i, 1);
        return cbResult;
    }

    /**
     * restores an element to an array in the same relative position as in the original array, bearing in mind that the
     * array may still be missing other elements that distort the position.
     *
     * The way this is done it to find the absolute position of the element in the original array by seeking its index.
     * If the element is represented array multiple times in the original an array of indexes is returned. This array
     * only contains the indexes of elements that have NOT yet been added (e.g. during previous calls to this function).
     * The first of these indexes is used as reference index.
     *
     * Subsequently, a suitable spot is found in the destination array. inside the search loop pending indexes (this time
     * of the current item of the iteration) are retrieved once again in order to see whether
     *     a) there are more of this element in original and
     *     b) any of these occur after the element to add (referenceIndex)
     * If the latter (b) is the case the element is inserted before the current item, otherwise it's appended to the end
     * of the array
     *
     * @param {Array} destination array to which to restore the element
     * @param {*} element the element to restore to its correct (relative) position
     * @param {Array} original the array in its original state - used for reference
     */
    function restoreElement(destination, element, original) {
        var origElementIndexes = getPendingIndexes(original, destination, element, true),
            stillSearching = true, referenceIndex, itemIdx, pendingIndexes;

        if (!origElementIndexes.length) {
            return; //this means that all elements in the original array are already in 'array' -> nothing more to be done;
        }

        referenceIndex = origElementIndexes[0];
        for(itemIdx = 0; itemIdx < destination.length && stillSearching; itemIdx++) {
            pendingIndexes = getPendingIndexes(original, destination.slice(0, itemIdx), destination[itemIdx]);
            if (pendingIndexes.length && referenceIndex < pendingIndexes[0]) {
                destination.splice(itemIdx, 0, element);
                stillSearching = false;
            }
        }

        if (stillSearching) {
            destination.push(element);
        }
    }

    /**
     * Retrieves the indexes of all occurrences in 'original' of given element that have not yet been added to
     * 'destination'
     */
    function getPendingIndexes(original, destination, element, shouldBeInOriginal) {
        var origElementIndexes = getElementIndexes(original, element),
            arrayElementIndexes = getElementIndexes(destination, element);

        function getElementIndexes(collection, value) {
            return _.transform(collection, function (result, el, idx) {
                if (el === value) { //check for reference equality rather than for instance _.eq, as we need the original astNode references back in the array
                    result.push(idx);
                }
            });
        }

        // not found in original array when it should? then throw an error
        if (shouldBeInOriginal && !origElementIndexes.length) {
            throw 'Element to be restored not found in original array: ' + element;
        }

        /* Remove number of elements found in 'array' from 'original', leaving only those instances of element in
         * original that have not yet been added to 'array'.
         * The upshot of this is that equivalent elements (in 'original') are added from front to back in 'array'
         * (ie. first time an element is added it will be placed in the first available spot starting from the front of the array).
         */
        return origElementIndexes.slice(Math.min(arrayElementIndexes.length, origElementIndexes.length), origElementIndexes.length);
    }


    module.exports.removeElement = removeElement;
    module.exports.restoreElement = restoreElement;
})(module);