'use strict';

/**
 * build the file
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat');
gulp.task('build', function() {

    gulp.src('src/**/*.js')
        .pipe(concat('js-mutation-test.js'))
        .pipe(gulp.dest('./build/'));
});