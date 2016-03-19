/**
 * Configuration for Mutation testing
 * @author Martin Koster [paysdoc@gmail.com], created on 15/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';

    var JSParserWrapper = require('./JSParserWrapper'),
        CopyUtils = require('./utils/CopyUtils'),
        log4js = require('log4js'),
        glob = require('glob'),
        path = require('path'),
        _ = require('lodash'),
        Q = require('q');

    // Placeholder function for when no explicit before, after, or test function is provided
    function CALL_DONE(done) {
        _.isFunction(done) && done(true);
    }

    var DEFAULT_OPTIONS = {
            before: CALL_DONE,
            beforeEach: CALL_DONE,
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
        REQUIRED_OPTIONS = [
            'lib',    // libraries required for the test
            'mutate', // The files to perform the mutation tests on (subset of 'code')
            'specs'   // The unit tests that (mutated) files are tested against (may be a subset of 'code')
        ];

    var logger = log4js.getLogger('MutationConfiguration');
    function Configuration(rawConfig) {
        var ignore = rawConfig && rawConfig.discardDefaultIgnore ? []: [/('use strict'|"use strict");/],
            configIgnore = rawConfig.ignore || [],
            config = this._config = _.merge(DEFAULT_OPTIONS, rawConfig);

        if(!areRequiredOptionsSet(config)) {
            throw new Error('Not all required options have been set');
        }

        // Set logging options
        log4js.setGlobalLogLevel(log4js.levels[config.logLevel]);
        log4js.configure({
            appenders: [{type: 'console', layout: {type: 'pattern', pattern: '%[(%d{ABSOLUTE}) %p [%c]:%] %m'}}]
        });

        // ensure that ignore and ignoreReplacement are arrays and are added to the rawConfig
        Array.prototype.push.apply(ignore, toArray(configIgnore));
        config.ignore = ignore;
        config.ignoreReplacements = toArray(config && config.ignoreReplacements);

        config.lib = expandFiles(toArray(config.lib), config.basePath);
        config.mutate = expandFiles(toArray(config.mutate), config.basePath);
        config.specs = expandFiles(toArray(config.specs), config.basePath);

        this.initPathPromise = initPath(config);
    }

    Configuration.prototype.get = function(key) {
        return this._config[key];
    };

    Configuration.prototype.onInitComplete = function(cb) {
        var self = this;
        this.initPathPromise.done(function() {
            logger.trace('init complete with mutation files residing in %s', self.get('mutate'));
            cb();
        });
    };

    function toArray(val) {
        return _.isArray(val) ? val : [val];
    }

    /**
     * Prepend all given files with the provided basepath and expand all wildcards
     * @param files the files to expand
     * @param basePath the basepath from which the files should be expanded
     * @returns {Array} list of expanded files
     */
    function expandFiles(files, basePath) {
        var expandedFiles = [];

        _.forEach(files, function(fileName) {
            expandedFiles = _.union(
                expandedFiles,
                toArray(glob.sync(path.join(basePath, fileName), { dot: true }))
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

    function initPath(config) {
        var files;

        logger.trace('mutate', config.mutate);
        if(config.mutateProductionCode) {
            return new Q({});
        } else {
            files = config.lib.concat(config.mutate, config.specs);
            return CopyUtils.copyToTemp(files, 'mutation-testing').then(function(tempDirPath) {

                logger.trace('Copied %j to %s', files, tempDirPath);

                // Set the basePath relative to the temp dir
                logger.trace('base path', config.basePath);
                config.basePath = path.join(tempDirPath, config.basePath);

                // Set the paths to the files to be mutated relative to the temp dir
                config.lib = _.map(config.lib, function(file) {
                    return path.join(tempDirPath, file);
                });

                // Set the paths to the files to be mutated relative to the temp dir
                config.mutate = _.map(config.mutate, function(file) {
                    return path.join(tempDirPath, file);
                });

                // Set the paths to the files to be mutated relative to the temp dir
                config.specs = _.map(config.specs, function(file) {
                    return path.join(tempDirPath, file);
                });
            });
        }
    }

    module.exports = Configuration;
})(module);