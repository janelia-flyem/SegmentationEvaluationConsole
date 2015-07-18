module.exports = function(grunt) {

    // load npm modules at runtime -- cleans up configu file
    require('jit-grunt')(grunt);

  
    // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      build: {
        options: {
            paths: ['node_modules/bootstrap/less']
        },
        files: { 'build/css/main.css': 'src/less/main.less'}
      }
    },
    cssmin: {
          build: {
              files: [{
                  expand: true,
                  cwd: 'build/css',
                  src: ['*.css', '!*.min.css'],
                  dest: 'build/css',
                  ext: '.min.css'
              }]
          }
    },
    browserify: {
      app:          {
        options: {
            transform:  [ require('grunt-react').browserify ]
        },
        src:        'src/js/app.js',
        dest:       'build/js/bundle.js'
      },
      specs: {
        options: {
            transform:  [ require('grunt-react').browserify ],
            browserifyOptions: {
                debug: true,
                paths: ["./node_modules"]
            }
        },
        src: ["test/specs/*.js"],
        dest: "test/specs.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/js/bundle.js',
        dest: 'build/js/bundle.min.js'
      }
    },
    jasmine: {
        tests: {
            src: [],
            options: {
                outfile: "test/_SpecRunner.html",
                specs: "test/specs.js"
            }
        }
    },
    copy: {
        main: {
                files: [
                    {
                        src: 'src/application.html',
                        dest: 'build/application.html'
                    },
                    {
                        expand: "true",
                        cwd: 'node_modules/bootstrap/',
                        src: 'fonts/*',
                        dest: 'build/'
                    }
                ]
        }
    },
    jslint: {
        client: {
            src: [
                'src/js/app.js',
                'src/js/components/*.js'
            ],
            directives: {
                node: true,
                browser: true,
                predef: [
                    '$'
                ]
            }
        }
    },
    watch: {
      scripts: {
        files: ['src/application.html', 'src/js/app.js', 'src/js/**/*.js'],
        tasks: ['browserify', 'less', 'uglify', 'cssmin', 'copy']
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['browserify:app', 'less', 'uglify', 'copy', 'cssmin', 'watch']);
  grunt.registerTask('lint', 'Running lint', ['jslint']);
  grunt.registerTask('test', ["browserify:specs", "jasmine"]);

};
