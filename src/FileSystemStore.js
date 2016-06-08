"use strict";

var fs = require("file-system"),
    _ = require("lodash");

var _defOptions = {
    ddbb_path: 'db',
    collection_extension: 'json',
    sync: false
};

// existsDir, existsFile, createDir, removeDir, createFile, removeFile, writeToFile, readFromFile

const _existsFile = function(filename) {
    var exists = false;
    try {
        let file = fs.readFileSync(filename);  
        
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

const _persist = function(collectionPath, collection) {
    let docs = "";
    for (let i = 0; i < collection.docs.length; i++) {
        docs += JSON.stringify(collection.docs[i]) + "\n";
    }
    
    if (this.options.sync === true) {
        _writeFile(collectionPath, docs);

        console.info('Document persisted in the file system');
    } else {
        fs.writeFile(collectionPath, (docs, err) => {
            if (err) throw err;
            
            console.info('Document persisted in the file system');
        });
    }
};

const _readFile = function(path, callback = null) {
    if (!_.isNil(callback)) {
        fs.readFile(path, (err, data) => {
            if (err) throw err;
            
            callback(data);
            
            console.info('Collection readed from the file system');
        });
    } else {
        return fs.readFileSync(path);
    }
};

const _createDirectory = function(dir = '') {
    fs.mkdirSync(`${this.options.ddbb_path}/${dir}`);
};

const _createFile = function(path, recursive) {
    _writeFile(path);
};

const _writeFile = function(path, content = '') {
    fs.writeFileSync(path, content);
};

class FileSysStore {
    constructor(options) {
        this.options = _.assign(_defOptions, options);
        
        console.info(`Database will be in ${this.options.ddbb_path}`);
        
        // Create the DDBB path
        _createDirectory.call(this);
    }
    
    /***************
     *    UTILS    *
     ***************/
    getCollectionPath(ddbb_name, coll_name) {
        if (_.isNil(ddbb_name)) throw new Error("Parameter 'ddbb_name' is required");
        if (_.isNil(coll_name)) throw new Error("Parameter 'coll_name' is required");
        
        return `${this.options.ddbb_path}/${ddbb_name}/${coll_name}.${this.options.collection_extension}`;
    }
    
    /***************
     * COLLECTIONS *
     ***************/
     
     createCollection(args) {
         console.log('#createCollection');
         
         var coll_path = this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name);
         
         if (!_existsFile(coll_path)) {
             _createFile(coll_path, true);
         }
     }

    /**********
     * CREATE *
     **********/
    
    insert (args) {
        console.log('#insert');
            
        _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
    }
    
    // TODO
    save (args) {
        console.log('#save');
        // console.log(args);
    }
    
    /**********
     *  READ  *
     **********/
    
    // TODO
    all(args) {
        console.log('#all');
        
        // console.log(args);
    }
    
    find (args) {
        console.log('#find');
        
        var callback = null;
        
        if (this.options.sync !== true) {
            // handle async
        }
        
        var file = _readFile(this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), callback);
        
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
    
    findOne (args) {
        console.log('#findOne');
        // console.log(args);
        
        // FIXME When we can do a line-per-line file search, change this
        this.find(args);
    }
    /**********
     * UPDATE *
     **********/
    
    update (args){
        console.log('#update');
        // console.log(args);
        
        _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
    }
    
    /**********
     * DELETE *
     **********/
    
    remove (args){
        console.log('#remove');
        
        _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
    }
    
    /**********
     * OTHERS *
     **********/
    // TODO
    ensureIndex (args){
        console.log('#ensureIndex');
        // console.log(args);
    }
    
    // TODO
    backup (args){
        console.log('#backup');
        // console.log(args);
    }
    
    // TODO
    backups (args){
        console.log('#backups');
        // console.log(args);
    }
    
    // TODO
    removeBackup (args){
        console.log('#removeBackup');
        // console.log(args);
    }
    
    // TODO
    restore (args){
        console.log('#restore');
        // console.log(args);
    }
}

module.exports = FileSysStore;