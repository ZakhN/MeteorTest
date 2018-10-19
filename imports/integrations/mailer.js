import nodemailer from 'nodemailer';

/**
 * mailer
 * @const send an mail to selected email 
 */

 const mailer = ({todaysTasks, checkedTasks}) => {
  const transporter = nodemailer.createTransport('');
  let mailOptions = {
    from: 'sender@email.com', // sender address
    to: 'nzaharov86@gmail.com', // list of receivers
    subject: 'Subject of your email', // Subject line
    html:'todaysTasks '+ todaysTasks+' '+'checkedTasks '+checkedTasks // plain text body
  };
  
  console.log('EMAIL HAVE BEEN SENT');

  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err);
    else
      console.log(info);
  });
};

export default mailer;
