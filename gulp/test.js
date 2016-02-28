/**
 * test files
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul'),
    path = require('path'),
    MutationTester = require('../src/MutationTester');

gulp.task('test', function() {
    'use strict';

    testRunner({src: ['src/**/*.js'], specs: ['test/unit/**/*Spec.js']});
});

gulp.task('e2e', function() {
    'use strict';

    var mutate = ['../test/e2e/code/**/*.js'],
        specs = ['../test/e2e/tests/**/*-test.js'],
        lib = ['../node_modules/chai/**/*.js', '../node_modules/lodash/**/*.js'];

    function completionHandler(passed, cb) {
        cb(passed ? 0 : 1);
    }
    new MutationTester({
        lib: lib,
        mutate: mutate,
        specs: specs,
        basePath: __dirname,
        logLevel: 'TRACE'}
    ).test(function(src, specs, cb) {
            testRunner({src: src, specs: specs}, cb, function(passed) {
                completionHandler(passed, cb);
            });
            process.on('uncaughtException', function(error) {
                console.log('caught ', error);
                cb(1, error.message);
            });
        }
    );
});

function testRunner(config, cb, completionHandler) {
    'use strict';

    if (completionHandler) {
        jasmine.onComplete(completionHandler);
    }
    gulp.src(config.src)
        .pipe(istanbul({includeUntested:true}))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(config.specs)
                .pipe(jasmine())
                .pipe(istanbul.writeReports())
                .on('finish', function() {cb && cb();})
                .on('error', function(err) {throw err;});
        });
}