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
    }
}).file({ file: './config.json'} );
var user = nconf.get('gmail_user');
var pass = nconf.get('gmail_password');
var emailPath = nconf.get('email');

// Load email object
var emailJSON = fs.readFileSync(emailPath, 'utf8');
var email = JSON.parse(emailJSON);

// Load csv in bcc
var content = fs.readFileSync(email.bcc, 'utf8');

// Parse csv and call sendEmailTo
parse(content, {comment: '#'}, function(err, output){
	if(err) throw err
	
	// a@gmail.com,b@gmail.com
	var emailListAsString = output.map(function(elem) { return elem[2]}).join(',');
	sendEmailTo(emailListAsString);
});

function sendEmailTo(bcc) {
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
	    bcc: bcc,
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
		    console.log('bcc: ' + bcc);
	    }
	});
}
