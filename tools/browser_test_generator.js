var Promise = require("bluebird");
var path = require("path");
var readFile = Promise.promisify(require("fs").readFile);
var writeFile = Promise.promisify(require("fs").writeFile);
var stringToStream = require("./utils.js").stringToStream;
var baseDir = path.join(__dirname, "..", "test", "browser");

module.exports = function(tests, options) {
    var testRequires = tests.map(function(test) {
        var code = "require('../mocha/" + test.name + "');";
        if (test.name.indexOf("2.3.3") >= 0) {
            code = "if (haveGetters) " + code;
        }
        return code;
    }).join("\n");

    return readFile(path.join(baseDir, "main.js"), "utf8").then(function(contents) {
        var browserify = require("browserify");
        contents = contents + "\n" + testRequires;
        var b = browserify({
            basedir: baseDir,
            entries: stringToStream(contents)
        });
        return Promise.promisify(b.bundle, b)().then(function(src) {
            return writeFile(path.join(baseDir, "bundle.js"), src);
        });
    }).then(function() {
        if (options.executeBrowserTests) {
            return require("./browser_test_runner.js")(options);
        }
    }).catch(function(e) {
        console.error(e.stack || e.message);
        process.exit(2);
    });
};
