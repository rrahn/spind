const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2/promise');

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

async function createLockerTable() {

    const sql = 'CREATE TABLE IF NOT EXISTS locker_table(UnitId INT NOT NULL, \
                                                         CompartmentId INT NOT NULL, \
                                                         LockType ENUM("Key", "Combination"), \
                                                         Color varchar(255), \
                                                         State ENUM("Free", "Occupied", "OutOfOrder", "Reserved") NOT NULL, \
                                                         PRIMARY KEY(UnitId, CompartmentId) \
                                                         ) DEFAULT CHARSET utf8mb4';
    await pool.query({sql});
    console.log(`Successfully created locker table`);
}

async function createLockerUnitTable() {
    const sql = 'CREATE TABLE IF NOT EXISTS locker_unit_table(UnitId INT NOT NULL, \
                                                              FloorId INT NOT NULL, \
                                                              TopLeftX INT NOT NULL, \
                                                              TopLeftY INT NOT NULL, \
                                                              BottomRightX INT NOT NULL, \
                                                              BottomRightY INT NOT NULL, \
                                                              PRIMARY KEY(UnitId) \
                                                              ) DEFAULT CHARSET utf8mb4';
    await pool.query({sql});
    console.log(`Successfully created locker unit table`);
}

async function createFloorMapTable() {
    const sql = 'CREATE TABLE IF NOT EXISTS floor_map_table(FloorId INT NOT NULL, \
                                                            ImageSource VARCHAR(255) NOT NULL, \
                                                            ImageDescription VARCHAR(255) NOT NULL, \
                                                            PRIMARY KEY(FloorId) \
                                                            ) DEFAULT CHARSET utf8mb4';
    await pool.query({sql});
    console.log(`Successfully created floor map table`);
}

async function createReservationTable() {
    const sql = 'CREATE TABLE IF NOT EXISTS reservation_table(Id INT AUTO_INCREMENT, \
                                                              UnitId INT, \
                                                              CompartmentId INT, \
                                                              ReservationTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \
                                                              PRIMARY KEY(Id), \
                                                              FOREIGN KEY(UnitId, CompartmentId) REFERENCES locker_table(UnitId, CompartmentId) ON DELETE CASCADE \
                                                              ) DEFAULT CHARSET utf8mb4';
    await pool.query({sql});
    console.log(`Successfully created reservation table`);
}

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    await waitPort({
        host,
        port: 3306,
        timeout: 10000,
        waitForDns: true,
    });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    });

    const promiseCreateLockerTbl = createLockerTable();

    const promiseCreateLockerUnitTable = createLockerUnitTable();

    const promiseCreateFloorMapTable = createFloorMapTable();

    const promiseCreateReservationTable = createReservationTable();

    return Promise.all([promiseCreateLockerTbl, promiseCreateLockerUnitTable, promiseCreateFloorMapTable, promiseCreateReservationTable]);
}

async function teardown() {
    await pool.end();
}

async function getFloorMaps() {

    const [rows] = await pool.query('SELECT * FROM floor_map_table');
    return rows.map(item =>
        Object.assign({}, {
            level: item.FloorId,
            image: item.ImageSource,
            title: item.ImageDescription,
        }),
    );
}

async function getLockerUnits() {
    const [rows] = await pool.query('SELECT * FROM locker_unit_table');
    return rows.map(item => Object.assign({}, item));
}

async function getLockerUnitsOnFloor(floorId) {
    const [rows] = await pool.query('SELECT * FROM locker_unit_table WHERE FloorId = ?', [floorId]);
    return rows.map(item => Object.assign({}, item));
}

async function getLockers() {
    const [rows] = await pool.query('SELECT * FROM locker_table');
    return rows.map(item => Object.assign({}, item));
}

async function getLockersForUnit(unitId) {
    const [rows] = await pool.query('SELECT * FROM locker_table WHERE UnitId = ?', [unitId]);
    return rows.map(item => Object.assign({}, item));
}

async function freeOldLocker(connection, unitId, compartmentId) {
    if (unitId && compartmentId) {
        console.log("reserveLocker, freeing old locker...");
        // First check whether the old locker is still reserved
        const [oldLockerRows] = await connection.query(
            'SELECT * FROM locker_table WHERE UnitId = ? AND CompartmentId = ? AND State = "Reserved" FOR UPDATE',
            [unitId, compartmentId]);

        if (oldLockerRows.length === 0) {
            throw new Error('Old locker is not reserved but was expected to be reserved');
        }

        await connection.query(
            'UPDATE locker_table SET State = "Free" WHERE UnitId = ? AND CompartmentId = ?',
            [unitId, compartmentId]);
        const [result] = await connection.query(
            'DELETE FROM reservation_table WHERE UnitId = ? AND CompartmentId = ?',
            [unitId, compartmentId]);

        if (result.affectedRows === 0) {
            throw new Error('No reservation entry for locker %d-%d!', unitId, compartmentId);
        }
    }
}

async function reserveNewLocker(connection, unitId, compartmentId) {
    // Check if the new locker is still available
    console.log("reserveLocker, check if locker is free...");
    const [rows] = await connection.query(
        'SELECT * FROM locker_table WHERE UnitId = ? AND CompartmentId = ? AND State = "Free" FOR UPDATE',
        [unitId, compartmentId]
    );

    if (rows.length === 0) {
        console.log("reserveLocker, locker is not free...");
        throw new Error('Locker is already reserved');
    }

    console.log("reserveLocker, reserve locker...");
    const queryResult = await connection.query(
        'UPDATE locker_table SET State = "Reserved" WHERE UnitId = ? AND CompartmentId = ?',
        [unitId, compartmentId]);

    const [result] = await connection.query(
        'INSERT INTO reservation_table (UnitId, CompartmentId, ReservationTime) VALUES (?, ?, NOW())',
        [unitId, compartmentId]);
    console.log("reserveLocker, reservation made: %d", result.insertId);
    return queryResult;
}

