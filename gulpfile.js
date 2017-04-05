var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var concat = require('gulp-coffeescript-concat');

gulp.task('coffee', function() {
  gulp.src(['./src/*.coffee'])
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./dist/'));
    
  gulp.src(['./tmp/*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('concatCoffee', function() {
  gulp.src(['./src/*.coffee','./node_modules/spark-starter/src/*.coffee'])
    .pipe(concat('parallelio.coffee'))
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('compress', function () {
  gulp.src('./dist/parallelio.js')
    .pipe(uglify())
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['concatCoffee', 'coffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('default', ['build']);