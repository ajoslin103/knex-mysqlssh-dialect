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