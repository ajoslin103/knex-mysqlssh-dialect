# knex-mysqlssh-dialect
A Knex dialect that uses mysql-ssh to support tunneled connections

## Background

This is a minimal insertion of the mysql-ssh library into a copy of the Knex MySQL dialect

I created this project becuse the database I was trying to connect to could only be protected (beyond username/password) by IP whitelisting.  

And since my prject is hosted on Heroku, where I get a new IP address for every deploymnet, I am unable to maintain an unchanging IP address.

Unfortuneately I could not just tunnel to the database server, because it's a shared host they do not support port forwarding on their ssh connections.

So I needed an ssh capable, port-forwarding, machine to serve as Jump server so that I could forward my connection from a server whose IP address would not change.

I provisioned a minimal DigitalOcean Ubuntu droplet, which will maintain it's originally provisioned IP address until it's decommissioned to use as my Jump server.

I had used mysql-ssh to test the concept, so I used it again to create a thoroughly-untested, assumed-to-be-buggy, Knex MysqlSSH Dialect.

## Installation 

Clone this project into a folder accessible to your project

Define your database config in two parts: the ssh config for your Jump server; and, the dbms config for your Database connection.

Require the dialect and reference it as 'client' in your configuration

Pass the entirety to Knex as your config, and Knex will do the rest.

## Example

My project uses the excellent AdonisJS Node.js framework, if anyone can contribute other samples we could expand this section.

const fs = require('fs');
const jumpKeyFile = Env.get('JUMP_KEYFILE', '');
const jumpKey = jumpKeyFile ? fs.readFileSync(jumpKeyFile, { encoding: 'utf8' }).trim() : '';

const mysqlssh = require('../knex-dialects/mysqlssh')

module.exports = {
    mysqlssh: {
        client: mysqlssh,
        connection: {
            sshConfig: {
                host: Env.get('JUMP_HOST', 'some.ssh.capable.host'),
                port: Env.get('JUMP_PORT', 22),
                user: Env.get('JUMP_USER', ''),
                privateKey: Env.get('JUMP_KEY', jumpKey),
            },
            host: Env.get('DB_HOST', 'your.finicky.database.host'),
            port: Env.get('DB_PORT', 3306),
            user: Env.get('DB_USER', ''),
            password: Env.get('DB_PASSWORD', ''),
            database: Env.get('DB_DATABASE', ''),
        },
    },
}

## Notes

For development I use a JUMP_KEYFILE environment variable to point to my local keyfile I use to connect to the Jump server.

In production I specify a JUMP_KEY environment variable to hold the contents of that [private] local keyfile

From mysql-ssh: sshConfig should be an object according to the ssh2 package.

From mysql-ssh: dbConfig should be an object according to the mysql2 package.

FUTURE ISSUE: the ssh2 and mysql2 packages note that their config objects will, in the future, not be accepted if they contain unknown fields.  Currently, the Knex dialects do not subselect the database fields.

## Credits

This package would not have been possible with the fine work of the developers and maintainers of [at least] the following packages

[AdonisJS](https://adonisjs.com/) [Knex](http://knexjs.org/) [mysql-ssh](https://github.com/grrr-amsterdam/mysql-ssh) [mysql2](https://github.com/sidorares/node-mysql2) [ssh2](https://github.com/mscdex/ssh2)

## Other

Pull Requests and Comments are Welcome

