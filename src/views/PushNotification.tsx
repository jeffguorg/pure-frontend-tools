import React from "react";

import { Container, Row, Col, Button, Card, InputGroup, FormControl } from "react-bootstrap";

import { BaseComponent, TitleProp } from "./Base";
import { DefaultPadding } from "../components/Padding"

import { ec } from "elliptic";

import axios from "axios"

let EC = new ec("p256");

type NotificateState = {
    ServiceWorkerScriptURL?: string
    PushSubscriptionObject?: PushSubscription
    Command?: string
    BrowserName?: string
}

type PushNotificationPageButtonTextState = {
    NodeJSCodeCopied?: boolean
    GolangCodeCopied?: boolean
}

type ErrorsState = {
    Error: string[]
}

export class PushNotification extends BaseComponent<TitleProp, NotificateState & PushNotificationPageButtonTextState & ErrorsState> {
    private supported = ('Notification' in window && !!navigator.serviceWorker);
    constructor(props: TitleProp) {
        super(props);

        this.state = { Error: [] }
    }

    async queryNotificationState() {
        if (this.supported) {
            let registration = await navigator.serviceWorker.getRegistration();

            let subscriptionObj = (await registration?.pushManager.getSubscription()) || undefined
            if (subscriptionObj) {
                let browserName = this.state.BrowserName;
                if (!browserName) {
                    try {
                        let randomUserResponse = await axios.get('https://randomuser.me/api/');
                        let randomUser = randomUserResponse.data.results[0].name;
                        browserName = `${randomUser.first} ${randomUser.last}`
                    } catch (e) {
                        browserName = "a lonely browser"
                    }
                }

                let content = JSON.stringify({
                    Browser: browserName,
                    Subscription: subscriptionObj,
                    Options: {
                        VAPIDPublicKey: Buffer.from(localStorage.getItem("push.pubkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""),
                        VAPIDPrivateKey: Buffer.from(localStorage.getItem("push.privkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""),
                    }
                })
                this.setState({
                    Command: `/register ${btoa(content).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}`
                })
            }
            this.setState({
                ServiceWorkerScriptURL: navigator.serviceWorker.controller?.scriptURL,
                PushSubscriptionObject: subscriptionObj
            })

        }
    }

    componentDidMount() {
        this.queryNotificationState()
        
        let browserName = this.state.BrowserName;
        if (!browserName) {
            try {
                axios.get('https://randomuser.me/api/').then(randomUserResponse => {
                    let randomUser = randomUserResponse.data.results[0].name;
                    browserName = `${randomUser.first} ${randomUser.last}`
                    this.setState({
                        BrowserName: browserName
                    })
                })
            } catch (e) {
                browserName = "a lonely browser"
            }
        }
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
            let NodeJSCode = `var webPush = require('web-push');

var pushSubscription = ${JSON.stringify(subscription.toJSON(), null, 4)}
var payload = 'Hi!';
var options = {
    publicKey: '${Buffer.from(localStorage.getItem("push.pubkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}', // Buffer.from("${localStorage.getItem("push.pubkey") || ""}", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
    privateKey: '${Buffer.from(localStorage.getItem("push.privkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}', // Buffer.from("${localStorage.getItem("push.privkey") || ""}", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
};

webPush.sendNotification(
    pushSubscription,
    payload,
    options
);`

            let GolangCode = `package main

import (
    "io/ioutil"
    "log"

    "github.com/SherClockHolmes/webpush-go"
)

func main() {
    subscription := webpush.Subscription{
        Endpoint: "${subscription.endpoint}",
        Keys: webpush.Keys{
            Auth:   "${(subscription.toJSON().keys as Record<string, string>)["auth"]}",
            P256dh: "${(subscription.toJSON().keys as Record<string, string>)["p256dh"]}",
        },
    }
    payload := []byte("Hi")
    resp, err := webpush.SendNotification(payload, &subscription, &webpush.Options{
        VAPIDPublicKey: "${Buffer.from(localStorage.getItem("push.pubkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}",
        VAPIDPrivateKey:  "${Buffer.from(localStorage.getItem("push.privkey") || "", "hex").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}",
    })
    if err != nil {
        log.Fatal("failed to send request: ", err)
    }
    defer resp.Body.Close()
    if resp.StatusCode/100 != 2 {
        body, _ := ioutil.ReadAll(resp.Body)
        log.Fatal("unexpected status code: ", resp.StatusCode, ", body: ", string(body))
    }
    log.Println("ok")
}
`

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
                                                    Public Key: {localStorage.getItem("push.pubkey")}
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <pre>
                                                        {JSON.stringify(subscription.toJSON(), null, 4)}
                                                    </pre>
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

                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Register this subscription to Telegram Bot @a_demo_push_notification_bot</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>Browser Name</InputGroup.Text>
                                            </InputGroup.Prepend>
                                                <FormControl type="input" value={this.state.BrowserName} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                                    this.setState({
                                                        BrowserName: ev.target.value,
                                                    })
                                                    this.queryNotificationState()
                                                }} />
                                            </InputGroup>
                                            <Row>
                                                <Col>
                                                    <DefaultPadding>
                                                        {this.state.Command}
                                                    </DefaultPadding>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding>
                                            <Button href="https://t.me/a_demo_push_notification_bot">Start Bot</Button>
                                        </DefaultPadding>

                                        <DefaultPadding>
                                            <Button onClick={() => {
                                                if (this.state.Command) {
                                                    navigator.clipboard.writeText(this.state.Command)
                                                }
                                            }}>Copy</Button>
                                        </DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Push With NodeJS(require web-push)</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <Row>
                                                <Col>
                                                    <pre id="nodejs-code">
                                                        {NodeJSCode}
                                                    </pre>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding>
                                            {
                                                this.state.NodeJSCodeCopied === undefined ? (
                                                    <Button color="primary" onClick={() => {
                                                        navigator.clipboard.writeText(NodeJSCode).then(() => {
                                                            this.setState({
                                                                NodeJSCodeCopied: true
                                                            })
                                                        }).catch(() => {
                                                            let nodejsCode = document.getElementById("nodejs-code");
                                                            if (nodejsCode) {
                                                                nodejsCode.focus();
                                                            }

                                                            this.setState({
                                                                NodeJSCodeCopied: false
                                                            })
                                                        })
                                                    }}>Copy</Button>
                                                ) : this.state.NodeJSCodeCopied ? (
                                                    <Button color="primary" onClick={() => {
                                                        navigator.clipboard.writeText(NodeJSCode).then(() => {
                                                            this.setState({
                                                                NodeJSCodeCopied: true
                                                            })
                                                        }).catch(() => {
                                                            let nodejsCode = document.getElementById("nodejs-code");
                                                            if (nodejsCode) {
                                                                nodejsCode.focus();
                                                            }

                                                            this.setState({
                                                                NodeJSCodeCopied: false
                                                            })
                                                        })
                                                    }}>Done! Paste it to your IDE or click to Copy Again!</Button>
                                                ) : (
                                                            <Button color="warn" onClick={() => {
                                                                navigator.clipboard.writeText(NodeJSCode).then(() => {
                                                                    this.setState({
                                                                        NodeJSCodeCopied: true
                                                                    })
                                                                }).catch(() => {
                                                                    let nodejsCode = document.getElementById("nodejs-code");
                                                                    if (nodejsCode) {
                                                                        nodejsCode.focus();
                                                                    }

                                                                    this.setState({
                                                                        NodeJSCodeCopied: false
                                                                    })
                                                                })
                                                            }}>Unable to copy text. Click to try again</Button>
                                                        )
                                            }
                                        </DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Push With Golang</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <Row>
                                                <Col>
                                                    <pre id="golang-code">
                                                        {GolangCode}
                                                    </pre>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding>
                                            {
                                                this.state.GolangCodeCopied === undefined ? (
                                                    <Button color="primary" onClick={() => {
                                                        navigator.clipboard.writeText(GolangCode).then(() => {
                                                            this.setState({
                                                                GolangCodeCopied: true
                                                            })
                                                        }).catch(() => {
                                                            let golangCode = document.getElementById("golang-code");
                                                            if (golangCode) {
                                                                golangCode.focus();
                                                            }

                                                            this.setState({
                                                                GolangCodeCopied: false
                                                            })
                                                        })
                                                    }}>Copy</Button>
                                                ) : this.state.GolangCodeCopied ? (
                                                    <Button color="primary" onClick={() => {
                                                        navigator.clipboard.writeText(GolangCode).then(() => {
                                                            this.setState({
                                                                GolangCodeCopied: true
                                                            })
                                                        }).catch(() => {
                                                            let golangCode = document.getElementById("golang-code");
                                                            if (golangCode) {
                                                                golangCode.focus();
                                                            }

                                                            this.setState({
                                                                GolangCodeCopied: false
                                                            })
                                                        })
                                                    }}>Done! Paste it to your IDE or click to Copy Again!</Button>
                                                ) : (
                                                            <Button color="warn" onClick={() => {
                                                                navigator.clipboard.writeText(GolangCode).then(() => {
                                                                    this.setState({
                                                                        GolangCodeCopied: true
                                                                    })
                                                                }).catch(() => {
                                                                    let golangCode = document.getElementById("golang-code");
                                                                    if (golangCode) {
                                                                        golangCode.focus();
                                                                    }

                                                                    this.setState({
                                                                        GolangCodeCopied: false
                                                                    })
                                                                })
                                                            }}>Unable to copy text. Click to try again</Button>
                                                        )
                                            }
                                        </DefaultPadding>
                                    </Card.Footer>
                                </Card>
                            </DefaultPadding>
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            let subscribeCode = `navigator.serviceWorker.ready.then(async (reg) => {
    let keypair = EC.genKeyPair(); 
    // WARN: the key pair should be generated on the server side, only the public key should be allowed to send to client side
    let [priv, pub] = [keypair.getPrivate(), keypair.getPublic()];
    localStorage.setItem("push.privkey", priv.toJSON());
    localStorage.setItem("push.pubkey", pub.encode("hex", false));
    let encoded = Uint8Array.from(pub.encode("array", false)).buffer;
    try {
        let sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: encoded
        })
        if (sub) {
            this.queryNotificationState();
        }
    } catch (e) {
        console.log("failed to subscribe push notification", e)
    }
})
`
            return (
                <Container>
                    <Row>
                        <Col>
                            <DefaultPadding>
                                <Card>
                                    <Card.Header>Not Subscribed</Card.Header>
                                    <Card.Body>
                                        <Container>
                                            <Row>
                                                <Col>
                                                    <DefaultPadding>
                                                        Click to get your subcription object! The page will execute the following script:
                                                    </DefaultPadding>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <DefaultPadding>
                                                        <pre id="golang-code">
                                                            {subscribeCode}
                                                        </pre>
                                                    </DefaultPadding>
                                                </Col>
                                            </Row>
                                            {
                                                this.state.Error.map((e) => (
                                                    <Row>
                                                        <Col>
                                                            <DefaultPadding>{e}</DefaultPadding>
                                                        </Col>
                                                    </Row>))
                                            }
                                        </Container>
                                    </Card.Body>
                                    <Card.Footer>
                                        <DefaultPadding><Button color="primary" onClick={() => {
                                            navigator.serviceWorker.ready.then(async (reg) => {
                                                let keypair = EC.genKeyPair();
                                                let [priv, pub] = [keypair.getPrivate(), keypair.getPublic()];

                                                localStorage.setItem("push.privkey", priv.toJSON())
                                                localStorage.setItem("push.pubkey", pub.encode("hex", false))
                                                let encoded = Uint8Array.from(pub.encode("array", false)).buffer;

                                                try {
                                                    let sub = await reg.pushManager.subscribe({
                                                        userVisibleOnly: true,
                                                        applicationServerKey: encoded
                                                    })
                                                    if (sub) {
                                                        this.queryNotificationState();
                                                    }
                                                } catch (e) {
                                                    console.log("failed to subscribe push notification", e)
                                                    if (e instanceof Error) {
                                                        this.setState({
                                                            Error: [...this.state.Error, `${e.message}\n${e.stack}`]
                                                        })
                                                    } else {
                                                        this.setState({
                                                            Error: [...this.state.Error, `${e}`]
                                                        })
                                                    }
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