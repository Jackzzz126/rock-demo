let rock = require('./rock');
let fs = require('fs');
var hoconParser = require('hocon-parser');
let async = require('async');

require('./core/global');
let proto = require('./core/proto');
let connMgr = require('./core/connMgr');
let reqMgr = require('./core/reqMgr');

gLog.debug("Demo debug msg");
gLog.info("Demo info msg");
gLog.warn("Demo warn msg");
gLog.error("Demo error msg");
console.log("Demo console log");

async.waterfall([
	function(cb) {
		fs.readFile('./core/config.conf', (err, data) => {
			if (err) {
				gLog.error("error when read config.conf: %s", err);
				return cb(err);
			}
			try {
				let config = hoconParser(data.toString());
				for(let i in config) {
					gConfig[i] = config[i];
				}
				gLog.setLevel(gConfig.serverConfig.logLevel);
				return cb();
			} catch(ex) {
				gLog.error("error when parse config.conf: %s", ex);
				return cb(new Error(ex));
			}
		});
	},
	function(cb) {
		proto.init(gConfig.serverConfig.protoPath, function(err) {
			if(err) {
				gLog.error("Proto init error: %s", err);
				return cb(err);
			}
			return cb();
		});
	},
	function(cb) {
		rock.tcpServer.run(gConfig.serverConfig.tcpPort, connMgr.onConn);
		gLog.info("Tcp server start at %d.", gConfig.serverConfig.tcpPort);
		return cb();
	},
	function(cb) {
		rock.httpServer.run(gConfig.serverConfig.httpPort, reqMgr.onReq);
		gLog.info("Http server start at port %d.", gConfig.serverConfig.httpPort);
		return cb();
		//rock.httpServer.run(gConfig.serverConfig.port, onRequest,
		//		'./https_keys/1_yx-tuya.philm.cc_bundle.crt',
		//		'./https_keys/2_yx-tuya.philm.cc.key'
		//		);
		//gLog.info("Server start at port %d.", gConfig.serverConfig.port);
	},
	function(cb) {
		setInterval(function() {
			let curTimeMs = rock.time.curTimeMs();
			let timeOut = gConfig.serverConfig.connTimeout * 1000;
			for(let i in gAllSockets) {
				let connData = gAllSockets[i].connData;
				if((curTimeMs - connData.lat) > timeOut) {
					let uid = 0;
					if(connData.uid) {
						uid = connData.uid;
					}
					gLog.debug("%s exit by timeout", uid);
					//if(connData.uid) {//add exit code here
					//}
					gAllSockets[i].end();
					connData.closed = true;
					gAllSockets.splice(i, 1);
				}
			}
		}, 3 * 1000);
		return cb();
	},
], function( err, result) {
	if(err) {
		process.exit(1);
	}
});
