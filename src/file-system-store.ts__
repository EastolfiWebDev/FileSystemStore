// https://blogs.msdn.microsoft.com/typescript/2013/06/18/announcing-typescript-0-9/
// https://www.npmjs.com/package/tsify
// https://www.npmjs.com/package/gulp-typedoc/
// https://github.com/TypeStrong/typedoc
// http://typedoc.org/guides/usage/

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

import * as _                   from "lodash";
import * as fs                  from "file-system";
import * as Promise             from "promise";
import { JSWLogger as Logger }  from "jsw-logger";

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
export class FileSystemStore {
    private logger: Logger;
    private defaultOptions: any = {
        ddbb_path: 'db',
        collection_extension: 'json',
        sync: false
    };
    // private defaultOptions: Options = new Options({
    //     ddbb_path: 'db',
    //     collection_extension: 'json',
    //     sync: false
    // });
    
    options: any = {};
    // options: Options = new Options();
    
    constructor(options?: any/*Options = new Options()*/) {
        // if (!options) options = new Options();
        // this.options = _.assign(this.defaultOptions, options);
        this._initOptions(options);
        
        // Create a new Logger instance with the logging options, if received 
        if (this.options.log) {
            this.logger = Logger.getInstance(this.options.log);
        } else {
            this.logger = Logger.instance;
        }
        
        this.logger.debug(`Database will be in "${this.options.ddbb_path}" folder`);
        
        // Ensure the existence of the main database directory (force sync)
        let created = this.ensureDirectorySync();   // when recursive -> this.options.ddbb_path
        this.logger.debug(`Directory "${created}" created`);
    }
    
    /***************
     *   PRIVATE   *
     ***************/
     
    private _initOptions(options: any = {}) {
        this.options = _.assign(this.defaultOptions, options);
        
        // if (options) {
        //     if (options.ddbb_path) this.ddbb_path = options.ddbb_path;
        //     if (options.collection_extension) this.collection_extension = options.collection_extension;
        //     if (_.isBoolean(options.sync)) this.sync = options.sync;
        //     if (options.log) this.ddbb_path = options.log;
        // }
    }
    
    private handleError(error: Error): Error {
        this.logger.throw(error);
        
        return error;
    }
    
    // TODO: Recursive
    private ensureDirectorySync(path: string = "", root: string = this.options.ddbb_path): string | Error{
        let dirPath = `${root}/${path}`;
        
        try {
            fs.mkdirSync(dirPath);
            
            return dirPath;
        } catch(error) {
            return this.handleError(error);
        }
    }
    
