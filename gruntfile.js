module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        ts: {
            default: {
                tsconfig: true
            }
        },
        copy: {
            default: {
                files: [
                    {
                        src:
                            [
                                'modules/**/*.js',
                                'modules/**/*.map',
                                'index.js.map',
                                'index.js',
                                '*.json'
                            ],
                        dest: 'dist/'
                    }
                ]
            }
        },
        clean: {
            default: [
                'dist',
                'modules/**/*.js',
                'modules/**/*.map',
                'index.js.map',
                'index.js']
        }
    });

    grunt.registerTask("default", ["ts"]);
    grunt.registerTask("dist", ["clean","ts", "copy"]);
};