"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("file-system"),
    _ = require("lodash");

var _defOptions = {
    ddbb_path: 'db',
    collection_extension: 'json',
    sync: false
};

// existsDir, existsFile, createDir, removeDir, createFile, removeFile, writeToFile, readFromFile

var _existsFile = function _existsFile(filename) {
    var exists = false;
    try {
        var file = fs.readFileSync(filename);

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

var _persist = function _persist(collectionPath, collection) {
    var docs = "";
    for (var i = 0; i < collection.docs.length; i++) {
        docs += JSON.stringify(collection.docs[i]) + "\n";
    }

    if (this.options.sync === true) {
        _writeFile(collectionPath, docs);

        console.info('Document persisted in the file system');
    } else {
        fs.writeFile(collectionPath, function (docs, err) {
            if (err) throw err;

            console.info('Document persisted in the file system');
        });
    }
};

var _readFile = function _readFile(path) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (!_.isNil(callback)) {
        fs.readFile(path, function (err, data) {
            if (err) throw err;

            callback(data);

            console.info('Collection readed from the file system');
        });
    } else {
        return fs.readFileSync(path);
    }
};

var _createDirectory = function _createDirectory() {
    var dir = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    fs.mkdirSync(this.options.ddbb_path + "/" + dir);
};

var _createFile = function _createFile(path, recursive) {
    _writeFile(path);
};

var _writeFile = function _writeFile(path) {
    var content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    fs.writeFileSync(path, content);
};

var FileSysStore = function () {
    function FileSysStore(options) {
        _classCallCheck(this, FileSysStore);

        this.options = _.assign(_defOptions, options);

        console.info("Database will be in " + this.options.ddbb_path);

        // Create the DDBB path
        _createDirectory.call(this);
    }

    /***************
     *    UTILS    *
     ***************/


    _createClass(FileSysStore, [{
        key: "getCollectionPath",
        value: function getCollectionPath(ddbb_name, coll_name) {
            if (_.isNil(ddbb_name)) throw new Error("Parameter 'ddbb_name' is required");
            if (_.isNil(coll_name)) throw new Error("Parameter 'coll_name' is required");

            return this.options.ddbb_path + "/" + ddbb_name + "/" + coll_name + "." + this.options.collection_extension;
        }

        /***************
         * COLLECTIONS *
         ***************/

    }, {
        key: "createCollection",
        value: function createCollection(args) {
            console.log('#createCollection');

            var coll_path = this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name);

            if (!_existsFile(coll_path)) {
                _createFile(coll_path, true);
            }
        }

        /**********
         * CREATE *
         **********/

    }, {
        key: "insert",
        value: function insert(args) {
            console.log('#insert');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        // TODO

    }, {
        key: "save",
        value: function save(args) {
            console.log('#save');
            // console.log(args);
        }

        /**********
         *  READ  *
         **********/

        // TODO

    }, {
        key: "all",
        value: function all(args) {
            console.log('#all');

            // console.log(args);
        }
    }, {
        key: "find",
        value: function find(args) {
            console.log('#find');

            var callback = null;

            if (this.options.sync !== true) {
                // handle async
            }

            var file = _readFile(this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), callback);

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
    }, {
        key: "findOne",
        value: function findOne(args) {
            console.log('#findOne');
            // console.log(args);

            // FIXME When we can do a line-per-line file search, change this
            this.find(args);
        }
        /**********
         * UPDATE *
         **********/

    }, {
        key: "update",
        value: function update(args) {
            console.log('#update');
            // console.log(args);

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        /**********
         * DELETE *
         **********/

    }, {
        key: "remove",
        value: function remove(args) {
            console.log('#remove');

            _persist.call(this, this.getCollectionPath(args.collection.fullName.split('.')[0], args.collection.name), args.collection);
        }

        /**********
         * OTHERS *
         **********/
        // TODO

    }, {
        key: "ensureIndex",
        value: function ensureIndex(args) {
            console.log('#ensureIndex');
            // console.log(args);
        }

        // TODO

    }, {
        key: "backup",
        value: function backup(args) {
            console.log('#backup');
            // console.log(args);
        }

        // TODO

    }, {
        key: "backups",
        value: function backups(args) {
            console.log('#backups');
            // console.log(args);
        }

        // TODO

    }, {
        key: "removeBackup",
        value: function removeBackup(args) {
            console.log('#removeBackup');
            // console.log(args);
        }

        // TODO

    }, {
        key: "restore",
        value: function restore(args) {
            console.log('#restore');
            // console.log(args);
        }
    }]);

    return FileSysStore;
}();

module.exports = FileSysStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9GaWxlU3lzdGVtU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQUVBLElBQUksS0FBSyxRQUFRLGFBQVIsQ0FBVDtJQUNJLElBQUksUUFBUSxRQUFSLENBRFI7O0FBR0EsSUFBSSxjQUFjO0FBQ2QsZUFBVyxJQURHO0FBRWQsMEJBQXNCLE1BRlI7QUFHZCxVQUFNO0FBSFEsQ0FBbEI7Ozs7QUFRQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQVMsUUFBVCxFQUFtQjtBQUNuQyxRQUFJLFNBQVMsS0FBYjtBQUNBLFFBQUk7QUFDQSxZQUFJLE9BQU8sR0FBRyxZQUFILENBQWdCLFFBQWhCLENBQVg7O0FBRUEsWUFBSSxDQUFDLEVBQUUsS0FBRixDQUFRLElBQVIsQ0FBTCxFQUFvQjtBQUNoQixnQkFBSSxRQUFRLEdBQUcsUUFBSCxDQUFZLFFBQVosQ0FBWjs7QUFFQSxxQkFBUyxNQUFNLE1BQU4sRUFBVDtBQUNIO0FBQ0osS0FSRCxDQVFFLE9BQU8sS0FBUCxFQUFjO0FBQ1osZ0JBQVEsR0FBUixDQUFZLEtBQVo7QUFDSCxLQVZELFNBVVU7QUFDTixlQUFPLE1BQVA7QUFDSDtBQUNKLENBZkQ7O0FBaUJBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDO0FBQ2xELFFBQUksT0FBTyxFQUFYO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFdBQVcsSUFBWCxDQUFnQixNQUFwQyxFQUE0QyxHQUE1QyxFQUFpRDtBQUM3QyxnQkFBUSxLQUFLLFNBQUwsQ0FBZSxXQUFXLElBQVgsQ0FBZ0IsQ0FBaEIsQ0FBZixJQUFxQyxJQUE3QztBQUNIOztBQUVELFFBQUksS0FBSyxPQUFMLENBQWEsSUFBYixLQUFzQixJQUExQixFQUFnQztBQUM1QixtQkFBVyxjQUFYLEVBQTJCLElBQTNCOztBQUVBLGdCQUFRLElBQVIsQ0FBYSx1Q0FBYjtBQUNILEtBSkQsTUFJTztBQUNILFdB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ZCxFQUFvQixLQUFLLGlCQUFMLENBQXVCLEtBQUssVUFBTCxDQUFnQixRQUFoQixDQUF5QixLQUF6QixDQUErQixHQUEvQixFQUFvQyxDQUFwQyxDQUF2QixFQUErRCxLQUFLLFVBQUwsQ0FBZ0IsSUFBL0UsQ0FBcEIsRUFBMEcsS0FBSyxVQUEvRztBQUNIOzs7Ozs7OzsrQkFNTyxJLEVBQUs7QUFDVCxvQkFBUSxHQUFSLENBQVksU0FBWjs7QUFFQSxxQkFBUyxJQUFULENBQWMsSUFBZCxFQUFvQixLQUFLLGlCQUFMLENBQXVCLEtBQUssVUFBTCxDQUFnQixRQUFoQixDQUF5QixLQUF6QixDQUErQixHQUEvQixFQUFvQyxDQUFwQyxDQUF2QixFQUErRCxLQUFLLFVBQUwsQ0FBZ0IsSUFBL0UsQ0FBcEIsRUFBMEcsS0FBSyxVQUEvRztBQUNIOzs7Ozs7Ozs7b0NBTVksSSxFQUFLO0FBQ2Qsb0JBQVEsR0FBUixDQUFZLGNBQVo7O0FBRUg7Ozs7OzsrQkFHTyxJLEVBQUs7QUFDVCxvQkFBUSxHQUFSLENBQVksU0FBWjs7QUFFSDs7Ozs7O2dDQUdRLEksRUFBSztBQUNWLG9CQUFRLEdBQVIsQ0FBWSxVQUFaOztBQUVIOzs7Ozs7cUNBR2EsSSxFQUFLO0FBQ2Ysb0JBQVEsR0FBUixDQUFZLGVBQVo7O0FBRUg7Ozs7OztnQ0FHUSxJLEVBQUs7QUFDVixvQkFBUSxHQUFSLENBQVksVUFBWjs7QUFFSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFlBQWpCIiwiZmlsZSI6IkZpbGVTeXN0ZW1TdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZnMgPSByZXF1aXJlKFwiZmlsZS1zeXN0ZW1cIiksXG4gICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbnZhciBfZGVmT3B0aW9ucyA9IHtcbiAgICBkZGJiX3BhdGg6ICdkYicsXG4gICAgY29sbGVjdGlvbl9leHRlbnNpb246ICdqc29uJyxcbiAgICBzeW5jOiBmYWxzZVxufTtcblxuLy8gZXhpc3RzRGlyLCBleGlzdHNGaWxlLCBjcmVhdGVEaXIsIHJlbW92ZURpciwgY3JlYXRlRmlsZSwgcmVtb3ZlRmlsZSwgd3JpdGVUb0ZpbGUsIHJlYWRGcm9tRmlsZVxuXG5jb25zdCBfZXhpc3RzRmlsZSA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKTsgIFxuICAgICAgICBcbiAgICAgICAgaWYgKCFfLmlzTmlsKGZpbGUpKSB7XG4gICAgICAgICAgICB2YXIgc3RhdHMgPSBmcy5zdGF0U3luYyhmaWxlbmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4aXN0cyA9IHN0YXRzLmlzRmlsZSgpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ29vaycpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIHJldHVybiBleGlzdHM7XG4gICAgfVxufTtcblxuY29uc3QgX3BlcnNpc3QgPSBmdW5jdGlvbihjb2xsZWN0aW9uUGF0aCwgY29sbGVjdGlvbikge1xuICAgIGxldCBkb2NzID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxlY3Rpb24uZG9jcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb2NzICs9IEpTT04uc3RyaW5naWZ5KGNvbGxlY3Rpb24uZG9jc1tpXSkgKyBcIlxcblwiO1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMgPT09IHRydWUpIHtcbiAgICAgICAgX3dyaXRlRmlsZShjb2xsZWN0aW9uUGF0aCwgZG9jcyk7XG5cbiAgICAgICAgY29uc29sZS5pbmZvKCdEb2N1bWVudCBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZnMud3JpdGVGaWxlKGNvbGxlY3Rpb25QYXRoLCAoZG9jcywgZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnRG9jdW1lbnQgcGVyc2lzdGVkIGluIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBfcmVhZEZpbGUgPSBmdW5jdGlvbihwYXRoLCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICBpZiAoIV8uaXNOaWwoY2FsbGJhY2spKSB7XG4gICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29sbGVjdGlvbiByZWFkZWQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0nKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKTtcbiAgICB9XG59O1xuXG5jb25zdCBfY3JlYXRlRGlyZWN0b3J5ID0gZnVuY3Rpb24oZGlyID0gJycpIHtcbiAgICBmcy5ta2RpclN5bmMoYCR7dGhpcy5vcHRpb25zLmRkYmJfcGF0aH0vJHtkaXJ9YCk7XG59O1xuXG5jb25zdCBfY3JlYXRlRmlsZSA9IGZ1bmN0aW9uKHBhdGgsIHJlY3Vyc2l2ZSkge1xuICAgIF93cml0ZUZpbGUocGF0aCk7XG59O1xuXG5jb25zdCBfd3JpdGVGaWxlID0gZnVuY3Rpb24ocGF0aCwgY29udGVudCA9ICcnKSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBjb250ZW50KTtcbn07XG5cbmNsYXNzIEZpbGVTeXNTdG9yZSB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmFzc2lnbihfZGVmT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYERhdGFiYXNlIHdpbGwgYmUgaW4gJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofWApO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBEREJCIHBhdGhcbiAgICAgICAgX2NyZWF0ZURpcmVjdG9yeS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKioqKioqXG4gICAgICogICAgVVRJTFMgICAgKlxuICAgICAqKioqKioqKioqKioqKiovXG4gICAgZ2V0Q29sbGVjdGlvblBhdGgoZGRiYl9uYW1lLCBjb2xsX25hbWUpIHtcbiAgICAgICAgaWYgKF8uaXNOaWwoZGRiYl9uYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW1ldGVyICdkZGJiX25hbWUnIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgICBpZiAoXy5pc05pbChjb2xsX25hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJhbWV0ZXIgJ2NvbGxfbmFtZScgaXMgcmVxdWlyZWRcIik7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYCR7dGhpcy5vcHRpb25zLmRkYmJfcGF0aH0vJHtkZGJiX25hbWV9LyR7Y29sbF9uYW1lfS4ke3RoaXMub3B0aW9ucy5jb2xsZWN0aW9uX2V4dGVuc2lvbn1gO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKioqKioqXG4gICAgICogQ09MTEVDVElPTlMgKlxuICAgICAqKioqKioqKioqKioqKiovXG4gICAgIFxuICAgICBjcmVhdGVDb2xsZWN0aW9uKGFyZ3MpIHtcbiAgICAgICAgIGNvbnNvbGUubG9nKCcjY3JlYXRlQ29sbGVjdGlvbicpO1xuICAgICAgICAgXG4gICAgICAgICB2YXIgY29sbF9wYXRoID0gdGhpcy5nZXRDb2xsZWN0aW9uUGF0aChhcmdzLmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgYXJncy5jb2xsZWN0aW9uLm5hbWUpO1xuICAgICAgICAgXG4gICAgICAgICBpZiAoIV9leGlzdHNGaWxlKGNvbGxfcGF0aCkpIHtcbiAgICAgICAgICAgICBfY3JlYXRlRmlsZShjb2xsX3BhdGgsIHRydWUpO1xuICAgICAgICAgfVxuICAgICB9XG5cbiAgICAvKioqKioqKioqKlxuICAgICAqIENSRUFURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgaW5zZXJ0IChhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjaW5zZXJ0Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGFyZ3MuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBhcmdzLmNvbGxlY3Rpb24ubmFtZSksIGFyZ3MuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBzYXZlIChhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjc2F2ZScpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiAgUkVBRCAgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8vIFRPRE9cbiAgICBhbGwoYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZygnI2FsbCcpO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIGZpbmQgKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyNmaW5kJyk7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgYXN5bmNcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGZpbGUgPSBfcmVhZEZpbGUodGhpcy5nZXRDb2xsZWN0aW9uUGF0aChhcmdzLmNvbGxlY3Rpb24uZnVsbE5hbWUuc3BsaXQoJy4nKVswXSwgYXJncy5jb2xsZWN0aW9uLm5hbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICBsZXQgZG9jcyA9IFtdO1xuICAgICAgICBsZXQgaW5kZXhlcyA9IHt9O1xuICAgICAgICBcbiAgICAgICAgbGV0IGxpbmVzID0gZmlsZS50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8gRklYTUUgV29ya2Fyb3VuZC4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZG9jID0gbGluZXNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkb2MudHJpbSgpICE9PSAnJykge1xuICAgICAgICAgICAgICAgIGRvY3MucHVzaChKU09OLnBhcnNlKGRvYykpO1xuICAgICAgICAgICAgICAgIGluZGV4ZXNbSlNPTi5wYXJzZShkb2MpLl9pZF0gPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKiovXG4gICAgICAgIC8vIHZhciBfZG9jcyA9IF8uY2xvbmVEZWVwKGFyZ3MuY29sbGVjdGlvbi5kb2NzKTtcbiAgICAgICAgLy8gdmFyIF9pZHhzID0gXy5jbG9uZURlZXAoYXJncy5jb2xsZWN0aW9uLmRvY19pbmRleGVzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGZvciAoY29sbERvY3MpIHtcbiAgICAgICAgLy8gICAgIGxldCBkb2M7XG4gICAgICAgICAgICBcbiAgICAgICAgLy8gICAgIGlmICghXy5oYXNJbihfaWR4LCBkb2MuX2lkKSkge1xuICAgICAgICAvLyAgICAgICAgIGFkZChkb2MpO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICB1cGRhdGUoZG9jKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuICAgICAgICAvKiovXG4gICAgICAgIFxuICAgICAgICAvLyB2YXIgZG9jcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsRG9jcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyAgICAgdmFyIGRvYyA9IGNvbGxEb2NzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICBkb2NzLnB1c2goZG9jKTtcbiAgICAgICAgLy8gICAgIGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlc1tkb2MuX2lkXSA9IGk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGlmIChkb2NzLmxlbmd0aCAhPT0gKVxuICAgICAgICBcbiAgICAgICAgLy8gZm9yIChsZXQga2V5IGluIGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcykge1xuICAgICAgICAgICAgXG4gICAgICAgIC8vIH1cbiAgICAgICAgXG4gICAgICAgIGFyZ3MuY29sbGVjdGlvbi5kb2NzID0gZG9jcztcbiAgICAgICAgYXJncy5jb2xsZWN0aW9uLmRvY19pbmRleGVzID0gaW5kZXhlcztcbiAgICB9XG4gICAgXG4gICAgZmluZE9uZSAoYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZygnI2ZpbmRPbmUnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgICAgIFxuICAgICAgICAvLyBGSVhNRSBXaGVuIHdlIGNhbiBkbyBhIGxpbmUtcGVyLWxpbmUgZmlsZSBzZWFyY2gsIGNoYW5nZSB0aGlzXG4gICAgICAgIHRoaXMuZmluZChhcmdzKTtcbiAgICB9XG4gICAgLyoqKioqKioqKipcbiAgICAgKiBVUERBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIHVwZGF0ZSAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjdXBkYXRlJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGFyZ3MuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBhcmdzLmNvbGxlY3Rpb24ubmFtZSksIGFyZ3MuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogREVMRVRFICpcbiAgICAgKioqKioqKioqKi9cbiAgICBcbiAgICByZW1vdmUgKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZygnI3JlbW92ZScpO1xuICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCB0aGlzLmdldENvbGxlY3Rpb25QYXRoKGFyZ3MuY29sbGVjdGlvbi5mdWxsTmFtZS5zcGxpdCgnLicpWzBdLCBhcmdzLmNvbGxlY3Rpb24ubmFtZSksIGFyZ3MuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogT1RIRVJTICpcbiAgICAgKioqKioqKioqKi9cbiAgICAvLyBUT0RPXG4gICAgZW5zdXJlSW5kZXggKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZygnI2Vuc3VyZUluZGV4Jyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgYmFja3VwIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNiYWNrdXAnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICBiYWNrdXBzIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNiYWNrdXBzJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPXG4gICAgcmVtb3ZlQmFja3VwIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNyZW1vdmVCYWNrdXAnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE9cbiAgICByZXN0b3JlIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNyZXN0b3JlJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzU3RvcmU7Il19
