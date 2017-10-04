"use strict";
// https://blogs.msdn.microsoft.com/typescript/2013/06/18/announcing-typescript-0-9/
// https://www.npmjs.com/package/tsify
// https://www.npmjs.com/package/gulp-typedoc/
// https://github.com/TypeStrong/typedoc
// http://typedoc.org/guides/usage/
Object.defineProperty(exports, "__esModule", { value: true });
// http://definitelytyped.org/guides/best-practices.html
// https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines
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
// class Options {
//     ddbb_path: String;
//     collection_extension: String;
//     sync: boolean;
//     log: Object;
//     constructor(options?: any) {
//         if (options) {
//             if (options.ddbb_path) this.ddbb_path = options.ddbb_path;
//             if (options.collection_extension) this.collection_extension = options.collection_extension;
//             if (_.isBoolean(options.sync)) this.sync = options.sync;
//             if (options.log) this.ddbb_path = options.log;
//         }
//     }
// }
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
    // options: Options = new Options();
    function FileSystemStore(options /*Options = new Options()*/) {
        this.defaultOptions = {
            ddbb_path: 'db',
            collection_extension: 'json',
            sync: false
        };
        // private defaultOptions: Options = new Options({
        //     ddbb_path: 'db',
        //     collection_extension: 'json',
        //     sync: false
        // });
        this.options = {};
        // if (!options) options = new Options();
        // this.options = _.assign(this.defaultOptions, options);
        this._initOptions(options);
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
    FileSystemStore.prototype._initOptions = function (options) {
        if (options === void 0) { options = {}; }
        this.options = _.assign(this.defaultOptions, options);
        // if (options) {
        //     if (options.ddbb_path) this.ddbb_path = options.ddbb_path;
        //     if (options.collection_extension) this.collection_extension = options.collection_extension;
        //     if (_.isBoolean(options.sync)) this.sync = options.sync;
        //     if (options.log) this.ddbb_path = options.log;
        // }
    };
    FileSystemStore.prototype.handleError = function (error) {
        this.logger.throw(error);
        return error;
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
        if (root === void 0) { root = this.options.ddbb_path; }
        var dirPath = root + "/" + path;
        return new Promise(function (resolve, reject) {
            fs.mkdir(dirPath, function (error) {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(dirPath);
                }
            });
        });
    };
    FileSystemStore.prototype.existsFileSync = function (filename) {
        var exists = false;
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
    };
    FileSystemStore.prototype.existsFile = function (filename) {
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
    };
    FileSystemStore.prototype.writeFileSync = function (path, content) {
        if (content === void 0) { content = ""; }
        try {
            fs.writeFileSync(path, content);
            return true;
        }
        catch (error) {
            this.handleError(error);
            return false;
        }
    };
    FileSystemStore.prototype.writeFile = function (path, content) {
        if (content === void 0) { content = ""; }
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
    };
    FileSystemStore.prototype.persistSync = function (collectionPath, documents) {
        var docs = "";
        for (var i = 0; i < documents.length; i++) {
            docs += JSON.stringify(documents[i]) + "\n";
        }
        var persisted = this.writeFileSync(collectionPath, docs);
        if (persisted) {
            this.logger.debug("Documents persisted in the file system");
        }
        else {
            this.logger.debug("Documents not persisted in the file system");
        }
        return persisted;
    };
    FileSystemStore.prototype.persist = function (collectionPath, documents) {
        var _this = this;
        var docs = "";
        for (var i = 0; i < documents.length; i++) {
            docs += JSON.stringify(documents[i]) + "\n";
        }
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
    };
    FileSystemStore.prototype.readFileSync = function (path) {
        try {
            return fs.readFileSync(path);
        }
        catch (error) {
            return this.handleError(error);
        }
    };
    FileSystemStore.prototype.readFile = function (path) {
        var _this = this;
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
                return this.writeFileSync(coll_path);
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
        if (this.options.sync) {
            return this.persistSync(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
        else {
            return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
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
            var file = this.readFileSync(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name));
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
        if (this.options.sync) {
            return this.persistSync(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
        else {
            return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
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
        if (this.options.sync) {
            return this.persistSync(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
        else {
            return this.persist(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name), event.collection.docs);
        }
    };
    /**********
     * OTHERS *
     **********/
    // TODO
    FileSystemStore.prototype.ensureIndex = function (event) {
        this.logger.throw('#ensureIndex');
    };
    // TODO
    FileSystemStore.prototype.backup = function (event) {
        this.logger.throw('#backup');
    };
    // TODO
    FileSystemStore.prototype.backups = function (event) {
        this.logger.throw('#backups');
    };
    // TODO
    FileSystemStore.prototype.removeBackup = function (event) {
        this.logger.throw('#removeBackup');
    };
    // TODO
    FileSystemStore.prototype.restore = function (event) {
        this.logger.throw('#restore');
    };
    return FileSystemStore;
}());
exports.FileSystemStore = FileSystemStore;
// export { FileSystemStore }; 
//# sourceMappingURL=FileSystemStore.js.map