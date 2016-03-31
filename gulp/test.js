/**
 * test files
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    gulp_jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul'),
    path = require('path'),
    MutationTester = require('../src/MutationTester');

gulp.task('test', function() {
    'use strict';

    gulp.src(['src/**/*.js'])
        .pipe(istanbul({includeUntested:true}))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/unit/**/*Spec.js'])
                .pipe(gulp_jasmine())
                .pipe(istanbul.writeReports())
                .on('error', function(err) {throw err;});
        });
});

gulp.task('e2e', function() {
    'use strict';

    var mutate = ['code/**/*.js'],
        specs = ['tests/**/*-test.js'],
        lib = ['../../node_modules/lodash/**/*.js'];

    function completionHandler(passed, cb) {
        cb(passed);
    }
    new MutationTester({
        lib: lib,
        mutate: mutate,
        specs: specs,
        basePath: process.cwd() + '/test/e2e/',
        logLevel: 'DEBUG'}
    ).test(function(config, cb) {
            var cache = require.cache || {};
            var jasmine;

            for(var key in cache) {
                if(cache.hasOwnProperty(key)) {
                    delete cache[key];
                }
            }

            jasmine = new (require('jasmine'))({projectBaseDir: config.basePath});
            jasmine.loadConfig({
                spec_dir: '',
                spec_files: specs,
                helpers: lib
            });
            jasmine.onComplete(function(passed) {
                completionHandler(passed, cb);
            });
            jasmine.execute();
        }
    );
});