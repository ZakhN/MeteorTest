import { Meteor } from 'meteor/meteor';
// import { Lists } from '../imports/api/lists';
import '../imports/api/tasks';
import '../imports/api/lists';

import '../imports/startup/account-creation';
import cron from '../imports/startup/cron-reports';

Meteor.startup(() => {
  cron.start()
});
