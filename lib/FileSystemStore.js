"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("file-system"),
    _ = require("lodash");

var _defOptions = {
    ddbb_path: 'db'
};

var _persist = function _persist(collection) {
    var _path = this.options.ddbb_path + "/" + collection.name + ".json";

    if (this.options.sync === true) {
        fs.writeFile(_path, JSON.stringify(collection.docs), function (err) {
            if (err) throw err;

            console.info('Document persisted in the file system');
        });
    } else {
        fs.writeFileSync(_path, JSON.stringify(collection.docs));

        console.info('Document persisted in the file system');
    }
};

var _fromFile = function _fromFile(collection) {
    var _path = this.options.ddbb_path + "/" + collection.name + ".json";

    if (this.options.sync === true) {
        fs.readFile(_path, function (err) {
            if (err) throw err;

            console.info('Collection readed from the file system');
        });
    } else {
        var file = fs.readFileSync(_path, 'utf8');

        console.info('Collection readed from the file system');

        return JSON.parse(file);
    }
};

var FileSysStore = function () {
    function FileSysStore(options) {
        _classCallCheck(this, FileSysStore);

        if (_.isNil(options)) {
            options = _defOptions;
        }

        this.options = options;

        console.info("Database will be in " + options.ddbb_path);

        // Create the DDBB path
        fs.mkdirSync(this.options.ddbb_path);
    }

    /***************
     * COLLECTIONS *
     ***************/

    _createClass(FileSysStore, [{
        key: "createCollection",
        value: function createCollection(args) {
            console.log('#createCollection');
        }

        /**********
         * CREATE *
         **********/

    }, {
        key: "insert",
        value: function insert(args) {
            console.log('#insert');

            _persist.call(this, args.collection);
        }
    }, {
        key: "save",
        value: function save(args) {
            console.log('#save');
            // console.log(args);
        }

        /**********
         *  READ  *
         **********/

        // Called for all

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
    }, {
        key: "findOne",
        value: function findOne(args) {
            console.log('#findOne');
            // console.log(args);
        }
        /**********
         * UPDATE *
         **********/

    }, {
        key: "update",
        value: function update(args) {
            console.log('#update');
            // console.log(args);

            _persist.call(this, args.collection);
        }

        /**********
         * DELETE *
         **********/

    }, {
        key: "remove",
        value: function remove(args) {
            console.log('#remove');
            // console.log(args);
        }

        /**********
         * OTHERS *
         **********/

    }, {
        key: "open",
        value: function open(args) {
            console.log('#open');
            // console.log(args);
        }
    }, {
        key: "ensureIndex",
        value: function ensureIndex(args) {
            console.log('#ensureIndex');
            // console.log(args);
        }
    }, {
        key: "backup",
        value: function backup(args) {
            console.log('#backup');
            // console.log(args);
        }
    }, {
        key: "backups",
        value: function backups(args) {
            console.log('#backups');
            // console.log(args);
        }
    }, {
        key: "removeBackup",
        value: function removeBackup(args) {
            console.log('#removeBackup');
            // console.log(args);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9GaWxlU3lzdGVtU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQUVBLElBQUksS0FBSyxRQUFRLGFBQVIsQ0FBVDtJQUNJLElBQUksUUFBUSxRQUFSLENBRFI7O0FBR0EsSUFBSSxjQUFjO0FBQ2QsZUFBVztBQURHLENBQWxCOztBQUlBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBUyxVQUFULEVBQXFCO0FBQ2xDLFFBQUksUUFBVyxLQUFLLE9BQUwsQ0FBYSxTQUF4QixTQUFxQyxXQUFXLElBQWhELFVBQUo7O0FBRUEsUUFBSSxLQUFLLE9BQUwsQ0FBYSxJQUFiLEtBQXNCLElBQTFCLEVBQWdDO0FBQzVCLFdBQUcsU0FBSCxDQUFhLEtBQWIsRUFBb0IsS0FBSyxTQUFMLENBQWUsV0FBVyxJQUExQixDQUFwQixFQUFxRCxlQUFPO0FBQ3hELGdCQUFJLEdBQUosRUFBUyxNQUFNLEdBQU47O0FBRVQsb0JBQVEsSUFBUixDQUFhLHVDQUFiO0FBQ0gsU0FKRDtBQUtILEtBTkQsTUFNTztBQUNILFdBQUcsYUFBSCxDQUFpQixLQUFqQixFQUF3QixLQUFLLFNBQUwsQ0FBZSxXQUFXLElBQTFCLENBQXhCOztBQUVBLGdCQUFRLElBQVIsQ0FBYSx1Q0FBYjtBQUNIO0FBQ0osQ0FkRDs7QUFnQkEsSUFBTSxZQUFZLFNBQVosU0FBWSxDQUFTLFVBQVQsRUFBcUI7QUFDbkMsUUFBSSxRQUFXLEtBQUssT0FBTCxDQUFhLFNBQXhCLFNBQXFDLFdBQVcsSUFBaEQsVUFBSjs7QUFFQSxRQUFJLEtBQUssT0FBTCxDQUFhLElBQWIsS0FBc0IsSUFBMUIsRUFBZ0M7QUFDNUIsV0FBRyxRQUFILENBQVksS0FBWixFQUFtQixlQUFPO0FBQ3RCLGdCQUFJLEdBQUosRUFBUyxNQUFNLEdBQU47O0FBRVQsb0JBQVEsSUFBUixDQUFhLHdDQUFiO0FBQ0gsU0FKRDtBQUtILEtBTkQsTUFNTztBQUNILFlBQUksT0FBTyxHQUFHLFlBQUgsQ0FBZ0IsS0FBaEIsRUFBdUIsTUFBdkIsQ0FBWDs7QUFFQSxnQkFBUSxJQUFSLENBQWEsd0NBQWI7O0FBRUEsZUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQVA7QUFDSDtBQUNKLENBaEJEOztJQWtCTSxZO0FBQ0YsMEJBQVksT0FBWixFQUFxQjtBQUFBOztBQUNqQixZQUFJLEVBQUUsS0FBRixDQUFRLE9BQVIsQ0FBSixFQUFzQjtBQUNsQixzQkFBVSxXQUFWO0FBQ0g7O0FBRUQsYUFBSyxPQUFMLEdBQWUsT0FBZjs7QUFFQSxnQkFBUSxJQUFSLDBCQUFvQyxRQUFRLFNBQTVDOzs7QUFHQSxXQUFHLFNBQUgsQ0FBYSxLQUFLLE9BQUwsQ0FBYSxTQUExQjtBQUNIOzs7Ozs7Ozt5Q0FNaUIsSSxFQUFNO0FBQ25CLG9CQUFRLEdBQVIsQ0FBWSxtQkFBWjtBQUNIOzs7Ozs7OzsrQkFNTSxJLEVBQU07QUFDVixvQkFBUSxHQUFSLENBQVksU0FBWjs7QUFFQSxxQkFBUyxJQUFULENBQWMsSUFBZCxFQUFvQixLQUFLLFVBQXpCO0FBQ0g7Ozs2QkFFSyxJLEVBQUs7QUFDUCxvQkFBUSxHQUFSLENBQVksT0FBWjs7QUFFSDs7Ozs7Ozs7Ozs0QkFPRyxJLEVBQU07QUFDTixvQkFBUSxHQUFSLENBQVksTUFBWjs7O0FBR0g7Ozs2QkFFSyxJLEVBQU07QUFDUixvQkFBUSxHQUFSLENBQVksT0FBWjs7QUFFQSxnQkFBSSxhQUFhLFVBQVUsSUFBVixDQUFlLElBQWYsRUFBcUIsS0FBSyxVQUExQixDQUFqQjs7QUFFQSxnQkFBSSxPQUFPLEVBQVg7O0FBRUEsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxXQUFXLE1BQS9CLEVBQXVDLEdBQXZDLEVBQTRDO0FBQ3hDLG9CQUFJLE1BQU0sV0FBVyxDQUFYLENBQVY7O0FBRUEsb0JBQUksRUFBRSxLQUFGLENBQVEsS0FBSyxVQUFMLENBQWdCLFdBQXhCLEVBQXFDLElBQUksR0FBekMsQ0FBSixFQUFtRDtBQUMvQyx5QkFBSyxJQUFMLENBQVUsR0FBVjtBQUNBLHlCQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsSUFBSSxHQUFoQyxJQUF1QyxDQUF2QztBQUNILGlCQUhELE1BR087QUFDSCwyQkFBTyxLQUFLLFVBQUwsQ0FBZ0IsV0FBdkI7QUFDSDtBQUNKOztBQUVELGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsR0FBdUIsSUFBdkI7QUFDSDs7O2dDQUVRLEksRUFBTTtBQUNYLG9CQUFRLEdBQVIsQ0FBWSxVQUFaOztBQUVIOzs7Ozs7OytCQUtPLEksRUFBSztBQUNULG9CQUFRLEdBQVIsQ0FBWSxTQUFaOzs7QUFHQSxxQkFBUyxJQUFULENBQWMsSUFBZCxFQUFvQixLQUFLLFVBQXpCO0FBQ0g7Ozs7Ozs7OytCQU1PLEksRUFBSztBQUNULG9CQUFRLEdBQVIsQ0FBWSxTQUFaOztBQUVIOzs7Ozs7Ozs2QkFLSyxJLEVBQUs7QUFDUCxvQkFBUSxHQUFSLENBQVksT0FBWjs7QUFFSDs7O29DQUVZLEksRUFBSztBQUNkLG9CQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVIOzs7K0JBRU8sSSxFQUFLO0FBQ1Qsb0JBQVEsR0FBUixDQUFZLFNBQVo7O0FBRUg7OztnQ0FFUSxJLEVBQUs7QUFDVixvQkFBUSxHQUFSLENBQVksVUFBWjs7QUFFSDs7O3FDQUVhLEksRUFBSztBQUNmLG9CQUFRLEdBQVIsQ0FBWSxlQUFaOztBQUVIOzs7Z0NBRVEsSSxFQUFLO0FBQ1Ysb0JBQVEsR0FBUixDQUFZLFVBQVo7O0FBRUg7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixZQUFqQiIsImZpbGUiOiJGaWxlU3lzdGVtU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIGZzID0gcmVxdWlyZShcImZpbGUtc3lzdGVtXCIpLFxuICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG52YXIgX2RlZk9wdGlvbnMgPSB7XG4gICAgZGRiYl9wYXRoOiAnZGInXG59O1xuXG5jb25zdCBfcGVyc2lzdCA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgX3BhdGggPSBgJHt0aGlzLm9wdGlvbnMuZGRiYl9wYXRofS8ke2NvbGxlY3Rpb24ubmFtZX0uanNvbmA7XG4gICAgXG4gICAgaWYgKHRoaXMub3B0aW9ucy5zeW5jID09PSB0cnVlKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZShfcGF0aCwgSlNPTi5zdHJpbmdpZnkoY29sbGVjdGlvbi5kb2NzKSwgZXJyID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdEb2N1bWVudCBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtJyk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoX3BhdGgsIEpTT04uc3RyaW5naWZ5KGNvbGxlY3Rpb24uZG9jcykpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKCdEb2N1bWVudCBwZXJzaXN0ZWQgaW4gdGhlIGZpbGUgc3lzdGVtJyk7XG4gICAgfVxufTtcblxuY29uc3QgX2Zyb21GaWxlID0gZnVuY3Rpb24oY29sbGVjdGlvbikge1xuICAgIHZhciBfcGF0aCA9IGAke3RoaXMub3B0aW9ucy5kZGJiX3BhdGh9LyR7Y29sbGVjdGlvbi5uYW1lfS5qc29uYDtcbiAgICBcbiAgICBpZiAodGhpcy5vcHRpb25zLnN5bmMgPT09IHRydWUpIHtcbiAgICAgICAgZnMucmVhZEZpbGUoX3BhdGgsIGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29sbGVjdGlvbiByZWFkZWQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0nKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoX3BhdGgsICd1dGY4Jyk7XG5cbiAgICAgICAgY29uc29sZS5pbmZvKCdDb2xsZWN0aW9uIHJlYWRlZCBmcm9tIHRoZSBmaWxlIHN5c3RlbScpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZmlsZSk7XG4gICAgfVxufTtcblxuY2xhc3MgRmlsZVN5c1N0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGlmIChfLmlzTmlsKG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gX2RlZk9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYERhdGFiYXNlIHdpbGwgYmUgaW4gJHtvcHRpb25zLmRkYmJfcGF0aH1gKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgRERCQiBwYXRoXG4gICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLm9wdGlvbnMuZGRiYl9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKioqKioqKlxuICAgICAqIENPTExFQ1RJT05TICpcbiAgICAgKioqKioqKioqKioqKioqL1xuICAgICBcbiAgICAgY3JlYXRlQ29sbGVjdGlvbihhcmdzKSB7XG4gICAgICAgICBjb25zb2xlLmxvZygnI2NyZWF0ZUNvbGxlY3Rpb24nKTtcbiAgICAgfVxuXG4gICAgLyoqKioqKioqKipcbiAgICAgKiBDUkVBVEUgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIGluc2VydCAoYXJncykge1xuICAgICAgICBjb25zb2xlLmxvZygnI2luc2VydCcpO1xuICAgICAgICAgICAgXG4gICAgICAgIF9wZXJzaXN0LmNhbGwodGhpcywgYXJncy5jb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgc2F2ZSAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjc2F2ZScpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqKioqKioqKipcbiAgICAgKiAgUkVBRCAgKlxuICAgICAqKioqKioqKioqL1xuICAgIFxuICAgIC8vIENhbGxlZCBmb3IgYWxsXG4gICAgYWxsKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyNhbGwnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICBmaW5kIChhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjZmluZCcpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBfZnJvbUZpbGUuY2FsbCh0aGlzLCBhcmdzLmNvbGxlY3Rpb24pO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRvY3MgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRvYyA9IGNvbGxlY3Rpb25baV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChfLmhhc0luKGFyZ3MuY29sbGVjdGlvbi5kb2NfaW5kZXhlcywgZG9jLl9pZCkpIHtcbiAgICAgICAgICAgICAgICBkb2NzLnB1c2goZG9jKTtcbiAgICAgICAgICAgICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jX2luZGV4ZXNbZG9jLl9pZF0gPSBpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXJncy5jb2xsZWN0aW9uLmRvY19pbmRleGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhcmdzLmNvbGxlY3Rpb24uZG9jcyA9IGRvY3M7XG4gICAgfVxuICAgIFxuICAgIGZpbmRPbmUgKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyNmaW5kT25lJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICAvKioqKioqKioqKlxuICAgICAqIFVQREFURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgIFxuICAgIHVwZGF0ZSAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjdXBkYXRlJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgICAgICBcbiAgICAgICAgX3BlcnNpc3QuY2FsbCh0aGlzLCBhcmdzLmNvbGxlY3Rpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKioqKioqKioqKlxuICAgICAqIERFTEVURSAqXG4gICAgICoqKioqKioqKiovXG4gICAgXG4gICAgcmVtb3ZlIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNyZW1vdmUnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8qKioqKioqKioqXG4gICAgICogT1RIRVJTICpcbiAgICAgKioqKioqKioqKi9cbiAgICBvcGVuIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNvcGVuJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICBlbnN1cmVJbmRleCAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjZW5zdXJlSW5kZXgnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJncyk7XG4gICAgfVxuICAgIFxuICAgIGJhY2t1cCAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjYmFja3VwJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICBiYWNrdXBzIChhcmdzKXtcbiAgICAgICAgY29uc29sZS5sb2coJyNiYWNrdXBzJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVCYWNrdXAgKGFyZ3Mpe1xuICAgICAgICBjb25zb2xlLmxvZygnI3JlbW92ZUJhY2t1cCcpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICB9XG4gICAgXG4gICAgcmVzdG9yZSAoYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjcmVzdG9yZScpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcmdzKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c1N0b3JlOyJdfQ==
