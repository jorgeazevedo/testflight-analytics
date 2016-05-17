var nodemailer = require('nodemailer');
var parse = require('csv-parse');
var fs = require('fs');
var nconf = require('nconf');

// Load csv file and credentials
nconf.argv({
    "e": {
      alias: 'email',
      describe: 'JSON describing email to send',
      demand: true
    },
    "t": {
      alias: 'to',
      describe: 'To: field',
      demand: false
    }
}).file({ file: './config.json'} );
var user = nconf.get('gmail_user');
var pass = nconf.get('gmail_password');
var emailPath = nconf.get('email');
var toOverride = nconf.get('to');

// Load email object
var emailJSON = fs.readFileSync(emailPath, 'utf8');
var email = JSON.parse(emailJSON);

if(toOverride)
	email["to"] = toOverride;

if(numberOFEmailsInString(email.to) > 1)
	throw new Error("More than one email in To field: " + email.to);

sendEmail(email);

function numberOFEmailsInString(str) {
	return (str.match(/@/g) || []).length
}

function sendEmail(email) {
	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport({
	    service: "Gmail",
            maxMessages: Infinity,
	    auth: {
		user: user,
		pass: pass
	    }
	});

	// setup e-mail data
	var mailOptions = {
	    from: email.from,
	    to: email.to,
	    subject: email.subject,
	    html: fs.readFileSync(email.body, 'utf8')
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		return console.log(error);
	    } else {
		    console.log('Message sent: ' + info.response);
		    console.log('from:' + user);
		    console.log('email.to: ' + email.to);
	    }
	});
}
