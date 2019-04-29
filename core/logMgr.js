var bunyan = require('bunyan');

function getMainLog(logPath) {
	var log = bunyan.createLogger({
		name: 'main',
		streams: [
			{
				stream : process.stdout,
				level : 'trace',
			},
			{
				type: 'rotating-file',
				path: logPath + '/main.log',
				period: '1d',   // daily rotation
				count: 9999,
				level: 'debug',
			},
			{
				type: 'rotating-file',
				path: logPath + '/main_err.log',
				period: '1d',   // daily rotation
				count: 9999,
				level: 'warn',
			},
		]
	});
	return log;
}

function getConsoleLog() {
	var log = bunyan.createLogger({
		name: 'main',
		streams: [
			{
				stream : process.stdout,
				level : 'trace',
			},
		]
	});
	return log;
}

exports.getMainLog = getMainLog;
exports.getConsoleLog = getConsoleLog;

