var gulp = require("gulp");
var fs = require("fs");
var gutil = require("gulp-util");
var rename = require("gulp-rename");
// var jsdoc = require("gulp-jsdoc3");
var typedoc = require("gulp-typedoc");
var jsdoc2md = require("jsdoc-to-markdown");
var gulpJsdoc2md = require("gulp-jsdoc-to-markdown");
var conventionalChangelog = require("gulp-conventional-changelog");

gulp.task("doc:api:full", function () {
    return jsdoc2md.render({ files: "lib/**/*.js" })
        .then(function(output) {
            return fs.writeFileSync("api/index.md", output);
        });
});

gulp.task("doc:api:files", function () {
    return gulp.src(["lib/FileSystemStore.js"])         // CHANGE: Put your documented files
        .pipe(gulpJsdoc2md(/*{ template: fs.readFileSync("./readme.hbs", "utf8") }*/))
        .on("error", function (err) {
            gutil.log(gutil.colors.red("jsdoc2md failed"), err.message);
        })
        .pipe(rename(function (path) {
            path.extname = ".md";
        }))
        .pipe(gulp.dest("api"));
});

gulp.task("doc:app", function (cb) {
    return gulp.src("./src/FileSystemStore.ts")
        .pipe(typedoc({
            // typescript
            target: "es5",
    		module: "commonjs",
    		moduleResolution: "node",
    // 		sourceMap: true,
    		experimentalDecorators: true,
    		emitDecoratorMetadata: true,
    // 		lib: [ "es2015", "dom" ],
    		noImplicitAny: false,
    		suppressImplicitAnyIndexErrors: true,
    		
    		// typedoc
    		out: "doc",
    		json: "doc/out.json",
    		
    		name: "FileSystemStore",
    		// theme: "",
    		// plugins: ["", ""],
    		ignoreCompilerErrors: false,
    		version: true
        }));
    
    // var config = require("../../jsdoc.conf.json");
    // gulp.src(["./src/**/*.js"], {read: false})
    //     .pipe(jsdoc(config, cb));
});

gulp.task("changelog", function () {
    return gulp.src("CHANGELOG.md", {
        buffer: false
    })
    .pipe(conventionalChangelog({
        preset: "angular",
        outputUnreleased: true,
        releaseCount: 0
    }, {    // CHANGE: Put your github repository info
        host: "https://github.com",
        owner: "eastolfi",
        repository: "FileSystemStore"
    }))
    .pipe(gulp.dest("./"));
});