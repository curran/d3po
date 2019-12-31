(function() {
    var buckets, comparator, dataThreshold, fetchText, fetchValue, fontSizes, offset, radar, sort, textwrap, uniques;

    comparator = require("../../array/comparator.js");

    sort = require("../../array/sort.js");

    dataThreshold = require("../../core/data/threshold.js");

    fetchText = require("../../core/fetch/text.js");

    fetchValue = require("../../core/fetch/value.js");

    fontSizes = require("../../font/sizes.js");

    offset = require("../../geom/offset.js");

    textwrap = require("../../textwrap/textwrap.js");

    buckets = require("../../util/buckets.js");

    uniques = require("../../util/uniques.js");

    radar = function(vars) {
        var a, a2, anchor, angle, buffer, c, center, children, d, data, first, grid, gridStyle, i, idIndex, ids, intervals, j, k, l, labelData, labelGroup, labelHeight, labelIndex, labelStyle, labelWidth, labels, len, len1, len2, len3, m, maxData, maxRadius, n, nextDepth, nextLevel, o, ov, radius, ref, ref1, righty, ringData, ringStyle, rings, second, sizes, text, textStyle, top, total, x, y;
        data = vars.data.viz;
        nextDepth = vars.depth.value + 1;
        nextLevel = vars.id.nesting[nextDepth];
        children = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
                d = data[j];
                results.push(d[nextLevel]);
            }
            return results;
        })();
        total = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = data.length; j < len; j++) {
                d = data[j];
                results.push(uniques(data, nextLevel, fetchValue, vars, nextDepth));
            }
            return results;
        })();
        total = uniques(d3.merge(total)).length;
        angle = Math.PI * 2 / total;
        maxRadius = d3.min([vars.width.viz, vars.height.viz]) / 2;
        labelHeight = 0;
        labelWidth = 0;
        labels = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = children.length; j < len; j++) {
                c = children[j];
                results.push(fetchText(vars, c, nextDepth)[0]);
            }
            return results;
        })();
        labels = uniques(d3.merge(labels));
        if (vars.labels.value) {
            first = offset(Math.PI / 2, maxRadius);
            second = offset(angle + Math.PI / 2, maxRadius);
            labelHeight = (first.x - second.x) - vars.labels.padding * 2;
            textStyle = {
                "fill": vars.x.ticks.font.color,
                "font-family": vars.x.ticks.font.family.value,
                "font-weight": vars.x.ticks.font.weight,
                "font-size": vars.x.ticks.font.size + "px"
            };
            sizes = fontSizes(labels, textStyle, {
                mod: function(elem) {
                    return textwrap().container(d3.select(elem)).width(vars.height.viz / 8).height(labelHeight).draw();
                }
            });
            labelWidth = d3.max(sizes, function(d) {
                return d.width;
            });
            maxRadius -= labelWidth;
            maxRadius -= vars.labels.padding * 2;
        }
        maxData = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = children.length; j < len; j++) {
                c = children[j];
                results.push((function() {
                    var k, len1, results1;
                    results1 = [];
                    for (k = 0, len1 = c.length; k < len1; k++) {
                        d = c[k];
                        results1.push(fetchValue(vars, d, vars.size.value));
                    }
                    return results1;
                })());
            }
            return results;
        })();
        maxData = d3.max(d3.merge(maxData));
        radius = d3.scale.linear().domain([0, maxData]).range([0, maxRadius]);
        ids = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = children.length; j < len; j++) {
                c = children[j];
                results.push(fetchValue(vars, c, nextLevel));
            }
            return results;
        })();
        ids = uniques(d3.merge(ids));
        idIndex = d3.scale.ordinal().domain(ids).range(d3.range(0, ids.length));
        for (j = 0, len = data.length; j < len; j++) {
            d = data[j];
            d.d3po.x = vars.width.viz / 2 + vars.margin.top;
            d.d3po.y = vars.height.viz / 2 + vars.margin.left;
            ref = d[nextLevel];
            for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
                a = ref[i];
                if (!a.d3po) {
                    a.d3po = {};
                }
                a.d3po.r = radius(fetchValue(vars, a, vars.size.value));
                a.d3po.a = idIndex(fetchValue(vars, a, nextLevel)) * angle;
            }
        }
        intervals = 1;
        ref1 = [10, 5, 4, 2];
        for (m = 0, len2 = ref1.length; m < len2; m++) {
            i = ref1[m];
            if (maxRadius / i >= 20) {
                intervals = i;
                break;
            }
        }
        ringData = buckets([maxRadius / intervals, maxRadius], intervals - 1).reverse();
        if (ringData.length === intervals) {
            ringData.shift();
        }
        rings = vars.group.selectAll(".d3po_radar_rings").data(ringData, function(d, i) {
            return i;
        });
        ringStyle = function(ring) {
            return ring.attr("fill", function(d, i) {
                if (i === 0) {
                    return vars.axes.background.color;
                } else {
                    return "transparent";
                }
            }).attr("cx", vars.width.viz / 2 + vars.margin.top).attr("cy", vars.height.viz / 2 + vars.margin.left).attr("stroke", vars.x.grid.value ? vars.x.grid.color : "transparent");
        };
        rings.enter().append("circle").attr("class", "d3po_radar_rings").call(ringStyle).attr("r", 0);
        rings.transition().duration(vars.draw.timing).call(ringStyle).attr("r", function(d) {
            return d;
        });
        rings.exit().transition().duration(vars.draw.timing).attr("opacity", 0).remove();
        labelIndex = d3.scale.ordinal().domain(labels).range(d3.range(0, labels.length));
        labelData = [];
        for (n = 0, len3 = labels.length; n < len3; n++) {
            l = labels[n];
            a2 = (angle * labelIndex(l)) - Math.PI / 2;
            a = a2 * (180 / Math.PI);
            if (a < -90 || a > 90) {
                a = a - 180;
                buffer = -(maxRadius + vars.labels.padding * 2 + labelWidth);
                anchor = "end";
            } else {
                buffer = maxRadius + vars.labels.padding * 2;
                anchor = "start";
            }
            top = a2 < 0 || a2 > Math.PI;
            righty = a2 < Math.PI / 2;
            ov = maxRadius;
            if (vars.labels.value) {
                ov += vars.labels.padding;
            }
            o = offset(a2, ov);
            x = o.x;
            y = o.y;
            if (!righty) {
                x -= labelWidth;
            }
            if (top) {
                y -= labelHeight;
            }
            center = [0, Math.PI].indexOf(angle * labelIndex(l)) >= 0;
            if (center) {
                x -= labelWidth / 2;
            }
            labelData.push({
                "text": l,
                "angle": a,
                "x": buffer,
                "anchor": anchor,
                "offset": o
            });
        }
        labelGroup = vars.group.selectAll("g.d3po_radar_label_group").data([0]);
        labelGroup.enter().append("g").attr("class", "d3po_radar_label_group").attr("transform", "translate(" + vars.width.viz / 2 + "," + vars.height.viz / 2 + ")");
        labelGroup.transition().duration(vars.draw.timing).attr("transform", "translate(" + vars.width.viz / 2 + "," + vars.height.viz / 2 + ")");
        text = labelGroup.selectAll(".d3po_radar_labels").data((vars.labels.value ? labelData : []), function(d, i) {
            return i;
        });
        labelStyle = function(label) {
            return label.attr(textStyle).each(function(l, i) {
                return textwrap().container(d3.select(this)).height(labelHeight).width(labelWidth).align(l.anchor).text(l.text).padding(0).valign("middle").x(l.x).y(-labelHeight / 2).draw();
            }).attr("transform", function(t) {
                var translate;
                translate = d3.select(this).attr("transform") || "";
                if (translate.length) {
                    translate = translate.split(")").slice(-3).join(")");
                }
                return "rotate(" + t.angle + ")" + translate;
            });
        };
        text.call(labelStyle);
        text.enter().append("text").attr("class", "d3po_radar_labels").attr("opacity", 0).call(labelStyle).transition().duration(vars.draw.timing).attr("opacity", 1);
        text.exit().transition().duration(vars.draw.timing).attr("opacity", 0).remove();
        grid = vars.group.selectAll(".d3po_radar_lines").data(labelData, function(d, i) {
            return i;
        });
        gridStyle = function(grid) {
            return grid.attr("stroke", vars.x.grid.color).attr("x1", vars.width.viz / 2 + vars.margin.left).attr("y1", vars.height.viz / 2 + vars.margin.top);
        };
        grid.enter().append("line").attr("class", "d3po_radar_lines").call(gridStyle).attr("x2", vars.width.viz / 2 + vars.margin.left).attr("y2", vars.height.viz / 2 + vars.margin.top);
        grid.transition().duration(vars.draw.timing).call(gridStyle).attr("x2", function(d) {
            return vars.width.viz / 2 + vars.margin.left + d.offset.x;
        }).attr("y2", function(d) {
            return vars.height.viz / 2 + vars.margin.top + d.offset.y;
        });
        grid.exit().transition().duration(vars.draw.timing).attr("opacity", 0).remove();
        vars.mouse.viz = {
            click: false
        };
        return data;
    };

    radar.requirements = ["data", "size"];

    radar.shapes = ["radial"];

    module.exports = radar;

}).call(this);