/**
 * @prettier
 */

import React from "react";

const Emoji = props => (
  <span
    className="emoji"
    role="img"
    aria-label={props.label ? props.label : ""}
    aria-hidden={props.label ? "false" : "true"}
  >
    <img src={props.symbol} width="45px"></img>
  </span>
);

export default Emoji;
