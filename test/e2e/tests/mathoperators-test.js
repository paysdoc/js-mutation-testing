var mathoperators = require("./../code/mathoperators");
describe('Math operators', function () {
    it('add', function () {
        expect(mathoperators.addOperator(4, 0)).toEqual(4);
    });

    it('subtract', function () {
        expect(mathoperators.subtractOperator(4, 0)).toEqual(4);
    });

    it('multiply', function () {
        expect(mathoperators.multiplyOperator(4, 1)).toEqual(4);
    });

    it('divide', function () {
        expect(mathoperators.divideOperator(4, 1)).toEqual(4);
    });

    it('divide - handle dividing by 0 situation', function () {
        expect(mathoperators.divideOperator(4, 0)).toEqual(0);
    });

    it('modulus', function () {
        expect(mathoperators.modulusOperator(0, 1)).toEqual(0);
    });

});
