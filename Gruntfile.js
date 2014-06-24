module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), // the package file to use
 
    uglify: {
      files: {
        expand: true, 
        flatten: true, 
        src: 'src/js/*.js',
        dest: 'dist',
        ext: '.min.js'
      }
    },

    less: {
        options: {
            cleancss: true,
            compile: true
        },
        core: {
            files: {
                "dist/bootstrap-treeview.min.css": "src/less/bootstrap-treeview.less"
            }
        }
    },

    qunit: {
        all: ['tests/*.html']
    },

    watch: {
      files: ['tests/*.js', 'tests/*.html', 'src/**'],
      tasks: ['default']
    },

    copy: {
      main: { 
        files: [
          // copy dist to tests
          // { expand: true, cwd: 'dist', src: '*', dest: 'tests/lib/' },
          { expand: true, cwd: 'src/less', src: '*', dest: 'tests/lib/' },
          { expand: true, cwd: 'src/js', src: '*', dest: 'tests/lib/' },
        ]
      }
    }
  });

  // load up your plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');

  // register one or more task lists (you should ALWAYS have a "default" task list)
  grunt.registerTask('default', ['uglify', 'less', 'copy', 'qunit']);
  grunt.registerTask('build', ['uglify', 'less', 'copy', 'qunit']);
};
