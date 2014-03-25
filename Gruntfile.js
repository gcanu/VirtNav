module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: '**/*.js',
                        dest: 'build/',
                        ext: '-min.js'
                    }
                ]
            }
        },

        // JSHint
        jshint: {
            options: {
                camelcase: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noempty: true,
                nonbsp: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                devel: true

            },
            all: ['src/**/*.js']
        },

        // Watch
        watch: {
            compilecoffee: {
                files: ['src/**/*.coffee'],
                tasks: ['coffee:all'],
                options: {
                    event: ['added', 'changed']
                }
            }
        },

        // CoffeeScript compiler
        coffee: {
            all: {
                expand: true,
                cwd: 'src/',
                src: '**/*.coffee',
                dest: 'src/',
                ext: '.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'jshint']);

};