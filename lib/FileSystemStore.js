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
var Logger = require("jsw-logger");
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
            this.logger = Logger.getInstance(this.options.log);
        }
        else {
            this.logger = Logger.instance;
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
module.exports = FileSystemStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxJQUFJLENBQ3hCLENBQUM7SUFDTixDQUFDO0lBRUQ7O2dCQUVZO0lBQ1osT0FBTztJQUNQLHFDQUFXLEdBQVgsVUFBWSxLQUFLO1FBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELE9BQU87SUFDUCxnQ0FBTSxHQUFOLFVBQU8sS0FBSztRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxPQUFPO0lBQ1AsaUNBQU8sR0FBUCxVQUFRLEtBQUs7UUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsT0FBTztJQUNQLHNDQUFZLEdBQVosVUFBYSxLQUFLO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELE9BQU87SUFDUCxpQ0FBTyxHQUFQLFVBQVEsS0FBSztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDTCxzQkFBQztBQUFELENBM2VBLEFBMmVDLElBQUE7QUFFRCxpQkFBUyxlQUFlLENBQUMiLCJmaWxlIjoiRmlsZVN5c3RlbVN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cHM6Ly9ibG9ncy5tc2RuLm1pY3Jvc29mdC5jb20vdHlwZXNjcmlwdC8yMDEzLzA2LzE4L2Fubm91bmNpbmctdHlwZXNjcmlwdC0wLTkvXG4vLyBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS90c2lmeVxuLy8gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC10eXBlZG9jL1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL1R5cGVTdHJvbmcvdHlwZWRvY1xuLy8gaHR0cDovL3R5cGVkb2Mub3JnL2d1aWRlcy91c2FnZS9cblxuLyoqXG4gKiBAZmlsZSBGaWxlU3lzdGVtU3RvcmUuanMgLSBGaWxlIFN5c3RlbSBTdG9yZSBmb3IgcGVyc2lzdGVuY2Ugd2l0aCBNb25nb1BvcnRhYmxlICh7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0Vhc3RvbGZpV2ViRGV2L01vbmdvUG9ydGFibGV9KSwgXG4gKiAgYSBwb3J0YWJsZSBNb25nb0RCLWxpa2UgbW9kdWxlLlxuICogQHZlcnNpb24gMS4wLjBcbiAqIFxuICogQGF1dGhvciBFZHVhcmRvIEFzdG9sZmkgPGVhc3RvbGZpOTFAZ21haWwuY29tPlxuICogQGNvcHlyaWdodCAyMDE2IEVkdWFyZG8gQXN0b2xmaSA8ZWFzdG9sZmk5MUBnbWFpbC5jb20+XG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZWRcbiAqL1xuXG5pbXBvcnQgKiBhcyBfICAgICAgICAgICBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBmcyAgICAgICAgICBmcm9tIFwiZmlsZS1zeXN0ZW1cIjtcbmltcG9ydCAqIGFzIFByb21pc2UgICAgIGZyb20gXCJwcm9taXNlXCI7XG5pbXBvcnQgKiBhcyBMb2dnZXIgICAgICBmcm9tIFwianN3LWxvZ2dlclwiO1xuXG5jbGFzcyBPcHRpb25zIHtcbiAgICBkZGJiX3BhdGg6IFN0cmluZztcbiAgICBjb2xsZWN0aW9uX2V4dGVuc2lvbjogU3RyaW5nO1xuICAgIHN5bmM6IGJvb2xlYW47XG4gICAgbG9nOiBPYmplY3Q7XG4gICAgXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRkYmJfcGF0aCkgdGhpcy5kZGJiX3BhdGggPSBvcHRpb25zLmRkYmJfcGF0aDtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbGxlY3Rpb25fZXh0ZW5zaW9uKSB0aGlzLmNvbGxlY3Rpb25fZXh0ZW5zaW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uX2V4dGVuc2lvbjtcbiAgICAgICAgICAgIGlmIChfLmlzQm9vbGVhbihvcHRpb25zLnN5bmMpKSB0aGlzLnN5bmMgPSBvcHRpb25zLnN5bmM7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sb2cpIHRoaXMuZGRiYl9wYXRoID0gb3B0aW9ucy5sb2c7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRmlsZVN5c3RlbVN0b3JlXG4gKiBcbiAqIEBtb2R1bGUgRmlsZVN5c3RlbVN0b3JlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBzaW5jZSAwLjAuMVxuICogXG4gKiBAY2xhc3NkZXNjIFN0b3JlIGZvciBNb25nb1BvcnRhYmxlICh7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0Vhc3RvbGZpV2ViRGV2L01vbmdvUG9ydGFibGV9KVxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gQWRkaXRpb25hbCBvcHRpb25zXG4gKiBcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGRiYl9wYXRoPVwiZGJcIl0gLSBUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSBkYXRhYmFzZSB3aWxsIGJlIGxvY2F0ZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc3luYz10cnVlXSAtIFNldCBpdCBmYWxzZSB0byBtYWtlIGFsbCB0aGUgZmlsZSBhY2Nlc3MgYXN5bmNocm9ub3VzLiAoQ3VycmVudGx5IG9ubHkgc3luYz10cnVlIGlzIHN1cHBvcnRlZClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY29sbGVjdGlvbl9leHRlbnNpb249XCJqc29uXCJdIC0gVGhlIGV4dGVuc2lvbiBvZiB0aGUgY29sbGVjdGlvbiBmaWxlcy4gKEN1cnJlbnRseSBvbmx5IFwianNvblwiIGlzIHN1cHBvcnRlZClcbiAqL1xuY2xhc3MgRmlsZVN5c3RlbVN0b3JlIHtcbiAgICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuICAgIHByaXZhdGUgZGVmYXVsdE9wdGlvbnM6IE9wdGlvbnMgPSBuZXcgT3B0aW9ucyh7XG4gICAgICAgIGRkYmJfcGF0aDogJ2RiJyxcbiAgICAgICAgY29sbGVjdGlvbl9leHRlbnNpb246ICdqc29uJyxcbiAgICAgICAgc3luYzogZmFsc2VcbiAgICB9KTtcbiAgICBcbiAgICBvcHRpb25zOiBPcHRpb25zID0gbmV3IE9wdGlvbnMoKTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBPcHRpb25zID0gbmV3IE9wdGlvbnMoKSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBMb2dnZXIgaW5zdGFuY2Ugd2l0aCB0aGUgbG9nZ2luZyBvcHRpb25zLCBpZiByZWNlaXZlZCBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2cpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyID0gTG9nZ2VyLmdldEluc3RhbmNlKHRoaXMub3B0aW9ucy5sb2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIgPSBMb2dnZXIuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKGBEYXRhYmFzZSB3aWxsIGJlIGluIFwiJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofVwiIGZvbGRlcmApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW5zdXJlIHRoZSBleGlzdGVuY2Ugb2YgdGhlIG1haW4gZGF0YWJhc2UgZGlyZWN0b3J5IChmb3JjZSBzeW5jKVxuICAgICAgICBsZXQgY3JlYXRlZCA9IHRoaXMuZW5zdXJlRGlyZWN0b3J5U3luYygpOyAgIC8vIHdoZW4gcmVjdXJzaXZlIC0+IHRoaXMub3B0aW9ucy5kZGJiX3BhdGhcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoYERpcmVjdG9yeSBcIiR7Y3JlYXRlZH1cIiBjcmVhdGVkYCk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiAgIFBSSVZBVEUgICAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICBcbiAgICBwcml2YXRlIGhhbmRsZUVycm9yKGVycm9yOiBFcnJvcikge1xuICAgICAgICB0aGlzLmxvZ2dlci50aHJvdyhlcnJvcik7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IFJlY3Vyc2l2ZVxuICAgIHByaXZhdGUgZW5zdXJlRGlyZWN0b3J5U3luYyhwYXRoOiBTdHJpbmcgPSBcIlwiLCByb290OiBTdHJpbmcgPSB0aGlzLm9wdGlvbnMuZGRiYl9wYXRoKTogU3RyaW5nICYgUHJvbWlzZTxTdHJpbmc+IHtcbiAgICAgICAgbGV0IGRpclBhdGggPSBgJHtyb290fS8ke3BhdGh9YDtcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMoZGlyUGF0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkaXJQYXRoO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBlbnN1cmVEaXJlY3RvcnkocGF0aDogU3RyaW5nLCByb290OiBTdHJpbmcgPSB0aGlzLm9wdGlvbnMuZGRiYl9wYXRoKTogU3RyaW5nICYgUHJvbWlzZTxTdHJpbmc+IHtcbiAgICAgICAgbGV0IGRpclBhdGggPSBgJHtyb290fS8ke3BhdGh9YDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbnN1cmVEaXJlY3RvcnlTeW5jKHBhdGgsIHJvb3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpcihkaXJQYXRoLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBleGlzdHNGaWxlKGZpbGVuYW1lOiBTdHJpbmcpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHZhciBleGlzdHMgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSk7ICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNOaWwoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZW5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RzID0gc3RhdHMuaXNGaWxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhgRmlsZSBcIiR7ZmlsZW5hbWV9XCIgZG9lc24ndCBleGlzdGApO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhpc3RzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShmaWxlbmFtZSwgKGVycm9yLCBmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciB8fCBfLmlzTmlsKGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IgfHwgbmV3IEVycm9yKGBGaWxlIFwiJHtmaWxlbmFtZX1cIiBkb2Vzbid0IGV4aXN0YCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMuc3RhdChmaWxlbmFtZSwgKGVycm9yLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RhdHMuaXNGaWxlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGNyZWF0ZUZpbGUocGF0aDogU3RyaW5nKTogYm9vbGVhbiAmIFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZUZpbGUocGF0aCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgd3JpdGVGaWxlKHBhdGg6IFN0cmluZywgY29udGVudDogU3RyaW5nID0gXCJcIik6IGJvb2xlYW4gJiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUocGF0aCwgY29udGVudCwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBlcnNpc3QoY29sbGVjdGlvblBhdGg6IFN0cmluZywgZG9jdW1lbnRzOiBPYmplY3RbXSk6IGJvb2xlYW4gJiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgbGV0IGRvY3MgPSBcIlwiO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb2N1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRvY3MgKz0gSlNPTi5zdHJpbmdpZnkoZG9jdW1lbnRzW2ldKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYykge1xuICAgICAgICAgICAgbGV0IHBlcnNpc3RlZCA9IHRoaXMud3JpdGVGaWxlKGNvbGxlY3Rpb25QYXRoLCBkb2NzKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChwZXJzaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBub3QgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBlcnNpc3RlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUZpbGUoY29sbGVjdGlvblBhdGgsIGRvY3MpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHBlcnNpc3RlZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIkRvY3VtZW50cyBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXCJEb2N1bWVudHMgbm90IHBlcnNpc3RlZCBpbiB0aGUgZmlsZSBzeXN0ZW1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZWFkRmlsZShwYXRoOiBTdHJpbmcpOiBPYmplY3QgJiBQcm9taXNlPE9iamVjdD4ge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnJvciwgZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgfHwgXy5pc05pbChmaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yIHx8IG5ldyBFcnJvcihgRmlsZSBcIiR7cGF0aH1cIiBkb2Vzbid0IGV4aXN0YCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoYENvbGxlY3Rpb24gXCIke3BhdGh9XCIgcmVhZGVkIGZyb20gdGhlIGZpbGUgc3lzdGVtYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqKioqKipcbiAgICAgKiAgICBVVElMUyAgICAqXG4gICAgICoqKioqKioqKioqKioqKi9cbiAgICAgXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwYXRoIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlI2dldENvbGxlY3Rpb25QYXRoXG4gICAgICogXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRkYmJfbmFtZSAtIE5hbWUgb2YgdGhlIGRhdGFiYXNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxfbmFtZSAtIE5hbWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gLSBUaGUgcGF0aCBvZiB0aGUgZmlsZVxuICAgICAqL1xuICAgIGdldENvbGxlY3Rpb25QYXRoKGRkYmJfbmFtZTogU3RyaW5nLCBjb2xsX25hbWU6IFN0cmluZyk6IFN0cmluZyB7XG4gICAgICAgIGlmIChfLmlzTmlsKGRkYmJfbmFtZSkpIHRocm93IG5ldyBFcnJvcihcIlBhcmFtZXRlciAnZGRiYl9uYW1lJyBpcyByZXF1aXJlZFwiKTtcbiAgICAgICAgaWYgKF8uaXNOaWwoY29sbF9uYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyICdjb2xsX25hbWUnIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGAke3RoaXMub3B0aW9ucy5kZGJiX3BhdGh9LyR7ZGRiYl9uYW1lfS8ke2NvbGxfbmFtZX0uJHt0aGlzLm9wdGlvbnMuY29sbGVjdGlvbl9leHRlbnNpb259YDtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKioqKioqKlxuICAgICAqIENPTExFQ1RJT05TICpcbiAgICAgKioqKioqKioqKioqKioqL1xuICAgICBcbiAgICAvKipcbiAgICAgKiBSZWNlaXZlcyBhIFwiY3JlYXRlQ29sbGVjdGlvblwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfmNyZWF0ZUNvbGxlY3Rpb25cbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmNyZWF0ZUNvbGxlY3Rpb25cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBJbmZvcm1hdGlvbiBvZiB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuY29ubmVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IGRhdGFiYXNlIGNvbm5lY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uIGNyZWF0ZWRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufFByb21pc2U8Ym9vbGVhbj59IC0gVHJ1ZSBpZiB0aGUgY29sbGVjdGlvbiB3YXMgY3JlYXRlZFxuICAgICAqL1xuICAgIGNyZWF0ZUNvbGxlY3Rpb24oZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjY3JlYXRlQ29sbGVjdGlvbicpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNvbGxfcGF0aCA9IHRoaXMuZ2V0Q29sbGVjdGlvblBhdGgoZXZlbnQuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBldmVudC5jb2xsZWN0aW9uLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZXhpc3RzRmlsZShjb2xsX3BhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRmlsZShjb2xsX3BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXN0c0ZpbGUoY29sbF9wYXRoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihleGlzdHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShleGlzdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIENSRUFURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImluc2VydFwiIGV2ZW50IGZyb20gTW9uZ29Qb3J0YWJsZSwgc3luY3Jvbml6aW5nIHRoZSBjb2xsZWN0aW9uIGZpbGUgd2l0aCB0aGUgbmV3IGluZm9cbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3Jlfmluc2VydFxuICAgICAqIFxuICAgICAqIEBsaXN0ZW5zIE1vbmdvUG9ydGFibGV+aW5zZXJ0XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50LmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5kb2MgLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZG9jdW1lbnQgaW5zZXJ0ZWRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufFByb21pc2U8Ym9vbGVhbj59IC0gVHJ1ZSBpZiB0aGUgY29sbGVjdGlvbiB3YXMgaW5zZXJ0ZWRcbiAgICAgKi9cbiAgICBpbnNlcnQoZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjaW5zZXJ0Jyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5wZXJzaXN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSksXG4gICAgICAgICAgICBldmVudC5jb2xsZWN0aW9uLmRvY3NcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIHNhdmUoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyNzYXZlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogIFJFQUQgICpcbiAgICAgKioqKioqKioqKi9cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgYWxsKGV2ZW50KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjYWxsJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgXCJmaW5kXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBmZXRjaGluZyB0aGUgaW5mbyBvZiB0aGUgY29sbGVjdGlvbiBmaWxlXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5maW5kXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX5maW5kXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gQXJndW1lbnRzIGZyb20gdGhlIGV2ZW50XG4gICAgICogXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LmNvbGxlY3Rpb24gLSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY29sbGVjdGlvblxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5zZWxlY3RvciAtIFRoZSBzZWxlY3Rpb24gb2YgdGhlIHF1ZXJ5XG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LmZpZWxkcyAtIFRoZSBmaWVsZHMgc2hvd2VkIGluIHRoZSBxdWVyeVxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge09iamVjdHxQcm9taXNlPE9iamVjdD59IC0gQW4gb2JqZWN0IHdpdGggdGhlIGRvY3VtZW50IGFuZCBpbmRleGVzXG4gICAgICovXG4gICAgZmluZChldmVudCk6IE9iamVjdCAmIFByb21pc2U8T2JqZWN0PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZmluZCcpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHBhcnNlTGluZXMgPSAoZmlsZSwgY2I/OiBGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgbGV0IGRvY3MgPSBbXTtcbiAgICAgICAgICAgIGxldCBpbmRleGVzID0ge307XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBsaW5lcyA9IGZpbGUudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRklYTUUgV29ya2Fyb3VuZC4uLlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBkb2MgPSBsaW5lc1tpXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoZG9jLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoKEpTT04ucGFyc2UoZG9jKSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ZXNbSlNPTi5wYXJzZShkb2MpLl9pZF0gPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXZlbnQuY29sbGVjdGlvbi5kb2NzID0gZG9jcztcbiAgICAgICAgICAgIGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMgPSBpbmRleGVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgICBjYihkb2NzLCBpbmRleGVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9jdW1lbnRzOiBkb2NzLCBpbmRleGVzIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMpIHtcbiAgICAgICAgICAgIGxldCBmaWxlID0gdGhpcy5yZWFkRmlsZSh0aGlzLmdldENvbGxlY3Rpb25QYXRoKGV2ZW50LmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgZXZlbnQuY29sbGVjdGlvbi5uYW1lKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcnNlTGluZXMoZmlsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVhZEZpbGUodGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VMaW5lcyhmaWxlLCAoZG9jdW1lbnRzLCBpbmRleGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGRvY3VtZW50cywgaW5kZXhlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKiovXG4gICAgICAgIC8vIHZhciBfZG9jcyA9IF8uY2xvbmVEZWVwKGV2ZW50LmNvbGxlY3Rpb24uZG9jcyk7XG4gICAgICAgIC8vIHZhciBfaWR4cyA9IF8uY2xvbmVEZWVwKGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gZm9yIChjb2xsRG9jcykge1xuICAgICAgICAvLyAgICAgbGV0IGRvYztcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgaWYgKCFfLmhhc0luKF9pZHgsIGRvYy5faWQpKSB7XG4gICAgICAgIC8vICAgICAgICAgYWRkKGRvYyk7XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIHVwZGF0ZShkb2MpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG4gICAgICAgIC8qKi9cbiAgICAgICAgXG4gICAgICAgIC8vIHZhciBkb2NzID0gW107XG4gICAgICAgIFxuICAgICAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGxEb2NzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vICAgICB2YXIgZG9jID0gY29sbERvY3NbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgLy8gICAgIGRvY3MucHVzaChkb2MpO1xuICAgICAgICAvLyAgICAgZXZlbnQuY29sbGVjdGlvbi5kb2NfaW5kZXhlc1tkb2MuX2lkXSA9IGk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGlmIChkb2NzLmxlbmd0aCAhPT0gKVxuICAgICAgICBcbiAgICAgICAgLy8gZm9yIChsZXQga2V5IGluIGV2ZW50LmNvbGxlY3Rpb24uZG9jX2luZGV4ZXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBcImZpbmRPbmVcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIGZldGNoaW5nIHRoZSBpbmZvIG9mIHRoZSBjb2xsZWN0aW9uIGZpbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgRmlsZVN5c3RlbVN0b3JlfmZpbmRPbmVcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfmZpbmRPbmVcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuZmllbGRzIC0gVGhlIGZpZWxkcyBzaG93ZWQgaW4gdGhlIHF1ZXJ5XG4gICAgICogXG4gICAgICogQHJldHVybiB7T2JqZWN0fFByb21pc2U8T2JqZWN0Pn0gLSBBbiBvYmplY3Qgd2l0aCB0aGUgZG9jdW1lbnQgYW5kIGluZGV4ZXNcbiAgICAgKi9cbiAgICBmaW5kT25lIChldmVudCk6IE9iamVjdCAmIFByb21pc2U8T2JqZWN0PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZmluZE9uZScpO1xuICAgICAgICBcbiAgICAgICAgLy8gRklYTUUgV2hlbiB3ZSBjYW4gZG8gYSBsaW5lLXBlci1saW5lIGZpbGUgc2VhcmNoLCBjaGFuZ2UgdGhpc1xuICAgICAgICByZXR1cm4gdGhpcy5maW5kKGV2ZW50KTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBVUERBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGFuIFwidXBkYXRlXCIgZXZlbnQgZnJvbSBNb25nb1BvcnRhYmxlLCBzeW5jcm9uaXppbmcgdGhlIGNvbGxlY3Rpb24gZmlsZSB3aXRoIHRoZSBuZXcgaW5mb1xuICAgICAqXG4gICAgICogQG1ldGhvZCBGaWxlU3lzdGVtU3RvcmV+dXBkYXRlXG4gICAgICogXG4gICAgICogQGxpc3RlbnMgTW9uZ29Qb3J0YWJsZX51cGRhdGVcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBBcmd1bWVudHMgZnJvbSB0aGUgZXZlbnRcbiAgICAgKiBcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuY29sbGVjdGlvbiAtIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb2xsZWN0aW9uXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGV2ZW50LnNlbGVjdG9yIC0gVGhlIHNlbGVjdGlvbiBvZiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQubW9kaWZpZXIgLSBUaGUgbW9kaWZpZXIgdXNlZCBpbiB0aGUgcXVlcnlcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuZG9jcyAtIFRoZSB1cGRhdGVkL2luc2VydGVkIGRvY3VtZW50cyBpbmZvcm1hdGlvblxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW58UHJvbWlzZTxib29sZWFuPn0gLSBUcnVlIGlmIHRoZSBkb2N1bWVudHMgd2VyZSB1cGRhdGVkXG4gICAgICovXG4gICAgdXBkYXRlKGV2ZW50KTogYm9vbGVhbiAmIFByb21pc2U8Ym9vbGVhbj4gIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyN1cGRhdGUnKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLnBlcnNpc3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGV2ZW50LmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgZXZlbnQuY29sbGVjdGlvbi5uYW1lKSxcbiAgICAgICAgICAgIGV2ZW50LmNvbGxlY3Rpb24uZG9jc1xuICAgICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIERFTEVURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYW4gXCJyZW1vdmVcIiBldmVudCBmcm9tIE1vbmdvUG9ydGFibGUsIHN5bmNyb25pemluZyB0aGUgY29sbGVjdGlvbiBmaWxlIHdpdGggdGhlIG5ldyBpbmZvXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIEZpbGVTeXN0ZW1TdG9yZX5yZW1vdmVcbiAgICAgKiBcbiAgICAgKiBAbGlzdGVucyBNb25nb1BvcnRhYmxlfnJlbW92ZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEFyZ3VtZW50cyBmcm9tIHRoZSBldmVudFxuICAgICAqIFxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5jb2xsZWN0aW9uIC0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gZXZlbnQuc2VsZWN0b3IgLSBUaGUgc2VsZWN0aW9uIG9mIHRoZSBxdWVyeVxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBldmVudC5kb2NzIC0gVGhlIGRlbGV0ZWQgZG9jdW1lbnRzIGluZm9ybWF0aW9uXG4gICAgICogXG4gICAgICogQHJldHVybiB7Ym9vbGVhbnxQcm9taXNlPGJvb2xlYW4+fSAtIFRydWUgaWYgdGhlIGRvY3VtZW50cyB3ZXJlIHJlbW92ZWRcbiAgICAgKi9cbiAgICByZW1vdmUoZXZlbnQpOiBib29sZWFuICYgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjcmVtb3ZlJyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5wZXJzaXN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChldmVudC5jb2xsZWN0aW9uLmZ1bGxOYW1lLnNwbGl0KCcuJylbMF0sIGV2ZW50LmNvbGxlY3Rpb24ubmFtZSksXG4gICAgICAgICAgICBldmVudC5jb2xsZWN0aW9uLmRvY3NcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBPVEhFUlMgKlxuICAgICAqKioqKioqKioqL1xuICAgIC8vIFRPRE9cbiAgICBlbnN1cmVJbmRleChldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjZW5zdXJlSW5kZXgnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ET1xuICAgIGJhY2t1cChldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjYmFja3VwJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXBzKGV2ZW50KXtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJyNiYWNrdXBzJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICByZW1vdmVCYWNrdXAoZXZlbnQpe1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnI3JlbW92ZUJhY2t1cCcpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgcmVzdG9yZShldmVudCl7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCcjcmVzdG9yZScpO1xuICAgIH1cbn1cbiAgICBcbmV4cG9ydCA9IEZpbGVTeXN0ZW1TdG9yZTsiXX0=
