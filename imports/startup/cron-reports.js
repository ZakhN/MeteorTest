import { Meteor } from 'meteor/meteor';
import { CronJob } from 'cron';
import _ from 'lodash';
// import mailer from './mailer';
import { Tasks } from '../api/tasks';

const cron = new CronJob('44 * * * *', Meteor.bindEnvironment(() => {
  const date = new Date(new Date().setHours(0,0,0,0));
  
  const users = Meteor.users.find({
    'status.lastLogin.date': { $gte: date },
  }).fetch();
  
  users.map(user => {
    const tasks = Tasks.find({ ownerId: user._id, createdAt: { $gte: date } }).fetch();
  
    const popularListTask = _.maxBy(tasks, 'listId');
  
    const result = {
      tasks: tasks.length,
      completed: tasks.filter(t => t.checked).length,
      lists: _.uniqBy(tasks, 'listId').length,
      popularListId: popularListTask && popularListTask.listId,
    };

    console.log('result', result);
  });
}, null, true));

export default cron;
