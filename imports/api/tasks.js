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
  'tasks.insert': function(text){
    check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let codePhrase = '';
    let codePhraseTime = '';

    
    const todayReg = /(^| )сегодня(\W|$)/gi;
    const tomorrowReg = /(^| )завтра(\W|$)/gi;
    const datReg = /(сегодня |завтра )/ig;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/ig;
    
    if (((text.match(timeReg)) && (!text.match(datReg)))) throw new Meteor.Error('There is no date','Time determined, date not');
  
    const date = new Date();

    if (text.match(todayReg)) codePhrase = new Date().toLocaleDateString();
    else if (text.match(tomorrowReg)) codePhrase =  new Date(date.setDate(date.getDate() + 1)).toLocaleDateString();
    if (text.match(timeReg)) codePhraseTime = text.match(timeReg);

    codePhrase = codePhrase + ' ' + codePhraseTime;

    console.log(codePhrase);  

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      dueDate: codePhrase
    });

    const {google} = require('googleapis');

var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2015-05-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2015-05-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

const calendar = google.calendar({version: 'v3', auth});
  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
  },

  'tasks.remove': function(taskId) {
    check(taskId, String);
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
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
});
