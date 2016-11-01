'use strict';

import R from 'ramda';
import rethinkdbdash from 'rethinkdbdash';
import Promise from 'bluebird';


const promise = function promise (fn) {
  return new Promise((resolve, reject) => fn(resolve, reject));
};


// Check if database
function _checkDBExists ({ db, dbName }) {
  return R.curry(() => {
    return promise((resolve, reject) => {
      return db.dbList()
        .contains(dbName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error occured checking database.', err);
        });
    });
  });
};


// Create new database
function _createDB ({ db, dbName }) {
  return R.curry(dbExists => {
    return promise((resolve, reject) => {
      console.log(dbName, dbExists);
      if (dbExists) return resolve();

      return db.dbCreate(dbName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error while creating database.', err);
        });
    });
  });
};


// Drop database
function _dropDB ({ db, dbName }) {
  return R.curry(tableExists => {
    return promise((resolve, reject) => {
      if (!tableExists) return resolve();

      return db.dropTable(dbName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error while creating table.', err);
        });
    });
  });
};


// Check if table exists
function _checkTableExists ({ db, tableName }) {
  return R.curry(() => {
    return promise((resolve, reject) => {
      return db.tableList()
        .contains(tableName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error occured table.', err);
        });
    });
  });
};


// Create new table
function _createTable ({ db, tableName }) {
  return R.curry(tableExists => {
    return promise((resolve, reject) => {
      if (tableExists) return resolve();

      return db.tableCreate(tableName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error while creating table.', err);
        });
    });
  });
};


// Drop table
function _dropTable ({ db, tableName }) {
  return R.curry(tableExists => {
    return promise((resolve, reject) => {
      if (!tableExists) return resolve();

      return db.dropTable(tableName)
        .run()
        .then(response => {
          return resolve(response);
        })
        .error(err => {
          console.log('Error while creating table.', err);
        });
    });
  });
};


// Create secondary indexes;
function _createIndexes ({db, tableName, indexes}) {
  return R.curry(() => {
    return promise((resolve, reject) => {

      const makeIndex = idx => {
        return db.table(tableName)
          .indexCreate(idx)
          .run()
          .then(response => {
            return resolve(response);
          })
          .error(err => {
            console.log('Error occured creating indexes', err);
          });
      };

      if (Array.isArray(indexes)) {
        indexes.forEach(idx => {
          makeIndex(idx);
        });
      } else if (indexes) {
        makeIndex(indexes);
      } else {
        resolve();
      }
    });
  });
}


// Insert data into table
function _insertIntoTable ({ db, tableName, data }) {
  return R.curry(() => {
    return promise((resolve, reject) => {
      return db.table(tableName)
        .insert(data)
        .run()
        .then(response => {
          resolve(response);
        })
        .error(err => {
          console.log('Error occured inseting data into tables.', err);
          reject(err);
        });
    });
  });
};



export function uuid ({ db, host, port }) {
  const r = rethinkdbdash({ db, host, port });

  return promise((resolve, reject) => {
    r.uuid()
      .run()
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}


export function dropDB ({ db, dbName }) {
  return promise((resolve, reject) => {
    R.pipeP(
      _checkDBExists({ db, dbName }),
      _dropDB({ db, dbName })
    )();
  });
}


export function createDB ({ db, dbName }) {
  return promise((resolve, reject) => {
    R.pipeP(
      _checkDBExists({ db, dbName }),
      _createDB({ db, dbName })
    )();
  });
}


export function createTable ({ db, tableName, indexes }) {
  return promise((resolve, reject) => {
    R.pipeP(
      _checkTableExists({ db, tableName }),
      _createTable({ db, tableName }),
      _createIndexes({ db, tableName, indexes })
    )();
  });
}


export function dropTable ({ db, tableName }) {
  return promise((resolve, reject) => {
    R.pipeP(
      _checkTableExists({ db, tableName }),
      _dropTable({ db, tableName })
    )();
  });
}


export function insert ({ dbName, tableName, data, db, fn, indexes }) {
  return promise((resolve, reject) => {
    R.pipeP(
      // _checkDBExists ({ db, dbName }),
      // _createDB ({ db, dbName }),
      _checkTableExists({ db, tableName }),
      _createTable({ db, tableName }),
      _createIndexes({ db, tableName, indexes }),
      _insertIntoTable({ db, tableName, data }),
      fn(resolve)
    )();
  });
}

// Seed tables
export function seed ({ dbName, tableName, fn, data, db, indexes }) {
  const tableNameTile = tableName.replace(tableName.charAt(0), tableName.charAt(0).toUpperCase())

  function callback (resolve) {
    return R.curry((response) => {
      if (response.errors) return response.errors;
      console.log(response);
      console.log(`${tableNameTile} mocks save to rethinkdb`);
    });
  }

  if (!fn) {
    fn = callback;
  }
  return promise((resolve, reject) => {
    R.pipeP(
      // _checkDBExists ({ db, dbName }),
      // _createDB ({ db, dbName }),
      _checkTableExists({ db, tableName }),
      _checkTableExists({ db, tableName }),
      _createTable({ db, tableName }),
      _createIndexes({ db, tableName, indexes }),
      _insertIntoTable({ db, tableName, data }),
      fn(resolve)
    )();
  });
}
