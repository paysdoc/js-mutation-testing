/**
 * Configuration for Mutation testing
 * @author Martin Koster [paysdoc@gmail.com], created on 15/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';

    var _ = require('lodash'),
        glob = require('glob'),
        log4js = require('log4js'),
        path = require('path'),
        JSParserWrapper = require('./JSParserWrapper');

    // Placeholder function for when no explicit before, after, or test function is provided
    function CALL_DONE(done) {
        done(true);
    }

    var DEFAULT_OPTIONS = {
            before: CALL_DONE,
            beforeEach: CALL_DONE,
            test: CALL_DONE,
            afterEach: CALL_DONE,
            after: CALL_DONE,

            basePath: '.',
            logLevel: 'INFO',
            reporters: {console: true},
            ignoreReplacements: [],
            excludeMutations: [],
            maxReportedMutationLength: 80,
            mutateProductionCode: false,
            discardDefaultIgnore: false
        },
        DEFAULT_REPORTER = {
            console: true // By default, report only to the console, which takes no additional configuration
        },
        REQUIRED_OPTIONS = [
            'mutate' // The files to perform the mutation tests on
        ];

    var Configuration = function(rawConfig) {
        var ignore = rawConfig && rawConfig.discardDefaultIgnore ? []: [/('use strict'|"use strict");/],
            configIgnore = rawConfig.ignore || [],
            config = _.merge(DEFAULT_OPTIONS, rawConfig);

        if(!areRequiredOptionsSet(config)) {
            throw new Error('Not all required options have been set');
        }

        // ensure that ignore and ignoreReplacement are arrays and are added to the rawConfig
        Array.prototype.push.apply(ignore, ensureArray(configIgnore));
        config.ignore = ignore;
        config.ignoreReplacements = rawConfig && rawConfig.ignoreReplacements? ensureArray(rawConfig.ignoreReplacements) : [];

        config.mutate = expandFiles(config.mutate, config.basePath);

        // Set logging options
        log4js.setGlobalLogLevel(log4js.levels[rawConfig.logLevel]);
        log4js.configure({
            appenders: [{type: 'console', layout: {type: 'pattern', pattern: '%[(%d{ABSOLUTE}) %p [%c]:%] %m'}}]
        });

        // Only set the default reporter when no explicit reporter configuration is provided
        if(!rawConfig.hasOwnProperty('reporters')) {
            rawConfig.reporters = DEFAULT_REPORTER;
        }

        //with all options set - let's make sure each option has a getter
        _.forOwn(config, function(value, prop) {
            Configuration.prototype['get' + _.capitalize(prop)] = function() {
                return value;
            };
        });
    };

    function ensureArray(val) {
        return val ? _.isArray(val) ? val : [val] : [];
    }

    module.exports = Configuration;

    /**
     * Prepend all given files with the provided basepath and expand all wildcards
     * @param files the files to expand
     * @param basePath the basepath from which the files should be expanded
     * @returns {Array} list of expanded files
     */
    function expandFiles(files, basePath) {
        var expandedFiles = [];

        if(!_.isArray(files)) {
            files = [files];
        }

        _.forEach(files, function(fileName) {
            expandedFiles = _.union(
                expandedFiles,
                glob.sync(path.join(basePath, fileName), { dot: true })
            );
        });

        return expandedFiles;
    }

    /**
     * Check if all required options are set on the given opts object
     * @param opts the options object to check
     * @returns {boolean} indicator of all required options have been set or not
     */
    function areRequiredOptionsSet(opts) {
        return !_.find(REQUIRED_OPTIONS, function(option) {
            return !opts.hasOwnProperty(option);
        });
    }

})(module);