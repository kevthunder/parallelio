var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var mocha = require('gulp-mocha');
var merge = require('merge2');
var concatStrings = require('parallelio-strings/gulp/concatStrings');
var wrapper = require('spark-wrapper');

gulp.task('coffee', function() {
  return gulp.src(['./src/*.coffee'])
    .pipe(coffee({bare: true}))
    .pipe(wrapper({namespace:'Parallelio'}))
    .pipe(wrapper.loader({namespace:'Parallelio'}))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('concatStrings', function() {
  return concatStrings('_strings.coffee')
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('concat', ['concatStrings'], function() {
  console.log(require.resolve('spark-starter/package.json'));
  return merge([
    wrapper.composeModule({namespace:'Parallelio.Spark',module:'spark-starter'},'src/*.coffee'),
    wrapper.composeModule({namespace:'Parallelio',module:'parallelio-tiles'},'src/*.coffee'),
    wrapper.composeModule({namespace:'Parallelio',module:'parallelio-pathfinder'},'src/*.coffee'),
    gulp.src([
      './tmp/_strings.coffee',
      './src/*.coffee'
    ])
  ])
    .pipe(wrapper.compose({namespace:'Parallelio'}))
    .pipe(concat('parallelio.coffee'))
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('concatCoffee', ['concat'], function() {
  return gulp.src(['./tmp/*.coffee', '!./tmp/_*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', ['concatCoffee'], function () {
  return gulp.src('./dist/parallelio.js')
    .pipe(uglify())
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./test/'));
});

gulp.task('test', ['build','coffeeTest'], function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha());
});

gulp.task('build', ['coffee', 'concatCoffee', 'compress'], function () {
    console.log('Build Complete');
});

gulp.task('default', ['build']);