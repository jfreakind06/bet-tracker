// knexfile.js
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'stephkd3035_',
      database: 'postgres',
    },
    migrations: {
      directory: './migrations',
    },
  },
};
