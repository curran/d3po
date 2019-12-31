(function() {
    var filter, scale;

    filter = require("../../core/methods/filter.js");

    scale = require("../../color/scale.js");

    module.exports = {
        accepted: [false, Array, Function, Object, String],
        domain: {
            accepted: [false, Array],
            value: false
        },
        focus: "#444444",
        heatmap: ["#282F6B", "#419391", "#AFD5E8", "#EACE3F", "#B35C1E", "#B22200"],
        missing: "#eeeeee",
        mute: filter(true),
        primary: "#d74b03",
        range: ["#B22200", "#FFEE8D", "#759143"],
        scale: {
            accepted: [Array, Function, "d3po", "category10", "category20", "category20b", "category20c"],
            process: function(value) {
                if (value instanceof Array) {
                    return d3.scale.ordinal().range(value);
                } else if (value === "d3po") {
                    return scale;
                } else if (typeof value === "string") {
                    return d3.scale[value]();
                } else {
                    return value;
                }
            },
            value: "d3po"
        },
        solo: filter(true),
        secondary: "#e5b3bb",
        value: false
    };

}).call(this);