describe('Testing Exports', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management');
    test('it should confirm our functions are exported', () => {
        expect(mysqlssh.verifyConfiguration).toBeDefined();
        expect(mysqlssh.getPrivateKey).toBeDefined();
        expect(mysqlssh.establishTunnel).toBeDefined();
        expect(mysqlssh.destroyTunnel).toBeDefined();
        expect(mysqlssh.decrementConnections).toBeDefined();
    })
})

describe('Testing verifyConfiguration', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management');
    const aConfig = require('./sample-config');
    test('it should confirm we can verify a configuration', () => {
        expect(mysqlssh.verifyConfiguration(aConfig.connection)).toBeTruthy();
    })
})

describe('Testing getPrivateKey', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management');
    const fs = require('fs');
    const path = require('path');
    const keyFile = './test/keyfile.sample';
    const keyFilePath = path.resolve(keyFile);
    const keyText = fs.readFileSync(keyFilePath, { encoding: 'utf8' });
    const trimmedKeyText = keyText.trim();
    const withKeyFromFile = { tunnelConfig: { jmp: { auth: { keyFile: keyFilePath, keyStr: '' } } } };
    test('it should confirm we can read a private key from a file', () => {
        expect(mysqlssh.getPrivateKey(withKeyFromFile) === trimmedKeyText).toBeTruthy();
    })
    const withKeyFromStr = { tunnelConfig: { jmp: { auth: { keyStr: trimmedKeyText, keyFile: '' } } } };
    test('it should confirm we can use a private key from a string', () => {
        expect(mysqlssh.getPrivateKey(withKeyFromStr) === trimmedKeyText).toBeTruthy();
    })
})