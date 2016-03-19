'use strict';
/**
 * main build
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    del = require('del');

require('require-dir')('./gulp');
gulp.task('clean', function() {
    del(['build', 'coverage', 'reports']);
});
gulp.task('default', ['clean', 'lint', 'test', 'e2e', 'build']);
gulp.task('pre-commit', ['clean', 'lint', 'test']);