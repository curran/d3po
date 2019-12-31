(function() {
    var decoration, family, transform;

    decoration = require("../../core/methods/font/decoration.js");

    family = require("../../core/methods/font/family.js");

    transform = require("../../core/methods/font/transform.js");

    module.exports = {
        accepted: [Boolean],
        align: {
            accepted: ["start", "middle", "end", "left", "center", "right"],
            process: function(value) {
                var css;
                css = ["left", "center", "right"].indexOf(value);
                if (css >= 0) {
                    value = this.accepted[css];
                }
                return value;
            },
            value: "middle"
        },
        color: {
            accepted: [false, String],
            value: false
        },
        font: {
            decoration: decoration(),
            family: family(),
            size: 11,
            transform: transform(),
            weight: 400
        },
        padding: 7,
        resize: {
            accepted: [Boolean],
            value: true
        },
        text: {
            accepted: [false, Function, String],
            value: false
        },
        segments: 2,
        valign: {
            accepted: [false, "top", "middle", "bottom"],
            value: "middle"
        },
        value: true
    };

}).call(this);