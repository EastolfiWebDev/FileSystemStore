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

var _ = require("lodash"),
    fs = require("file-system"),
    Logger = require("jsw-logger");

var logger = null;

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
        logger.debug("File " + filename + " doesn't exist");
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

        logger.info('Document persisted in the file system');
    } else {
        fs.writeFile(collectionPath, function (docs, err) {
            if (err) throw err;

            logger.info('Document persisted in the file system');
        });
    }
};

var _readFile = function _readFile(path) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!_.isNil(callback)) {
        fs.readFile(path, function (err, data) {
            if (err) throw err;

            callback(data);

            logger.info('Collection readed from the file system');
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
    function FileSysStore() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, FileSysStore);

        this.options = _.assign(_defOptions, options);

        if (options.log) {
            logger = Logger.getInstance(options.log);
        } else {
            logger = Logger.instance;
        }

        logger.info("Database will be in " + this.options.ddbb_path);

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
            logger.log('#createCollection');

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
            logger.log('#insert');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        // TODO

    }, {
        key: "save",
        value: function save(args) {
            logger.log('#save');
        }

        /**********
         *  READ  *
         **********/

        // TODO

    }, {
        key: "all",
        value: function all(args) {
            logger.log('#all');
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
            logger.log('#find');

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
            logger.log('#findOne');

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
            logger.log('#update');

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
            logger.log('#remove');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        /**********
         * OTHERS *
         **********/
        // TODO

    }, {
        key: "ensureIndex",
        value: function ensureIndex(args) {
            logger.log('#ensureIndex');
        }

        // TODO

    }, {
        key: "backup",
        value: function backup(args) {
            logger.log('#backup');
        }

        // TODO

    }, {
        key: "backups",
        value: function backups(args) {
            logger.log('#backups');
        }

        // TODO

    }, {
        key: "removeBackup",
        value: function removeBackup(args) {
            logger.log('#removeBackup');
        }

        // TODO

    }, {
        key: "restore",
        value: function restore(args) {
            logger.log('#restore');
        }
    }]);

    return FileSysStore;
}();

