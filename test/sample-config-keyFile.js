module.exports = {
    connection: {
        tunnelConfig: {
            src: {
                host: 'localhost',
                port: 3306,
            },
            dst: {
                host: 'localhost',
                port: '3306',
            },
            jmp: {
                host: '10.20.0.1',
                port: 22,
                auth: {
                    user: 'username',
                    keyFile: './test/keyfile.sample',
                },
            },
        },
    }
}
