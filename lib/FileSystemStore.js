"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @file FileSystemStore.js - File System Store for persistence with MongoPortable ({@link https://github.com/EastolfiWebDev/MongoPortable}), 
 *  a portable MongoDB-like module.
 * @version 1.0.0
 * 
 * @author Eduardo Astolfi <eastolfi91@gmail.com>
 * @copyright 2016 Eduardo Astolfi <eastolfi91@gmail.com>
 * @license MIT Licensed
 */

var fs = require("file-system"),
    _ = require("lodash");

var _defOptions = {
    ddbb_path: 'db',
    collection_extension: 'json',
    sync: false
};

// existsDir, existsFile, createDir, removeDir, createFile, removeFile, writeToFile, readFromFile

var _existsFile = function _existsFile(filename) {
    var exists = false;
    try {
        var file = fs.readFileSync(filename);

        if (!_.isNil(file)) {
            var stats = fs.statSync(filename);

            exists = stats.isFile();
        }
    } catch (error) {
        console.log('ook');
    } finally {
        return exists;
    }
};

var _persist = function _persist(collectionPath, collection) {
    var docs = "";
    for (var i = 0; i < collection.docs.length; i++) {
        docs += JSON.stringify(collection.docs[i]) + "\n";
    }

    if (this.options.sync === true) {
        _writeFile(collectionPath, docs);

        console.info('Document persisted in the file system');
    } else {
        fs.writeFile(collectionPath, function (docs, err) {
            if (err) throw err;

            console.info('Document persisted in the file system');
        });
    }
};

var _readFile = function _readFile(path) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!_.isNil(callback)) {
        fs.readFile(path, function (err, data) {
            if (err) throw err;

            callback(data);

            console.info('Collection readed from the file system');
        });
    } else {
        return fs.readFileSync(path);
    }
};

var _createDirectory = function _createDirectory() {
    var dir = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    fs.mkdirSync(this.options.ddbb_path + "/" + dir);
};

var _createFile = function _createFile(path, recursive) {
    _writeFile(path);
};

var _writeFile = function _writeFile(path) {
    var content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    fs.writeFileSync(path, content);
};

/**
 * FileSystemStore
 * 
 * @module FileSystemStore
 * @constructor
 * @since 0.0.1
 * 
 * @classdesc Store for MongoPortable ({@link https://github.com/EastolfiWebDev/MongoPortable})
 * 
 * @param {Object} [options] - Additional options
 * 
 * @param {Boolean} [options.ddbb_path="db"] - The name of the directory where the database will be located
 * @param {Boolean} [options.sync=true] - Set it false to make all the file access asynchronous. (Currently only sync=true is supported)
 * @param {Boolean} [options.collection_extension="json"] - The extension of the collection files. (Currently only "json" is supported)
 */

