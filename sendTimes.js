#! /usr/bin/env node

require('dotenv').config();
const zipFolder = require('zip-folder');
const sendmail = require('sendmail')();
const del = require('del');

zipFolder('./json', 'times.zip', (zipErr) => {
  if (zipErr) {
    // eslint-disable-next-line
    console.log('oh no!', zipErr);
  } else {
    sendmail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: 'Tennis Times',
      html: 'Tennis Times',
      attachments: [
        {
          filename: 'times.zip',
          path: 'times.zip'
        }
      ]
    }, (err, reply) => {
      // eslint-disable-next-line
      console.log(err && err.stack);
      // eslint-disable-next-line
      console.dir(reply);

      del(['json/*.json']).then((paths) => {
        // eslint-disable-next-line
        console.log('Deleted files:\n', paths.join('\n'));
      });
    });
  }
});
