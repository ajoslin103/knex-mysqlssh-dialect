module.exports = {
    connection: {
        tunnelConfig: {
            src: {
                host: 'localhost',
                port: 3306,
            },
            dst: {
                host: 'localhost',
                port: '3306a',
            },
            jmp: {
                host: '10.20.0.1',
                port: 22,
                auth: {
                    user: 'username',
                    pass: 'password',
                },
            },
        },
    }
}
