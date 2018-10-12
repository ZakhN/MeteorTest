import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

export const Tasks = new Mongo.Collection('tasks');

/**
 * tasks.remove
 * @const remove events from db and gCalengar.
 */
const taskRemove = new ValidatedMethod({
  name: 'tasks.remove',
  validate: new SimpleSchema({
    taskId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ taskId }) {
    const task = Tasks.findOne(taskId);

    if (!task) throw new Meteor.Error('Task does not exist');

    if (task.private && task.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (task.calendarEventId && Meteor.isServer) {
     /* eslint-disable */
      import * as GoogleCalendar from '../integrations/google/calendar'; // eslint-disable-line
    /* eslint-enable */
      GoogleCalendar.deleteEvent({
        eventId: task.calendarEventId,
        userId: this.userId,
      });
    }

    Tasks.remove(taskId);
  }
});

/**
 * tasks.hideChecked
 * @const hiden checked events from ui
 */
const taskHideCheked = new ValidatedMethod({
  name: 'tasks.hideChecked',
  validate: new SimpleSchema({
    isCheked: { type: Boolean },
  }).validator(),
  run({ isCheked }) {
    Meteor.users.update(this.userId, { $set:  { 'profile.hideChecked': isCheked } });
  }
});

/**
 * tasks.setPrivate
 * @const set events to private
 */
const taskSetPrivate = new ValidatedMethod({
  name: 'tasks.setPrivate',
  validate: new SimpleSchema({
    taskId: { type: String, regEx: SimpleSchema.RegEx.Id },
    setToPrivate: { type: Boolean },
  }).validator(),
  run({ setToPrivate, taskId }) {
    const task = Tasks.findOne(taskId);
    if (!task) new Meteor.Error('Task do not exist');

    if (task.ownerId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

/**
 * tasks.setChecked
 * @const set events to checked
 */
const taskSetChecked = new ValidatedMethod({
  name: 'tasks.setChecked',
  validate: new SimpleSchema({
    setChecked: { type: Boolean },
    taskId: { type: String },
  }).validator(),
  run({ setChecked, taskId }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const task = Tasks.findOne({_id: taskId});

    if (this.userId !== task.ownerId) throw new Meteor.Error('Access denied');

    Tasks.update(taskId, { $set: { checked: setChecked } });
  }
});

/**
 * tasks.insert
 * @const insert task into collection
 */
const taskInsert = new ValidatedMethod({
  name: 'tasks.insert',
  validate: new SimpleSchema({
    text: { type: String },
    sendToCalendar: { type: Boolean },
    // listId: { type: String },
  }).validator(),
   async run({ text, sendToCalendar, listId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // console.log(Meteor.user().profile.selectedListId);
    if (Meteor.user().profile.selectedListId.length < 1) {
      throw new Meteor.Error('You should select task-list before insert a new task');
    }

    //#region RegExps
    let codePhrase = '';
    let codePhraseTime = '';
    //TODO Разделить текст с кодовой фразой и передавать в Tasks чистый текст
    const todayReg = /(^| )сегодня(\W|$)/gi;
    const tomorrowReg = /(^| )завтра(\W|$)/gi;
    const datReg = /((^| )сегодня(\W|$)|(^| )завтра(\W|$))/ig;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/ig;
    //#endregion 

    if (((text.match(timeReg)) && (!text.match(datReg)))) throw new Meteor.Error('There is no date','Time determined, date not');

    const date = new Date();

    if (text.match(todayReg)) codePhrase = new Date().toLocaleDateString();

    else if (text.match(tomorrowReg)) codePhrase = new Date(date.setDate(date.getDate() + 1)).toLocaleDateString();

    if (text.match(timeReg)) codePhraseTime = text.match(timeReg);

    codePhrase = codePhrase + ' ' + codePhraseTime;

    const task = {
      text,
      createdAt: new Date(),
      ownerId: this.userId,
      username: Meteor.user().username,
      listId: Meteor.user().profile.selectedListId,
    };

    if (codePhrase.length > 1) task.dueDate = new Date(moment.utc(codePhrase).format());

    if (Meteor.isServer && sendToCalendar && Meteor.user().services.google && codePhrase.length > 2) {
  
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
});



if (Meteor.isServer) {
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { ownerId: this.userId },
      ],
    });
  });


  const LISTS_METHODS = _.map([
    taskRemove,
    taskHideCheked,
    taskSetPrivate,
    taskSetChecked,
    taskInsert,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
