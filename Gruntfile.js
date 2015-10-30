module.exports = function(grunt) {

  // Configuration of tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Configuration of SASS task
    sass: {
      options: {
        includePaths: ['bower_components/foundation/scss']
      },
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: true,
        },
        files: {
          'css/app.css': 'scss/app.scss',
          'css/index.css': 'scss/index.scss'
        }
      }
    },

    // Configuration for Webpack task
    webpack: {
      build: {
        entry: './js/app.js',
        output: {
          path: "./js/",
          filename: "app-bundle.js",
        },
      }
    },

    // Configuration for the watch task
    watch: {
      grunt: {
        options: {
          reload: true
        },
        files: ['Gruntfile.js']
      },

      // This part watches our sass folder, and runs the sass task when any file ending in .scss is modified inside
      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass']
      },

      // This watches our js folder, and runs the webpack task when a file ending in .js is modified. 
      //Since the task outputs app-bundle.js in the js directory,
      // we have to exclude this file from our watch list
      webpack: {
        files: ['js/**/*.js', 'js/**/*.ejs', '!js/app-bundle.js'],
        tasks: ['webpack']
      }


    }
  });
  // End config of tasks

  // Load the task runners
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('build', ['sass', 'webpack']);
  grunt.registerTask('default', ['build', 'watch']);
};
