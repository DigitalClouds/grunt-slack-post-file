/**
 * Created by David Osborne on 14/11/2016.
 */
"use strict";

const fs = require('mz/fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = function (grunt) {

    grunt.registerMultiTask('slack-post-file', 'Post a file to slack.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        const options = this.options({
            apiUrl: 'https://slack.com/api/files.upload',
            comment: null
        });
        this.requiresConfig('token', 'channels', 'fileSrc');
        const done = this.async();

        fs.readFile(options['fileSrc'])
            .then((file) => {
                let form = new FormData();
                form.append('token', options['token']);
                form.append('file', file);
                form.append('filename', path.parse(options['fileSrc']).base);
                if (options['comment']) {
                    form.append('initial_comment', options['comment']);
                }
                // TODO: get channel ids for this
                form.append('channels', options['channels'].join());

                return fetch(options['apiUrl'], {method: 'POST', body: form});
            }).then((res)=> {
                let body = res.json();
                if(body.ok){
                    grunt.log.oklns(`${options['fileSrc']} sent to Slack`);
                    done();
                }
                else{
                    throw new Error(body.error);
                }
            }).catch((err)=> {
                grunt.fatal(err.message);
        });

    });

};