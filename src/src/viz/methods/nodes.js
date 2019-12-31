(function() {
    var process;

    process = require("../../core/methods/process/data.js");

    module.exports = {
        accepted: [false, Array, Function, String],
        delimiter: {
            accepted: [String],
            value: "|"
        },
        filetype: {
            accepted: [false, "json", "xml", "html", "csv", "dsv", "tsv", "txt"],
            value: false
        },
        overlap: 0.6,
        process: process,
        value: false
    };

}).call(this);