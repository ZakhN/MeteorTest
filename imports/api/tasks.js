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
  'tasks.insert': function(text, sendToCalendar){
    check(text, String);
    check(sendToCalendar, Boolean);

    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    let codePhrase = '';
    let codePhraseTime = '';

    const todayReg = /(^| )сегодня(\W|$)/gi;
    const tomorrowReg = /(^| )завтра(\W|$)/gi;
    const datReg = /((^| )сегодня(\W|$)|(^| )завтра(\W|$))/ig;
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
      dueDate: codePhrase.length > 1  ?  codePhrase : ' ',
    });

      if (Meteor.isServer && sendToCalendar ){

        const {google} = require('googleapis');

        const oauth2Client = new google.auth.OAuth2('706668132829-8jvq7kj0burvehenqdt4on94ac8ganv6.apps.googleusercontent.com', 'Zc2Z5kVeo7zg0DkkwRMaQLmG',  'http://localhost:3000/_oauth/google');

        oauth2Client.credentials = { access_token: Meteor.user().services && Meteor.user().services.google && Meteor.user().services.google.accessToken };

        const calendar = google.calendar({version: 'v3', auth: oauth2Client });
        
        var event = {
          'summary': 'meteor-event',
          'description': text,
          'start': {
            'dateTime': moment(codePhrase).format(),
          },
          'end': {
            'dateTime': moment(codePhrase).format(),
          },
        };

        const accessToken = Meteor.user().services && Meteor.user().services.google && Meteor.user().services.google.accessToken;
        if (!accessToken) throw new Error('Please autorize via Google');

        calendar.events.insert({
          auth: oauth2Client,
          calendarId: 'primary',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
        });
      }
  },

  'tasks.remove': function(taskId) {
    check(taskId, String);
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
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