// As async function this returns a promise which fulfils with the result of the query.
async function reserveLocker(newLocker, oldLocker) {
    console.log("reserveLocker, creating connection...");

    const connection = await pool.getConnection();
    console.log("reserveLocker, established connection...");
    try {
        console.log("reserveLocker, starting transaction...");
        await connection.beginTransaction();

        await freeOldLocker(connection, oldLocker.locker, oldLocker.compartment);
        const queryResult = await reserveNewLocker(connection, newLocker.locker, newLocker.compartment);

        await connection.commit();
        return queryResult;
    } catch (error) {
        console.log("reserveLocker, rolling back due to error: ", error);
        await connection.rollback();
        throw error;
    } finally {
        console.log("reserveLocker, releasing connection...");
        connection.release();
    }
}

async function releaseLockers() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Select lockers that are reserved for more than 15 minutes
      const [rows] = await connection.execute(
        `SELECT rt.UnitId, rt.CompartmentId
         FROM reservation_table rt
         JOIN locker_table lt ON rt.UnitId = lt.UnitId AND rt.CompartmentId = lt.CompartmentId
         WHERE lt.State = "Reserved" AND rt.ReservationTime < NOW() - INTERVAL 15 MINUTE`
      );

      // Update the state of these lockers to Free
      const releasePromises = rows.map(row =>
        connection.execute(
          `UPDATE locker_table
           SET State = "Free"
           WHERE UnitId = ? AND CompartmentId = ?`,
          [row.UnitId, row.CompartmentId]
        )
      );

      // Delete the corresponding records from the reservation_table
      const deletePromises = rows.map(row =>
        connection.execute(
          `DELETE FROM reservation_table
           WHERE UnitId = ? AND CompartmentId = ?`,
          [row.UnitId, row.CompartmentId]
        )
      );

      await Promise.all([...releasePromises, ...deletePromises]);

      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error('Error releasing lockers:', error);
    } finally {
      connection.release();
    }
}

// async function getLockers() {
//     return new Promise((acc, rej) => {
//         pool.query('SELECT * FROM locker_tbl', (err, rows) => {
//             if (err) return rej(err);
//             acc(rows);
//         });
//     });
// }

// async function getItem(id) {
//     return new Promise((acc, rej) => {
//         pool.query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
//             if (err) return rej(err);
//             acc(
//                 rows.map(item =>
//                     Object.assign({}, item, {
//                         completed: item.completed === 1,
//                     }),
//                 )[0],
//             );
//         });
//     });
// }

// async function getLocker(id) {
//     return new Promise((acc, rej) => {
//         pool.query('SELECT * FROM locker_tbl WHERE id=?', [id], (err, rows) => {
//             if (err) return rej(err);
//             acc(rows);
//         });
//     });
// }

// async function storeLocker(locker) {
//     return new Promise.all(
//         locker.boxList.map(box => new Promise((acc, rej) => {
//             pool.query(
//                 "INSERT INTO locker_tbl (id, locker_num, box_num, location, assigned_order, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
//                 [locker.id, locker.name, locker.box.id(), locker.location, locker.assignedTo, locker.status, locker.type],
//                 err => {
//                     if (err) return rej(err);
//                     acc();
//                 },
//             );
//         }))
//     );
//     // store the locker function.
//     pool.query("INSERT INTO box_tbl (id, status, message)")

//     // store into lockerBox to relate locker to boxes.
//     pool.query("INSERT INTO box_tbl (locker_id, box_id, box_spot)")
// }

// async function storeItem(item) {
//     return new Promise((acc, rej) => {
//         pool.query(
//             'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
//             [item.id, item.name, item.completed ? 1 : 0],
//             err => {
//                 if (err) return rej(err);
//                 acc();
//             },
//         );
//     });
// }

// async function updateItem(id, item) {
//     return new Promise((acc, rej) => {
//         pool.query(
//             'UPDATE todo_items SET name=?, completed=? WHERE id=?',
//             [item.name, item.completed ? 1 : 0, id],
//             err => {
//                 if (err) return rej(err);
//                 acc();
//             },
//         );
//     });
// }

// async function updateLocker(id, locker) {
//     return new Promise((acc, rej) => {
//         pool.query(
//             'UPDATE locker_tbl SET locker_num=?, box_num=?, location=?, assigned_order=?, status=?, type=? WHERE id=?',
//             [locker.locker_num, locker.box_num, locker.location, locker.assignedTo, locker.status, locker.type, id],
//             err => {
//                 if (err) return rej(err);
//                 acc();
//             },
//         );
//     });
// }

// async function removeItem(id) {
//     return new Promise((acc, rej) => {
//         pool.query('DELETE FROM todo_items WHERE id = ?', [id], err => {
//             if (err) return rej(err);
//             acc();
//         });
//     });
// }

// async function removeLocker(id) {
//     return new Promise((acc, rej) => {
//         pool.query('DELETE FROM locker_tbl WHERE id = ?', [id], err => {
//             if (err) return rej(err);
//             acc();
//         });
//     });
// }

module.exports = {
    init,
    teardown,
    getFloorMaps,
    getLockerUnits,
    getLockers,
    getLockerUnitsOnFloor,
    getLockersForUnit,
    reserveLocker,
    releaseLockers,
    // getItems,
    // getLockers,
    // getItem,
    // getLocker,
    // storeItem,
    // storeLocker,
    // updateItem,
    // updateLocker,
    // removeItem,
    // removeLocker,
};