module.exports = FileSysStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9GaWxlU3lzdGVtU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQVVBLElBQUksSUFBSSxRQUFRLFFBQVIsQ0FBUjtJQUNJLEtBQUssUUFBUSxhQUFSLENBRFQ7SUFFSSxTQUFTLFFBQVEsWUFBUixDQUZiOztBQUlBLElBQUksU0FBUyxJQUFiOztBQUVBLElBQUksY0FBYztBQUNkLGVBQVcsSUFERztBQUVkLDBCQUFzQixNQUZSO0FBR2QsVUFBTTtBQUhRLENBQWxCOzs7O0FBUUEsSUFBTSxjQUFjLFNBQWQsV0FBYyxDQUFTLFFBQVQsRUFBbUI7QUFDbkMsUUFBSSxTQUFTLEtBQWI7QUFDQSxRQUFJO0FBQ0EsWUFBSSxPQUFPLEdBQUcsWUFBSCxDQUFnQixRQUFoQixDQUFYOztBQUVBLFlBQUksQ0FBQyxFQUFFLEtBQUYsQ0FBUSxJQUFSLENBQUwsRUFBb0I7QUFDaEIsZ0JBQUksUUFBUSxHQUFHLFFBQUgsQ0FBWSxRQUFaLENBQVo7O0FBRUEscUJBQVMsTUFBTSxNQUFOLEVBQVQ7QUFDSDtBQUNKLEtBUkQsQ0FRRSxPQUFPLEtBQVAsRUFBYztBQUNaLGVBQU8sS0FBUCxXQUFxQixRQUFyQjtBQUNILEtBVkQsU0FVVTtBQUNOLGVBQU8sTUFBUDtBQUNIO0FBQ0osQ0FmRDs7QUFpQkEsSUFBTSxXQUFXLFNBQVgsUUFBVyxDQUFTLGNBQVQsRUFBeUIsVUFBekIsRUFBcUM7QUFDbEQsUUFBSSxPQUFPLEVBQVg7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksV0FBVyxJQUFYLENBQWdCLE1BQXBDLEVBQTRDLEdBQTVDLEVBQWlEO0FBQzdDLGdCQUFRLEtBQUssU0FBTCxDQUFlLFdBQVcsSUFBWCxDQUFnQixDQUFoQixDQUFmLElBQXFDLElBQTdDO0FBQ0g7O0FBRUQsUUFBSSxLQUFLLE9BQUwsQ0FBYSxJQUFiLEtBQXNCLElBQTFCLEVBQWdDO0FBQzVCLG1CQUFXLGNBQVgsRUFBMkIsSUFB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SDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFlBQWpCIiwiZmlsZSI6IkZpbGVTeXN0ZW1TdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgRmlsZVN5c3RlbVN0b3JlLmpzIC0gRmlsZSBTeXN0ZW0gU3RvcmUgZm9yIHBlcnNpc3RlbmNlIHdpdGggTW9uZ29Qb3J0YWJsZSAoe0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9FYXN0b2xmaVdlYkRldi9Nb25nb1BvcnRhYmxlfSksIFxuICogIGEgcG9ydGFibGUgTW9uZ29EQi1saWtlIG1vZHVsZS5cbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKiBcbiAqIEBhdXRob3IgRWR1YXJkbyBBc3RvbGZpIDxlYXN0b2xmaTkxQGdtYWlsLmNvbT5cbiAqIEBjb3B5cmlnaHQgMjAxNiBFZHVhcmRvIEFzdG9sZmkgPGVhc3RvbGZpOTFAZ21haWwuY29tPlxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2VkXG4gKi9cbiBcbnZhciBfID0gcmVxdWlyZShcImxvZGFzaFwiKSxcbiAgICBmcyA9IHJlcXVpcmUoXCJmaWxlLXN5c3RlbVwiKSxcbiAgICBMb2dnZXIgPSByZXF1aXJlKFwianN3LWxvZ2dlclwiKTtcbiAgICBcbnZhciBsb2dnZXIgPSBudWxsO1xuXG52YXIgX2RlZk9wdGlvbnMgPSB7XG4gICAgZGRiYl9wYXRoOiAnZGInLFxuICAgIGNvbGxlY3Rpb25fZXh0ZW5zaW9uOiAnanNvbicsXG4gICAgc3luYzogZmFsc2Vcbn07XG5cbi8vIGV4aXN0c0RpciwgZXhpc3RzRmlsZSwgY3JlYXRlRGlyLCByZW1vdmVEaXIsIGNyZWF0ZUZpbGUsIHJlbW92ZUZpbGUsIHdyaXRlVG9GaWxlLCByZWFkRnJvbUZpbGVcblxuY29uc3QgX2V4aXN0c0ZpbGUgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICAgIHZhciBleGlzdHMgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBsZXQgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmICghXy5pc05pbChmaWxlKSkge1xuICAgICAgICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZW5hbWUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleGlzdHMgPSBzdGF0cy5pc0ZpbGUoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgRmlsZSAke2ZpbGVuYW1lfSBkb2Vzbid0IGV4aXN0YCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgcmV0dXJuIGV4aXN0cztcbiAgICB9XG59O1xuXG5jb25zdCBfcGVyc2lzdCA9IGZ1bmN0aW9uKGNvbGxlY3Rpb25QYXRoLCBjb2xsZWN0aW9uKSB7XG4gICAgbGV0IGRvY3MgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sbGVjdGlvbi5kb2NzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRvY3MgKz0gSlNPTi5zdHJpbmdpZnkoY29sbGVjdGlvbi5kb2NzW2ldKSArIFwiXFxuXCI7XG4gICAgfVxuICAgIFxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYyA9PT0gdHJ1ZSkge1xuICAgICAgICBfd3JpdGVGaWxlKGNvbGxlY3Rpb25QYXRoLCBkb2NzKTtcblxuICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnQgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLndyaXRlRmlsZShjb2xsZWN0aW9uUGF0aCwgKGRvY3MsIGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnQgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBfcmVhZEZpbGUgPSBmdW5jdGlvbihwYXRoLCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICBpZiAoIV8uaXNOaWwoY2FsbGJhY2spKSB7XG4gICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdDb2xsZWN0aW9uIHJlYWRlZCBmcm9tIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpO1xuICAgIH1cbn07XG5cbmNvbnN0IF9jcmVhdGVEaXJlY3RvcnkgPSBmdW5jdGlvbihkaXIgPSAnJykge1xuICAgIGZzLm1rZGlyU3luYyhgJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofS8ke2Rpcn1gKTtcbn07XG5cbmNvbnN0IF9jcmVhdGVGaWxlID0gZnVuY3Rpb24ocGF0aCwgcmVjdXJzaXZlKSB7XG4gICAgX3dyaXRlRmlsZShwYXRoKTtcbn07XG5cbmNvbnN0IF93cml0ZUZpbGUgPSBmdW5jdGlvbihwYXRoLCBjb250ZW50ID0gJycpIHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGgsIGNvbnRlbnQpO1xufTtcblxuLyoqXG4gKiBGaWxlU3lzdGVtU3RvcmVcbiAqIFxuICogQG1vZHVsZSBGaWxlU3lzdGVtU3RvcmVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHNpbmNlIDAuMC4xXG4gKiBcbiAqIEBjbGFzc2Rlc2MgU3RvcmUgZm9yIE1vbmdvUG9ydGFibGUgKHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vRWFzdG9sZmlXZWJEZXYvTW9uZ29Qb3J0YWJsZX0pXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBBZGRpdGlvbmFsIG9wdGlvbnNcbiAqIFxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5kZGJiX3BhdGg9XCJkYlwiXSAtIFRoZSBuYW1lIG9mIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIGRhdGFiYXNlIHdpbGwgYmUgbG9jYXRlZFxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5zeW5jPXRydWVdIC0gU2V0IGl0IGZhbHNlIHRvIG1ha2UgYWxsIHRoZSBmaWxlIGFjY2VzcyBhc3luY2hyb25vdXMuIChDdXJyZW50bHkgb25seSBzeW5jPXRydWUgaXMgc3VwcG9ydGVkKVxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jb2xsZWN0aW9uX2V4dGVuc2lvbj1cImpzb25cIl0gLSBUaGUgZXh0ZW5zaW9uIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVzLiAoQ3VycmVudGx5IG9ubHkgXCJqc29uXCIgaXMgc3VwcG9ydGVkKVxuICovXG5jbGFzcyBGaWxlU3lzU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmFzc2lnbihfZGVmT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgIFxuICAgICAgICBpZiAob3B0aW9ucy5sb2cpIHtcbiAgICAgICAgICAgIGxvZ2dlciA9IExvZ2dlci5nZXRJbnN0YW5jZShvcHRpb25zLmxvZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIgPSBMb2dnZXIuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxvZ2dlci5pbmZvKGBEYXRhYmFzZSB3aWxsIGJlIGluICR7dGhpcy5vcHRpb25zLmRkYmJfcGF0aH1gKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgRERCQiBwYXRoXG4gICAgICAgIF9jcmVhdGVEaXJlY3RvcnkuY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKioqKioqKlxuICAgICAqICAgIFVUSUxTICAgICpcbiAgICAgKioqKioqKioqKioqKioqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcGF0aCBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZSNnZXRDb2xsZWN0aW9uUGF0aFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkZGJiX25hbWUgLSBOYW1lIG9mIHRoZSBkYXRhYmFzZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsX25hbWUgLSBOYW1lIG9mIHRoZSBjb2xsZWN0aW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IC0gVGhlIHBhdGggb2YgdGhlIGZpbGVcbiAgICAgKi9cbiAgICBnZXRDb2xsZWN0aW9uUGF0aChkZGJiX25hbWUsIGNvbGxfbmFtZSkge1xuICAgICAgICBpZiAoXy5pc05pbChkZGJiX25hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJhbWV0ZXIgJ2RkYmJfbmFtZScgaXMgcmVxdWlyZWRcIik7XG4gICAgICAgIGlmIChfLmlzTmlsKGNvbGxfbmFtZSkpIHRocm93IG5ldyBFcnJvcihcIlBhcmFtZXRlciAnY29sbF9uYW1lJyBpcyByZXF1aXJlZFwiKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBgJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofS8ke2RkYmJfbmFtZX0vJHtjb2xsX25hbWV9LiR7dGhpcy5vcHRpb25zLmNvbGxlY3Rpb25fZXh0ZW5zaW9ufWA7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiBDT0xMRUNUSU9OUyAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImNyZWF0ZUNvbGxlY3Rpb25cIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIHN5bmNyb25pemluZyB0aGUgY29sbGVjdGlvbiBmaWxlIHdpdGggdGhlIG5ldyBpbmZvXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5jcmVhdGVDb2xsZWN0aW9uXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5jcmVhdGVDb2xsZWN0aW9uXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJncy5jb25uZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgZGF0YWJhc2UgY29ubmVjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzLmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvbiBjcmVhdGVkXG4gICAgICovXG4gICAgIGNyZWF0ZUNvbGxlY3Rpb24oYXJncykge1xuICAgICAgICAgbG9nZ2VyLmxvZygnI2NyZWF0ZUNvbGxlY3Rpb24nKTtcbiAgICAgICAgIFxuICAgICAgICAgdmFyIGNvbGxfcGF0aCA9IHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoYXJncy5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGFyZ3MuY29sbGVjdGlvbi5uYW1lKTtcbiAgICAgICAgIFxuICAgICAgICAgaWYgKCFfZXhpc3RzRmlsZShjb2xsX3BhdGgpKSB7XG4gICAgICAgICAgICAgX2NyZWF0ZUZpbGUoY29sbF9wYXRoLCB0cnVlKTtcbiAgICAgICAgIH1cbiAgICAgfVxuXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBDUkVBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJpbnNlcnRcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIHN5bmNyb25pemluZyB0aGUgY29sbGVjdGlvbiBmaWxlIHdpdGggdGhlIG5ldyBpbmZvXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5pbnNlcnRcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmluc2VydFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MuZG9jIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGRvY3VtZW50IGluc2VydGVkXG4gICAgICovXG4gICAgaW5zZXJ0IChhcmdzKSB7XG4gICAgICAgIGxvZ2dlci5sb2coJyNpbnNlcnQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICBfcGVyc2lzdC5jYWxsKHRoaXMsIHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoYXJncy5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGFyZ3MuY29sbGVjdGlvbi5uYW1lKSwgYXJncy5jb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHNhdmUgKGFyZ3MpIHtcbiAgICAgICAgbG9nZ2VyLmxvZygnI3NhdmUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiAgUkVBRCAgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8vIFRPRE9cbiAgICBhbGwoYXJncykge1xuICAgICAgICBsb2dnZXIubG9nKCcjYWxsJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJmaW5kXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBmZXRjaGluZyB0aGUgaW5mbyBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5maW5kXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5maW5kXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MuZmllbGRzIC0gVGhlIGZpZWxkcyBzaG93ZWQgaW4gdGhlIHF1ZXJ5XG4gICAgICovXG4gICAgZmluZCAoYXJncykge1xuICAgICAgICBsb2dnZXIubG9nKCcjZmluZCcpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy8gaGFuZGxlIGFzeW5jXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBmaWxlID0gX3JlYWRGaWxlKHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoYXJncy5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGFyZ3MuY29sbGVjdGlvbi5uYW1lKSwgY2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRvY3MgPSBbXTtcbiAgICAgICAgbGV0IGluZGV4ZXMgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIGxldCBsaW5lcyA9IGZpbGUudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZJWE1FIFdvcmthcm91bmQuLi5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGRvYyA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZG9jLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBkb2NzLnB1c2goSlNPTi5wYXJzZShkb2MpKTtcbiAgICAgICAgICAgICAgICBpbmRleGVzW0pTT04ucGFyc2UoZG9jKS5faWRdID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqL1xuICAgICAgICAvLyB2YXIgX2RvY3MgPSBfLmNsb25lRGVlcChhcmdzLmNvbGxlY3Rpb24uZG9jcyk7XG4gICAgICAgIC8vIHZhciBfaWR4cyA9IF8uY2xvbmVEZWVwKGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBmb3IgKGNvbGxEb2NzKSB7XG4gICAgICAgIC8vICAgICBsZXQgZG9jO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICBpZiAoIV8uaGFzSW4oX2lkeCwgZG9jLl9pZCkpIHtcbiAgICAgICAgLy8gICAgICAgICBhZGQoZG9jKTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgdXBkYXRlKGRvYyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqL1xuICAgICAgICBcbiAgICAgICAgLy8gdmFyIGRvY3MgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbERvY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gICAgIHZhciBkb2MgPSBjb2xsRG9jc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgZG9jcy5wdXNoKGRvYyk7XG4gICAgICAgIC8vICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jX2luZGV4ZXNbZG9jLl9pZF0gPSBpO1xuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICAvLyBpZiAoZG9jcy5sZW5ndGggIT09IClcbiAgICAgICAgXG4gICAgICAgIC8vIGZvciAobGV0IGtleSBpbiBhcmdzLmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jcyA9IGRvY3M7XG4gICAgICAgIGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcyA9IGluZGV4ZXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJmaW5kT25lXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBmZXRjaGluZyB0aGUgaW5mbyBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5maW5kT25lXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5maW5kT25lXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MuZmllbGRzIC0gVGhlIGZpZWxkcyBzaG93ZWQgaW4gdGhlIHF1ZXJ5XG4gICAgICovXG4gICAgZmluZE9uZSAoYXJncykge1xuICAgICAgICBsb2dnZXIubG9nKCcjZmluZE9uZScpO1xuICAgICAgICBcbiAgICAgICAgLy8gRklYTUUgV2hlbiB3ZSBjYW4gZG8gYSBsaW5lLXBlci1saW5lIGZpbGUgc2VhcmNoLCBjaGFuZ2UgdGhpc1xuICAgICAgICB0aGlzLmZpbmQoYXJncyk7XG4gICAgfVxuICAgIC8qKioqKioqKioqXG4gICAgICogVVBEQVRFICpcbiAgICAgKioqKioqKioqKi9cbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWNlaXZlcyBhbiBcInVwZGF0ZVwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfnVwZGF0ZVxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+dXBkYXRlXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MubW9kaWZpZXIgLSBUaGUgbW9kaWZpZXIgdXNlZCBpbiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5kb2NzIC0gVGhlIHVwZGF0ZWQvaW5zZXJ0ZWQgZG9jdW1lbnRzIGluZm9ybWF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlIChhcmdzKXtcbiAgICAgICAgbG9nZ2VyLmxvZygnI3VwZGF0ZScpO1xuICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGFyZ3MuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBhcmdzLmNvbGxlY3Rpb24ubmFtZSksIGFyZ3MuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogREVMRVRFICpcbiAgICAgKioqKioqKioqKi9cbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWNlaXZlcyBhbiBcInJlbW92ZVwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfnJlbW92ZVxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+cmVtb3ZlXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gYXJncy5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGFyZ3MuZG9jcyAtIFRoZSBkZWxldGVkIGRvY3VtZW50cyBpbmZvcm1hdGlvblxuICAgICAqL1xuICAgIHJlbW92ZShhcmdzKSB7XG4gICAgICAgIGxvZ2dlci5sb2coJyNyZW1vdmUnKTtcbiAgICAgICAgXG4gICAgICAgIF9wZXJzaXN0LmNhbGwodGhpcywgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChhcmdzLmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgYXJncy5jb2xsZWN0aW9uLm5hbWUpLCBhcmdzLmNvbGxlY3Rpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIE9USEVSUyAqXG4gICAgICoqKioqKioqKiovXG4gICAgLy8gVE9ET1xuICAgIGVuc3VyZUluZGV4IChhcmdzKXtcbiAgICAgICAgbG9nZ2VyLmxvZygnI2Vuc3VyZUluZGV4Jyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXAgKGFyZ3Mpe1xuICAgICAgICBsb2dnZXIubG9nKCcjYmFja3VwJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXBzIChhcmdzKXtcbiAgICAgICAgbG9nZ2VyLmxvZygnI2JhY2t1cHMnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHJlbW92ZUJhY2t1cCAoYXJncyl7XG4gICAgICAgIGxvZ2dlci5sb2coJyNyZW1vdmVCYWNrdXAnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHJlc3RvcmUgKGFyZ3Mpe1xuICAgICAgICBsb2dnZXIubG9nKCcjcmVzdG9yZScpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzU3RvcmU7Il19
