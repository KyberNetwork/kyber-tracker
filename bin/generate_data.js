require('dotenv').config();
const cp = require('child_process');

const env = process.env;
const filename = env.MYSQL_DB_DUMP || 'kyber_tracker_2018-03-10.sql';

run();

function run() {
  cp.exec(`mysql -u ${env.MYSQL_USERNAME} -p ${env.MYSQL_PASSWORD} ${env.MYSQL_DBNAME} < ./db/dump/${filename}`, (error, stdout, stderr) => {
    if (error) throw error;
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}