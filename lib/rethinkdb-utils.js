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

var promise = function promise(fn) {
  return new _bluebird2.default(function (resolve, reject) {
    return fn(resolve, reject);
  });
};

// Check if database
function _checkDBExists(_ref) {
  var db = _ref.db;
  var dbName = _ref.dbName;

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
  var db = _ref2.db;
  var dbName = _ref2.dbName;

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
  var db = _ref3.db;
  var dbName = _ref3.dbName;

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
  var db = _ref4.db;
  var tableName = _ref4.tableName;

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
  var db = _ref5.db;
  var tableName = _ref5.tableName;

  return _ramda2.default.curry(function (tableExists) {
    return promise(function (resolve, reject) {
      if (tableExists) return resolve();

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
  var db = _ref6.db;
  var tableName = _ref6.tableName;

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

// Create secondary indexes;
function _createIndexes(_ref7) {
  var db = _ref7.db;
  var tableName = _ref7.tableName;
  var indexes = _ref7.indexes;

  return _ramda2.default.curry(function () {
    return promise(function (resolve, reject) {

      var makeIndex = function makeIndex(idx) {
        return db.table(tableName).indexCreate(idx).run().then(function (response) {
          return resolve(response);
        }).error(function (err) {
          console.log('Error occured creating indexes', err);
        });
      };

      if (Array.isArray(indexes)) {
        indexes.forEach(function (idx) {
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
function _insertIntoTable(_ref8) {
  var db = _ref8.db;
  var tableName = _ref8.tableName;
  var data = _ref8.data;

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

function uuid(_ref9) {
  var db = _ref9.db;
  var host = _ref9.host;
  var port = _ref9.port;

  var r = (0, _rethinkdbdash2.default)({ db: db, host: host, port: port });

  return promise(function (resolve, reject) {
    r.uuid().run().then(function (response) {
      return resolve(response);
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function dropDB(_ref10) {
  var db = _ref10.db;
  var dbName = _ref10.dbName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkDBExists({ db: db, dbName: dbName }), _dropDB({ db: db, dbName: dbName }))();
  });
}

function createDB(_ref11) {
  var db = _ref11.db;
  var dbName = _ref11.dbName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkDBExists({ db: db, dbName: dbName }), _createDB({ db: db, dbName: dbName }))();
  });
}

function createTable(_ref12) {
  var db = _ref12.db;
  var tableName = _ref12.tableName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }))();
  });
}

function dropTable(_ref13) {
  var db = _ref13.db;
  var tableName = _ref13.tableName;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(_checkTableExists({ db: db, tableName: tableName }), _dropTable({ db: db, tableName: tableName }))();
  });
}

function insert(_ref14) {
  var dbName = _ref14.dbName;
  var tableName = _ref14.tableName;
  var data = _ref14.data;
  var db = _ref14.db;
  var fn = _ref14.fn;
  var indexes = _ref14.indexes;

  return promise(function (resolve, reject) {
    _ramda2.default.pipeP(
    // _checkDBExists ({ db, dbName }),
    // _createDB ({ db, dbName }),
    _checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }), _createIndexes({ db: db, tableName: tableName, indexes: indexes }), _insertIntoTable({ db: db, tableName: tableName, data: data }), fn(resolve))();
  });
}

// Seed tables
function seed(_ref15) {
  var dbName = _ref15.dbName;
  var tableName = _ref15.tableName;
  var fn = _ref15.fn;
  var data = _ref15.data;
  var db = _ref15.db;
  var indexes = _ref15.indexes;

  var tableNameTile = tableName.replace(tableName.charAt(0), tableName.charAt(0).toUpperCase());

  function callback(resolve) {
    return _ramda2.default.curry(function (response) {
      if (response.errors) return response.errors;
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
    _checkTableExists({ db: db, tableName: tableName }), _checkTableExists({ db: db, tableName: tableName }), _createTable({ db: db, tableName: tableName }), _createIndexes({ db: db, tableName: tableName, indexes: indexes }), _insertIntoTable({ db: db, tableName: tableName, data: data }), fn(resolve))();
  });
}