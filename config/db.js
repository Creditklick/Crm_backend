const mysql = require('mysql2');
const database = mysql.createPool({
    host: '68.178.145.55',
    user: 'CREDITKLICK_CRM',
    password: 'CREDITKLICK_CRM',
    database: 'CRM_IMS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



database.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to GoDaddy MySQL');
    connection.release();
});

module.exports = database;

