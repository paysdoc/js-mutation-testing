/**
 * test files
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul'),
    path = require('path'),
    log4js = require('log4js'),
    MutationTester = require('../src/MutationTester');

gulp.task('test', function() {
    'use strict';

    testRunner({src: ['src/**/*.js'], specs: ['test/unit/**/*Spec.js']});
});

gulp.task('e2e', function() {
    'use strict';

    new MutationTester({mutate: ['../test/e2e/code/arguments.js'], specs: ['../test/e2e/code/arguments-test.js'], basePath: __dirname}). test(testRunner);
});

function testRunner(config, cb) {
    'use strict';

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