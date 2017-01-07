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
        * [~createCollection(event)](#FileSystemStore..createCollection) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
        * [~insert(event)](#FileSystemStore..insert) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
        * [~find(event)](#FileSystemStore..find) ⇒ <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code>
        * [~findOne(event)](#FileSystemStore..findOne) ⇒ <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code>
        * [~update(event)](#FileSystemStore..update) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
        * [~remove(event)](#FileSystemStore..remove) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>

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

### FileSystemStore~createCollection(event) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
Receives a "createCollection" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code> - - True if the collection was created  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Information of the event |
| event.connection | <code>Object</code> | Information about the current database connection |
| event.collection | <code>Object</code> | Information about the collection created |

<a name="FileSystemStore..insert"></a>

### FileSystemStore~insert(event) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
Receives a "insert" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code> - - True if the collection was inserted  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Arguments from the event |
| event.collection | <code>Object</code> | Information about the collection |
| event.doc | <code>Object</code> | Information about the document inserted |

<a name="FileSystemStore..find"></a>

### FileSystemStore~find(event) ⇒ <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code>
Receives a "find" event from MongoPortable, fetching the info of the collection file

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code> - - An object with the document and indexes  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| event.collection | <code>Object</code> | Information about the collection |
| event.selector | <code>Object</code> | The selection of the query |
| event.fields | <code>Object</code> | The fields showed in the query |

<a name="FileSystemStore..findOne"></a>

### FileSystemStore~findOne(event) ⇒ <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code>
Receives a "findOne" event from MongoPortable, fetching the info of the collection file

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>Object</code> &#124; <code>Promise.&lt;Object&gt;</code> - - An object with the document and indexes  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| event.collection | <code>Object</code> | Information about the collection |
| event.selector | <code>Object</code> | The selection of the query |
| event.fields | <code>Object</code> | The fields showed in the query |

<a name="FileSystemStore..update"></a>

### FileSystemStore~update(event) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
Receives an "update" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code> - - True if the documents were updated  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| event.collection | <code>Object</code> | Information about the collection |
| event.selector | <code>Object</code> | The selection of the query |
| event.modifier | <code>Object</code> | The modifier used in the query |
| event.docs | <code>Object</code> | The updated/inserted documents information |

<a name="FileSystemStore..remove"></a>

### FileSystemStore~remove(event) ⇒ <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code>
Receives an "remove" event from MongoPortable, syncronizing the collection file with the new info

**Kind**: inner method of <code>[FileSystemStore](#FileSystemStore)</code>  
**Returns**: <code>boolean</code> &#124; <code>Promise.&lt;boolean&gt;</code> - - True if the documents were removed  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Arguments from the event |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| event.collection | <code>Object</code> | Information about the collection |
| event.selector | <code>Object</code> | The selection of the query |
| event.docs | <code>Object</code> | The deleted documents information |

