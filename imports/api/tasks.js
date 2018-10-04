import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'tasks.insert': async function(text, sendToCalendar){
    check(text, String);
    check(sendToCalendar, Boolean);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    let codePhrase = '';
    let codePhraseTime = '';
    //TODO Разделить текст с кодовой фразой и передавать в Tasks чистый текст
    const todayReg = /(^| )сегодня(\W|$)/gi;
    const tomorrowReg = /(^| )завтра(\W|$)/gi;
    const datReg = /((^| )сегодня(\W|$)|(^| )завтра(\W|$))/ig;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/ig;
    
    if (((text.match(timeReg)) && (!text.match(datReg)))) throw new Meteor.Error('There is no date','Time determined, date not');

    const date = new Date();
    
    if (text.match(todayReg)) codePhrase = new Date().toLocaleDateString();

    else if (text.match(tomorrowReg)) codePhrase = new Date(date.setDate(date.getDate() + 1)).toLocaleDateString();

    if (text.match(timeReg)) codePhraseTime = text.match(timeReg);

    codePhrase = codePhrase + ' ' + codePhraseTime;

    const task = {
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.user().username,
    };
    
    if (codePhrase.length > 1) task.dueDate = new Date(moment.utc(codePhrase).format());

    if (Meteor.isServer && sendToCalendar) {
      import * as GoogleCalendar from '../integrations/google/calendar';

      let event = {
        summary: 'meteor-event',
        description: text,
        start: {
          dateTime: moment(codePhrase).format(),
        },
        end: {
          dateTime: moment(codePhrase).format(),
        },
      };

      const createdEvent = await GoogleCalendar.createEvent({
        event,
        userId: Meteor.userId(),
      });
      
      task.calendarEventId = createdEvent.id;
    }
    Tasks.insert(task);
  },
  
  'tasks.remove': async function(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);

    if (task.private && task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (task.calendarEventId && Meteor.isServer) {
      import * as GoogleCalendar from '../integrations/google/calendar';

      GoogleCalendar.deleteEvent({
        task: task,
        userId: this.userId,
      });
    }
    Tasks.remove(taskId);
  },

  'tasks.setChecked': function(taskId, setChecked){
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { checked: setChecked } });
  },

  'tasks.setPrivate': function(taskId, setToPrivate){
    check(taskId, String);
    check(setToPrivate, Boolean);
    const task = Tasks.findOne(taskId);

    if (task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },

  'tasks.hideChecked': function (isCheked){
    check(isCheked, Boolean);

    Meteor.users.update(this.userId, { $set:  { 'profile.hideChecked': isCheked } });
  }
});
