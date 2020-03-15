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
    _assertNumber(Number(cfg.tunnelConfig.src.port), 'tunnelConfig.src.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.dst, 'tunnelConfig.dst is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.dst.host, 'tunnelConfig.dst.host is missing or not a string within the given configuration');
    _assertNumber(Number(cfg.tunnelConfig.dst.port), 'tunnelConfig.dst.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.jmp, 'tunnelConfig.jmp is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.host, 'tunnelConfig.jmp.host is missing or not a string within the given configuration');
    _assertNumber(Number(cfg.tunnelConfig.jmp.port), 'tunnelConfig.jmp.port is missing or not a number within the given configuration');
    _assertObject(cfg.tunnelConfig.jmp.auth, 'tunnelConfig.jmp.auth is missing or not an object within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.user, 'tunnelConfig.jmp.auth.user is missing or not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.pass || 'optional', 'tunnelConfig.jmp.auth.pass is not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.keyStr || 'optional', 'tunnelConfig.jmp.auth.keyStr is not a string within the given configuration');
    _assertString(cfg.tunnelConfig.jmp.auth.keyFile || 'optional', 'tunnelConfig.jmp.auth.keyFile is not a string within the given configuration');
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
};

function verifyTunnelCfg(cfg) {
  try {
    _assertObject(cfg, 'the given configuration is missing or not an object');
    _assertString(cfg.host, 'host is missing or not a string within the given configuration');
    _assertNumber(Number(cfg.port), 'port is missing or not a number within the given configuration');
    _assertString(cfg.dstHost, 'dstHost is missing or not a string within the given configuration');
    _assertNumber(Number(cfg.dstPort), 'dstPort is missing or not a number within the given configuration');
    _assertString(cfg.localHost, 'localHost is missing or not a string within the given configuration');
    _assertNumber(Number(cfg.localPort), 'localPort is missing or not a number within the given configuration');
    _assertString(cfg.username, 'username is missing or not a string within the given configuration');
    _assertString(cfg.password || 'optional', 'password is not a string within the given configuration');
    _assertString(cfg.privateKey || 'optional', 'privateKey is not a string within the given configuration');
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
};

function _getPrivateKey(cfg) {
  _assertObject(cfg, 'the given configuration is missing or not an object');
  _assertObject(cfg.tunnelConfig, 'tunnelConfig is missing or not an object within the given configuration');
  _assertObject(cfg.tunnelConfig.jmp, 'tunnelConfig.jmp is missing or not an object within the given configuration');
  _assertObject(cfg.tunnelConfig.jmp.auth, 'tunnelConfig.jmp.auth is missing or not an object within the given configuration');
  var privateSSHKeyFile = cfg.tunnelConfig.jmp.auth.keyFile || ''; // specify privateSSHKey via a file in development
  var privateSSHKeyStr = cfg.tunnelConfig.jmp.auth.keyStr || ''; // specify privateSSHKey via a ENV variable in production
  var privateKeyContents = privateSSHKeyFile ? _fs.readFileSync(privateSSHKeyFile, { encoding: 'utf8' }) : privateSSHKeyStr;
  return privateKeyContents.trim();
};

function _establishTunnel(config, tunnelRef) {
  if (!my.verifyTunnelCfg(config)) {
    return Promise.reject(new Error('invalid configuration supplied to _establishTunnel()'));
  }
  return new Promise(function (resolve, reject) {
    _server = tunnelRef(config, function (err, server) {
      if (err) {
        console.error(err);
        reject(new Error(err));
      }
      resolve();
    });
  })
};

function _destroyTunnel(serverRef) {
  if (serverRef && serverRef.close) {
    serverRef.close();
    serverRef = null;
  }
};

function incrementConnections(cfg) {
  if (!my.verifyConfiguration(cfg)) {
    return Promise.reject(new Error('invalid configuration supplied to incrementConnections()'));
  }
  var tnlPromise = Promise.resolve(); // we'll just resolve if we are more than zero connections
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
      privateKey: my._getPrivateKey(cfg),
    };
    console.debug(`[knex-mysqlssh-dialect] establishing tunnel from ${config.localHost} to ${config.dstHost} via ${config.host} for ${config.localPort}`);
    tnlPromise = my._establishTunnel(config, _tunnel);
  }
  return tnlPromise
    .then(function () {
      _connectionCnt++;
    })
};

function decrementConnections() {
  if (_connectionCnt === 1) { my._destroyTunnel(_server) }
  _connectionCnt = Math.max(_connectionCnt - 1, 0);
};

function getNumberOfConnections() {
  return _connectionCnt;
};

// we export _establishTunnel, _destroyTunnel and _getPrivateKey for testing purposes only
const my = {
  verifyTunnelCfg,
  verifyConfiguration,
  decrementConnections,
  incrementConnections,
  getNumberOfConnections,
  _establishTunnel,
  _destroyTunnel,
  _getPrivateKey,
};

module.exports = my;
