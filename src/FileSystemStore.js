// https://blogs.msdn.microsoft.com/typescript/2013/06/18/announcing-typescript-0-9/
// https://www.npmjs.com/package/tsify
// https://www.npmjs.com/package/gulp-typedoc/
// https://github.com/TypeStrong/typedoc
// http://typedoc.org/guides/usage/
"use strict";
/**
 * @file FileSystemStore.js - File System Store for persistence with MongoPortable ({@link https://github.com/EastolfiWebDev/MongoPortable}),
 *  a portable MongoDB-like module.
 * @version 1.0.0
 *
 * @author Eduardo Astolfi <eastolfi91@gmail.com>
 * @copyright 2016 Eduardo Astolfi <eastolfi91@gmail.com>
 * @license MIT Licensed
 */
var _ = require("lodash");
var fs = require("file-system");
var Promise = require("promise");
var jsw_logger_1 = require("jsw-logger");
var Options = (function () {
    function Options(options) {
        if (options) {
            if (options.ddbb_path)
                this.ddbb_path = options.ddbb_path;
            if (options.collection_extension)
                this.collection_extension = options.collection_extension;
            if (_.isBoolean(options.sync))
                this.sync = options.sync;
            if (options.log)
                this.ddbb_path = options.log;
        }
    }
    return Options;
}());
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
var FileSystemStore = (function () {
    function FileSystemStore(options) {
        if (options === void 0) { options = new Options(); }
        this.defaultOptions = new Options({
            ddbb_path: 'db',
            collection_extension: 'json',
            sync: false
        });
        this.options = new Options();
        this.options = _.assign(this.defaultOptions, options);
        // Create a new Logger instance with the logging options, if received 
        if (this.options.log) {
            this.logger = jsw_logger_1.JSWLogger.getInstance(this.options.log);
        }
        else {
            this.logger = jsw_logger_1.JSWLogger.instance;
        }
        this.logger.debug("Database will be in \"" + this.options.ddbb_path + "\" folder");
        // Ensure the existence of the main database directory (force sync)
        var created = this.ensureDirectorySync(); // when recursive -> this.options.ddbb_path
        this.logger.debug("Directory \"" + created + "\" created");
    }
    /***************
     *   PRIVATE   *
     ***************/
    FileSystemStore.prototype.handleError = function (error) {
        this.logger.throw(error);
    };
    // TODO: Recursive
    FileSystemStore.prototype.ensureDirectorySync = function (path, root) {
        if (path === void 0) { path = ""; }
        if (root === void 0) { root = this.options.ddbb_path; }
        var dirPath = root + "/" + path;
        try {
            fs.mkdirSync(dirPath);
            return dirPath;
        }
        catch (error) {
            return this.handleError(error);
        }
    };
    FileSystemStore.prototype.ensureDirectory = function (path, root) {
        var _this = this;
        if (root === void 0) { root = this.options.ddbb_path; }
        var dirPath = root + "/" + path;
        return new Promise(function (resolve, reject) {
            if (_this.options.sync) {
                return _this.ensureDirectorySync(path, root);
            }
            else {
                fs.mkdir(dirPath, function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(dirPath);
                    }
                });
            }
        });
    };
    FileSystemStore.prototype.existsFile = function (filename) {
        var exists = false;
        if (this.options.sync) {
            try {
                var file = fs.readFileSync(filename);
                if (!_.isNil(file)) {
                    var stats = fs.statSync(filename);
                    exists = stats.isFile();
                }
            }
            catch (error) {
                this.logger.debug("File \"" + filename + "\" doesn't exist");
            }
            finally {
                return exists;
            }
        }
        else {
            return new Promise(function (resolve, reject) {
                fs.readFile(filename, function (error, file) {
                    if (error || _.isNil(file)) {
                        reject(error || new Error("File \"" + filename + "\" doesn't exist"));
                    }
                    else {
                        fs.stat(filename, function (error, stats) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(stats.isFile());
                            }
                        });
                    }
                });
            });
        }
    };
    FileSystemStore.prototype.createFile = function (path) {
        return this.writeFile(path);
    };
    FileSystemStore.prototype.writeFile = function (path, content) {
        if (content === void 0) { content = ""; }
        if (this.options.sync) {
            try {
                fs.writeFileSync(path, content);
                return true;
            }
            catch (error) {
                this.handleError(error);
                return false;
            }
        }
        else {
            return new Promise(function (resolve, reject) {
                fs.writeFile(path, content, function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        }
    };
    FileSystemStore.prototype.persist = function (collectionPath, documents) {
        var _this = this;
        var docs = "";
        for (var i = 0; i < documents.length; i++) {
            docs += JSON.stringify(documents[i]) + "\n";
        }
        if (this.options.sync) {
            var persisted = this.writeFile(collectionPath, docs);
            if (persisted) {
                this.logger.debug("Documents persisted in the file system");
            }
            else {
                this.logger.debug("Documents not persisted in the file system");
            }
            return persisted;
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.writeFile(collectionPath, docs)
                    .then(function (persisted) {
                    _this.logger.debug("Documents persisted in the file system");
                    resolve(true);
                })
                    .catch(function (error) {
                    _this.logger.debug("Documents not persisted in the file system");
                    reject(error);
                });
            });
        }
    };
    FileSystemStore.prototype.readFile = function (path) {
        var _this = this;
        if (this.options.sync) {
            try {
                return fs.readFileSync(path);
            }
            catch (error) {
                return this.handleError(error);
            }
        }
        else {
            return new Promise(function (resolve, reject) {
                fs.readFile(path, function (error, file) {
                    if (error || _.isNil(file)) {
                        reject(error || new Error("File \"" + path + "\" doesn't exist"));
                    }
                    else {
                        _this.logger.debug("Collection \"" + path + "\" readed from the file system");
                        resolve(file);
                    }
                });
            });
        }
    };
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
    FileSystemStore.prototype.getCollectionPath = function (ddbb_name, coll_name) {
        if (_.isNil(ddbb_name))
            throw new Error("Parameter 'ddbb_name' is required");
        if (_.isNil(coll_name))
            throw new Error("Parameter 'coll_name' is required");
        return this.options.ddbb_path + "/" + ddbb_name + "/" + coll_name + "." + this.options.collection_extension;
    };
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
     * @param {Object} event - Information of the event
     *
     * @param {Object} event.connection - Information about the current database connection
     * @param {Object} event.collection - Information about the collection created
     *
     * @return {boolean|Promise<boolean>} - True if the collection was created
     */
    FileSystemStore.prototype.createCollection = function (event) {
        var _this = this;
        this.logger.debug('#createCollection');
        var coll_path = this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name);
        if (this.options.sync) {
            if (!this.existsFile(coll_path)) {
                return this.createFile(coll_path);
            }
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.existsFile(coll_path)
                    .then(function (exists) {
                    resolve(exists);
                })
                    .catch(function (error) {
                    reject(error);
                });
            });
        }
    };
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
     * @param {Object} event - Arguments from the event
     *
     * @param {Object} event.collection - Information about the collection
     * @param {Object} event.doc - Information about the document inserted
     *
     * @return {boolean|Promise<boolean>} - True if the collection was inserted
     */
    FileSystemStore.prototype.insert = function (event) {
        this.logger.debug('#insert');
        return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
    };
    // TODO
    FileSystemStore.prototype.save = function (event) {
        this.logger.debug('#save');
    };
    /**********
     *  READ  *
     **********/
    // TODO
    FileSystemStore.prototype.all = function (event) {
        this.logger.debug('#all');
    };
    /**
     * Receives a "find" event from MongoPortable, fetching the info of the collection file
     *
     * @method FileSystemStore~find
     *
     * @listens MongoPortable~find
     *
     * @param {Object} event - Arguments from the event
     *
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.fields - The fields showed in the query
     *
     * @return {Object|Promise<Object>} - An object with the document and indexes
     */
    FileSystemStore.prototype.find = function (event) {
        var _this = this;
        this.logger.debug('#find');
        var parseLines = function (file, cb) {
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
            event.collection.docs = docs;
            event.collection.doc_indexes = indexes;
            if (cb) {
                cb(docs, indexes);
            }
            else {
                return { documents: docs, indexes: indexes };
            }
        };
        if (this.options.sync) {
            var file = this.readFile(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name));
            parseLines(file);
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.readFile(_this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name))
                    .then(function (file) {
                    parseLines(file, function (documents, indexes) {
                        resolve({ documents: documents, indexes: indexes });
                    });
                })
                    .catch(function (error) {
                    reject(error);
                });
            });
        }
        /**/
        // var _docs = _.cloneDeep(event.collection.docs);
        // var _idxs = _.cloneDeep(event.collection.doc_indexes);
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
        //     event.collection.doc_indexes[doc._id] = i;
        // }
        // if (docs.length !== )
        // for (let key in event.collection.doc_indexes) {
        // }
    };
    /**
     * Receives a "findOne" event from MongoPortable, fetching the info of the collection file
     *
     * @method FileSystemStore~findOne
     *
     * @listens MongoPortable~findOne
     *
     * @param {Object} event - Arguments from the event
     *
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.fields - The fields showed in the query
     *
     * @return {Object|Promise<Object>} - An object with the document and indexes
     */
    FileSystemStore.prototype.findOne = function (event) {
        this.logger.debug('#findOne');
        // FIXME When we can do a line-per-line file search, change this
        return this.find(event);
    };
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
     * @param {Object} event - Arguments from the event
     *
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.modifier - The modifier used in the query
     * @property {Object} event.docs - The updated/inserted documents information
     *
     * @return {boolean|Promise<boolean>} - True if the documents were updated
     */
    FileSystemStore.prototype.update = function (event) {
        this.logger.debug('#update');
        return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
    };
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
     * @param {Object} event - Arguments from the event
     *
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.docs - The deleted documents information
     *
     * @return {boolean|Promise<boolean>} - True if the documents were removed
     */
    FileSystemStore.prototype.remove = function (event) {
        this.logger.debug('#remove');
        return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
    };
    /**********
     * OTHERS *
     **********/
    // TODO
    FileSystemStore.prototype.ensureIndex = function (event) {
        this.logger.debug('#ensureIndex');
    };
    // TODO
    FileSystemStore.prototype.backup = function (event) {
        this.logger.debug('#backup');
    };
    // TODO
    FileSystemStore.prototype.backups = function (event) {
        this.logger.debug('#backups');
    };
    // TODO
    FileSystemStore.prototype.removeBackup = function (event) {
        this.logger.debug('#removeBackup');
    };
    // TODO
    FileSystemStore.prototype.restore = function (event) {
        this.logger.debug('#restore');
    };
    return FileSystemStore;
}());
exports.FileSystemStore = FileSystemStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTeXN0ZW1TdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvRkFBb0Y7QUFDcEYsc0NBQXNDO0FBQ3RDLDhDQUE4QztBQUM5Qyx3Q0FBd0M7QUFDeEMsbUNBQW1DOztBQUVuQzs7Ozs7Ozs7R0FRRztBQUVILDBCQUE4QztBQUM5QyxnQ0FBbUQ7QUFDbkQsaUNBQStDO0FBQy9DLHlDQUFrRDtBQUVsRDtJQU1JLGlCQUFZLE9BQVE7UUFDaEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNWLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQzFELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQztnQkFBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDO1lBQzNGLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUN4RCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxDQUFDO0lBQ0wsQ0FBQztJQUNMLGNBQUM7QUFBRCxDQWRBLEFBY0MsSUFBQTtBQUVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFVSSx5QkFBWSxPQUFnQztRQUFoQyx3QkFBQSxFQUFBLGNBQXVCLE9BQU8sRUFBRTtRQVJwQyxtQkFBYyxHQUFZLElBQUksT0FBTyxDQUFDO1lBQzFDLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysb0JBQW9CLEVBQUUsTUFBTTtZQUM1QixJQUFJLEVBQUUsS0FBSztTQUNkLENBQUMsQ0FBQztRQUVILFlBQU8sR0FBWSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBRzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRELHNFQUFzRTtRQUN0RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxzQkFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsc0JBQU0sQ0FBQyxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUF3QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsY0FBVSxDQUFDLENBQUM7UUFFNUUsbUVBQW1FO1FBQ25FLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUcsMkNBQTJDO1FBQ3ZGLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFjLE9BQU8sZUFBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOztxQkFFaUI7SUFFVCxxQ0FBVyxHQUFuQixVQUFvQixLQUFZO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxrQkFBa0I7SUFDViw2Q0FBbUIsR0FBM0IsVUFBNEIsSUFBaUIsRUFBRSxJQUFxQztRQUF4RCxxQkFBQSxFQUFBLFNBQWlCO1FBQUUscUJBQUEsRUFBQSxPQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUztRQUNoRixJQUFJLE9BQU8sR0FBTSxJQUFJLFNBQUksSUFBTSxDQUFDO1FBRWhDLElBQUksQ0FBQztZQUNELEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNuQixDQUFFO1FBQUEsS0FBSyxDQUFBLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBRU8seUNBQWUsR0FBdkIsVUFBd0IsSUFBWSxFQUFFLElBQXFDO1FBQTNFLGlCQWdCQztRQWhCcUMscUJBQUEsRUFBQSxPQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUztRQUN2RSxJQUFJLE9BQU8sR0FBTSxJQUFJLFNBQUksSUFBTSxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSztvQkFDcEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xCLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9DQUFVLEdBQWxCLFVBQW1CLFFBQWdCO1FBQy9CLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztRQUVuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDO2dCQUNELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRWxDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLENBQUM7WUFDTCxDQUFFO1lBQUEsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFTLFFBQVEscUJBQWlCLENBQUMsQ0FBQztZQUMxRCxDQUFDO29CQUFTLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNsQixDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQy9CLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQUMsS0FBSyxFQUFFLElBQUk7b0JBQzlCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDekIsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxZQUFTLFFBQVEscUJBQWlCLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQUMsS0FBSyxFQUFFLEtBQUs7NEJBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0NBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNsQixDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs0QkFDNUIsQ0FBQzt3QkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVPLG9DQUFVLEdBQWxCLFVBQW1CLElBQVk7UUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLG1DQUFTLEdBQWpCLFVBQWtCLElBQVksRUFBRSxPQUFvQjtRQUFwQix3QkFBQSxFQUFBLFlBQW9CO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRWhDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBRTtZQUFBLEtBQUssQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFeEIsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQy9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFBLEtBQUs7b0JBQzdCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNsQixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFTyxpQ0FBTyxHQUFmLFVBQWdCLGNBQXNCLEVBQUUsU0FBbUI7UUFBM0QsaUJBZ0NDO1FBL0JHLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNoRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXJELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUNoRSxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtnQkFDL0IsS0FBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDO3FCQUMvQixJQUFJLENBQUMsVUFBQSxTQUFTO29CQUNYLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7b0JBRTVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDO3FCQUNELEtBQUssQ0FBQyxVQUFBLEtBQUs7b0JBQ1IsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztvQkFFaEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFTyxrQ0FBUSxHQUFoQixVQUFpQixJQUFZO1FBQTdCLGlCQW9CQztRQW5CRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDO2dCQUNELE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUU7WUFBQSxLQUFLLENBQUEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtnQkFDL0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBQyxLQUFLLEVBQUUsSUFBSTtvQkFDMUIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLFlBQVMsSUFBSSxxQkFBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWUsSUFBSSxtQ0FBK0IsQ0FBQyxDQUFDO3dCQUV0RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xCLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBRUQ7O3FCQUVpQjtJQUVqQjs7Ozs7Ozs7O09BU0c7SUFDSCwyQ0FBaUIsR0FBakIsVUFBa0IsU0FBaUIsRUFBRSxTQUFpQjtRQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzdFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFFN0UsTUFBTSxDQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxTQUFJLFNBQVMsU0FBSSxTQUFTLFNBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBc0IsQ0FBQztJQUN0RyxDQUFDO0lBRUQ7O3FCQUVpQjtJQUVqQjs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsMENBQWdCLEdBQWhCLFVBQWlCLEtBQUs7UUFBdEIsaUJBb0JDO1FBbkJHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFdkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0wsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQy9CLEtBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO3FCQUNyQixJQUFJLENBQUMsVUFBQSxNQUFNO29CQUNSLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDO3FCQUNELEtBQUssQ0FBQyxVQUFBLEtBQUs7b0JBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRDs7Z0JBRVk7SUFFWjs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsZ0NBQU0sR0FBTixVQUFPLEtBQUs7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDZixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQ3RGLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUN4QixDQUFDO0lBQ04sQ0FBQztJQUVELE9BQU87SUFDUCw4QkFBSSxHQUFKLFVBQUssS0FBSztRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Z0JBRVk7SUFFWixPQUFPO0lBQ1AsNkJBQUcsR0FBSCxVQUFJLEtBQUs7UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFDSCw4QkFBSSxHQUFKLFVBQUssS0FBSztRQUFWLGlCQWdGQztRQS9FRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUzQixJQUFJLFVBQVUsR0FBRyxVQUFDLElBQUksRUFBRSxFQUFhO1lBQ2pDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUVqQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhDLHNCQUFzQjtZQUN0QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVuQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckMsQ0FBQztZQUNMLENBQUM7WUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDN0IsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1lBRXZDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLFNBQUEsRUFBRSxDQUFDO1lBQ3hDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVqSCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQy9CLEtBQUksQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoRyxJQUFJLENBQUMsVUFBQSxJQUFJO29CQUNOLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBQyxTQUFTLEVBQUUsT0FBTzt3QkFDaEMsT0FBTyxDQUFDLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsQ0FBQyxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7cUJBQ0QsS0FBSyxDQUFDLFVBQUEsS0FBSztvQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBSUQsSUFBSTtRQUNKLGtEQUFrRDtRQUNsRCx5REFBeUQ7UUFFekQsbUJBQW1CO1FBQ25CLGVBQWU7UUFFZixxQ0FBcUM7UUFDckMsb0JBQW9CO1FBQ3BCLGVBQWU7UUFDZix1QkFBdUI7UUFDdkIsUUFBUTtRQUNSLElBQUk7UUFDSixJQUFJO1FBRUosaUJBQWlCO1FBRWpCLDhDQUE4QztRQUM5Qyw2QkFBNkI7UUFFN0Isc0JBQXNCO1FBQ3RCLGlEQUFpRDtRQUNqRCxJQUFJO1FBRUosd0JBQXdCO1FBRXhCLGtEQUFrRDtRQUVsRCxJQUFJO0lBR1IsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsaUNBQU8sR0FBUCxVQUFTLEtBQUs7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5QixnRUFBZ0U7UUFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOztnQkFFWTtJQUVaOzs7Ozs7Ozs7Ozs7Ozs7T0FlRztJQUNILGdDQUFNLEdBQU4sVUFBTyxLQUFLO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQ2YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUN0RixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFRDs7Z0JBRVk7SUFFWjs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILGdDQUFNLEdBQU4sVUFBTyxLQUFLO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQ2YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUN0RixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFRDs7Z0JBRVk7SUFDWixPQUFPO0lBQ1AscUNBQVcsR0FBWCxVQUFZLEtBQUs7UUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsT0FBTztJQUNQLGdDQUFNLEdBQU4sVUFBTyxLQUFLO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELE9BQU87SUFDUCxpQ0FBTyxHQUFQLFVBQVEsS0FBSztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxPQUFPO0lBQ1Asc0NBQVksR0FBWixVQUFhLEtBQUs7UUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsT0FBTztJQUNQLGlDQUFPLEdBQVAsVUFBUSxLQUFLO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0EzZUEsQUEyZUMsSUFBQTtBQUVRLDBDQUFlIiwiZmlsZSI6IkZpbGVTeXN0ZW1TdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vYmxvZ3MubXNkbi5taWNyb3NvZnQuY29tL3R5cGVzY3JpcHQvMjAxMy8wNi8xOC9hbm5vdW5jaW5nLXR5cGVzY3JpcHQtMC05L1xuLy8gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvdHNpZnlcbi8vIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtdHlwZWRvYy9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9UeXBlU3Ryb25nL3R5cGVkb2Ncbi8vIGh0dHA6Ly90eXBlZG9jLm9yZy9ndWlkZXMvdXNhZ2UvXG5cbi8qKlxuICogQGZpbGUgRmlsZVN5c3RlbVN0b3JlLmpzIC0gRmlsZSBTeXN0ZW0gU3RvcmUgZm9yIHBlcnNpc3RlbmNlIHdpdGggTW9uZ29Qb3J0YWJsZSAoe0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9FYXN0b2xmaVdlYkRldi9Nb25nb1BvcnRhYmxlfSksIFxuICogIGEgcG9ydGFibGUgTW9uZ29EQi1saWtlIG1vZHVsZS5cbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKiBcbiAqIEBhdXRob3IgRWR1YXJkbyBBc3RvbGZpIDxlYXN0b2xmaTkxQGdtYWlsLmNvbT5cbiAqIEBjb3B5cmlnaHQgMjAxNiBFZHVhcmRvIEFzdG9sZmkgPGVhc3RvbGZpOTFAZ21haWwuY29tPlxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2VkXG4gKi9cblxuaW1wb3J0ICogYXMgXyAgICAgICAgICAgICAgICAgICBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBmcyAgICAgICAgICAgICAgICAgIGZyb20gXCJmaWxlLXN5c3RlbVwiO1xuaW1wb3J0ICogYXMgUHJvbWlzZSAgICAgICAgICAgICBmcm9tIFwicHJvbWlzZVwiO1xuaW1wb3J0IHsgSlNXTG9nZ2VyIGFzIExvZ2dlciB9ICBmcm9tIFwianN3LWxvZ2dlclwiO1xuXG5jbGFzcyBPcHRpb25zIHtcbiAgICBkZGJiX3BhdGg6IFN0cmluZztcbiAgICBjb2xsZWN0aW9uX2V4dGVuc2lvbjogU3RyaW5nO1xuICAgIHN5bmM6IGJvb2xlYW47XG4gICAgbG9nOiBPYmplY3Q7XG4gICAgXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRkYmJfcGF0aCkgdGhpcy5kZGJiX3BhdGggPSBvcHRpb25zLmRkYmJfcGF0aDtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbGxlY3Rpb25fZXh0ZW5zaW9uKSB0aGlzLmNvbGxlY3Rpb25fZXh0ZW5zaW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uX2V4dGVuc2lvbjtcbiAgICAgICAgICAgIGlmIChfLmlzQm9vbGVhbihvcHRpb25zLnN5bmMpKSB0aGlzLnN5bmMgPSBvcHRpb25zLnN5bmM7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sb2cpIHRoaXMuZGRiYl9wYXRoID0gb3B0aW9ucy5sb2c7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRmlsZVN5c3RlbVN0b3JlXG4gKiBcbiAqIEBtb2R1bGUgRmlsZVN5c3RlbVN0b3JlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBzaW5jZSAwLjAuMVxuICogXG4gKiBAY2xhc3NkZXNjIFN0b3JlIGZvciBNb25nb1BvcnRhYmxlICh7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0Vhc3RvbGZpV2ViRGV2L01vbmdvUG9ydGFibGV9KVxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gQWRkaXRpb25hbCBvcHRpb25zXG4gKiBcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGRiYl9wYXRoPVwiZGJcIl0gLSBUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSBkYXRhYmFzZSB3aWxsIGJlIGxvY2F0ZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc3luYz10cnVlXSAtIFNldCBpdCBmYWxzZSB0byBtYWtlIGFsbCB0aGUgZmlsZSBhY2Nlc3MgYXN5bmNocm9ub3VzLiAoQ3VycmVudGx5IG9ubHkgc3luYz10cnVlIGlzIHN1cHBvcnRlZClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY29sbGVjdGlvbl9leHRlbnNpb249XCJqc29uXCJdIC0gVGhlIGV4dGVuc2lvbiBvZiB0aGUgY29sbGVjdGlvbiBmaWxlcy4gKEN1cnJlbnRseSBvbmx5IFwianNvblwiIGlzIHN1cHBvcnRlZClcbiAqL1xuY2xhc3MgRmlsZVN5c3RlbVN0b3JlIHtcbiAgICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuICAgIHByaXZhdGUgZGVmYXVsdE9wdGlvbnM6IE9wdGlvbnMgPSBuZXcgT3B0aW9ucyh7XG4gICAgICAgIGRkYmJfcGF0aDogJ2RiJyxcbiAgICAgICAgY29sbGVjdGlvbl9leHRlbnNpb246ICdqc29uJyxcbiAgICAgICAgc3luYzogZmFsc2VcbiAgICB9KTtcbiAgICBcbiAgICBvcHRpb25zOiBPcHRpb25zID0gbmV3IE9wdGlvbnMoKTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBPcHRpb25zID0gbmV3IE9wdGlvbnMoKSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBMb2dnZXIgaW5zdGFuY2Ugd2l0aCB0aGUgbG9nZ2luZyBvcHRpb25zLCBpZiByZWNlaXZlZCBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2cpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyID0gTG9nZ2VyLmdldEluc3RhbmNlKHRoaXMub3B0aW9ucy5sb2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIgPSBMb2dnZXIuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKGBEYXRhYmFzZSB3aWxsIGJlIGluIFwiJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofVwiIGZvbGRlcmApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW5zdXJlIHRoZSBleGlzdGVuY2Ugb2YgdGhlIG1haW4gZGF0YWJhc2UgZGlyZWN0b3J5IChmb3JjZSBzeW5jKVxuICAgICAgICBsZXQgY3JlYXRlZCA9IHRoaXMuZW5zdXJlRGlyZWN0b3J5U3luYygpOyAgIC8vIHdoZW4gcmVjdXJzaXZlIC0+IHRoaXMub3B0aW9ucy5kZGJiX3BhdGhcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoYERpcmVjdG9yeSBcIiR7Y3JlYXRlZH1cIiBjcmVhdGVkYCk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiAgIFBSSVZBVEUgICAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICBcbiAgICBwcml2YXRlIGhhbmRsZUVycm9yKGVycm9yOiBFcnJvcikge1xuICAgICAgICB0aGlzLmxvZ2dlci50aHJvdyhlcnJvcik7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IFJlY3Vyc2l2ZVxuICAgIHByaXZhdGUgZW5zdXJlRGlyZWN0b3J5U3luYyhwYXRoOiBTdHJpbmcgPSBcIlwiLCByb290OiBTdHJpbmcgPSB0aGlzLm9wdGlvbnMuZGRiYl9wYXRoKTogU3RyaW5nICYgUHJvbWlzZTxTdHJpbmc+IHtcbiAgICAgICAgbGV0IGRpclBhdGggPSBgJHtyb290fS8ke3BhdGh9YDtcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMoZGlyUGF0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkaXJQYXRoO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBlbnN1cmVEaXJlY3RvcnkocGF0aDogU3RyaW5nLCByb290OiBTdHJpbmcgPSB0aGlzLm9wdGlvbnMuZGRiYl9wYXRoKTogU3RyaW5nICYgUHJvbWlzZTxTdHJpbmc+IHtcbiAgICAgICAgbGV0IGRpclBhdGggPSBgJHtyb290fS8ke3BhdGh9YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbnN1cmVEaXJlY3RvcnlTeW5jKHBhdGgsIHJvb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpcihkaXJQYXRoLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBleGlzdHNGaWxlKGZpbGVuYW1lOiBTdHJpbmcpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHZhciBleGlzdHMgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSk7ICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNOaWwoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZW5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RzID0gc3RhdHMuaXNGaWxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhgRmlsZSBcIiR7ZmlsZW5hbWV9XCIgZG9lc24ndCBleGlzdGApO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhpc3RzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShmaWxlbmFtZSwgKGVycm9yLCBmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciB8fCBfLmlzTmlsKGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IgfHwgbmV3IEVycm9yKGBGaWxlIFwiJHtmaWxlbmFtZX1cIiBkb2Vzbid0IGV4aXN0YCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMuc3RhdChmaWxlbmFtZSwgKGVycm9yLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RhdHMuaXNGaWxlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGNyZWF0ZUZpbGUocGF0aDogU3RyaW5nKTogYm9vbGVhbiAmIFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZUZpbGUocGF0aCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgd3JpdGVGaWxlKHBhdGg6IFN0cmluZywgY29udGVudDogU3RyaW5nID0gXCJcIik6IGJvb2xlYW4gJiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUocGF0aCwgY29udGVudCwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBlcnNpc3QoY29sbGVjdGlvblBhdGg6IFN0cmluZywgZG9jdW1lbnRzOiBPYmplY3RbXSk6IGJvb2xlYW4gJiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgbGV0IGRvY3MgPSBcIlwiO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb2N1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRvY3MgKz0gSlNPTi5zdHJpbmdpZnkoZG9jdW1lbnRzW2ldKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYykge1xuICAgICAgICAgICAgbGV0IHBlcnNpc3RlZCA9IHRoaXMud3JpdGVGaWxlKGNvbGxlY3Rpb25QYXRoLCBkb2NzKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChwZXJzaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBub3QgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBlcnNpc3RlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUZpbGUoY29sbGVjdGlvblBhdGgsIGRvY3MpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHBlcnNpc3RlZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXCJEb2N1bWVudHMgbm90IHBlcnNpc3RlZCBpbiB0aGUgZmlsZSBzeXN0ZW1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZWFkRmlsZShwYXRoOiBTdHJpbmcpOiBPYmplY3QgJiBQcm9taXNlPE9iamVjdD4ge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnJvciwgZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgfHwgXy5pc05pbChmaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yIHx8IG5ldyBFcnJvcihgRmlsZSBcIiR7cGF0aH1cIiBkb2Vzbid0IGV4aXN0YCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoYENvbGxlY3Rpb24gXCIke3BhdGh9XCIgcmVhZGVkIGZyb20gdGhlIGZpbGUgc3lzdGVtYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiAgICBVVElMUyAgICAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICAgXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwYXRoIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlI2dldENvbGxlY3Rpb25QYXRoXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRkYmJfbmFtZSAtIE5hbWUgb2YgdGhlIGRhdGFiYXNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxfbmFtZSAtIE5hbWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gLSBUaGUgcGF0aCBvZiB0aGUgZmlsZVxuICAgICAqL1xuICAgIGdldENvbGxlY3Rpb25QYXRoKGRkYmJfbmFtZTogU3RyaW5nLCBjb2xsX25hbWU6IFN0cmluZyk6IFN0cmluZyB7XG4gICAgICAgIGlmIChfLmlzTmlsKGRkYmJfbmFtZSkpIHRocm93IG5ldyBFcnJvcihcIlBhcmFtZXRlciAnZGRiYl9uYW1lJyBpcyByZXF1aXJlZFwiKTtcbiAgICAgICAgaWYgKF8uaXNOaWwoY29sbF9uYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyICdjb2xsX25hbWUnIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGAke3RoaXMub3B0aW9ucy5kZGJiX3BhdGh9LyR7ZGRiYl9uYW1lfS8ke2NvbGxfbmFtZX0uJHt0aGlzLm9wdGlvbnMuY29sbGVjdGlvbl9leHRlbnNpb259YDtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKioqKioqKlxuICAgICAqIENPTExFQ1RJT05TICpcbiAgICAgKioqKioqKioqKioqKioqL1xuICAgICBcbiAgICAvKipcbiAgICAgKiBSZWNlaXZlcyBhIFwiY3JlYXRlQ29sbGVjdGlvblwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfmNyZWF0ZUNvbGxlY3Rpb25cbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmNyZWF0ZUNvbGxlY3Rpb25cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBJbmZvcm1hdGlvbiBvZiB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuY29ubmVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IGRhdGFiYXNlIGNvbm5lY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uIGNyZWF0ZWRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufFByb21pc2U8Ym9vbGVhbj59IC0gVHJ1ZSBpZiB0aGUgY29sbGVjdGlvbiB3YXMgY3JlYXRlZFxuICAgICAqL1xuICAgIGNyZWF0ZUNvbGxlY3Rpb24oZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjY3JlYXRlQ29sbGVjdGlvbicpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNvbGxfcGF0aCA9IHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoZXZlbnQuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBldmVudC5jb2xsZWN0aW9uLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZXhpc3RzRmlsZShjb2xsX3BhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRmlsZShjb2xsX3BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXN0c0ZpbGUoY29sbF9wYXRoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihleGlzdHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShleGlzdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIENSRUFURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImluc2VydFwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3Jlfmluc2VydFxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+aW5zZXJ0XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50LmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5kb2MgLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZG9jdW1lbnQgaW5zZXJ0ZWRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufFByb21pc2U8Ym9vbGVhbj59IC0gVHJ1ZSBpZiB0aGUgY29sbGVjdGlvbiB3YXMgaW5zZXJ0ZWRcbiAgICAgKi9cbiAgICBpbnNlcnQoZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjaW5zZXJ0Jyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5wZXJzaXN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSksXG4gICAgICAgICAgICBldmVudC5jb2xsZWN0aW9uLmRvY3NcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHNhdmUoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyNzYXZlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogIFJFQUQgICpcbiAgICAgKioqKioqKioqKi9cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgYWxsKGV2ZW50KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjYWxsJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJmaW5kXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBmZXRjaGluZyB0aGUgaW5mbyBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5maW5kXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5maW5kXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LmZpZWxkcyAtIFRoZSBmaWVsZHMgc2hvd2VkIGluIHRoZSBxdWVyeVxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge09iamVjdHxQcm9taXNlPE9iamVjdD59IC0gQW4gb2JqZWN0IHdpdGggdGhlIGRvY3VtZW50IGFuZCBpbmRleGVzXG4gICAgICovXG4gICAgZmluZChldmVudCk6IE9iamVjdCAmIFByb21pc2U8T2JqZWN0PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZmluZCcpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHBhcnNlTGluZXMgPSAoZmlsZSwgY2I/OiBGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvY3MgPSBbXTtcbiAgICAgICAgICAgIGxldCBpbmRleGVzID0ge307XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBsaW5lcyA9IGZpbGUudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRklYTUUgV29ya2Fyb3VuZC4uLlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBkb2MgPSBsaW5lc1tpXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoZG9jLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoKEpTT04ucGFyc2UoZG9jKSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ZXNbSlNPTi5wYXJzZShkb2MpLl9pZF0gPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXZlbnQuY29sbGVjdGlvbi5kb2NzID0gZG9jcztcbiAgICAgICAgICAgIGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMgPSBpbmRleGVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgICBjYihkb2NzLCBpbmRleGVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9jdW1lbnRzOiBkb2NzLCBpbmRleGVzIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgIGxldCBmaWxlID0gdGhpcy5yZWFkRmlsZSh0aGlzLmdldENvbGxlY3Rpb25QYXRoKGV2ZW50LmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgZXZlbnQuY29sbGVjdGlvbi5uYW1lKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcnNlTGluZXMoZmlsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVhZEZpbGUodGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VMaW5lcyhmaWxlLCAoZG9jdW1lbnRzLCBpbmRleGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGRvY3VtZW50cywgaW5kZXhlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKiovXG4gICAgICAgIC8vIHZhciBfZG9jcyA9IF8uY2xvbmVEZWVwKGV2ZW50LmNvbGxlY3Rpb24uZG9jcyk7XG4gICAgICAgIC8vIHZhciBfaWR4cyA9IF8uY2xvbmVEZWVwKGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gZm9yIChjb2xsRG9jcykge1xuICAgICAgICAvLyAgICAgbGV0IGRvYztcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgaWYgKCFfLmhhc0luKF9pZHgsIGRvYy5faWQpKSB7XG4gICAgICAgIC8vICAgICAgICAgYWRkKGRvYyk7XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIHVwZGF0ZShkb2MpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG4gICAgICAgIC8qKi9cbiAgICAgICAgXG4gICAgICAgIC8vIHZhciBkb2NzID0gW107XG4gICAgICAgIFxuICAgICAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGxEb2NzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vICAgICB2YXIgZG9jID0gY29sbERvY3NbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgLy8gICAgIGRvY3MucHVzaChkb2MpO1xuICAgICAgICAvLyAgICAgZXZlbnQuY29sbGVjdGlvbi5kb2NfaW5kZXhlc1tkb2MuX2lkXSA9IGk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGlmIChkb2NzLmxlbmd0aCAhPT0gKVxuICAgICAgICBcbiAgICAgICAgLy8gZm9yIChsZXQga2V5IGluIGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImZpbmRPbmVcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIGZldGNoaW5nIHRoZSBpbmZvIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfmZpbmRPbmVcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmZpbmRPbmVcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuZmllbGRzIC0gVGhlIGZpZWxkcyBzaG93ZWQgaW4gdGhlIHF1ZXJ5XG4gICAgICogXG4gICAgICogQHJldHVybiB7T2JqZWN0fFByb21pc2U8T2JqZWN0Pn0gLSBBbiBvYmplY3Qgd2l0aCB0aGUgZG9jdW1lbnQgYW5kIGluZGV4ZXNcbiAgICAgKi9cbiAgICBmaW5kT25lIChldmVudCk6IE9iamVjdCAmIFByb21pc2U8T2JqZWN0PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZmluZE9uZScpO1xuICAgICAgICBcbiAgICAgICAgLy8gRklYTUUgV2hlbiB3ZSBjYW4gZG8gYSBsaW5lLXBlci1saW5lIGZpbGUgc2VhcmNoLCBjaGFuZ2UgdGhpc1xuICAgICAgICByZXR1cm4gdGhpcy5maW5kKGV2ZW50KTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBVUERBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGFuIFwidXBkYXRlXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBzeW5jcm9uaXppbmcgdGhlIGNvbGxlY3Rpb24gZmlsZSB3aXRoIHRoZSBuZXcgaW5mb1xuICAgICAqXG4gICAgICogQG1ldGhvZCBGaWxlU3lzdGVtU3RvcmV+dXBkYXRlXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX51cGRhdGVcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQubW9kaWZpZXIgLSBUaGUgbW9kaWZpZXIgdXNlZCBpbiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuZG9jcyAtIFRoZSB1cGRhdGVkL2luc2VydGVkIGRvY3VtZW50cyBpbmZvcm1hdGlvblxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW58UHJvbWlzZTxib29sZWFuPn0gLSBUcnVlIGlmIHRoZSBkb2N1bWVudHMgd2VyZSB1cGRhdGVkXG4gICAgICovXG4gICAgdXBkYXRlKGV2ZW50KTogYm9vbGVhbiAmIFByb21pc2U8Ym9vbGVhbj4gIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyN1cGRhdGUnKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLnBlcnNpc3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGV2ZW50LmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgZXZlbnQuY29sbGVjdGlvbi5uYW1lKSxcbiAgICAgICAgICAgIGV2ZW50LmNvbGxlY3Rpb24uZG9jc1xuICAgICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIERFTEVURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYW4gXCJyZW1vdmVcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIHN5bmNyb25pemluZyB0aGUgY29sbGVjdGlvbiBmaWxlIHdpdGggdGhlIG5ldyBpbmZvXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5yZW1vdmVcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfnJlbW92ZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEFyZ3VtZW50cyBmcm9tIHRoZSBldmVudFxuICAgICAqIFxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuc2VsZWN0b3IgLSBUaGUgc2VsZWN0aW9uIG9mIHRoZSBxdWVyeVxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5kb2NzIC0gVGhlIGRlbGV0ZWQgZG9jdW1lbnRzIGluZm9ybWF0aW9uXG4gICAgICogXG4gICAgICogQHJldHVybiB7Ym9vbGVhbnxQcm9taXNlPGJvb2xlYW4+fSAtIFRydWUgaWYgdGhlIGRvY3VtZW50cyB3ZXJlIHJlbW92ZWRcbiAgICAgKi9cbiAgICByZW1vdmUoZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjcmVtb3ZlJyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5wZXJzaXN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSksXG4gICAgICAgICAgICBldmVudC5jb2xsZWN0aW9uLmRvY3NcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBPVEhFUlMgKlxuICAgICAqKioqKioqKioqL1xuICAgIC8vIFRPRE9cbiAgICBlbnN1cmVJbmRleChldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZW5zdXJlSW5kZXgnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIGJhY2t1cChldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjYmFja3VwJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXBzKGV2ZW50KXtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyNiYWNrdXBzJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICByZW1vdmVCYWNrdXAoZXZlbnQpe1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnI3JlbW92ZUJhY2t1cCcpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgcmVzdG9yZShldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjcmVzdG9yZScpO1xuICAgIH1cbn1cbiAgICBcbmV4cG9ydCB7IEZpbGVTeXN0ZW1TdG9yZSB9OyJdfQ==
