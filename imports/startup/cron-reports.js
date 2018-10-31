import { Meteor } from 'meteor/meteor';
import { CronJob } from 'cron';
import _ from 'lodash';

import { Tasks } from '../api/tasks';
import { Lists } from '../api/lists';
import sendEmail from '../integrations/meteor-email';

const getMostPopularElement = arr => arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop();

const cron = new CronJob(Meteor.settings.cronStartupFrequency, Meteor.bindEnvironment(() => {
  // const date = new Date(new Date().setHours(0,0,0,0));
  
  // const users = Meteor.users.find({
  //   'status.lastLogin.date': { $gte: date },
  // }).fetch();
  
  // users.map(user => {
  //   const tasks = Tasks.find({ ownerId: user._id, createdAt: { $gte: date } }).fetch();

  //   const popularListId = getMostPopularElement(_.map(tasks, 'listId'));
  //   const popularList = Lists.findOne(popularListId, { fields: { name: 1 } });

  //   const result = {
  //     tasks: tasks.length,
  //     completed: tasks.filter(t => t.checked).length,
  //     lists: _.uniqBy(tasks, 'listId').length,
  //     popularListName: popularList && popularList.name,
  //   };

  //   console.log('result', result);
    
  //   sendEmail({ email: 'zakh@milkandcartoons.com', report: result });

  // });

  
}, null, true));

export default cron;
