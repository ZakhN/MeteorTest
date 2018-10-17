const { google } = require('googleapis');

import { HTTP } from 'meteor/http';

import GoogleOAuth from './oauth';

const GoogleCalendar = ({ userId }) => google.calendar({ version: 'v3', auth: GoogleOAuth({ userId }) });

const createEvent = async ({ event, userId }) => {
  const calendar = GoogleCalendar({ userId });

  return new Promise((resolve, reject) => {
    // const calendarId = HTTP.call('GET', 'GET https://www.googleapis.com/calendar/v3/users/me/calendarList', { });

    calendar.events.insert({
      auth: GoogleOAuth({ userId }),
      calendarId: 'primary',
      resource: event,
    }, (err, response) => {
      if (err) return reject(err);
      else return resolve(response.data);
    });
  });
};

const deleteEvent = async ({ eventId, userId }) => {
  const calendar = GoogleCalendar({ userId });

  return new Promise((resolve, reject) => {
    calendar.events.delete({
      auth: GoogleOAuth({ userId }),
      calendarId: 'primary',
      eventId,
    }, (err, response) => {
      if (err) return reject(err);
      else return resolve(response.data);
    });
  });
};

// calendar.events.delete({calendarId: 'primary', eventId: task.calendarEventId});

exports.deleteEvent = deleteEvent;
exports.createEvent = createEvent; 
