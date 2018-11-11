import { Meteor } from 'meteor/meteor';
import dotenv from 'dotenv';

import '../imports/api/tasks';
import '../imports/api/lists';
import '../imports/api/payments';
import '../imports/api/stripe';
import '../imports/startup/account-creation';

import cron from '../imports/startup/cron-reports';

dotenv.config({ path: `${process.env.PWD}/.env` });

Meteor.startup(() => {

  cron.start();

  Slingshot.createDirective('myFileUploads', Slingshot.S3Storage, {
    bucket: Meteor.settings.public.bucket,
    maxSize: 1024 * 1024 * 1,
    acl: 'public-read',
    region: Meteor.settings.public.region,
    AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    AWSSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'],
    authorize: () => {
      // var message;
      // if (!this.userId) {
      //   message = 'Please login before posting files';
      //   throw new Meteor.Error('Login Required', message);
      // }
      return true;
    },
    key: function(file) {
      // admin would be the folder and file would be saved with a timestamp
      return 'admin/' + Date.now() + file.name;
    }
   });
});
