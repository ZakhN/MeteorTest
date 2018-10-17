import nodemailer from 'nodemailer';

/**
 * mailer
 * @const send an email to selecrtd email 
 */

 const mailer = () => {
  const transporter = nodemailer.createTransport('smtp://nickolay@milkandcartoons.com:nickolay@smtp.mailgun.org:587');

  const mailOptions = {
    from: 'sender@email.com', // sender address
    to: 'nzaharov86@gmail.com', // list of receivers
    subject: 'Subject of your email', // Subject line
    html: '<p>Your html here</p>'// plain text body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err);
    else
      console.log(info);
  });
};

export default mailer;
