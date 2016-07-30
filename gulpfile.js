var gulp = require('gulp'),
    sh = require('shelljs');

var host = 'http://localhost:1313';

gulp.task('publish', [], function() {
    sh.exec('hugo');
    sh.exec('aws s3 cp ./public s3://www.rushtehrani.com/ --recursive');
});

gulp.task('emulate:web', [], function() {
    sh.exec('open ' + host);
    sh.exec('hugo server -w');
});
