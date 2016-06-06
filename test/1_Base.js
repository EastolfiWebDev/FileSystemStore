var expect = require("chai").expect,
    MongoPortable = require("mongo-portable");

describe("FileSystemStore", function() {
    before(function() {
        // db = new MongoPortable(TEST_DDBB);
    });
    
    after(function() {
        // db.dropDatabase();
        // db = null;
    });
    
    describe("#Constructor", function() {
        it("should have the dependencies ready", function() {
            expect(MongoPortable).to.exist;
        });
    });
    
    describe.skip("#Collections", function() {
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
    
    describe.skip("#Documents", function() {
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