# FileSystemStore
File System Store for persistence with [MongoPortable][Repo-MongoPortable], a portable MongoDB-like module.

It handles the collections and documents in memory, and allow the use of stores for persistence.

# Installation
```shell
npm install --save file-system-store
```

>**NOTE**: This module complements MongoPortable, a MongoDB-like portable database.
If you don't have it installed, please read the [documentation][Repo-MongoPortable].

# Usage
```javascript
// Declaring the modules dependencies
var MongoPortable = require("mongo-portable"),
    FileSystemStore = require("file-system-store");

// Instantiates a new ddbb object by passing a ddbb name
var db = new MongoPortable("TEST");

// Tells MongoPortable to use this store to persist the data
db.addStore(new FileSystemStore({
    // The path where the database will be stored
    ddbb_path: "MY_PHISICAL_DDBB_PATH",
    // Whether the persistance will be asynchronous or not
    sync: true
}));

// Creates a new collection named "users" 
//      (if it's already created, it will just return it instead)
var users = db.collection("users");

// Inserts a new document into the collection
var document = users.insert({ name: "John", lastName: "Abruzzi" });
console.log(document);  // -> { name: "John", lastName: "Abruzzi" }

// Creates a cursor with the query information, ready to be fetched
var cursor = users.find({ name: "John" });

// Iterates over the cursor, obtaining each document that matchs the query
cursor.forEach(function(doc) {
    console.log(doc);  // -> { name: "John", lastName: "Abruzzi" }
});
```

----------

Currently, we are supporting simple CRUD operations.

## TO-DO List
### Collection Operations
- [X] Create
- [ ] Drop

### Documents Operations
- [X] Creating
    * [X] .insert()
    * [X] .save()
- [X] Reading
    * [X] .find()
    * [X] .findOne()
- [X] Updating
    * [X] .update()
- [X] Deleting
    * [X] .remove()

----------

### Indexes Operations
- [ ] createIndex
- [ ] ensureIndex
- [ ] dropIndex
- [ ] reIndex

### Backups Operations
- [ ] backup
- [ ] backups
- [ ] removeDackup
- [ ] restore

----------

# License

MIT

[Repo-MongoPortable]: https://github.com/EastolfiWebDev/MongoPortable

[mongo-db-command]: https://docs.mongodb.com/manual/reference/command/

[API-MongoPortable]: https://github.com/EastolfiWebDev/MongoPortable/blob/master/api/MongoPortable.md
[API-Collection]: https://github.com/EastolfiWebDev/MongoPortable/blob/master/api/Collection.md
[API-Cursor]: https://github.com/EastolfiWebDev/MongoPortable/blob/master/api/Cursor.md

[Module-FileSystemStore]: https://github.com/EastolfiWebDev/FileSystemStore
[API-FileSystemStore]: https://github.com/EastolfiWebDev/FileSystemStore/blob/master/api/FileSystemStore.md