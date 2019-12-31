(function() {
    var buckets, buffer, createAxis, fetchValue, fontSizes, formatPower, labelPadding, superscript, textwrap, timeDetect, uniques;

    buckets = require("../../../../../util/buckets.js");

    buffer = require("./buffer.js");

    fetchValue = require("../../../../../core/fetch/value.js");

    fontSizes = require("../../../../../font/sizes.js");

    textwrap = require("../../../../../textwrap/textwrap.js");

    timeDetect = require("../../../../../core/data/time.js");

    uniques = require("../../../../../util/uniques.js");

    module.exports = function(vars, opts) {
        var axes, axis, axisStyle, extent, j, k, l, len, len1, len2, newtick, opp, otherScale, scale, step, tens, tick, ticks, timeReturn, values;
        vars.axes.margin.viz = {
            top: vars.axes.margin.top,
            right: vars.axes.margin.right,
            bottom: vars.axes.margin.bottom,
            left: vars.axes.margin.left
        };
        vars.axes.height = vars.height.viz;
        vars.axes.width = vars.width.viz;
        axes = vars.width.viz > vars.height.viz ? ["y", "y2", "x", "x2"] : ["x", "x2", "y", "y2"];
        for (j = 0, len = axes.length; j < len; j++) {
            axis = axes[j];
            if (vars[axis].value) {
                if (vars[axis].ticks.values === false) {
                    if (vars[axis].value === vars.time.value) {
                        ticks = vars.time.solo.value;
                        if (ticks.length) {
                            ticks = ticks.map(function(d) {
                                if (d.constructor !== Date) {
                                    d = d + "";
                                    if (d.length === 4 && parseInt(d) + "" === d) {
                                        d += "/01/01";
                                    }
                                    d = new Date(d);
                                }
                                return d;
                            });
                        } else {
                            ticks = vars.data.time.values;
                        }
                        extent = d3.extent(ticks);
                        step = vars.data.time.stepType;
                        ticks = [extent[0]];
                        tick = extent[0];
                        while (tick < extent[1]) {
                            newtick = new Date(tick);
                            tick = new Date(newtick["set" + step](newtick["get" + step]() + 1));
                            ticks.push(tick);
                        }
                        vars[axis].ticks.values = ticks;
                    } else {
                        if (axis.indexOf("2") === 1) {
                            otherScale = vars[axis.slice(0, 1)].scale.viz;
                            scale = vars[axis].scale.viz;
                            ticks = vars[axis.slice(0, 1)].scale.ticks;
                            vars[axis].ticks.values = otherScale.ticks(ticks).map(function(t) {
                                return parseFloat(d3.format(".5f")(scale.invert(otherScale(t))));
                            });
                        } else {
                            vars[axis].ticks.values = vars[axis].scale.viz.ticks(vars[axis].scale.ticks);
                        }
                    }
                }
                if (!vars[axis].ticks.values.length) {
                    values = fetchValue(vars, vars.data.viz, vars[axis].value);
                    if (!(values instanceof Array)) {
                        values = [values];
                    }
                    vars[axis].ticks.values = values;
                }
                opp = axis.indexOf("x") === 0 ? "y" : "x";
                if (vars[axis].ticks.values.length === 1 || (opts.buffer && opts.buffer !== opp && axis === vars.axes.discrete && vars[axis].reset === true)) {
                    buffer(vars, axis, opts.buffer);
                }
                vars[axis].reset = false;
                if (vars[axis].value === vars.time.value) {
                    axisStyle = {
                        "font-family": vars[axis].ticks.font.family.value,
                        "font-weight": vars[axis].ticks.font.weight,
                        "font-size": vars[axis].ticks.font.size + "px",
                        "text-transform": vars[axis].ticks.font.transform.value,
                        "letter-spacing": vars[axis].ticks.font.spacing + "px"
                    };
                    timeReturn = timeDetect(vars, {
                        values: vars[axis].ticks.values,
                        limit: vars.width.viz,
                        style: axisStyle
                    });
                    if (vars[axis].ticks.value) {
                        vars[axis].ticks.visible = vars[axis].ticks.value.map(Number);
                    } else if (vars[axis].ticks.labels.value.constructor === Array) {
                        vars[axis].ticks.visible = vars[axis].ticks.labels.value.map(Number);
                    } else {
                        vars[axis].ticks.visible = timeReturn.values.map(Number);
                    }
                    vars[axis].ticks.format = timeReturn.format;
                } else if (vars[axis].ticks.value) {
                    vars[axis].ticks.values = vars[axis].ticks.value;
                    if (vars[axis].ticks.labels.value.constructor === Array) {
                        vars[axis].ticks.visible = vars[axis].ticks.labels.value;
                    } else {
                        vars[axis].ticks.visible = vars[axis].ticks.value;
                    }
                } else if (vars[axis].ticks.labels.value.constructor === Array) {
                    vars[axis].ticks.visible = vars[axis].ticks.labels.value;
                } else if (vars[axis].scale.value === "log") {
                    ticks = vars[axis].ticks.values;
                    tens = ticks.filter(function(t) {
                        return Math.abs(t).toString().charAt(0) === "1";
                    });
                    if (tens.length < 3) {
                        vars[axis].ticks.visible = ticks;
                    } else {
                        vars[axis].ticks.visible = tens;
                    }
                } else {
                    vars[axis].ticks.visible = vars[axis].ticks.values;
                }
                if (vars[axis].value === vars.time.value) {
                    vars[axis].ticks.visible = vars[axis].ticks.visible.map(function(d) {
                        if (d.constructor === Number && ("" + d).length > 4) {
                            return d;
                        }
                        d += "";
                        if (d.length === 4 && parseInt(d) + "" === d) {
                            d += "/01/01";
                        }
                        return new Date(d).getTime();
                    });
                }
            }
        }
        if (vars.small) {
            vars.axes.width -= vars.axes.margin.viz.left + vars.axes.margin.viz.right;
            vars.axes.height -= vars.axes.margin.viz.top + vars.axes.margin.viz.bottom;
            for (k = 0, len1 = axes.length; k < len1; k++) {
                axis = axes[k];
                vars[axis].label.height = 0;
            }
        } else {
            if (!vars.small) {
                labelPadding(vars);
            }
        }
        for (l = 0, len2 = axes.length; l < len2; l++) {
            axis = axes[l];
            vars[axis].axis.svg = createAxis(vars, axis);
        }
    };

    labelPadding = function(vars) {
        var axis, j, k, lastTick, len, len1, margin, ref, ref1, rightLabel, rightMod, x2Domain, xAttrs, xAxisHeight, xAxisWidth, xDomain, xLabel, xLabelAttrs, xMaxWidth, xSizes, xText, xValues, y2Domain, yAttrs, yAxisWidth, yDomain, yLabel, yLabelAttrs, yText, yValues;
        xDomain = vars.x.scale.viz.domain();
        yDomain = vars.y.scale.viz.domain();
        if (vars.x2.value) {
            x2Domain = vars.x2.scale.viz.domain();
        }
        if (vars.y2.value) {
            y2Domain = vars.y2.scale.viz.domain();
        }
        ref = ["y", "y2"];
        for (j = 0, len = ref.length; j < len; j++) {
            axis = ref[j];
            if (vars[axis].value) {
                margin = axis === "y" ? "left" : "right";
                yAttrs = {
                    "font-size": vars[axis].ticks.font.size + "px",
                    "font-family": vars[axis].ticks.font.family.value,
                    "font-weight": vars[axis].ticks.font.weight,
                    "text-transform": vars[axis].ticks.font.transform.value,
                    "letter-spacing": vars[axis].ticks.font.spacing + "px"
                };
                yValues = vars[axis].ticks.visible;
                if (vars[axis].scale.value === "log") {
                    yText = yValues.map(function(d) {
                        return formatPower(d);
                    });
                } else if (vars[axis].scale.value === "share") {
                    yText = yValues.map(function(d) {
                        return vars.format.value(d * 100, {
                            key: "share",
                            vars: vars,
                            output: axis
                        });
                    });
                } else if (vars[axis].value === vars.time.value) {
                    yText = yValues.map(function(d, i) {
                        return vars[axis].ticks.format(new Date(d));
                    });
                } else {
                    if (typeof yValues[0] === "string") {
                        yValues = vars[axis].scale.viz.domain().filter(function(d) {
                            return d.indexOf("d3po_buffer_") !== 0;
                        });
                    }
                    yText = yValues.map(function(d) {
                        return vars.format.value(d, {
                            key: vars[axis].value,
                            vars: vars,
                            labels: vars[axis].affixes.value,
                            output: axis
                        });
                    });
                }
                if (vars[axis].ticks.labels.value) {
                    vars[axis].ticks.hidden = false;
                    yAxisWidth = d3.max(fontSizes(yText, yAttrs), function(d) {
                        return d.width;
                    });
                    if (yAxisWidth) {
                        yAxisWidth = Math.ceil(yAxisWidth + vars.labels.padding);
                        vars.axes.margin.viz[margin] += yAxisWidth;
                    }
                } else {
                    vars[axis].ticks.hidden = true;
                }
                yLabel = vars[axis].label.fetch(vars);
                if (yLabel) {
                    yLabelAttrs = {
                        "font-family": vars[axis].label.font.family.value,
                        "font-weight": vars[axis].label.font.weight,
                        "font-size": vars[axis].label.font.size + "px",
                        "text-transform": vars[axis].label.font.transform.value,
                        "letter-spacing": vars[axis].label.font.spacing + "px"
                    };
                    vars[axis].label.height = fontSizes([yLabel], yLabelAttrs)[0].height;
                } else {
                    vars[axis].label.height = 0;
                }
                if (vars[axis].label.value) {
                    vars.axes.margin.viz[margin] += vars[axis].label.height;
                    vars.axes.margin.viz[margin] += vars[axis].label.padding * 2;
                }
            }
        }
        vars.axes.width -= vars.axes.margin.viz.left + vars.axes.margin.viz.right;
        vars.x.scale.viz.range(buckets([0, vars.axes.width], xDomain.length));
        if (x2Domain) {
            vars.x2.scale.viz.range(buckets([0, vars.axes.width], x2Domain.length));
        }
        ref1 = ["x", "x2"];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            axis = ref1[k];
            if (vars[axis].value) {
                margin = axis === "x" ? "bottom" : "top";
                if (vars[axis].ticks.labels.value) {
                    vars[axis].ticks.hidden = false;
                    xAttrs = {
                        "font-size": vars[axis].ticks.font.size + "px",
                        "font-family": vars[axis].ticks.font.family.value,
                        "font-weight": vars[axis].ticks.font.weight,
                        "text-transform": vars[axis].ticks.font.transform.value,
                        "letter-spacing": vars[axis].ticks.font.spacing + "px"
                    };
                    xValues = vars[axis].ticks.visible;
                    if (vars[axis].scale.value === "log") {
                        xText = xValues.map(function(d) {
                            return formatPower(d);
                        });
                    } else if (vars[axis].scale.value === "share") {
                        xText = xValues.map(function(d) {
                            return vars.format.value(d * 100, {
                                key: "share",
                                vars: vars,
                                output: axis
                            });
                        });
                    } else if (vars[axis].value === vars.time.value) {
                        xText = xValues.map(function(d, i) {
                            return vars[axis].ticks.format(new Date(d));
                        });
                    } else {
                        if (typeof xValues[0] === "string") {
                            xValues = vars[axis].scale.viz.domain().filter(function(d) {
                                return d.indexOf("d3po_buffer_") !== 0;
                            });
                        }
                        xText = xValues.map(function(d) {
                            return vars.format.value(d, {
                                key: vars[axis].value,
                                vars: vars,
                                labels: vars[axis].affixes.value,
                                output: axis
                            });
                        });
                    }
                    xSizes = fontSizes(xText, xAttrs);
                    xAxisWidth = d3.max(xSizes, function(d) {
                        return d.width;
                    });
                    xAxisHeight = d3.max(xSizes, function(d) {
                        return d.height;
                    });
                    if (xValues.length === 1) {
                        xMaxWidth = vars.axes.width;
                    } else {
                        xMaxWidth = vars[axis].scale.viz(xValues[1]) - vars[axis].scale.viz(xValues[0]);
                        xMaxWidth = Math.abs(xMaxWidth);
                    }
                    if (xAxisWidth > xMaxWidth && xText.join("").indexOf(" ") > 0) {
                        vars[axis].ticks.wrap = true;
                        xSizes = fontSizes(xText, xAttrs, {
                            mod: function(elem) {
                                return textwrap().container(d3.select(elem)).height(vars.axes.height / 2).width(xMaxWidth).draw();
                            }
                        });
                        xAxisWidth = d3.max(xSizes, function(d) {
                            return d.width;
                        });
                        xAxisHeight = d3.max(xSizes, function(d) {
                            return d.height;
                        });
                    } else {
                        vars[axis].ticks.wrap = false;
                    }
                    vars[axis].ticks.baseline = "auto";
                    if (xAxisWidth <= xMaxWidth) {
                        vars[axis].ticks.rotate = 0;
                    } else if (xAxisWidth < vars.axes.height / 2) {
                        xSizes = fontSizes(xText, xAttrs, {
                            mod: function(elem) {
                                return textwrap().container(d3.select(elem)).width(vars.axes.height / 2).height(xMaxWidth).draw();
                            }
                        });
                        xAxisHeight = d3.max(xSizes, function(d) {
                            return d.width;
                        });
                        xAxisWidth = d3.max(xSizes, function(d) {
                            return d.height;
                        });
                        vars[axis].ticks.rotate = -90;
                    } else {
                        xAxisWidth = 0;
                        xAxisHeight = 0;
                    }
                    if (!(xAxisWidth && xAxisHeight)) {
                        vars[axis].ticks.hidden = true;
                        vars[axis].ticks.rotate = 0;
                    }
                    xAxisWidth = Math.ceil(xAxisWidth);
                    xAxisHeight = Math.ceil(xAxisHeight);
                    vars[axis].ticks.maxHeight = xAxisHeight;
                    vars[axis].ticks.maxWidth = xAxisWidth;
                    if (xAxisHeight) {
                        vars.axes.margin.viz[margin] += xAxisHeight + vars.labels.padding;
                    }
                    lastTick = vars[axis].ticks.visible[vars[axis].ticks.visible.length - 1];
                    rightLabel = vars[axis].scale.viz(lastTick);
                    rightLabel += xAxisWidth / 2 + vars.axes.margin.viz.left;
                    if (rightLabel > vars.width.value) {
                        rightMod = rightLabel - vars.width.value + vars.axes.margin.viz.right;
                        vars.axes.width -= rightMod;
                        vars.axes.margin.viz.right += rightMod;
                    }
                } else {
                    vars[axis].ticks.hidden = true;
                }
                xLabel = vars[axis].label.fetch(vars);
                if (xLabel) {
                    xLabelAttrs = {
                        "font-family": vars[axis].label.font.family.value,
                        "font-weight": vars[axis].label.font.weight,
                        "font-size": vars[axis].label.font.size + "px",
                        "text-transform": vars[axis].label.font.transform.value,
                        "letter-spacing": vars[axis].label.font.spacing + "px"
                    };
                    vars[axis].label.height = fontSizes([xLabel], xLabelAttrs)[0].height;
                } else {
                    vars[axis].label.height = 0;
                }
                if (vars[axis].label.value) {
                    vars.axes.margin.viz[margin] += vars[axis].label.height;
                    vars.axes.margin.viz[margin] += vars[axis].label.padding * 2;
                }
            }
        }
        vars.axes.height -= vars.axes.margin.viz.top + vars.axes.margin.viz.bottom;
        vars.x.scale.viz.range(buckets([0, vars.axes.width], xDomain.length));
        if (x2Domain) {
            vars.x2.scale.viz.range(buckets([0, vars.axes.width], x2Domain.length));
        }
        vars.y.scale.viz.range(buckets([0, vars.axes.height], yDomain.length));
        if (y2Domain) {
            return vars.y2.scale.viz.range(buckets([0, vars.axes.height], y2Domain.length));
        }
    };

    createAxis = function(vars, axis) {
        return d3.svg.axis().tickSize(vars[axis].ticks.size).tickPadding(5).orient(vars[axis].orient.value).scale(vars[axis].scale.viz).tickValues(vars[axis].ticks.values).tickFormat(function(d, i) {
            var c, scale;
            if (vars[axis].ticks.hidden) {
                return null;
            }
            scale = vars[axis].scale.value;
            c = d.constructor === Date ? +d : d;
            if (vars[axis].ticks.visible.indexOf(c) >= 0) {
                if (scale === "share") {
                    return vars.format.value(d * 100, {
                        key: "share",
                        vars: vars,
                        labels: vars[axis].affixes.value,
                        output: axis
                    });
                } else if (d.constructor === Date) {
                    return vars[axis].ticks.format(d);
                } else if (scale === "log") {
                    return formatPower(d);
                } else {
                    return vars.format.value(d, {
                        key: vars[axis].value,
                        vars: vars,
                        labels: vars[axis].affixes.value,
                        output: axis
                    });
                }
            } else {
                return null;
            }
        });
    };

    superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹";

    formatPower = function(d) {
        var n, p, t;
        p = Math.round(Math.log(Math.abs(d)) / Math.LN10);
        t = Math.abs(d).toString().charAt(0);
        n = 10 + " " + (p + "").split("").map(function(c) {
            return superscript[c];
        }).join("");
        if (t !== "1") {
            n = t + " x " + n;
        }
        if (d < 0) {
            return "-" + n;
        } else {
            return n;
        }
    };

}).call(this);