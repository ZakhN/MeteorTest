import { Meteor } from 'meteor/meteor';
// import { Lists } from '../imports/api/lists';
import '../imports/api/tasks';
import '../imports/api/lists';

import '../imports/startup/account-creation';
import schedule from '../imports/integrations/schedule';


Meteor.startup(() => {
  schedule();
});

