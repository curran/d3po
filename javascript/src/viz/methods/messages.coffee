decoration = require "../../core/methods/font/decoration.coffee"
family     = require "../../core/methods/font/family.coffee"
transform  = require "../../core/methods/font/transform.coffee"

module.exports =
  accepted: [Boolean, String]
  background:
    accepted: [false, String]
    value: false
  font:
    color:      "#444"
    decoration: decoration()
    family:     family()
    size:       16
    transform:  transform()
    weight:     400
  padding:  5
  style:
    accepted: [false, "small", "large"]
    value:    false
  value:    true
