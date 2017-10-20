import "mocha";
import { expect } from "chai";    
const fs = require("fs");
const rimraf = require("rimraf");
import { MongoPortable } from "mongo-portable";

import { FileSystemStore } from "../../src/FileSystemStore";
// import { FileSystemStore } from "../../index";

export class TestHelper {
    public static DDBB_NAME = "test_ddbb";
    public static COLL_NAME = "test_collection";
    public static DDBB_PATH = "data";
    public static DDBB_PATH_DEF = "db";
    
    static buildCollectionPath() {
        return `${TestHelper.DDBB_PATH}/${TestHelper.DDBB_NAME}/${TestHelper.COLL_NAME}.json`;
    }
    
    static createDocument() {
        return {
            _id: "1111",
            name: "John",
            lastname: "Abruzzi"
        };
    }
    
    static createStore() {
        return new FileSystemStore({
            ddbb_path: TestHelper.DDBB_PATH,
            sync: true
        });
    }
    
    static init(clear: boolean = true) {
        if (clear) {
            TestHelper.clearDataDir();
        }
            
        let db = new MongoPortable(TestHelper.DDBB_NAME, { log: {} });
        
        db.addStore(TestHelper.createStore());
        
        return db;
    }
    
    static clear(db) {
        db.dropDatabase();
        db = null;
        
        return db;
    }
    
    static appendDocument() {
        fs.appendFileSync(
            TestHelper.buildCollectionPath(),
            "{\"_id\":\"0000\",\"name\":\"John\", \"lastname\": \"Wayne\"}"
        );
    }
    
    static clearDataDir() {
        rimraf.sync(TestHelper.DDBB_PATH_DEF);
        rimraf.sync(TestHelper.DDBB_PATH);
    }
    
    static assertDir(dirName: string, exist: boolean, nFiles: number) {
        var files = fs.readdirSync(dirName);
        
        if (exist) {
            expect(files).to.exist;
            
            expect(files).to.be.instanceof(Array);
            expect(files).to.have.length(nFiles);
        } else {
            expect(files).to.not.exist;
        }
    }

    static assertFile(fileName: string, exist: boolean, empty: boolean) {
        if (empty != null) {
            empty = !!empty;
            
            fs.readFile(fileName, function(error, data) {
                expect(error).to.not.exist;
                expect(data).to.exist;
                
                if (empty) {
                    expect(data).to.have.length(0);
                } else {
                    expect(data).to.have.length.above(0);
                }
            });
        } else {
            var file = fs.readFileSync(fileName);
            
            if (exist) {
                expect(file).to.exist;
            } else {
                expect(file).to.not.exist;
            }
        }
    }
}