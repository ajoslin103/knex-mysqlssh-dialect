'use strict';

exports.__esModule = true;

var _fs = require('fs');
var _tunnel = require('tunnel-ssh');
var _server = null;
var _connectionCnt = 0;

function verifyConfiguration(connectionSettings) {
  return true;
};

function getPrivateKey(connectionSettings) {
  var privateSSHKeyFile = connectionSettings.tunnelConfig.jmp.auth.keyFile // specify privateSSHKey in production
  var privateKeyContents = privateSSHKeyFile ? _fs.readFileSync(privateSSHKeyFile, { encoding: 'utf8' }) : connectionSettings.tunnelConfig.jmp.auth.keyStr
  return privateKeyContents.trim();
};

function establishTunnel(config) {
  return new Promise(function (resolve, reject) {
    _server = _tunnel(config, function (err, server) {
      if (err) {
        console.error(err);
        reject(new Error(err));
      }
      // console.debug('tunnel established');
      resolve();
    });
  })
};

function destroyTunnel() {
  // console.debug('closing tunnel');
  if (_server && _server.close) { _server.close(); }
};

function incrementConnections(connectionSettings) {
  var tnlPromise = Promise.resolve();
  if (_connectionCnt === 0) {
    var config = {
      host: connectionSettings.tunnelConfig.jmp.host,
      port: connectionSettings.tunnelConfig.jmp.port,
      dstHost: connectionSettings.tunnelConfig.dst.host,
      dstPort: connectionSettings.tunnelConfig.dst.port,
      localHost: connectionSettings.tunnelConfig.src.host,
      localPort: connectionSettings.tunnelConfig.src.port,
      username: connectionSettings.tunnelConfig.jmp.auth.user,
      password: connectionSettings.tunnelConfig.jmp.auth.pass,
      privateKey: _getPrivateKey(connectionSettings),
    };
    console.debug(`establishing tunnel from ${config.localHost} to ${config.dstHost} via ${config.host} for ${config.localPort}`);
    tnlPromise = _establishTunnel(config);
  }
  return tnlPromise
    .then(function () {
      _connectionCnt++;
      // console.debug(`supporting ${_connectionCnt} connections`);
    })
};

function decrementConnections() {
  _connectionCnt--;
  // console.debug(`${_connectionCnt} connections remaining`);
  if (_connectionCnt === 0) { _destroyTunnel() }
};

module.exports = {
  verifyConfiguration,
  getPrivateKey,
  establishTunnel,
  destroyTunnel,
  decrementConnections,
}
