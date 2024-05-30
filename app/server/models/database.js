const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');

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

    const promiseCreateLockerTbl = new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS locker_table(UnitId INT NOT NULL, \
                                                     CompartmentId INT NOT NULL, \
                                                     LockType ENUM("Key", "Combination"), \
                                                     Color varchar(255), \
                                                     State ENUM("Free", "Occupied", "OutOfOrder", "Reserved") NOT NULL, \
                                                     PRIMARY KEY(UnitId, CompartmentId) \
                                                    ) DEFAULT CHARSET utf8mb4',
            (err) => {
                if (err) return rej(err);

                console.log(`Successfully created locker table`);
                acc();
            },
        );
    });

    const promiseCreateLockerUnitTable = new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS locker_unit_table(UnitId INT NOT NULL, \
                                                          FloorId INT NOT NULL, \
                                                          TopLeftX INT NOT NULL, \
                                                          TopLeftY INT NOT NULL, \
                                                          BottomRightX INT NOT NULL, \
                                                          BottomRightY INT NOT NULL, \
                                                          PRIMARY KEY(UnitId) \
            ) DEFAULT CHARSET utf8mb4',
            (err) => {
                if (err) return rej(err);

                console.log(`Successfully created locker unit table`);
                acc();
            }
        );
    });

    const promiseCreateFloorMapTable = new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS floor_map_table(FloorId INT NOT NULL, \
                                                        ImageSource VARCHAR(255) NOT NULL, \
                                                        ImageDescription VARCHAR(255) NOT NULL, \
                                                        PRIMARY KEY(FloorId) \
            ) DEFAULT CHARSET utf8mb4',
            (err) => {
                if (err) return rej(err);

                console.log(`Successfully created floor map table`);
                acc();
            }
        )
    });

    return Promise.all([promiseCreateLockerTbl, promiseCreateLockerUnitTable, promiseCreateFloorMapTable]);
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getFloorMaps() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM floor_map_table', (err, rows) => {
            if (err) return rej(err); // catch case
            acc(// then case - do not need to modify the locker object.
                rows.map(item =>
                    Object.assign({}, {
                        level: item.FloorId,
                        image: item.ImageSource,
                        title: item.ImageDescription,
                    }),
                ),
            );
        });
    });
}

async function getLockerUnits() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM locker_unit_table', (err, rows) => {
            if (err) return rej(err); // catch case
            acc(// then case - do not need to modify the locker object.
                rows.map(item =>
                    Object.assign({}, item),
                ),
            );
        });
    });
}

async function getLockerUnitsOnFloor(floorId) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM locker_unit_table WHERE FloorId = ?', [floorId], (err, rows) => {
            if (err) return rej(err); // catch case
            acc(// then case - do not need to modify the locker object.
                rows.map(item =>
                    Object.assign({}, item),
                ),
            );
        });
    });
}

async function getLockers() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM locker_table', (err, rows) => {
            if (err) return rej(err); // catch case
            acc(// then case - do not need to modify the locker object.
                rows.map(item =>
                    Object.assign({}, item),
                ),
            );
        });
    });
}

async function getLockersForUnit(unitId) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM locker_table WHERE UnitId = ?', [unitId], (err, rows) => {
            if (err) return rej(err); // catch case
            acc(// then case - do not need to modify the locker object.
                rows.map(item =>
                    Object.assign({}, item),
                ),
            );
        });
    });
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
