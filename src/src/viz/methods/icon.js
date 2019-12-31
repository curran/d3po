(function() {
    var process;

    process = require("../../core/methods/process/icon.js");

    module.exports = {
        accepted: [false, Array, Function, Object, String],
        back: {
            accepted: [false, String],
            fallback: "&#x276e;",
            opacity: 1,
            process: process,
            rotate: 0,
            value: "fa-angle-left"
        },
        style: {
            accepted: [Object, String],
            value: "default"
        },
        value: false
    };

}).call(this);