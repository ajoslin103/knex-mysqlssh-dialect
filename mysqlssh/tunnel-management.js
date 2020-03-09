'use strict';

exports.__esModule = true;

var _fs = require('fs');
var _tunnel = require('tunnel-ssh');
var _server = null;
var _connectionCnt = 0;

function _assert(val, msg) { if (!val) { throw new Error(msg); } }
function _assertString(val, msg) { _assert(val, msg); if (typeof val !== 'string') { throw new Error(msg); } }
function _assertNumber(val, msg) { _assert(val, msg); if (typeof val !== 'number') { throw new Error(msg); } }
function _assertObject(val, msg) { _assert(val, msg); if (typeof val !== 'object') { throw new Error(msg); } }

function verifyConfiguration(cfg) {
  try {
    _assertObject(cfg, 'the given configuration is missing or not an object');
    _assertObject(cfg.tunnelConfig, 'tunnelConfig is missing or not an object within the given configuration');
    _assertObject(cfg.tunnelConfig.src, 'tunnelConfig.src is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.src.host, 'tunnelConfig.src.host is missing or not a string within the given configuration');
    _assertNumber(cfg.tunnelConfig.src.port, 'tunnelConfig.src.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.dst, 'tunnelConfig.dst is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.dst.host, 'tunnelConfig.dst.host is missing or not a string within the given configuration');
    _assertNumber(cfg.tunnelConfig.dst.port, 'tunnelConfig.dst.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.jmp, 'tunnelConfig.jmp is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.host, 'tunnelConfig.jmp.host is missing or not a string within the given configuration');
    _assertNumber(cfg.tunnelConfig.jmp.port, 'tunnelConfig.jmp.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.jmp.auth, 'tunnelConfig.jmp.auth is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.user, 'tunnelConfig.jmp.auth.user is missing or not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.pass, 'tunnelConfig.jmp.auth.pass is missing or not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.keyStr, 'tunnelConfig.jmp.auth.keyStr is missing or not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.keyFile, 'tunnelConfig.jmp.auth.keyFile is missing or not a string within the given configuration');
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
};

function getPrivateKey(cfg) {
  _assertObject(cfg, 'the given configuration is missing or not an object');
  _assertObject(cfg.tunnelConfig, 'tunnelConfig is missing or not an object within the given configuration');
  _assertObject(cfg.tunnelConfig.jmp, 'tunnelConfig.jmp is missing or not an object within the given configuration');
  _assertObject(cfg.tunnelConfig.jmp.auth, 'tunnelConfig.jmp.auth is missing or not an object within the given configuration');
  var privateSSHKeyFile = cfg.tunnelConfig.jmp.auth.keyFile || ''; // specify privateSSHKey via a file in development
  var privateSSHKeyStr = cfg.tunnelConfig.jmp.auth.keyStr || ''; // specify privateSSHKey via a ENV variable in production
  var privateKeyContents = privateSSHKeyFile ? _fs.readFileSync(privateSSHKeyFile, { encoding: 'utf8' }) : privateSSHKeyStr;
  return privateKeyContents.trim();
};

function establishTunnel(config) {
  console.debug('establishing tunnel');
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

function incrementConnections(cfg) {
  if (!my.verifyConfiguration(cfg)) {
    throw new Error('invalid configuration supplied to incrementConnections()');
  }
  var tnlPromise = Promise.resolve();
  if (_connectionCnt === 0) {
    var config = {
      host: cfg.tunnelConfig.jmp.host,
      port: cfg.tunnelConfig.jmp.port,
      dstHost: cfg.tunnelConfig.dst.host,
      dstPort: cfg.tunnelConfig.dst.port,
      localHost: cfg.tunnelConfig.src.host,
      localPort: cfg.tunnelConfig.src.port,
      username: cfg.tunnelConfig.jmp.auth.user,
      password: cfg.tunnelConfig.jmp.auth.pass,
      privateKey: my.getPrivateKey(cfg),
    };
    console.debug(`establishing tunnel from ${config.localHost} to ${config.dstHost} via ${config.host} for ${config.localPort}`);
    tnlPromise = my.establishTunnel(config);
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
  if (_connectionCnt === 0) { my.destroyTunnel() }
};

function getNumberOfConnections() {
  return _connectionCnt;
};

const my = {
  verifyConfiguration,
  getPrivateKey,
  establishTunnel,
  destroyTunnel,
  decrementConnections,
  incrementConnections,
  getNumberOfConnections,
};

module.exports = my;
