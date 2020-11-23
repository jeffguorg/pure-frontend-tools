import React from 'react';

import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Route, RouteComponentProps, withRouter } from "react-router";

import "./App.sass"

import { WithTranslation } from 'react-i18next';
import { wTranslation } from "./i18next"

import { Content } from "./components";
import { PushNotification, GetPass, AboutMe } from "./views";

class App extends React.Component<WithTranslation & RouteComponentProps> {
  readonly path = {
    notification: "/push-notification",
    getpass: "/getpass",
    about: "/about"
  };

  render() {
    let { t, i18n, location, history } = this.props;

    if (location.pathname === "/") {
      history.replace(this.path.notification);
    }

    return (
      <>
        <Navbar bg="light" expand="sm">
          <Container>
            <LinkContainer to="/"><Navbar.Brand>{t("site.title")}</Navbar.Brand></LinkContainer>
            <Navbar.Toggle aria-controls="nav" />
            <Navbar.Collapse id="nav">
              <Nav className="mr-auto">
                <LinkContainer to={this.path.notification}><Nav.Link active={location.pathname === this.path.notification}>{t("nav.push-notification")}</Nav.Link></LinkContainer>
                <LinkContainer to={this.path.getpass}><Nav.Link active={location.pathname === this.path.getpass}>{t("nav.getpass")}</Nav.Link></LinkContainer>
              </Nav>

              <Nav>
                <LinkContainer to={this.path.about}><Nav.Link active={location.pathname === this.path.about}>{t("nav.about")}</Nav.Link></LinkContainer>
                <Nav.Link onClick={() => { i18n.changeLanguage(i18n.language === "zh" ? "en" : "zh") }}>{i18n.language === "zh" ? "English" : "中文"}</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Content>
          <Route path={this.path.notification}><PushNotification title={t("nav.push-notification")} /></Route>
          <Route path={this.path.getpass}><GetPass title={t("nav.getpass")} /></Route>
          <Route path={this.path.about}><AboutMe title={t("nav.about")} /></Route>
        </Content>
      </>
    );
  }
}

export default withRouter(wTranslation(App));
