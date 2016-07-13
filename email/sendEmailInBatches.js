var nodemailer = require('nodemailer');
var parse = require('csv-parse');
var fs = require('fs');
var nconf = require('nconf');
var _ = require('lodash');
var async = require('async');

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
	
	console.log(JSON.stringify(output));

	// ["a@gmail.com", "b@gmail.com"]
	var emails = output.map(function(elem) { return elem[2]});
	var chunks = _.chunk(emails, 90);
	console.log(JSON.stringify(chunks));

	async.eachSeries(chunks, wrapperSendEmailTo, function(error){
		if(error) {
			console.log(JSON.stringify(error));
			throw error;
		}
		console.log("FINISHED");
	});

});

function wrapperSendEmailTo(chunk, callback) {
	sendEmailTo(chunk, function(error, info){
	    if(error){
		callback(error);
	    } else {
		console.log('from:' + info.envelope.from);
		console.log('bcc: ' + info.envelope.to.join(","));
		console.log('Message sent: ' + info.response);
		callback(null);
	    }
	});

}

function sendEmailTo(bcc, callback) {
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
	transporter.sendMail(mailOptions, callback);
}
