import React from "react";

type TitleProp = {
    title?: ""
}

export class BaseComponent extends React.Component<TitleProp> {
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
