import schedule from 'node-schedule';
import { Meteor } from 'meteor/meteor';
import mailer from './mailer';

const sendMail = () => {
  const scheduleSendMail = schedule.scheduleJob('42 * * * *', function() {
    console.log('The answer to life, the universe, and everything!');
  
    const users = Meteor.users.find();
  
    users.map(u => {
      const o = new Date;
      if (moment(u.status.lastLogin.date).format('ll') === moment(o).format('ll')) {
        return mailer();
      }
    });
  });

  return scheduleSendMail;
};

  export default sendMail;