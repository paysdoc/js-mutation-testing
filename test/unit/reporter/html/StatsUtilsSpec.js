/**
 * Unit test specs for StatUtils
 * @author Martin Koster [paysdoc@gmail.com], created on 07/08/15.
 * Licensed under the MIT license.
 */
describe('StatsUtils', function() {
    var StatUtils = require('../../../../src/reporter/html/StatUtils');

    it('decorates the given mutation test statistics with percentages', function() {
        var  decoratedStats = StatUtils.decorateStatPercentages({all:20, killed: 14, survived: 4, ignored: 1, untested: 1});
        expect(decoratedStats).toEqual({
            all: 20, killed: 14, survived: 4, ignored: 1, untested: 1, success: 16,
            successRate: '80.0', killedRate: '70.0', survivedRate: '20.0', ignoredRate: '5.0', untestedRate: '5.0'
        });
    });

    it('reverts to 0 percentages when stats are 0 to prevent division by 0', function() {
        var  decoratedStats = StatUtils.decorateStatPercentages({all:0, killed: 0, survived: 0, ignored: 0, untested: 0});
        expect(decoratedStats).toEqual({
            all:0, killed: 0, survived: 0, ignored: 0, untested: 0, success: 0,
            successRate: '0.0', killedRate: '0.0', survivedRate: '0.0', ignoredRate: '0.0', untestedRate: '0.0'
        });
    });
});