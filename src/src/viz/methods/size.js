(function() {
    var filter;

    filter = require("../../core/methods/filter.js");

    module.exports = {
        accepted: [false, Function, Number, Object, String],
        dataFilter: true,
        mute: filter(true),
        scale: {
            accepted: [Function],
            domain: {
                min: {
                    accepted: [false, Number],
                    value: false
                },
                max: {
                    accepted: [false, Number],
                    value: false
                }
            },
            range: {
                max: {
                    accepted: [Function, Number],
                    value: function(vars) {
                        return Math.floor(d3.max([d3.min([vars.width.viz, vars.height.viz]) / 15, 6]));
                    }
                },
                min: {
                    accepted: [Function, Number],
                    value: 3
                }
            },
            value: d3.scale.sqrt()
        },
        solo: filter(true),
        threshold: {
            accepted: [Boolean, Function, Number],
            value: false
        },
        value: false
    };

}).call(this);