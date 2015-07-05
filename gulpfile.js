/**
 * main build
 * @author Martin Koster [paysdoc@gmail.com], created on 21/06/15.
 * Licensed under the MIT license.
 */
var gulp = require('gulp'),
    del = require('del');

require('require-dir')('./gulp');
gulp.task('clean', function() {
    del('build');
});
gulp.task('default', ['clean', 'lint', 'test', 'e2e', 'build']);