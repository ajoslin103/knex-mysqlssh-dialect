'use strict';

exports.__esModule = true;

var _fs = require('fs');
var _tunnel = require('tunnel-ssh');
var _server = null;
var _connectionCnt = 0;

function verifyConfiguration(cfg) {
  function assert(val, msg) { if (!val) { throw new Error(msg); } }
  function assertString(val, msg) { assert(val, msg); if (typeof val !== 'string') { throw new Error(msg); } }
  function assertNumber(val, msg) { assert(val, msg); if (typeof val !== 'number') { throw new Error(msg); } }
  function assertObject(val, msg) { assert(val, msg); if (typeof val !== 'object') { throw new Error(msg); } }
  try {
    assertObject(cfg, 'the given configuration is missing or not an object');
    assertObject(cfg.tunnelConfig, 'tunnelConfig is missing or not an object within the given configuration');
    assertObject(cfg.tunnelConfig.src, 'tunnelConfig.src is missing or not an object within the given configuration');
    assertString(cfg.tunnelConfig.src.host, 'tunnelConfig.src.host is missing or not a string within the given configuration');
    assertNumber(cfg.tunnelConfig.src.port, 'tunnelConfig.src.port is missing or not a number within the given configuration');
    assertObject(cfg.tunnelConfig.dst, 'tunnelConfig.dst is missing or not an object within the given configuration');
    assertString(cfg.tunnelConfig.dst.host, 'tunnelConfig.dst.host is missing or not a string within the given configuration');
    assertNumber(cfg.tunnelConfig.dst.port, 'tunnelConfig.dst.port is missing or not a number within the given configuration');
    assertObject(cfg.tunnelConfig.jmp, 'tunnelConfig.jmp is missing or not an object within the given configuration');
    assertString(cfg.tunnelConfig.jmp.host, 'tunnelConfig.jmp.host is missing or not a string within the given configuration');
    assertNumber(cfg.tunnelConfig.jmp.port, 'tunnelConfig.jmp.port is missing or not a number within the given configuration');
    assertObject(cfg.tunnelConfig.jmp.auth, 'tunnelConfig.jmp.auth is missing or not an object within the given configuration');
    assertString(cfg.tunnelConfig.jmp.auth.user, 'tunnelConfig.jmp.auth.user is missing or not a string within the given configuration');
    assertString(cfg.tunnelConfig.jmp.auth.pass, 'tunnelConfig.jmp.auth.pass is missing or not a string within the given configuration');
    assertString(cfg.tunnelConfig.jmp.auth.keyStr, 'tunnelConfig.jmp.auth.keyStr is missing or not a string within the given configuration');
    assertString(cfg.tunnelConfig.jmp.auth.keyFile, 'tunnelConfig.jmp.auth.keyFile is missing or not a string within the given configuration');
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
};

function getPrivateKey(cfg) {
  var privateSSHKeyFile = cfg.tunnelConfig.jmp.auth.keyFile // specify privateSSHKey in production
  var privateKeyContents = privateSSHKeyFile ? _fs.readFileSync(privateSSHKeyFile, { encoding: 'utf8' }) : cfg.tunnelConfig.jmp.auth.keyStr
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
