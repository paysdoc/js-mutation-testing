/**
 * test files
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul');

gulp.task('test', function() {
    gulp.src(['src/**/*.js'])
        .pipe(istanbul({includeUntested:true}))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/unit/**/*Spec.js'])
                .pipe(jasmine())
                .pipe(istanbul.writeReports())
                .on('error', function(err) {throw err;});
    });
});

gulp.task('e2e', function() {
    //TODO: implement
});