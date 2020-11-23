import React from "react";

import { Container, Row, Col, Button, Card } from "react-bootstrap";

import { BaseComponent, TitleProp } from "./Base";
import { DefaultPadding } from "../components/Padding"

import { ec } from "elliptic";


let EC = new ec("p256");

type NotificateState = {
    ServiceWorkerScriptURL?: string
    PushSubscriptionObject?: PushSubscription
}

export class PushNotification extends BaseComponent<TitleProp, NotificateState> {
    private supported = ('Notification' in window && !!navigator.serviceWorker);

    constructor(props: TitleProp) {
        super(props);

        this.state = {}
    }

    async queryNotificationState() {
        if (this.supported) {
            let registration = await navigator.serviceWorker.getRegistration();

            this.setState({
                ServiceWorkerScriptURL: navigator.serviceWorker.controller?.scriptURL,
                PushSubscriptionObject: (await registration?.pushManager.getSubscription()) || undefined
            })
        }
    }

    componentDidMount() {
        this.queryNotificationState()
    }

    render() {
        if (!this.supported) {
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Not Supported</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <Row>
                                                <Col>Your browser doesnot sastify the minimal requirement of push notification.</Col>
                                            </Row>
                                            <Row>
                                                <Col>HTTPS?: {String(window.location.protocol.toLowerCase() === "https")}</Col>
                                            </Row>
                                            <Row>
                                                <Col>'Notification' in window: {String('Notification' in window)}</Col>
                                            </Row>
                                            <Row>
                                                <Col>navigator.serviceWorker: {String(Boolean(navigator.serviceWorker))}</Col>
                                            </Row>
                                        </Container>
                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding><Button color="primary" onClick={() => window.location.assign("https://cn.bing.com/search?q=browsers")}>Download Another Browser and Try Again</Button></DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        }
        if (!this.state.ServiceWorkerScriptURL) {
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Service Worker not running</Card.Header>
                                    <Card.Body>Please reload and try again</Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding><Button color="primary" onClick={() => window.location.assign("https://cn.bing.com/search?q=browsers")}>Download Another Browser and Try Again</Button></DefaultPadding>
                                        <DefaultPadding><Button color="primary" onClick={() => window.location.reload()}>Reload Page</Button></DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        }
        if (Notification.permission !== "granted") {
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Notification Permission Denied</Card.Header>
                                    <Card.Body>Push Notification need Notificate Permission.</Card.Body>
                                    <Card.Footer>
                                        <Button onClick={async () => {
                                            await Notification.requestPermission()
                                            this.queryNotificationState()
                                        }}>Grant Permission</Button>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        }

        if (this.state.PushSubscriptionObject) {
            let subscription = this.state.PushSubscriptionObject;
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Subscribed</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <Row>
                                                <Col>
                                                    Private Key: {localStorage.getItem("push.privkey")}
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    {JSON.stringify(subscription.toJSON())}
                                                </Col>
                                            </Row>
                                        </Container>

                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding><Button color="primary" onClick={() => {
                                            subscription.unsubscribe()
                                            this.queryNotificationState()
                                        }}>Unsubscribe</Button></DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Not Subscribed</Card.Header>
                                    <Card.Body>Click to get your subcription object!</Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding><Button color="primary" onClick={() => {
                                            navigator.serviceWorker.ready.then(async (reg) => {
                                                let keypair = EC.genKeyPair();
                                                let [priv, pub] = [keypair.getPrivate(), keypair.getPublic()];

                                                localStorage.setItem("push.privkey", priv.toJSON())
                                                let encoded = Uint8Array.from(pub.encode("array", false)).buffer;

                                                let sub = await reg.pushManager.subscribe({
                                                    userVisibleOnly: true,
                                                    applicationServerKey: encoded
                                                })
                                                if (sub) {
                                                    this.queryNotificationState();
                                                }
                                            })
                                        }}>Subscribe</Button></DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        }
    }
}

export default PushNotification;