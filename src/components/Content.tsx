import React from "react";
import "./Content.sass";

export class Content extends React.Component {
    render() {
        return (<div className="content">{this.props.children}</div>)
    }
}