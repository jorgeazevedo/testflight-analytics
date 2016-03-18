var imaps = require('imap-simple');
var nconf = require('nconf');


nconf.argv({
    "l": {
      alias: 'label',
      describe: 'Gmail label to list',
      demand: true
    }
  }).file({ file: './config.json'} );
var user = nconf.get('gmail_user');
var password = nconf.get('gmail_password');
var label = nconf.get('label');
console.log('user is ' + user);
console.log('label is ' + label);

var config = {
	imap: {
		user: user,
		password: password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true,
		authTimeout: 3000
	}
};

var conn = {};

imaps.connect(config)
.then(function (connection) {
	//console.log("opening box");
	conn = connection;

	return conn.openBox(label);
}).then(function () {
	//console.log("searching");
	var searchCriteria = ['UNSEEN'];
	var fetchOptions = {
		bodies: ['HEADER'],
		markSeen: false
	};

	return conn.search(searchCriteria, fetchOptions)
}).then(function (results) {
	//console.log("printing");
	var fromFields = results.map(function (res) {
		return res.parts[0].body.from[0];
	});

	emailAddressesOnly(fromFields).forEach(function(address){
		console.log(',,' + address);
	});
	process.exit(0);
})

function emailAddressesOnly(fromFields) {
	var regex = /^(?:([^<]*@[^>]*)|.*<(.*)>)$/;
	return fromFields.map(function(field) {
		  var match = field.match(regex)
		  var email = match[1] || match[2];
		  return email;  
	});
}
