var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var concat = require('gulp-coffeescript-concat');
var stripCode = require('gulp-strip-code');

gulp.task('coffee', ['concatCoffee'], function() {
  gulp.src(['./src/*.coffee', '!./src/_*.coffee'])
    .pipe(stripCode({
      pattern: /### Concatened ###[\s\S]*?### Concatened end ###/g,
    }))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./lib/'));
    
  gulp.src(['./tmp/*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('concatCoffee', function() {
  gulp.src(['./node_modules/spark-starter/src/*.coffee','./src/*.coffee'])
    .pipe(concat('parallelio.coffee'))
    .pipe(stripCode({
      pattern: /### Standalone ###[\s\S]*?### Standalone end ###/g,
    }))
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('compress', ['coffee'], function () {
  gulp.src('./dist/parallelio.js')
    .pipe(uglify())
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['coffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('default', ['build']);