describe('Testing Exports', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management');
    test('it should confirm our functions are exported', () => {
        expect(mysqlssh.verifyConfiguration).toBeDefined();
        expect(mysqlssh.getPrivateKey).toBeDefined();
        expect(mysqlssh.establishTunnel).toBeDefined();
        expect(mysqlssh.destroyTunnel).toBeDefined();
        expect(mysqlssh.incrementConnections).toBeDefined();
        expect(mysqlssh.decrementConnections).toBeDefined();
        expect(mysqlssh.getNumberOfConnections).toBeDefined();
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

describe('Testing incrementConnections & decrementConnections', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management');
    const aConfig = require('./sample-config');
    const keyFile = './test/keyfile.sample';
    aConfig.connection.tunnelConfig.jmp.auth.keyFile = keyFile;
    mysqlssh.destroyTunnel = jest.fn().mockReturnValue(0);
    mysqlssh.establishTunnel = jest.fn().mockResolvedValue(0);
    const establishTunnelSpy = jest.spyOn(mysqlssh, 'establishTunnel');
    const destroyTunnelSpy = jest.spyOn(mysqlssh, 'destroyTunnel');
    test('it should only establishConnection once', async () => {
        await mysqlssh.incrementConnections(aConfig.connection);
        await mysqlssh.incrementConnections(aConfig.connection);
        await mysqlssh.incrementConnections(aConfig.connection);
        expect(establishTunnelSpy.mock.calls.length).toBe(1);
    })
    test('it should only destroyConnection once', async () => {
        await mysqlssh.decrementConnections(aConfig.connection);
        await mysqlssh.decrementConnections(aConfig.connection);
        await mysqlssh.decrementConnections(aConfig.connection);
        await mysqlssh.decrementConnections(aConfig.connection);
        expect(destroyTunnelSpy.mock.calls.length).toBe(1);
    })
})

