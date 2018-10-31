import { Email } from 'meteor/email';

const sendMail = ({ email, report }) => {
  const emailData = {
    to: email,
    from: 'Milky Tasks app <contact@example.com>',
    subject: 'Daily Report',
    text: `Hey, here is you daily report:

${report.tasks} new tasks in ${report.lists} lists.
${report.completed} tasks completed.
${report.popularListName && `${report.popularListName} is the most popular list.`}

Keep tasking!`,
  };

  return Email.send(emailData);
};

export default sendMail;
