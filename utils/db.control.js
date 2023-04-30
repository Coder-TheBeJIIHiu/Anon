const mysql = require('mysql2/promise');
const Logger = require("./Logger.js")
const log = new Logger()

class MysqlDb {
  constructor(config) {
    this.pool = mysql.createPool(config);
  }

  async execute(sql, params, logOff = false) {
		let maxRetries = 100;
    let retries = 0;
    while (true) {
      const connection = await this.pool.getConnection();
      try {
        const [rows, fields] = await connection.execute(sql, params);
				if (!logOff) {
          log.info(`\nSQL request completed successfully on ${retries+1}st attempt.\nSQL: ${sql}\nPARAMS: ${params}\n`);
				}
        return rows;
      } catch (err) {
        retries++;
        if (retries >= maxRetries) {
          throw err;
        }
        log.error(`\nError executing SQL: ${err.message}. Retrying...\nSQL: ${sql}\nPARAMS: ${params}\n`);
      } finally {
        connection.release();
      }
    }
  }
	async getAllUsers() {
        const rows = await this.execute('SELECT * FROM users');
        return rows;
	}
}

module.exports = MysqlDb;
