var expect = require("chai").expect,
    fs = require("fs"),
    rimraf = require("rimraf"),
    MongoPortable = require("mongo-portable"),
    FileSystemStore = require("../lib/FileSystemStore.js");

const DDBB_NAME = "test_ddbb";
const COLL_NAME = "test_collection";
const DDBB_PATH = "data";

const DOC = {
    _id: "1111",
    name: "John",
    lastname: "Abruzzi"
};

var clearDataDir = function() {
    rimraf.sync("db");
    rimraf.sync("data");
};

var checkDir = function(dirName, exist, nFiles) {
    var files = fs.readdirSync(dirName);
    
    if (exist) {
        expect(files).to.exist;
        
        expect(files).to.be.instanceof(Array);
        expect(files).to.have.length(nFiles);
    } else {
        expect(files).to.not.exist;
    }
};

var checkFile = function(fileName, exist, empty) {
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
};

var db = null;
var store = null;
describe("FileSystemStore", function() {
    after(function() {
        clearDataDir();
    });
    
    describe("#Constructor", function() {
        before(function() {
            clearDataDir();
        });
        
        it("should have the dependencies ready", function() {
            expect(MongoPortable).to.exist;
            expect(FileSystemStore).to.exist;
        });
        
        it("should be able to instantiate a new store", function() {
            var _store = new FileSystemStore();
            
            expect(_store).to.exist;
            expect(_store.options).to.exist;
            
            expect(_store.options.ddbb_path).to.be.equal("db");
            
            checkDir("db", true, 0);
            
            store = new FileSystemStore({
                ddbb_path: DDBB_PATH,
                sync: true
            });
            
            expect(store).to.exist;
            expect(store.options).to.exist;
            
            expect(store.options.ddbb_path).to.be.equal(DDBB_PATH);
            
            checkDir("data", true, 0);
        });
    });
    
    describe("#Collections", function() {
        before(function() {
            clearDataDir();
            
            db = new MongoPortable(DDBB_NAME);
            
            db.addStore(store);
        });
        
        after(function() {
            db.dropDatabase();
            db = null;
        });
        
        it("should not have collections at first", function() {
            var collections = db.collections();
            
            expect(collections).to.exist;
            
            expect(collections).to.be.instanceof(Array);
            expect(collections).to.have.length(0);
        });
        
        describe("#Create", function() {
            it("should be able to create a collection", function() {
                var coll = db.collection(COLL_NAME);
            
                expect(coll).to.exist;
                
                expect(coll.name).to.be.equal(COLL_NAME);
                expect(coll.docs).to.be.instanceof(Array);
                expect(coll.docs).to.have.length(0);
                
                checkFile(`${DDBB_PATH}/${DDBB_NAME}/${COLL_NAME}.json`, true, true);
            });
        });
        
        describe.skip("#Update", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
        
        describe.skip("#Delete", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
    });
    
    describe("#Documents", function() {
        before(function() {
            db = new MongoPortable(DDBB_NAME);
            
            db.addStore(store);
        });
        
        after(function() {
            db.dropDatabase();
            db = null;
        });
        
        describe("#Create", function() {
            it("should be able to create a document", function() {
                var coll = db.collection(COLL_NAME);
                
                coll.insert(DOC);
                
                checkFile(`${DDBB_PATH}/${DDBB_NAME}/${COLL_NAME}.json`, true, false);
            });
        });
        
        describe("#Read", function() {
            before(function() {
                fs.appendFileSync(`${DDBB_PATH}/${DDBB_NAME}/${COLL_NAME}.json`, "{\"_id\":\"0000\",\"name\":\"John\", \"lastname\": \"Wayne\"}");
            });
            
            it("should be able to read a document", function() {
                var coll = db.collection(COLL_NAME);
                
                var docs = coll.find({ name: "John" }).fetch();
                
                expect(docs).to.exist;
                
                expect(docs).to.be.instanceof(Array);
                expect(docs).to.have.length(2);
                
                var doc = coll.findOne({ lastname: "Wayne" });
                
                expect(doc).to.exist;
                
                expect(doc.name).to.be.equal("John");
            });
        });
        
        describe("#Update", function() {
            it("should be able to update a document", function() {
                var coll = db.collection(COLL_NAME);
                
                coll.update({
                    lastname: "Wayne"
                }, {
                    name: "Bruce"
                });
                
                // Disconnecting the DDBB to check persistance
                db.dropDatabase();
                db = null;
                db = new MongoPortable(DDBB_NAME);
                db.addStore(store);
                
                coll = db.collection(COLL_NAME);
                
                var docs = coll.find({ name: "John" }).fetch();
                
                expect(docs).to.exist;
                
                expect(docs).to.be.instanceof(Array);
                expect(docs).to.have.length(1);
                expect(docs[0].lastname).to.be.equal("Abruzzi");
            });
        });
        
        describe("#Delete", function() {
            it("should be able to delete a document", function() {
                var coll = db.collection(COLL_NAME);
                
                coll.delete({
                    lastname: "Wayne"
                });
                
                // Disconnecting the DDBB to check persistance
                db.dropDatabase();
                db = null;
                db = new MongoPortable(DDBB_NAME);
                db.addStore(store);
                
                coll = db.collection(COLL_NAME);
                
                var docs = coll.find().fetch();
                
                expect(docs).to.exist;
                
                expect(docs).to.be.instanceof(Array);
                expect(docs).to.have.length(1);
                expect(docs[0].name).to.be.equal("John");
                expect(docs[0].lastname).to.be.equal("Abruzzi");
            });
        });
    });
    
    describe.skip("#Backups", function() {
        describe.skip("#Create", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
        
        describe.skip("#Read", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
        
        describe.skip("#Update", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
        
        describe.skip("#Delete", function() {
            it("should have the dependencies ready", function() {
                expect(MongoPortable).to.exist;
            });
        });
    });
    
    describe.skip("#Others", function() {
        it("should have the dependencies ready", function() {
            expect(MongoPortable).to.exist;
        });
    });
});