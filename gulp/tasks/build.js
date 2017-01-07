var gulp = require("gulp");
var del = require("del");
// var babel = require("gulp-babel");
var ts = require("gulp-typescript");
// var minify = require("gulp-minify");
// var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
// var source = require("vinyl-source-stream");
// var buffer = require("vinyl-buffer");

gulp.task("clean:lib", function () {
    return del([
        "lib/**/*.js"
    ]);
});

var tsProject = ts.createProject("tsconfig.json");

gulp.task("build:app", ["clean:lib"], function () {
    return gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("lib"));
});

// gulp.task("bundle:app", ["build:app"], function() {
//     return browserify({
//         entries: ["./index.js"],    // CHANGE: Put your project entry file
//         debug: true
//     })
//     .transform("babelify", {presets: ["es2015", "react"]})
//     .bundle()
//     .pipe(source("./app.js"))       // CHANGE: The name of browser-ready file
//     .pipe(buffer())
//     .pipe(sourcemaps.init({loadMaps: true}))
//     .pipe(sourcemaps.write("./"))
//     .pipe(gulp.dest("./dist"));         // CHANGE: Where your file will be
// });

// gulp.task("compress:app", function() {
//     return gulp.src("dist/app.js")      // CHANGE: The file to compress
//         .pipe(minify({
//             ext:{
//                 min:".min.js"
//             }
//         }))
//         .pipe(gulp.dest("dist"));       // CHANGE: The minimified file destination
// });