(function() {
    var copy, events, fetchColor, fetchValue, legible, textColor;

    copy = require("../../../../../util/copy.js");

    events = require("../../../../../client/pointer.js");

    fetchColor = require("../../../../../core/fetch/color.js");

    fetchValue = require("../../../../../core/fetch/value.js");

    legible = require("../../../../../color/legible.js");

    textColor = require("../../../../../color/text.js");

    module.exports = function(node, vars) {
        var clickRemove, color, create, graph, lineData, lineInit, lineStyle, lineUpdate, lines, margin, r, rectStyle, rects, s, textStyle, texts, timing, x, y;
        clickRemove = d3.event.type === events.click && (vars.tooltip.value.long || vars.tooltip.html.value);
        create = [events.over, events.move].indexOf(d3.event.type) >= 0;
        x = node.d3po.x;
        y = node.d3po.y;
        r = node.d3po.r || 0;
        s = vars.types[vars.type.value].scale || 1;
        r = r * s;
        graph = vars.axes;
        margin = vars.axes.margin.viz;
        timing = vars.draw.timing ? vars.timing.mouseevents : 0;
        if (!clickRemove && create) {
            color = legible(fetchColor(vars, node));
            lineData = ["x", "y", "x2", "y2"].filter(function(axis) {
                var val;
                val = fetchValue(vars, node, vars[axis].value);
                return val && !(val instanceof Array) && axis !== vars.axes.stacked && vars[axis].mouse.value;
            });
        } else {
            lineData = [];
        }
        lineInit = function(line) {
            return line.attr("x1", function(d) {
                if (d.indexOf("x") === 0) {
                    return x;
                } else {
                    return x - r;
                }
            }).attr("y1", function(d) {
                if (d.indexOf("y") === 0) {
                    return y;
                } else {
                    return y + r;
                }
            }).attr("x2", function(d) {
                if (d.indexOf("x") === 0) {
                    return x;
                } else {
                    return x - r;
                }
            }).attr("y2", function(d) {
                if (d.indexOf("y") === 0) {
                    return y;
                } else {
                    return y + r;
                }
            }).attr("opacity", 0);
        };
        lineStyle = function(line) {
            return line.style("stroke", function(d) {
                if (vars.shape.value === "area") {
                    return "white";
                } else {
                    return color;
                }
            }).attr("stroke-dasharray", function(d) {
                return vars[d].mouse.dasharray.value;
            }).attr("shape-rendering", function(d) {
                return vars[d].mouse.rendering.value;
            }).style("stroke-width", function(d) {
                return vars[d].mouse.width;
            });
        };
        lineUpdate = function(line) {
            return line.attr("x1", function(d) {
                if (d.indexOf("x") === 0) {
                    return x;
                } else {
                    return x - r;
                }
            }).attr("y1", function(d) {
                if (d.indexOf("y") === 0) {
                    return y;
                } else {
                    return y + r;
                }
            }).attr("x2", function(d) {
                if (d.indexOf("x") === 0) {
                    return x;
                } else if (node.d3po.x0) {
                    return node.d3po.x0;
                } else if (d === "y") {
                    return margin.left - vars[d].ticks.size;
                } else {
                    return margin.left + graph.width + vars[d].ticks.size;
                }
            }).attr("y2", function(d) {
                if (d.indexOf("y") === 0) {
                    return y;
                } else if (node.d3po.y0) {
                    return node.d3po.y0;
                } else if (d === "x") {
                    return graph.height + margin.top + vars[d].ticks.size;
                } else {
                    return margin.top - vars[d].ticks.size;
                }
            }).style("opacity", 1);
        };
        lines = vars.g.labels.selectAll("line.d3po_mouse_axis_label").data(lineData);
        if (timing) {
            lines.enter().append("line").attr("class", "d3po_mouse_axis_label").attr("pointer-events", "none").call(lineInit).call(lineStyle);
            lines.transition().duration(timing).call(lineUpdate).call(lineStyle);
            lines.exit().transition().duration(timing).call(lineInit).remove();
        } else {
            lines.call(lineUpdate).call(lineStyle);
            lines.enter().append("line").attr("class", "d3po_mouse_axis_label").attr("pointer-events", "none").call(lineInit).call(lineStyle);
            lines.exit().remove();
        }
        textStyle = function(text) {
            return text.attr("font-size", function(d) {
                return vars[d].ticks.font.size + "px";
            }).attr("font-family", function(d) {
                return vars[d].ticks.font.family.value;
            }).attr("font-weight", function(d) {
                return vars[d].ticks.font.weight;
            }).attr("x", function(d) {
                if (d.indexOf("x") === 0) {
                    return x;
                } else if (d === "y") {
                    return margin.left - 5 - vars[d].ticks.size;
                } else {
                    return margin.left + graph.width + 5 + vars[d].ticks.size;
                }
            }).attr("y", function(d) {
                if (d.indexOf("y") === 0) {
                    return y;
                } else if (node.d3po.y0) {
                    return node.d3po.y + (node.d3po.y0 - node.d3po.y) / 2 + margin.top - 6;
                } else if (d === "x") {
                    return graph.height + margin.top + 5 + vars[d].ticks.size;
                } else {
                    return margin.top - 5 - vars[d].ticks.size - (vars[d].ticks.font.size * 1.35);
                }
            }).attr("fill", vars.shape.value === "area" ? "white" : textColor(color));
        };
        texts = vars.g.labels.selectAll("text.d3po_mouse_axis_label").data(lineData);
        texts.enter().append("text").attr("class", "d3po_mouse_axis_label").attr("id", function(d) {
            return d + "_d3pomouseaxislabel";
        }).attr("dy", function(d) {
            if (d.indexOf("y") === 0) {
                return vars[d].ticks.font.size * 0.35;
            } else {
                return vars[d].ticks.font.size;
            }
        }).style("text-anchor", function(d) {
            if (d === "y") {
                return "end";
            } else if (d === "y2") {
                return "start";
            } else {
                return "middle";
            }
        }).attr("opacity", 0).attr("pointer-events", "none").call(textStyle);
        texts.text(function(d) {
            var axis, val;
            axis = vars.axes.stacked || d;
            val = fetchValue(vars, node, vars[axis].value);
            return vars.format.value(val, {
                key: vars[axis].value,
                vars: vars,
                labels: vars[axis].affixes.value
            });
        });
        if (timing) {
            texts.transition().duration(timing).delay(timing).attr("opacity", 1).call(textStyle);
            texts.exit().transition().duration(timing).attr("opacity", 0).remove();
        } else {
            texts.attr("opacity", 1).call(textStyle);
            texts.exit().remove();
        }
        rectStyle = function(rect) {
            var getText;
            getText = function(axis) {
                var l;
                l = d3.select("text#" + axis + "_d3pomouseaxislabel");
                if (l.size()) {
                    return l.node().getBBox();
                } else {
                    return {
                        "width": 0,
                        "height": 0
                    };
                }
            };
            return rect.attr("x", function(d) {
                var width;
                width = getText(d).width;
                if (d.indexOf("x") === 0) {
                    return x - width / 2 - 5;
                } else if (d === "y") {
                    return margin.left - vars[d].ticks.size - width - 10;
                } else {
                    return margin.left + graph.width + vars[d].ticks.size;
                }
            }).attr("y", function(d) {
                var height;
                height = getText(d).height;
                if (d.indexOf("y") === 0) {
                    return y - (height / 2 + 5);
                } else if (node.d3po.y0) {
                    return node.d3po.y + (node.d3po.y0 - node.d3po.y) / 2 + margin.top - (height / 2 + 5);
                } else if (d === "x") {
                    return graph.height + margin.top + vars[d].ticks.size;
                } else {
                    return margin.top - vars[d].ticks.size - height - 10;
                }
            }).attr("width", function(d) {
                return getText(d).width + 10;
            }).attr("height", function(d) {
                return getText(d).height + 10;
            }).style("stroke", vars.shape.value === "area" ? "transparent" : color).attr("fill", color).attr("shape-rendering", function(d) {
                return vars[d].mouse.rendering.value;
            }).style("stroke-width", function(d) {
                return vars[d].mouse.width;
            });
        };
        rects = vars.g.labels.selectAll("rect.d3po_mouse_axis_label").data(lineData);
        if (timing) {
            rects.enter().insert("rect", "text.d3po_mouse_axis_label").attr("class", "d3po_mouse_axis_label").attr("pointer-events", "none").attr("opacity", 0).call(rectStyle);
            rects.transition().duration(timing).delay(timing).attr("opacity", 1).call(rectStyle);
            return rects.exit().transition().duration(timing).attr("opacity", 0).remove();
        } else {
            rects.attr("opacity", 1).call(rectStyle);
            rects.enter().insert("rect", "text.d3po_mouse_axis_label").attr("class", "d3po_mouse_axis_label").attr("pointer-events", "none").call(rectStyle);
            return rects.exit().remove();
        }
    };

}).call(this);