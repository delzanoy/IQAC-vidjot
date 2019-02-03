const nodemailer = require('nodemailer');
const credentials = require('../config/mailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: credentials.username,
        pass: credentials.password
    }
});

// const mailOptions = {
//     from: '<IQAC> delanoykunil@gmail.com', // sender address
//     to: 'devilsmindevilthoughts@gmail.com', // list of receivers
//     subject: 'Subject of your email', // Subject line
//     html: '<p>Your html here</p>' // plain text body
// };

// transporter.sendMail(mailOptions, function (err, info) {
//     if(err)
//       console.log(err)
//     else
//       console.log(info);
//  });

module.exports = {
    sendMail(mailOptions) {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });
    }
};