(function() {
    var d3selection;

    d3selection = require("../../util/d3selection.js");

    module.exports = {
        accepted: [false, Array, Object, String],
        element: false,
        id: "default",
        process: function(value) {
            if (value === false) {
                return d3.select("body");
            } else if (d3selection(value)) {
                return value;
            } else if (value instanceof Array) {
                return d3.select(value[0][0]);
            } else {
                this.selector = value;
                return d3.select(value);
            }
        },
        value: d3.select("body")
    };

}).call(this);