    private ensureDirectory(path: string, root: string = this.options.ddbb_path): Promise<string> {
        let dirPath = `${root}/${path}`;
        
        return new Promise((resolve, reject) => {
            fs.mkdir(dirPath, (error) => {
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(dirPath);
                }
            });
        });
    }
    
    private existsFileSync(filename: string): boolean {
        let exists = false;
        
        try {
            let file = fs.readFileSync(filename);  
            
            if (!_.isNil(file)) {
                let stats = fs.statSync(filename);
                
                exists = stats.isFile();
            }
        } catch (error) {
            this.logger.debug(`File "${filename}" doesn't exist`);
        } finally {
            return exists;
        }
    }
    
    private existsFile(filename: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (error, file) => {
                if (error || _.isNil(file)) {
                    reject(error || new Error(`File "${filename}" doesn't exist`));
                } else {
                    fs.stat(filename, (error, stats) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(stats.isFile());
                        }
                    });
                }
            });
        });
        
        
    }
    
    private writeFileSync(path: string, content: string = ""): boolean {
        try {
            fs.writeFileSync(path, content);
            
            return true;
        } catch(error) {
            this.handleError(error);
            
            return false;
        }
    }
    
    private writeFile(path: string, content: string = ""): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }
    
    private persistSync(collectionPath: string, documents: object[]): boolean {
        let docs = "";
        
        for (let i = 0; i < documents.length; i++) {
            docs += JSON.stringify(documents[i]) + "\n";
        }
        
        let persisted = this.writeFileSync(collectionPath, docs);
    
        if (persisted) {
            this.logger.debug("Documents persisted in the file system");
        } else {
            this.logger.debug("Documents not persisted in the file system");
        }
        
        return persisted;
    }
    
    private persist(collectionPath: string, documents: object[]): Promise<boolean> {
        let docs = "";
        
        for (let i = 0; i < documents.length; i++) {
            docs += JSON.stringify(documents[i]) + "\n";
        }
        
        return new Promise((resolve, reject) => {
            this.writeFile(collectionPath, docs)
            .then(persisted => {
                this.logger.debug("Documents persisted in the file system");
                
                resolve(true);
            })
            .catch(error => {
                this.logger.debug("Documents not persisted in the file system");
                
                reject(error);
            });
        });
    }
    
    private readFileSync(path: string): object | Error {
        try {
            return fs.readFileSync(path);
        } catch(error) {
            return this.handleError(error);
        }
    }
    
    private readFile(path: string): Promise<object> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (error, file) => {
                if (error || _.isNil(file)) {
                    reject(error || new Error(`File "${path}" doesn't exist`));
                } else {
                    this.logger.debug(`Collection "${path}" readed from the file system`);
                    
                    resolve(file);
                }
            });
        });
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
    getCollectionPath(ddbb_name: string, coll_name: string): string {
        if (_.isNil(ddbb_name)) throw new Error("Parameter 'ddbb_name' is required");
        if (_.isNil(coll_name)) throw new Error("Parameter 'coll_name' is required");
        
        return `${this.options.ddbb_path}/${ddbb_name}/${coll_name}.${this.options.collection_extension}`;
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
     * @param {Object} event - Information of the event
     * 
     * @param {Object} event.connection - Information about the current database connection
     * @param {Object} event.collection - Information about the collection created
     * 
     * @return {boolean|Promise<boolean>} - True if the collection was created
     */
    createCollection(event): boolean | Promise<boolean> {
        this.logger.debug('#createCollection');
        
        var coll_path = this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name);
        
        if (this.options.sync) {
            if (!this.existsFile(coll_path)) {
                return this.writeFileSync(coll_path);
            }
        } else {
            return new Promise((resolve, reject) => {
                this.existsFile(coll_path)
                    .then(exists => {
                        resolve(exists);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
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
     * @param {Object} event - Arguments from the event
     * 
     * @param {Object} event.collection - Information about the collection
     * @param {Object} event.doc - Information about the document inserted
     * 
     * @return {boolean|Promise<boolean>} - True if the collection was inserted
     */
    insert(event): boolean | Promise<boolean> {
        this.logger.debug('#insert');
        
        if (this.options.sync) {
            return this.persistSync(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        } else {
            return this.persist(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        }
    }
    
    // TODO
    save(event) {
        this.logger.debug('#save');
    }
    
    /**********
     *  READ  *
     **********/
    
    // TODO
    all(event) {
        this.logger.debug('#all');
    }
    
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
    find(event): object | Promise<object> {
        this.logger.debug('#find');
        
        let parseLines = (file, cb?: Function) => {
            let docs = [];
            let indexes = {};
            
            let lines = file.toString().split("\n");
            
            // FIXME Workaround...
            for (let i = 0; i < lines.length; i++) {
                let doc = lines[i];
                
                if (doc.trim() !== '') {
                    docs.push(JSON.parse(doc));
                    indexes[JSON.parse(doc)._id] = i;
                }
            }
            
            event.collection.docs = docs;
            event.collection.doc_indexes = indexes;
            
            if (cb) {
                cb(docs, indexes);
            } else {
                return { documents: docs, indexes };
            }
        };
        
        if (this.options.sync) {
            let file = this.readFileSync(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name));
            
            parseLines(file);
        } else {
            return new Promise((resolve, reject) => {
                this.readFile(this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name))
                    .then(file => {
                        parseLines(file, (documents, indexes) => {
                            resolve({ documents, indexes });
                        });
                    })
                    .catch(error => {
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
        
        
    }
    
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
    findOne (event): object | Promise<object> {
        this.logger.debug('#findOne');
        
        // FIXME When we can do a line-per-line file search, change this
        return this.find(event);
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
     * @param {Object} event - Arguments from the event
     * 
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.modifier - The modifier used in the query
     * @property {Object} event.docs - The updated/inserted documents information
     * 
     * @return {boolean|Promise<boolean>} - True if the documents were updated
     */
    update(event): boolean | Promise<boolean>  {
        this.logger.debug('#update');
        
        if (this.options.sync) {
            return this.persistSync(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        } else {
            return this.persist(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        }
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
     * @param {Object} event - Arguments from the event
     * 
     * @property {Object} event.collection - Information about the collection
     * @property {Object} event.selector - The selection of the query
     * @property {Object} event.docs - The deleted documents information
     * 
     * @return {boolean|Promise<boolean>} - True if the documents were removed
     */
    remove(event): boolean | Promise<boolean> {
        this.logger.debug('#remove');
        
        if (this.options.sync) {
            return this.persistSync(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        } else {
            return this.persist(
                this.getCollectionPath(event.collection.fullName.split('.')[0], event.collection.name),
                event.collection.docs
            );
        }
    }
    
    /**********
     * OTHERS *
     **********/
    // TODO
    ensureIndex(event){
        this.logger.debug('#ensureIndex');
    }
    
    // TODO
    backup(event){
        this.logger.debug('#backup');
    }
    
    // TODO
    backups(event){
        this.logger.debug('#backups');
    }
    
    // TODO
    removeBackup(event){
        this.logger.debug('#removeBackup');
    }
    
    // TODO
    restore(event){
        this.logger.debug('#restore');
    }
}
    
// export { FileSystemStore };