var copy = require("../../../util/copy.js"),
    fetchColor = require("../../../core/fetch/color.js"),
    fetchValue = require("../../../core/fetch/value.js"),
    segments = require("./segments.js"),
    shapeStyle = require("./style.js");
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws "square" and "circle" shapes using svg:rect
//------------------------------------------------------------------------------
module.exports = function(vars, selection, enter, exit) {

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // The position and size of each rectangle on enter and exit.
    //----------------------------------------------------------------------------
    function init(nodes) {

        nodes
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", 0);

    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // The position and size of each rectangle on update.
    //----------------------------------------------------------------------------
    function update(nodes, mod) {
        if (!mod) mod = 0;
        nodes
            .attr("x", function(d) {
                var w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
                return (-w / 2) - (mod / 2);
            })
            .attr("y", function(d) {
                var h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
                return (-h / 2) - (mod / 2);
            })
            .attr("width", function(d) {
                var w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
                return w + mod;
            })
            .attr("height", function(d) {
                var h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
                return h + mod;
            })
            .attr("rx", function(d) {
                var w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
                var rounded = ["circle", "donut"].indexOf(vars.shape.value) >= 0;
                return rounded ? (w + mod) / 2 : 0;
            })
            .attr("ry", function(d) {
                var h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
                var rounded = ["circle", "donut"].indexOf(vars.shape.value) >= 0;
                return rounded ? (h + mod) / 2 : 0;
            })
            .attr("shape-rendering", function(d) {
                if (["square"].indexOf(vars.shape.value) >= 0) {
                    return vars.shape.rendering.value;
                } else {
                    return "auto";
                }
            });
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // In order to correctly animate each donut's size and arcs, we need to store
    // it's previous values in a lookup object that does not get destroyed when
    // redrawing the visualization.
    //----------------------------------------------------------------------------
    if (!vars.arcs) {
        vars.arcs = {
            "donut": {},
            "active": {},
            "temp": {}
        };
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // This is the main arc function that determines what values to use for each
    // arc angle and radius.
    //----------------------------------------------------------------------------
    var arc = d3.arc()
        .startAngle(0)
        .endAngle(function(d) {
            var a = vars.arcs[d.d3po.shape][d.d3po.id].a;
            return a > Math.PI * 2 ? Math.PI * 2 : a;
        })
        .innerRadius(function(d) {
            if (!d.d3po.static && vars.shape.value === "donut") {
                var r = vars.arcs[d.d3po.shape][d.d3po.id].r;
                return r * vars.data.donut.size;
            } else {
                return 0;
            }
        })
        .outerRadius(function(d) {
            var r = vars.arcs[d.d3po.shape][d.d3po.id].r;
            return vars.shape.value === "donut" ? r : r * 2;
        });

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // This is the main "arcTween" function where all of the animation happens
    // for each arc.
    //----------------------------------------------------------------------------
    function size(path, mod, rad, ang) {
        if (!mod) mod = 0;
        if (typeof rad != "number") rad = undefined;
        if (typeof ang != "number") ang = undefined;
        path.attrTween("d", function(d) {
            if (rad === undefined) var r = d.d3po.r ? d.d3po.r : d3.max([d.d3po.width, d.d3po.height]);
            else var r = rad;
            if (ang === undefined) var a = d.d3po.segments[d.d3po.shape];
            else var a = ang;
            if (!vars.arcs[d.d3po.shape][d.d3po.id]) {
                vars.arcs[d.d3po.shape][d.d3po.id] = {
                    "r": 0
                };
                vars.arcs[d.d3po.shape][d.d3po.id].a = d.d3po.shape === "donut" ? Math.PI * 2 : 0;
            }
            var radius = d3.interpolate(vars.arcs[d.d3po.shape][d.d3po.id].r, r + mod),
                angle = d3.interpolate(vars.arcs[d.d3po.shape][d.d3po.id].a, a);

            return function(t) {
                vars.arcs[d.d3po.shape][d.d3po.id].r = radius(t);
                vars.arcs[d.d3po.shape][d.d3po.id].a = angle(t);
                return arc(d);
            };
        });
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Check each data point for active and temp data
    //----------------------------------------------------------------------------
    selection.each(function(d) {

        var active = segments(vars, d, "active"),
            temp = segments(vars, d, "temp"),
            total = segments(vars, d, "total"),
            group = d3.select(this),
            color = fetchColor(vars, d);

        var fill_data = [],
            hatch_data = [];

        if (total && vars.types[vars.type.value].fill) {

            if (temp) {
                var c = copy(d);
                c.d3po.shape = "temp";
                fill_data.push(c);
                hatch_data = ["temp"];
            }

            if (active && (active < total || temp)) {
                var c = copy(d);
                c.d3po.shape = "active";
                fill_data.push(c);
            }

        }

        function hatch_lines(l) {
            l
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .attr("shape-rendering", vars.shape.rendering.value);
        }

        var pattern = vars.defs.selectAll("pattern#d3po_hatch_" + d.d3po.id)
            .data(hatch_data);

        if (vars.draw.timing) {

            pattern.selectAll("rect")
                .transition().duration(vars.draw.timing)
                .style("fill", color);

            pattern.selectAll("line")
                .transition().duration(vars.draw.timing)
                .style("stroke", color);

        } else {

            pattern.selectAll("rect").style("fill", color);

            pattern.selectAll("line").style("stroke", color);

        }

        var pattern_enter = pattern.enter().append("pattern")
            .attr("id", "d3po_hatch_" + d.d3po.id)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "10")
            .attr("height", "10")
            .append("g");

        pattern_enter.append("rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "10")
            .attr("height", "10")
            .attr("fill", color)
            .attr("fill-opacity", 0.25);

        pattern_enter.append("line")
            .attr("x1", "0")
            .attr("x2", "10")
            .attr("y1", "0")
            .attr("y2", "10")
            .call(hatch_lines);

        pattern_enter.append("line")
            .attr("x1", "-1")
            .attr("x2", "1")
            .attr("y1", "9")
            .attr("y2", "11")
            .call(hatch_lines);

        pattern_enter.append("line")
            .attr("x1", "9")
            .attr("x2", "11")
            .attr("y1", "-1")
            .attr("y2", "1")
            .call(hatch_lines);

        var clip_data = fill_data.length ? [d] : [];

        var clip = group.selectAll("#d3po_clip_" + d.d3po.id)
            .data(clip_data);

        clip.enter().insert("clipPath", ".d3po_mouse")
            .attr("id", "d3po_clip_" + d.d3po.id)
            .append("rect")
            .attr("class", "d3po_clipping")
            .call(init);

        if (vars.draw.timing) {

            clip.selectAll("rect").transition().duration(vars.draw.timing)
                .call(update);

            clip.exit().transition().delay(vars.draw.timing)
                .remove();

        } else {

            clip.selectAll("rect").call(update);

            clip.exit().remove();

        }

        var fills = group.selectAll("path.d3po_fill")
            .data(fill_data);

        fills.transition().duration(vars.draw.timing)
            .call(shapeStyle, vars)
            .call(size);

        fills.enter().insert("path", "rect.d3po_mouse")
            .attr("class", "d3po_fill")
            .attr("clip-path", "url(#d3po_clip_" + d.d3po.id + ")")
            .transition().duration(0)
            .call(shapeStyle, vars)
            .call(size, 0, undefined, 0)
            .transition().duration(vars.draw.timing)
            .call(size)
            .call(shapeStyle, vars);

        fills.exit().transition().duration(vars.draw.timing)
            .call(size, 0, undefined, 0)
            .remove();

    });

};