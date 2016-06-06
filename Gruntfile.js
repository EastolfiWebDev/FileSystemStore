module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    
        watch: {
            test: {
                files: ['test_src/*.js'],
                tasks: ['babel'],
                options: {
                    spawn: false,
                }
            },
            dist: {
                files: ['src/**/*.js'],
                tasks: ['build_app'],
                options: {
                    spawn: false,
                }
            }
        },
        
        babel: {
            options: {
                sourceMaps: "inline",
                compact: false
            },
            dist: {
                files: {
                    "lib/FileSystemStore.js":             "src/FileSystemStore.js"
                }
            }
        },
    
        simplemocha: {
            all: {
                src: ['test/1_Base.js']
            }
        },
        
        jsdoc : {
            dist : {
                src: ['src/FileSystemStore.js'],
                options: {
                    destination: 'doc',
                    config: 'jsdoc.conf.json'
                }
            }
        },
        
        jsdoc2md: {
            fullDoc: {
                src: ['src/FileSystemStore.js'],
                dest: 'api/documentation.md'
            },
            apiDoc: {
                files: [
                    { src: 'src/FileSystemStore.js', dest: 'api/FileSystemStore.md' }
                ]
            }
        },
        
        coveralls: {
            options: {
                force: false
            },
            
            dist: {
                src: ['test/coverage/coverage-dist.lcov'],
                options: { }
            }
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
    grunt.loadNpmTasks('grunt-coveralls');
    
    // Documentation
    grunt.registerTask('build_doc', ['jsdoc:dist']);
    grunt.registerTask('build_html', ['jsdoc2md:fullDoc', 'jsdoc2md:apiDoc']);
    grunt.registerTask('build_full_doc', ['build_doc', 'build_html']);
    
    grunt.registerTask('watch_dist', ['watch:dist']);
    grunt.registerTask('build_app', ['babel:dist']);
    
    grunt.registerTask('dev_test', ['simplemocha:dev']);
    grunt.registerTask('run_test', ['simplemocha:all']);
    grunt.registerTask('coveralls_dist', ['coveralls:dist']);
    
    grunt.registerTask('full_build', ['build_app', 'build_doc', 'run_test']);
    
    grunt.registerTask('default', ['full_build']);
};