describe('Testing Exports', () => {
    const mysqlssh = require('../mysqlssh/tunnel-management')
    test('it should confirm our functions are exported', () => {
        expect(mysqlssh.getPrivateKey).toBeDefined();
        expect(mysqlssh.establishTunnel).toBeDefined();
        expect(mysqlssh.destroyTunnel).toBeDefined();
        expect(mysqlssh.decrementConnections).toBeDefined();
    })
})

