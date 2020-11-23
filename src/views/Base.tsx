import React from "react";

export type TitleProp = {
    title: ""
}

export class BaseComponent<P extends TitleProp = TitleProp, S={}> extends React.Component<P, S> {
    private previousTitle?: string;
    componentDidMount() {
        if (this.props.title !== undefined) {
            this.previousTitle = document.title;
            document.title = this.props.title;
        }
    }
    componentWillUnmount() {
        if (this.previousTitle !== undefined) {
            document.title = this.previousTitle;
        }
    }
    render() {
        return this.props.children;
    }
}
