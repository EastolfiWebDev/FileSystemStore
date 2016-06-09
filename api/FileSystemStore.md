<a name="FileSystemStore"></a>

## FileSystemStore
Store for MongoPortable ([https://github.com/EastolfiWebDev/MongoPortable](https://github.com/EastolfiWebDev/MongoPortable))

**Kind**: global class  
**Since**: 0.0.1  

* [FileSystemStore](#FileSystemStore)
    * [new FileSystemStore([options])](#new_FileSystemStore_new)
    * _instance_
        * [.getCollectionPath(ddbb_name, coll_name)](#FileSystemStore+getCollectionPath) ⇒ <code>String</code>
    * _inner_
        * [~createCollection(args)](#FileSystemStore..createCollection)
        * [~insert(args)](#FileSystemStore..insert)
        * [~find(args)](#FileSystemStore..find)
        * [~findOne(args)](#FileSystemStore..findOne)
        * [~update(args)](#FileSystemStore..update)
        * [~remove(args)](#FileSystemStore..remove)

<a name="new_FileSystemStore_new"></a>

### new FileSystemStore([options])
FileSystemStore


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  | Additional options |
| [options.ddbb_path] | <code>Boolean</code> | <code>&quot;db&quot;</code> | The name of the directory where the database will be located |
| [options.sync] | <code>Boolean</code> | <code>true</code> | Set it false to make all the file access asynchronous. (Currently only sync=true is supported) |
| [options.collection_extension] | <code>Boolean</code> | <code>&quot;json&quot;</code> | The extension of the collection files. (Currently only "json" is supported) |

<a name="FileSystemStore+getCollectionPath"></a>

### fileSystemStore.getCollectionPath(ddbb_name, coll_name) ⇒ <code>String</code>
Get the path of the collection file

**Kind**: instance method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>String</code> - - The path of the file  

| Param | Type | Description |
| --- | --- | --- |
| ddbb_name | <code>String</code> | Name of the database |
| coll_name | <code>String</code> | Name of the collection |

<a name="FileSystemStore..createCollection"></a>

### FileSystemStore~createCollection(args)
Receives a "createCollection" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |
| args.connection | <code>Object</code> | Information about the current database connection |
| args.collection | <code>Object</code> | Information about the collection created |

<a name="FileSystemStore..insert"></a>

### FileSystemStore~insert(args)
Receives a "insert" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |
| args.collection | <code>Object</code> | Information about the collection |
| args.doc | <code>Object</code> | Information about the document inserted |

<a name="FileSystemStore..find"></a>

### FileSystemStore~find(args)
Receives a "find" event from MongoPortable, fetching the info of the collection file

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args.collection | <code>Object</code> | Information about the collection |
| args.selector | <code>Object</code> | The selection of the query |
| args.fields | <code>Object</code> | The fields showed in the query |

<a name="FileSystemStore..findOne"></a>

### FileSystemStore~findOne(args)
Receives a "findOne" event from MongoPortable, fetching the info of the collection file

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args.collection | <code>Object</code> | Information about the collection |
| args.selector | <code>Object</code> | The selection of the query |
| args.fields | <code>Object</code> | The fields showed in the query |

<a name="FileSystemStore..update"></a>

### FileSystemStore~update(args)
Receives an "update" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args.collection | <code>Object</code> | Information about the collection |
| args.selector | <code>Object</code> | The selection of the query |
| args.modifier | <code>Object</code> | The modifier used in the query |
| args.docs | <code>Object</code> | The updated/inserted documents information |

<a name="FileSystemStore..remove"></a>

### FileSystemStore~remove(args)
Receives an "remove" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args.collection | <code>Object</code> | Information about the collection |
| args.selector | <code>Object</code> | The selection of the query |
| args.docs | <code>Object</code> | The deleted documents information |

