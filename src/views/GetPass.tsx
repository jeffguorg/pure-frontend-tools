import React from "react";

import { BaseComponent, TitleProp } from "./Base";

import { Container, Row, Col, Card, InputGroup, FormControl, Button } from "react-bootstrap";
import { wTranslation } from "../i18next"

import DefaultPadding from "../components/Padding";
import { WithTranslation } from "react-i18next";

// import argon2 from "argon2";
import bcrypt from "bcryptjs";

type GetPassProps = WithTranslation & TitleProp;
interface GetPassState {
    rounds: number;
    password: string;
    bcryptHash?: string;
    bcryptValid: boolean;
    bcryptCompare: string;
}
class Component extends BaseComponent<GetPassProps, GetPassState> {
    hashingTimer?: NodeJS.Timeout;
    bcryptCompareTimer?: NodeJS.Timeout;


    constructor(props: GetPassProps) {
        super(props);

        this.state = {
            rounds: 5,
            password: "",
            bcryptValid: false,
            bcryptCompare: "",
        };
    }

    updateBcryptHash() {
        if (this.hashingTimer !== undefined) {
            clearTimeout(this.hashingTimer)
        }

        this.hashingTimer = setTimeout(async () => {
            console.log("shit")
            this.hashingTimer = undefined;
            if (this.state.password) {
                const bcryptHash = await bcrypt.hash(this.state.password, await bcrypt.genSalt(this.state.rounds))
                this.setState({
                    bcryptHash,
                    bcryptValid: await bcrypt.compare(this.state.bcryptCompare, bcryptHash),
                })
            } else {
                this.setState({
                    bcryptHash: undefined
                })
            }
        }, 300)
    }
    updateBcryptValid() {
        if (this.bcryptCompareTimer) {
            clearTimeout(this.bcryptCompareTimer)
        }
        this.bcryptCompareTimer = setTimeout(async () => {
            if (this.state.bcryptHash !== undefined) {
                this.setState({
                    bcryptValid: await bcrypt.compare(this.state.bcryptCompare, this.state.bcryptHash),
                })
            }
            this.bcryptCompareTimer = undefined;
        }, 300);
    }
    render() {
        let { t } = this.props;
        return (
            <Container>
                <Row>
                    <Col>
                        <DefaultPadding>
                            <Card>
                                <Card.Header>{t("strings.password-hashing")} - {t("atomic.plain")}</Card.Header>
                                <Card.Body>
                                    <DefaultPadding>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <FormControl value={this.state.rounds} type="number" onChange={(ev) => {
                                                    this.setState({
                                                        rounds: parseInt(ev.target.value)
                                                    })
                                                    this.updateBcryptHash()
                                                }} />
                                            </InputGroup.Prepend>
                                            <FormControl placeholder={t("atomic.plain")} value={this.state.password} onChange={async (ev: React.ChangeEvent<HTMLInputElement>) => {
                                                this.setState({
                                                    password: ev.target.value,
                                                })
                                                this.updateBcryptHash()
                                            }} />
                                        </InputGroup>
                                    </DefaultPadding>
                                </Card.Body>
                                <Card.Footer>
                                    <DefaultPadding>
                                        <Button variant="link" target="_blank" href="https://en.wikipedia.org/wiki/Cryptographic_hash_function">{t("strings.password-hashing-wikipedia")}</Button>
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
                                <Card.Header>Bcrypt</Card.Header>
                                <Card.Body>
                                    <DefaultPadding>
                                        <FormControl placeholder={t("atomic.hash")} value={this.state.bcryptHash} onChange={(ev) => {
                                            this.setState({
                                                bcryptHash: ev.target.value,
                                            })
                                            this.updateBcryptValid()
                                        }} />
                                    </DefaultPadding>
                                    <DefaultPadding>
                                        <FormControl placeholder="Validate the password" isInvalid={!(this.state.bcryptHash === undefined || this.state.bcryptHash === "") && !this.state.bcryptValid} value={this.state.bcryptCompare} onChange={(ev) => {
                                            if (this.state.bcryptHash !== undefined) {
                                                this.setState({
                                                    bcryptCompare: ev.target.value,
                                                })
                                                this.updateBcryptValid()
                                            }
                                        }} />
                                    </DefaultPadding>
                                </Card.Body>
                            </Card>
                        </DefaultPadding>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export const GetPass = wTranslation(Component);
export default GetPass;
