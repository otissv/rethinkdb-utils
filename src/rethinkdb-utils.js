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
      if (tableExists) return resolve(true);

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


// Check if indexes already exist
function _indexesDoesntExist ({db, tableName, indexes}) {
  return R.curry(tableExists => {
    return promise((resolve, reject) => {
      if (!tableExists) return reject(`${tableName} does not exist.`);

      return db.table(tableName)
        .indexList()
        .run()
        .then(response => {
          let result;

          if (indexes) {
            result = [...indexes].reduce((prev, curr) => {
              return R.isEmpty(response.filter(r => r === curr)) ? [...prev, curr] : prev;
            }, []);
          }

          return resolve(result);
        })
        .error(err => {
          console.log('Error occured creating indexes', err);
        });

    });
  });
}


// Create secondary indexes;
function _createIndexes ({db, tableName, indexes}) {
  return R.curry(indexCreate => {
    const tmpIndex = indexCreate || indexes;


    return promise((resolve, reject) => {
      if (!tmpIndex) return resolve();
// indexCreate('authorName', r.row("author")("name"))
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

      const makeNestedIndex = idxSplit => {
        return db.table(tableName)
          .indexCreate('user', (row) => row('user')('id'))
          .run()
          .then(response => {
            return resolve(response);
          })
          .error(err => {
            console.log('Error occured creating indexes', err);
          });
      };

      if (Array.isArray(tmpIndex)) {
        tmpIndex.forEach(idx => {
          const idxSplit = idx.split('.');
          idxSplit[1] ? makeNestedIndex(idxSplit) : makeIndex(idx);
        });
      } else if (tmpIndex) {
        const tmpSplit = tmpIndex.split('.');
        tmpSplit[1] ? makeNestedIndex(tmpSplit) : makeIndex(tmpIndex);
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
      _indexesDoesntExist({ db, tableName, indexes }),
      _createIndexes({ db, tableName, indexes }),
      _insertIntoTable({ db, tableName, data }),
      fn(resolve)
    )();
  });
}

// Seed tables
export function seed ({ dbName, tableName, fn, data, db, indexes }) {
  const tableNameTile = tableName.replace(tableName.charAt(0), tableName.charAt(0).toUpperCase());

  function callback (resolve) {
    return R.curry((response) => {
      // if (response.errors) return response.errors;
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
      _createTable({ db, tableName }),
      _indexesDoesntExist({ db, tableName, indexes }),
      _createIndexes({ db, tableName, indexes }),
      _insertIntoTable({ db, tableName, data }),
      fn(resolve)
    )();
  });
}

// dynamic filtering and matching
export function filterMatch (filterObject) {
  const fields = Object.keys(filterObject)[0].split('.');

  function gererateDoc (doc) {
    switch (fields.length) {
      case 1:
        return doc(fields[0]);
      case 2:
        return doc(fields[0])(fields[1]);
      case 3:
        return doc(fields[0])(fields[1])(fields[2]);
      case 4:
        return doc(fields[0])(fields[1])(fields[2])(fields[3]);
      default:
        return doc;
    }
  }


  let condition;

  for (let key in filterObject) {
    let conditionForThisKey;

    const filterProps = filterObject[key];

    if (filterProps.condition === 'equals') {
      conditionForThisKey = doc => gererateDoc(doc).match(`(?i)^${filterProps.value}$`);

    } else if (filterProps.condition === 'beginsWith') {
      conditionForThisKey = doc => gererateDoc(doc).match(`(?i)^${filterProps.value}`);

    } else if (filterProps.condition === 'endsWith') {
      conditionForThisKey = doc => gererateDoc(doc).match(`(?i)${filterProps.value}$`);

    } else if (filterProps.condition === 'greaterThan') {
    } else if (filterProps.condition === 'greaterThanEqualTo') {
    } else if (filterProps.condition === 'lessThan') {
    } else if (filterProps.condition === 'lessThanEqualTo') {
    } else if (filterProps.condition === 'between') {
    } else if (filterProps.condition === 'min') {
    } else if (filterProps.condition === 'max') {
    } else if (filterProps.condition === 'minLength') {
    } else if (filterProps.condition === 'maxLength') {
    } else if (filterProps.condition === 'boolean') {
    } else if (filterProps.condition === 'contains') {
      conditionForThisKey = doc => gererateDoc(doc).match(`(?i)${filterProps.value}`);
    } else {
      // custom match or has
      conditionForThisKey = doc => gererateDoc(doc).match(`${filterProps.value}`);
    }


    if (typeof condition === 'undefined') {
      condition = conditionForThisKey;
    } else {
      condition = condition.and(conditionForThisKey);
    }
  }

  return condition;
}
