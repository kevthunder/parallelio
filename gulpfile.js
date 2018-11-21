require('source-map-support').install();

var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var mocha = require('gulp-mocha');
var merge = require('merge2');
var concatStrings = require('parallelio-strings/gulp/concatStrings');
var wrapper = require('spark-wrapper');
var run = require('run-sequence');
var autoCommit = require('spark-auto-commit');

gulp.task('coffee', function() {
  return gulp.src(['./src/**/*.coffee'])
    .pipe(coffee({bare: true}))
    .pipe(wrapper({namespace:'Parallelio'}))
    .pipe(wrapper.loader({namespace:'Parallelio'}))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('concatStrings', function() {
  return concatStrings('_strings.coffee')
    .pipe(gulp.dest('./tmp/'));
});

gulp.task('concat', gulp.series('concatStrings', function() {
  return merge([
    wrapper.composeModule({namespace:'Parallelio.Spark',module:'spark-starter'},'src/**/*.coffee')
      .pipe(wrapper.composeModule({namespace:'Parallelio',module:'parallelio-grids'},'src/*.coffee'))
      .pipe(wrapper.composeModule({namespace:'Parallelio',module:'parallelio-tiles'},'src/*.coffee'))
      .pipe(wrapper.composeModule({namespace:'Parallelio',module:'parallelio-pathfinder',main:'PathFinder'},'src/*.coffee'))
      .pipe(wrapper.composeModule({namespace:'Parallelio',module:'parallelio-timing',main:'Timing'},'src/*.coffee'))
      .pipe(wrapper.composeModule({namespace:'Parallelio',module:'parallelio-wiring'},'src/*.coffee')),
    gulp.src([
      './tmp/_strings.coffee',
      './src/**/*.coffee'
    ])
  ])
    .pipe(wrapper.compose({namespace:'Parallelio'}))
    .pipe(concat('parallelio.coffee'))
    .pipe(gulp.dest('./tmp/'));
}));

gulp.task('concatCoffee', gulp.series('concat', function() {
  return gulp.src(['./tmp/**/*.coffee', '!./tmp/_*.coffee'])
    .pipe(coffee())
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('compress', gulp.series('concatCoffee', function () {
  return gulp.src('./dist/parallelio.js')
    .pipe(uglify())
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/**/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./test/'));
});

gulp.task('update', function() {
  return autoCommit.afterModuleUpdate(function(cb){
    return run('test',cb);
  });
});

var build;
gulp.task('build', build = gulp.series('coffee', 'concatCoffee', 'compress', function (done) {
    console.log('Build Complete');
    done();
}));

gulp.task('watch', gulp.series('build', function() {
  return gulp.watch(['./src/**/*.coffee'], gulp.series('coffee', 'concatCoffee', 'compress'));
}));

gulp.task('test', gulp.series('build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha());
}));

gulp.task('test-debug', gulp.series('build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha({"inspect-brk":true, require:['source-map-support/register']}));
}));

gulp.task('default', build);