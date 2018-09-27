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

    
    const todayReg = /сегодня/i;
    const tomorrowReg = /завтра/i;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/i;
    
    if (((text.match(timeReg)) &&  (!text.match(todayReg)))) throw new Meteor.Error('There is no date','Time determined, date not');
  
    const date = new Date();

    if (text.match(todayReg)) codePhrase = new Date().toLocaleDateString();
    if (text.match(tomorrowReg)) codePhrase =  new Date(date.setDate(date.getDate() + 1)).toLocaleDateString();
    if (text.match(timeReg)) codePhraseTime = text.match(timeReg);

    codePhrase = codePhrase + ' ' + codePhraseTime;
      
    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      dueDate: codePhrase
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