var FileSysStore = function () {
    function FileSysStore(options) {
        _classCallCheck(this, FileSysStore);

        this.options = _.assign(_defOptions, options);

        console.info("Database will be in " + this.options.ddbb_path);

        // Create the DDBB path
        _createDirectory.call(this);
    }

    /***************
     *    UTILS    *
     ***************/

    /**
     * Get the path of the collection file
     *
     * @method FileSystemStore#getCollectionPath
     * 
     * @param {String} ddbb_name - Name of the database
     * @param {String} coll_name - Name of the collection
     *
     * @return {String} - The path of the file
     */


    _createClass(FileSysStore, [{
        key: "getCollectionPath",
        value: function getCollectionPath(ddbb_name, coll_name) {
            if (_.isNil(ddbb_name)) throw new Error("Parameter 'ddbb_name' is required");
            if (_.isNil(coll_name)) throw new Error("Parameter 'coll_name' is required");

            return this.options.ddbb_path + "/" + ddbb_name + "/" + coll_name + "." + this.options.collection_extension;
        }

        /***************
         * COLLECTIONS *
         ***************/

        /**
         * Receives a "createCollection" event from MongoPortable, syncronizing the collection file with the new info
         *
         * @method FileSystemStore~createCollection
         * 
         * @listens MongoPortable~createCollection
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @param {Object} args.connection - Information about the current database connection
         * @param {Object} args.collection - Information about the collection created
         */

    }, {
        key: "createCollection",
        value: function createCollection(args) {
            console.log('#createCollection');

            var coll_path = this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name);

            if (!_existsFile(coll_path)) {
                _createFile(coll_path, true);
            }
        }

        /**********
         * CREATE *
         **********/

        /**
         * Receives a "insert" event from MongoPortable, syncronizing the collection file with the new info
         *
         * @method FileSystemStore~insert
         * 
         * @listens MongoPortable~insert
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @param {Object} args.collection - Information about the collection
         * @param {Object} args.doc - Information about the document inserted
         */

    }, {
        key: "insert",
        value: function insert(args) {
            console.log('#insert');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        // TODO

    }, {
        key: "save",
        value: function save(args) {
            console.log('#save');
            // console.log(args);
        }

        /**********
         *  READ  *
         **********/

        // TODO

    }, {
        key: "all",
        value: function all(args) {
            console.log('#all');

            // console.log(args);
        }

        /**
         * Receives a "find" event from MongoPortable, fetching the info of the collection file
         *
         * @method FileSystemStore~find
         * 
         * @listens MongoPortable~find
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @property {Object} args.collection - Information about the collection
         * @property {Object} args.selector - The selection of the query
         * @property {Object} args.fields - The fields showed in the query
         */

    }, {
        key: "find",
        value: function find(args) {
            console.log('#find');

            var callback = null;

            if (this.options.sync !== true) {
                // handle async
            }

            var file = _readFile(this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), callback);

            var docs = [];
            var indexes = {};

            var lines = file.toString().split("\n");

            // FIXME Workaround...
            for (var i = 0; i < lines.length; i++) {
                var doc = lines[i];

                if (doc.trim() !== '') {
                    docs.push(JSON.parse(doc));
                    indexes[JSON.parse(doc)._id] = i;
                }
            }

            /**/
            // var _docs = _.cloneDeep(args.collection.docs);
            // var _idxs = _.cloneDeep(args.collection.doc_indexes);

            // for (collDocs) {
            //     let doc;

            //     if (!_.hasIn(_idx, doc._id)) {
            //         add(doc);
            //     } else {
            //         update(doc);
            //     }
            // }
            /**/

            // var docs = [];

            // for (var i = 0; i < collDocs.length; i++) {
            //     var doc = collDocs[i];

            //     docs.push(doc);
            //     args.collection.doc_indexes[doc._id] = i;
            // }

            // if (docs.length !== )

            // for (let key in args.collection.doc_indexes) {

            // }

            args.collection.docs = docs;
            args.collection.doc_indexes = indexes;
        }

        /**
         * Receives a "findOne" event from MongoPortable, fetching the info of the collection file
         *
         * @method FileSystemStore~findOne
         * 
         * @listens MongoPortable~findOne
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @property {Object} args.collection - Information about the collection
         * @property {Object} args.selector - The selection of the query
         * @property {Object} args.fields - The fields showed in the query
         */

    }, {
        key: "findOne",
        value: function findOne(args) {
            console.log('#findOne');
            // console.log(args);

            // FIXME When we can do a line-per-line file search, change this
            this.find(args);
        }
        /**********
         * UPDATE *
         **********/

        /**
         * Receives an "update" event from MongoPortable, syncronizing the collection file with the new info
         *
         * @method FileSystemStore~update
         * 
         * @listens MongoPortable~update
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @property {Object} args.collection - Information about the collection
         * @property {Object} args.selector - The selection of the query
         * @property {Object} args.modifier - The modifier used in the query
         * @property {Object} args.docs - The updated/inserted documents information
         */

    }, {
        key: "update",
        value: function update(args) {
            console.log('#update');
            // console.log(args);

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        /**********
         * DELETE *
         **********/

        /**
         * Receives an "remove" event from MongoPortable, syncronizing the collection file with the new info
         *
         * @method FileSystemStore~remove
         * 
         * @listens MongoPortable~remove
         * 
         * @param {Object} args - Arguments from the event
         * 
         * @property {Object} args.collection - Information about the collection
         * @property {Object} args.selector - The selection of the query
         * @property {Object} args.docs - The deleted documents information
         */

    }, {
        key: "remove",
        value: function remove(args) {
            console.log('#remove');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        /**********
         * OTHERS *
         **********/
        // TODO

    }, {
        key: "ensureIndex",
        value: function ensureIndex(args) {
            console.log('#ensureIndex');
            // console.log(args);
        }

        // TODO

    }, {
        key: "backup",
        value: function backup(args) {
            console.log('#backup');
            // console.log(args);
        }

        // TODO

    }, {
        key: "backups",
        value: function backups(args) {
            console.log('#backups');
            // console.log(args);
        }

        // TODO

    }, {
        key: "removeBackup",
        value: function removeBackup(args) {
            console.log('#removeBackup');
            // console.log(args);
        }

        // TODO

    }, {
        key: "restore",
        value: function restore(args) {
            console.log('#restore');
            // console.log(args);
        }
    }]);

    return FileSysStore;
}();

module.exports = FileSysStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9GaWxlU3lzdGVtU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQVVBLElBQUksS0FBSyxRQUFRLGFBQVIsQ0FBVDtJQUNJLElBQUksUUFBUSxRQUFSLENBRFI7O0FBR0EsSUFBSSxjQUFjO0FBQ2QsZUFBVyxJQURHO0FBRWQsMEJBQXNCLE1BRlI7QUFHZCxVQUFNO0FBSFEsQ0FBbEI7Ozs7QUFRQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQVMsUUFBVCxFQUFtQjtBQUNuQyxRQUFJLFNBQVMsS0FBYjtBQUNBLFFBQUk7QUFDQSxZQUFJLE9BQU8sR0FBRyxZQUFILENBQWdCLFFBQWhCLENBQVg7O0FBRUEsWUFBSSxDQUFDLEVBQUUsS0FBRixDQUFRLElBQVIsQ0FBTCxFQUFvQjtBQUNoQixnQkFBSSxRQUFRLEdBQUcsUUFBSCxDQUFZLFFBQVosQ0FBWjs7QUFFQSxxQkFBUyxNQUFNLE1BQU4sRUFBVDtBQUNIO0FBQ0osS0FSRCxDQVFFLE9BQU8sS0FBUCxFQUFjO0FBQ1osZ0JBQVEsR0FBUixDQUFZLEtBQVo7QUFDSCxLQVZELFNBVVU7QUFDTixlQUFPLE1BQVA7QUFDSDtBQUNKLENBZkQ7O0FBaUJBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDO0FBQ2xELFFBQUksT0FBTyxFQUFYO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFdBQVcsSUFBWCxDQUFnQixNQUFwQyxFQUE0QyxHQUE1QyxFQUFpRDtBQUM3QyxnQkFBUSxLQUFLLFNBQUwsQ0FBZSxXQUFXLElBQVgsQ0FBZ0IsQ0FBaEIsQ0FBZixJQUFxQyxJQUE3QztBQUNIOztBQUVELFFBQUksS0FBSyxPQUFMLENBQWEsSUFBYixLQUFzQixJQUExQixFQUFnQztBQUM1QixtQkFBVyxjQUFYLEVBQTJCLElBQTNCOztBQUVBLGdCQUFRLElBQVIsQ0FBYSx1Q0FBYjtBQUNILEtBSkQsTUFJTztB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SyxJQUFMLENBQVUsSUFBVjtBQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytCQW1CTyxJLEVBQUs7QUFDVCxvQkFBUSxHQUFSLENBQVksU0FBWjs7O0FBR0EscUJBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0IsS0FBSyxpQkFBTCxDQUF1QixLQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBeUIsS0FBekIsQ0FBK0IsR0FBL0IsRUFBb0MsQ0FBcEMsQ0FBdkIsRUFBK0QsS0FBSyxVQUFMLENBQWdCLElBQS9FLENBQXBCLEVBQTBHLEtBQUssVUFBL0c7QUFDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrQkFtQk0sSSxFQUFNO0FBQ1Qsb0JBQVEsR0FBUixDQUFZLFNBQVo7O0FBRUEscUJBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0IsS0FBSyxpQkFBTCxDQUF1QixLQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBeUIsS0FBekIsQ0FBK0IsR0FBL0IsRUFBb0MsQ0FBcEMsQ0FBdkIsRUFBK0QsS0FBSyxVQUFMLENBQWdCLElBQS9FLENBQXBCLEVBQTBHLEtBQUssVUFBL0c7QUFDSDs7Ozs7Ozs7O29DQU1ZLEksRUFBSztBQUNkLG9CQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVIOzs7Ozs7K0JBR08sSSxFQUFLO0FBQ1Qsb0JBQVEsR0FBUixDQUFZLFNBQVo7O0FBRUg7Ozs7OztnQ0FHUSxJLEVBQUs7QUFDVixvQkFBUSxHQUFSLENBQVksVUFBWjs7QUFFSDs7Ozs7O3FDQUdhLEksRUFBSztBQUNmLG9CQUFRLEdBQVIsQ0FBWSxlQUFaOztBQUVIOzs7Ozs7Z0NBR1EsSSxFQUFLO0FBQ1Ysb0JBQVEsR0FBUixDQUFZLFVBQVo7O0FBRUg7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixZQUFqQiIsImZpbGUiOiJGaWxlU3lzdGVtU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIEZpbGVTeXN0ZW1TdG9yZS5qcyAtIEZpbGUgU3lzdGVtIFN0b3JlIGZvciBwZXJzaXN0ZW5jZSB3aXRoIE1vbmdvUG9ydGFibGUgKHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vRWFzdG9sZmlXZWJEZXYvTW9uZ29Qb3J0YWJsZX0pLCBcbiAqICBhIHBvcnRhYmxlIE1vbmdvREItbGlrZSBtb2R1bGUuXG4gKiBAdmVyc2lvbiAxLjAuMFxuICogXG4gKiBAYXV0aG9yIEVkdWFyZG8gQXN0b2xmaSA8ZWFzdG9sZmk5MUBnbWFpbC5jb20+XG4gKiBAY29weXJpZ2h0IDIwMTYgRWR1YXJkbyBBc3RvbGZpIDxlYXN0b2xmaTkxQGdtYWlsLmNvbT5cbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlZFxuICovXG4gXG52YXIgZnMgPSByZXF1aXJlKFwiZmlsZS1zeXN0ZW1cIiksXG4gICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbnZhciBfZGVmT3B0aW9ucyA9IHtcbiAgICBkZGJiX3BhdGg6ICdkYicsXG4gICAgY29sbGVjdGlvbl9leHRlbnNpb246ICdqc29uJyxcbiAgICBzeW5jOiBmYWxzZVxufTtcblxuLy8gZXhpc3RzRGlyLCBleGlzdHNGaWxlLCBjcmVhdGVEaXIsIHJlbW92ZURpciwgY3JlYXRlRmlsZSwgcmVtb3ZlRmlsZSwgd3JpdGVUb0ZpbGUsIHJlYWRGcm9tRmlsZVxuXG5jb25zdCBfZXhpc3RzRmlsZSA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKTsgIFxuICAgICAgICBcbiAgICAgICAgaWYgKCFfLmlzTmlsKGZpbGUpKSB7XG4gICAgICAgICAgICB2YXIgc3RhdHMgPSBmcy5zdGF0U3luYyhmaWxlbmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4aXN0cyA9IHN0YXRzLmlzRmlsZSgpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ29vaycpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIHJldHVybiBleGlzdHM7XG4gICAgfVxufTtcblxuY29uc3QgX3BlcnNpc3QgPSBmdW5jdGlvbihjb2xsZWN0aW9uUGF0aCwgY29sbGVjdGlvbikge1xuICAgIGxldCBkb2NzID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxlY3Rpb24uZG9jcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb2NzICs9IEpTT04uc3RyaW5naWZ5KGNvbGxlY3Rpb24uZG9jc1tpXSkgKyBcIlxcblwiO1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMgPT09IHRydWUpIHtcbiAgICAgICAgX3dyaXRlRmlsZShjb2xsZWN0aW9uUGF0aCwgZG9jcyk7XG5cbiAgICAgICAgY29uc29sZS5pbmZvKCdEb2N1bWVudCBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZnMud3JpdGVGaWxlKGNvbGxlY3Rpb25QYXRoLCAoZG9jcywgZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnRG9jdW1lbnQgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBfcmVhZEZpbGUgPSBmdW5jdGlvbihwYXRoLCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICBpZiAoIV8uaXNOaWwoY2FsbGJhY2spKSB7XG4gICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29sbGVjdGlvbiByZWFkZWQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0nKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKTtcbiAgICB9XG59O1xuXG5jb25zdCBfY3JlYXRlRGlyZWN0b3J5ID0gZnVuY3Rpb24oZGlyID0gJycpIHtcbiAgICBmcy5ta2RpclN5bmMoYCR7dGhpcy5vcHRpb25zLmRkYmJfcGF0aH0vJHtkaXJ9YCk7XG59O1xuXG5jb25zdCBfY3JlYXRlRmlsZSA9IGZ1bmN0aW9uKHBhdGgsIHJlY3Vyc2l2ZSkge1xuICAgIF93cml0ZUZpbGUocGF0aCk7XG59O1xuXG5jb25zdCBfd3JpdGVGaWxlID0gZnVuY3Rpb24ocGF0aCwgY29udGVudCA9ICcnKSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBjb250ZW50KTtcbn07XG5cbi8qKlxuICogRmlsZVN5c3RlbVN0b3JlXG4gKiBcbiAqIEBtb2R1bGUgRmlsZVN5c3RlbVN0b3JlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBzaW5jZSAwLjAuMVxuICogXG4gKiBAY2xhc3NkZXNjIFN0b3JlIGZvciBNb25nb1BvcnRhYmxlICh7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0Vhc3RvbGZpV2ViRGV2L01vbmdvUG9ydGFibGV9KVxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gQWRkaXRpb25hbCBvcHRpb25zXG4gKiBcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGRiYl9wYXRoPVwiZGJcIl0gLSBUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSBkYXRhYmFzZSB3aWxsIGJlIGxvY2F0ZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc3luYz10cnVlXSAtIFNldCBpdCBmYWxzZSB0byBtYWtlIGFsbCB0aGUgZmlsZSBhY2Nlc3MgYXN5bmNocm9ub3VzLiAoQ3VycmVudGx5IG9ubHkgc3luYz10cnVlIGlzIHN1cHBvcnRlZClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY29sbGVjdGlvbl9leHRlbnNpb249XCJqc29uXCJdIC0gVGhlIGV4dGVuc2lvbiBvZiB0aGUgY29sbGVjdGlvbiBmaWxlcy4gKEN1cnJlbnRseSBvbmx5IFwianNvblwiIGlzIHN1cHBvcnRlZClcbiAqL1xuY2xhc3MgRmlsZVN5c1N0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IF8uYXNzaWduKF9kZWZPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgRGF0YWJhc2Ugd2lsbCBiZSBpbiAke3RoaXMub3B0aW9ucy5kZGJiX3BhdGh9YCk7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgdGhlIEREQkIgcGF0aFxuICAgICAgICBfY3JlYXRlRGlyZWN0b3J5LmNhbGwodGhpcyk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiAgICBVVElMUyAgICAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhdGggb2YgdGhlIGNvbGxlY3Rpb24gZmlsZVxuICAgICAqXG4gICAgICogQG1ldGhvZCBGaWxlU3lzdGVtU3RvcmUjZ2V0Q29sbGVjdGlvblBhdGhcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGRiYl9uYW1lIC0gTmFtZSBvZiB0aGUgZGF0YWJhc2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY29sbF9uYW1lIC0gTmFtZSBvZiB0aGUgY29sbGVjdGlvblxuICAgICAqXG4gICAgICogQHJldHVybiB7U3RyaW5nfSAtIFRoZSBwYXRoIG9mIHRoZSBmaWxlXG4gICAgICovXG4gICAgZ2V0Q29sbGVjdGlvblBhdGgoZGRiYl9uYW1lLCBjb2xsX25hbWUpIHtcbiAgICAgICAgaWYgKF8uaXNOaWwoZGRiYl9uYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyICdkZGJiX25hbWUnIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICBpZiAoXy5pc05pbChjb2xsX25hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJhbWV0ZXIgJ2NvbGxfbmFtZScgaXMgcmVxdWlyZWRcIik7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYCR7dGhpcy5vcHRpb25zLmRkYmJfcGF0aH0vJHtkZGJiX25hbWV9LyR7Y29sbF9uYW1lfS4ke3RoaXMub3B0aW9ucy5jb2xsZWN0aW9uX2V4dGVuc2lvbn1gO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKioqKioqXG4gICAgICogQ09MTEVDVElPTlMgKlxuICAgICAqKioqKioqKioqKioqKiovXG4gICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJjcmVhdGVDb2xsZWN0aW9uXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBzeW5jcm9uaXppbmcgdGhlIGNvbGxlY3Rpb24gZmlsZSB3aXRoIHRoZSBuZXcgaW5mb1xuICAgICAqXG4gICAgICogQG1ldGhvZCBGaWxlU3lzdGVtU3RvcmV+Y3JlYXRlQ29sbGVjdGlvblxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+Y3JlYXRlQ29sbGVjdGlvblxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MuY29ubmVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IGRhdGFiYXNlIGNvbm5lY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb24gY3JlYXRlZFxuICAgICAqL1xuICAgICBjcmVhdGVDb2xsZWN0aW9uKGFyZ3MpIHtcbiAgICAgICAgIGNvbnNvbGUubG9nKCcjY3JlYXRlQ29sbGVjdGlvbicpO1xuICAgICAgICAgXG4gICAgICAgICB2YXIgY29sbF9wYXRoID0gdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChhcmdzLmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgYXJncy5jb2xsZWN0aW9uLm5hbWUpO1xuICAgICAgICAgXG4gICAgICAgICBpZiAoIV9leGlzdHNGaWxlKGNvbGxfcGF0aCkpIHtcbiAgICAgICAgICAgICBfY3JlYXRlRmlsZShjb2xsX3BhdGgsIHRydWUpO1xuICAgICAgICAgfVxuICAgICB9XG5cbiAgICAvKioqKioqKioqKlxuICAgICAqIENSRUFURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImluc2VydFwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3Jlfmluc2VydFxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+aW5zZXJ0XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncy5kb2MgLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZG9jdW1lbnQgaW5zZXJ0ZWRcbiAgICAgKi9cbiAgICBpbnNlcnQgKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyNpbnNlcnQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICBfcGVyc2lzdC5jYWxsKHRoaXMsIHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoYXJncy5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGFyZ3MuY29sbGVjdGlvbi5uYW1lKSwgYXJncy5jb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHNhdmUgKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyNzYXZlJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqICBSRUFEICAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLy8gVE9ET1xuICAgIGFsbChhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjYWxsJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImZpbmRcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIGZldGNoaW5nIHRoZSBpbmZvIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfmZpbmRcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmZpbmRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIEFyZ3VtZW50cyBmcm9tIHRoZSBldmVudFxuICAgICAqIFxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5maWVsZHMgLSBUaGUgZmllbGRzIHNob3dlZCBpbiB0aGUgcXVlcnlcbiAgICAgKi9cbiAgICBmaW5kIChhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjZmluZCcpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy8gaGFuZGxlIGFzeW5jXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBmaWxlID0gX3JlYWRGaWxlKHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoYXJncy5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGFyZ3MuY29sbGVjdGlvbi5uYW1lKSwgY2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRvY3MgPSBbXTtcbiAgICAgICAgbGV0IGluZGV4ZXMgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIGxldCBsaW5lcyA9IGZpbGUudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZJWE1FIFdvcmthcm91bmQuLi5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZG9jLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBkb2NzLnB1c2goSlNPTi5wYXJzZShkb2MpKTtcbiAgICAgICAgICAgICAgICBpbmRleGVzW0pTT04ucGFyc2UoZG9jKS5faWRdID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqL1xuICAgICAgICAvLyB2YXIgX2RvY3MgPSBfLmNsb25lRGVlcChhcmdzLmNvbGxlY3Rpb24uZG9jcyk7XG4gICAgICAgIC8vIHZhciBfaWR4cyA9IF8uY2xvbmVEZWVwKGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBmb3IgKGNvbGxEb2NzKSB7XG4gICAgICAgIC8vICAgICBsZXQgZG9jO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICBpZiAoIV8uaGFzSW4oX2lkeCwgZG9jLl9pZCkpIHtcbiAgICAgICAgLy8gICAgICAgICBhZGQoZG9jKTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgdXBkYXRlKGRvYyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqL1xuICAgICAgICBcbiAgICAgICAgLy8gdmFyIGRvY3MgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbERvY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gICAgIHZhciBkb2MgPSBjb2xsRG9jc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgZG9jcy5wdXNoKGRvYyk7XG4gICAgICAgIC8vICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jX2luZGV4ZXNbZG9jLl9pZF0gPSBpO1xuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICAvLyBpZiAoZG9jcy5sZW5ndGggIT09IClcbiAgICAgICAgXG4gICAgICAgIC8vIGZvciAobGV0IGtleSBpbiBhcmdzLmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jcyA9IGRvY3M7XG4gICAgICAgIGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcyA9IGluZGV4ZXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJmaW5kT25lXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBmZXRjaGluZyB0aGUgaW5mbyBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5maW5kT25lXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5maW5kT25lXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MuZmllbGRzIC0gVGhlIGZpZWxkcyBzaG93ZWQgaW4gdGhlIHF1ZXJ5XG4gICAgICovXG4gICAgZmluZE9uZSAoYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZygnI2ZpbmRPbmUnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgICAgIFxuICAgICAgICAvLyBGSVhNRSBXaGVuIHdlIGNhbiBkbyBhIGxpbmUtcGVyLWxpbmUgZmlsZSBzZWFyY2gsIGNoYW5nZSB0aGlzXG4gICAgICAgIHRoaXMuZmluZChhcmdzKTtcbiAgICB9XG4gICAgLyoqKioqKioqKipcbiAgICAgKiBVUERBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGFuIFwidXBkYXRlXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBzeW5jcm9uaXppbmcgdGhlIGNvbGxlY3Rpb24gZmlsZSB3aXRoIHRoZSBuZXcgaW5mb1xuICAgICAqXG4gICAgICogQG1ldGhvZCBGaWxlU3lzdGVtU3RvcmV+dXBkYXRlXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX51cGRhdGVcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIEFyZ3VtZW50cyBmcm9tIHRoZSBldmVudFxuICAgICAqIFxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5tb2RpZmllciAtIFRoZSBtb2RpZmllciB1c2VkIGluIHRoZSBxdWVyeVxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLmRvY3MgLSBUaGUgdXBkYXRlZC9pbnNlcnRlZCBkb2N1bWVudHMgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGUgKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZygnI3VwZGF0ZScpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICAgICAgXG4gICAgICAgIF9wZXJzaXN0LmNhbGwodGhpcywgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChhcmdzLmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgYXJncy5jb2xsZWN0aW9uLm5hbWUpLCBhcmdzLmNvbGxlY3Rpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIERFTEVURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYW4gXCJyZW1vdmVcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIHN5bmNyb25pemluZyB0aGUgY29sbGVjdGlvbiBmaWxlIHdpdGggdGhlIG5ldyBpbmZvXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5yZW1vdmVcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfnJlbW92ZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3Muc2VsZWN0b3IgLSBUaGUgc2VsZWN0aW9uIG9mIHRoZSBxdWVyeVxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBhcmdzLmRvY3MgLSBUaGUgZGVsZXRlZCBkb2N1bWVudHMgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICByZW1vdmUoYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZygnI3JlbW92ZScpO1xuICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGFyZ3MuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBhcmdzLmNvbGxlY3Rpb24ubmFtZSksIGFyZ3MuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogT1RIRVJTICpcbiAgICAgKioqKioqKioqKi9cbiAgICAvLyBUT0RPXG4gICAgZW5zdXJlSW5kZXggKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZygnI2Vuc3VyZUluZGV4Jyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgYmFja3VwIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNiYWNrdXAnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXBzIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNiYWNrdXBzJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgcmVtb3ZlQmFja3VwIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNyZW1vdmVCYWNrdXAnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICByZXN0b3JlIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNyZXN0b3JlJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzU3RvcmU7Il19
