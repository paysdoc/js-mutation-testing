/**
 * useless unit test for endless loop
 * Created by martin on 25/03/15.
 */
var endlessLoop = require('./../code/endlessLoop');
describe('Endless Loop', function () {

    it('tests to see whether mutations cause code to loop indefinitely', function () {
        endlessLoop.provokeEndlessLoop({input: '102365770045232'});
    });

});
