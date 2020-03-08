# knex-mysqlssh-dialect

Based on a copy of the Knex MySQL dialect, this library uses connection counting to wrap an ssh tunnel around a connection pool.

## Background

I created this project because the database server I need to use can only accept connections from known IP addresses.

My project is hosted on Heroku, and I get a new IP address for every deployment, so I am unable to provide an unchanging IP address.

I can not tunnel to the database server, because it's on a shared hosting server and they do not support port forwarding on their ssh connections for security reasons.

I needed a fixed-IP, ssh capable, port-forwarding, Jump server to tunnel into -- so that my connection would come from a server whose IP address could be added to a whitelist.

A DigitalOcean droplet, which will maintain it's originally provisioned IP address until it's decommissioned, is a cheap solution requiring zero additional configuration beyond a base install.

With a Jump server and this library, I can connect from a static IP address to my paranoid database server -- even though my code is running on Heroku at a constantly changing IP address.

## Installation 

```
npm i ajoslin103/knex-mysqlssh-dialect
```

Embed a tunnelConfig object within your Knex connection object, see below for description

Require the dialect and reference it as the 'client' field in your connection configuration

By passing the dialect to Knex it is used as a Client, rather than as the name of a knex-supplied dialect to be located

## Example

My project uses the excellent AdonisJS Node.js framework, if anyone can contribute other samples we could expand this section.

const mysqlssh = require('../knex-dialects/mysqlssh')
```
this config works:

```
module.exports = {
  mysqltunnel: {
    client: mysqltunnel,
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', 3306),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis'),
      tunnelConfig: {
        src: {
          host: 'localhost',
          port: Env.get('DB_PORT', 3306),
        },
        dst: {
          host: Env.get('DB_HOST', ''),
          port: Env.get('DB_PORT', 3306),
        },
        jmp: {
          host: Env.get('JUMP_HOST', ''),
          port: Env.get('JUMP_PORT', 22),
          auth: {
            user: Env.get('JUMP_USER', ''),
            pass: Env.get('JUMP_PASS', ''),
            keyStr: Env.get('JUMP_KEY', ''),
            keyFile: Env.get('JUMP_KEYFILE', ''),
          },
        },
      },
    },
  },
}
```

## Notes

For development I use a JUMP_KEYFILE environment variable to point to my local keyfile which will authenticate me to the Jump server.

In production I specify a JUMP_KEY environment variable to hold the contents of that same [private] local keyfile

## Credits

This package would not have been possible with the fine work of the developers and maintainers of [at least] the following packages

[AdonisJS](https://adonisjs.com/) [Knex](http://knexjs.org/) [ssh-tunnel](https://github.com/agebrock/tunnel-ssh) [mysql](https://github.com/mysqljs/mysql) [ssh2](https://github.com/mscdex/ssh2)

Some inspiration and understanding of Knex dialects came from here: [MariaDB Driver for Knex](https://wildwolf.name/mariadb-driver-for-knex/)

## Other

Pull Requests and Comments are Welcome

