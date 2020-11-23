import React from "react";

type PaddingProps = {
    padding?: string
    margin?: string
    paddingTop?: string
    paddingBottom?: string
    paddingLeft?: string
    paddingRight?: string
    marginTop?: string
    marginBottom?: string
    marginLeft?: string
    marginRight?: string
}

export class Padding extends React.Component<PaddingProps> {
    render() {
        return <div style={{
            display: "inline",
            ...this.props,
        }}>{this.props.children}</div>
    }
}

export class DefaultPadding extends React.Component {
    render() {
        return <Padding margin="10px">{this.props.children}</Padding>
    }
}

export default DefaultPadding