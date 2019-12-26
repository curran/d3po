var shapeStyle = require("./style.js")
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Draws "square" and "circle" shapes using svg:rect
    //------------------------------------------------------------------------------
module.exports = function(vars, selection, enter, exit) {

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Initialize check scale on enter and exit.
    //----------------------------------------------------------------------------
    function init(paths) {
        paths.attr("d", d3.symbol().type(d3.symbolCross).size(10))
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Change scale of check on update.
    //---------------------------------------------------------------------------
    function update(paths) {
        paths.attr("d", d3.symbol().type(d3.symbolCross).size(function(d) {
            var smaller_dim = Math.min(d.d3po.width, d.d3po.height);
            return d3.scalePow().exponent(2)(smaller_dim / 2);
        }))
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // "paths" Enter
    //----------------------------------------------------------------------------
    enter.append("path").attr("class", "d3po_data")
        .call(init)
        .call(shapeStyle, vars)

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // "paths" Update
    //----------------------------------------------------------------------------
    selection.selectAll("path.d3po_data")
        .data(function(d) {
            return [d];
        })

    if (vars.draw.timing) {
        selection.selectAll("path.d3po_data")
            .transition().duration(vars.draw.timing)
            .call(update)
            .call(shapeStyle, vars)
    } else {
        selection.selectAll("path.d3po_data")
            .call(update)
            .call(shapeStyle, vars)
    }

}