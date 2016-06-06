"use strict";

var fs = require("file-system"),
    _ = require("lodash");

var _defOptions = {
    ddbb_path: 'db'
};

const _persist = function(collection) {
    var _path = `${this.options.ddbb_path}/${collection.name}.json`;
    
    if (this.options.sync === true) {
        fs.writeFile(_path, JSON.stringify(collection.docs), err => {
            if (err) throw err;
            
            console.info('Document persisted in the file system');
        });
    } else {
        fs.writeFileSync(_path, JSON.stringify(collection.docs));
        
        console.info('Document persisted in the file system');
    }
};

const _fromFile = function(collection) {
    var _path = `${this.options.ddbb_path}/${collection.name}.json`;
    
    if (this.options.sync === true) {
        fs.readFile(_path, err => {
            if (err) throw err;
            
            console.info('Collection readed from the file system');
        });
    } else {
        var file = fs.readFileSync(_path, 'utf8');

        console.info('Collection readed from the file system');
        
        return JSON.parse(file);
    }
};

class FileSysStore {
    constructor(options) {
        if (_.isNil(options)) {
            options = _defOptions;
        }
        
        this.options = options;
        
        console.info(`Database will be in ${options.ddbb_path}`);
        
        // Create the DDBB path
        fs.mkdirSync(this.options.ddbb_path);
    }
    
    /***************
     * COLLECTIONS *
     ***************/
     
     createCollection(args) {
         console.log('#createCollection');
     }

    /**********
     * CREATE *
     **********/
    
    insert (args) {
        console.log('#insert');
            
        _persist.call(this, args.collection);
    }
    
    save (args){
        console.log('#save');
        // console.log(args);
    }
    
    /**********
     *  READ  *
     **********/
    
    // Called for all
    all(args) {
        console.log('#all');
        
        // console.log(args);
    }
    
    find (args) {
        console.log('#find');
        
        var collection = _fromFile.call(this, args.collection);
        
        var docs = [];
        
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];
            
            if (_.hasIn(args.collection.doc_indexes, doc._id)) {
                docs.push(doc);
                args.collection.doc_indexes[doc._id] = i;
            } else {
                delete args.collection.doc_indexes;
            }
        }
        
        args.collection.docs = docs;
    }
    
    findOne (args) {
        console.log('#findOne');
        // console.log(args);
    }
    /**********
     * UPDATE *
     **********/
     
    update (args){
        console.log('#update');
        // console.log(args);
        
        _persist.call(this, args.collection);
    }
    
    /**********
     * DELETE *
     **********/
    
    remove (args){
        console.log('#remove');
        // console.log(args);
    }
    
    /**********
     * OTHERS *
     **********/
    open (args){
        console.log('#open');
        // console.log(args);
    }
    
    ensureIndex (args){
        console.log('#ensureIndex');
        // console.log(args);
    }
    
    backup (args){
        console.log('#backup');
        // console.log(args);
    }
    
    backups (args){
        console.log('#backups');
        // console.log(args);
    }
    
    removeBackup (args){
        console.log('#removeBackup');
        // console.log(args);
    }
    
    restore (args){
        console.log('#restore');
        // console.log(args);
    }
}

module.exports = FileSysStore;