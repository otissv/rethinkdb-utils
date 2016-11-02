'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuid = uuid;
exports.dropDB = dropDB;
exports.createDB = createDB;
exports.createTable = createTable;
exports.dropTable = dropTable;
exports.insert = insert;
exports.seed = seed;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rethinkdbdash = require('rethinkdbdash');

var _rethinkdbdash2 = _interopRequireDefault(_rethinkdbdash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var promise = function promise(fn) {
  return new _bluebird2.default(function (resolve, reject) {
    return fn(resolve, reject);
  });
};

// Check if database
function _checkDBExists(_ref) {
  var db = _ref.db,
      dbName = _ref.dbName;

  return _ramda2.default.curry(function () {
    return promise(function (resolve, reject) {
      return db.dbList().contains(dbName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error occured checking database.', err);
      });
    });
  });
};

// Create new database
function _createDB(_ref2) {
  var db = _ref2.db,
      dbName = _ref2.dbName;

  return _ramda2.default.curry(function (dbExists) {
    return promise(function (resolve, reject) {
      console.log(dbName, dbExists);
      if (dbExists) return resolve();

      return db.dbCreate(dbName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error while creating database.', err);
      });
    });
  });
};

// Drop database
function _dropDB(_ref3) {
  var db = _ref3.db,
      dbName = _ref3.dbName;

  return _ramda2.default.curry(function (tableExists) {
    return promise(function (resolve, reject) {
      if (!tableExists) return resolve();

      return db.dropTable(dbName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error while creating table.', err);
      });
    });
  });
};

// Check if table exists
function _checkTableExists(_ref4) {
  var db = _ref4.db,
      tableName = _ref4.tableName;

  return _ramda2.default.curry(function () {
    return promise(function (resolve, reject) {
      return db.tableList().contains(tableName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error occured table.', err);
      });
    });
  });
};

// Create new table
function _createTable(_ref5) {
  var db = _ref5.db,
      tableName = _ref5.tableName;

  return _ramda2.default.curry(function (tableExists) {
    return promise(function (resolve, reject) {
      if (tableExists) return resolve(true);

      return db.tableCreate(tableName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error while creating table.', err);
      });
    });
  });
};

// Drop table
function _dropTable(_ref6) {
  var db = _ref6.db,
      tableName = _ref6.tableName;

  return _ramda2.default.curry(function (tableExists) {
    return promise(function (resolve, reject) {
      if (!tableExists) return resolve();

      return db.dropTable(tableName).run().then(function (response) {
        return resolve(response);
      }).error(function (err) {
        console.log('Error while creating table.', err);
      });
    });
  });
};

// Check if indexes already exist
function _indexesDontExist(_ref7) {
  var db = _ref7.db,
      tableName = _ref7.tableName,
      indexes = _ref7.indexes;

  return _ramda2.default.curry(function (tableExists) {
    return promise(function (resolve, reject) {
      if (!tableExists) return reject(tableName + ' does not exist.');

      return db.table(tableName).indexList().run().then(function (response) {
        var result = [].concat(_toConsumableArray(indexes), ['otis']).reduce(function (prev, curr) {
          return _ramda2.default.isEmpty(response.filter(function (r) {
            return r === curr;
          })) ? [].concat(_toConsumableArray(prev), [curr]) : prev;
        }, []);

        return resolve(result);
      }).error(function (err) {
        console.log('Error occured creating indexes', err);
      });
    });
  });
}

// Create secondary indexes;
function _createIndexes(_ref8) {
  var db = _ref8.db,
      tableName = _ref8.tableName,
      indexes = _ref8.indexes;

  return _ramda2.default.curry(function (indexCreate) {
    var tmpIndex = indexCreate || indexes;

    return promise(function (resolve, reject) {
      if (!indexCreate) return resolve();

      var makeIndex = function makeIndex(idx) {
        return db.table(tableName).indexCreate(idx).run().then(function (response) {
          return resolve(response);
        }).error(function (err) {
          console.log('Error occured creating indexes', err);
        });
      };

      if (Array.isArray(tmpIndex)) {
        tmpIndex.forEach(function (idx) {
          makeIndex(idx);
        });
      } else if (tmpIndex) {
        makeIndex(tmpIndex);
      } else {
        resolve();
      }
    });
  });
}

// Insert data into table
function _insertIntoTable(_ref9) {
  var db = _ref9.db,
      tableName = _ref9.tableName,
      data = _ref9.data;

  return _ramda2.default.curry(function () {
    return promise(function (resolve, reject) {
      return db.table(tableName).insert(data).run().then(function (response) {
        resolve(response);
      }).error(function (err) {
        console.log('Error occured inseting data into tables.', err);
        reject(err);
      });
    });
  });
};

function uuid(_ref10) {
  var db = _ref10.db,
      host = _ref10.host,
      port = _ref10.port;

  var r = (0, _rethinkdbdash2.default)({ db: db, host: host, port: port });

  return promise(function (resolve, reject) {
    r.uuid().run().then(function (response) {
      return resolve(response);
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function dropDB(_ref11) {
  var db = _ref11.db,
      dbName = _ref11.dbName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkDBExists({ db: db, dbName: dbName }), _dropDB({ db: db, dbName: dbName }))();
  });
}

function createDB(_ref12) {
  var db = _ref12.db,
      dbName = _ref12.dbName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkDBExists({ db: db, dbName: dbName }), _createDB({ db: db, dbName: dbName }))();
  });
}

function createTable(_ref13) {
  var db = _ref13.db,
      tableName = _ref13.tableName,
      indexes = _ref13.indexes;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }), _createIndexes({ db: db, tableName: tableName, indexes: indexes }))();
  });
}

function dropTable(_ref14) {
  var db = _ref14.db,
      tableName = _ref14.tableName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkTableExists({ db: db, tableName: tableName }), _dropTable({ db: db, tableName: tableName }))();
  });
}

function insert(_ref15) {
  var dbName = _ref15.dbName,
      tableName = _ref15.tableName,
      data = _ref15.data,
      db = _ref15.db,
      fn = _ref15.fn,
      indexes = _ref15.indexes;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(
    // _checkDBExists ({ db, dbName }),
    // _createDB ({ db, dbName }),
    _checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }), _createIndexes({ db: db, tableName: tableName, indexes: indexes }), _insertIntoTable({ db: db, tableName: tableName, data: data }), fn(resolve))();
  });
}

// Seed tables
function seed(_ref16) {
  var dbName = _ref16.dbName,
      tableName = _ref16.tableName,
      fn = _ref16.fn,
      data = _ref16.data,
      db = _ref16.db,
      indexes = _ref16.indexes;

  var tableNameTile = tableName.replace(tableName.charAt(0), tableName.charAt(0).toUpperCase());

  function callback(resolve) {
    return _ramda2.default.curry(function (response) {
      // if (response.errors) return response.errors;
      console.log(response);
      console.log(tableNameTile + ' mocks save to rethinkdb');
    });
  }

  if (!fn) {
    fn = callback;
  }
  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(
    // _checkDBExists ({ db, dbName }),
    // _createDB ({ db, dbName }),
    _checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }), _indexesDontExist({ db: db, tableName: tableName, indexes: indexes }), _createIndexes({ db: db, tableName: tableName, indexes: indexes }),
    // _insertIntoTable({ db, tableName, data }),
    fn(resolve))();
  });
}