import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button, Panel, Modal} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import {css} from '@emotion/core';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from '../views/CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import RingLoader from 'react-spinners/RingLoader';
import {withRouter, Redirect} from 'react-router-dom';

import Slot from "../views/Slot";

const styles = {
    HomeContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    Container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "white",
        width: 600
    },
    CurrentGameContainer: {
        display: "flex",
        justifyContent: "center"
    },
    TicketNumbers: {
        width: 550,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        flexWrap: "wrap"
    },
    Ticket: {
        marginTop: 20,
        width: 550,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        borderColor: "#afafaf"
    },
    betButton: {
        width: 250,
        height: 50,
        marginBottom: 10,
        marginTop: 10,
        fontSize: 20,
        fontWeight: 800,
        color: "#FFFFFF",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.29)"
    },
    abortRevealButton: {
        width: 250,
        height: 50,
        marginBottom: 10,
        marginTop: 10,
        fontSize: 20,
        fontWeight: 800,
        background: "linear-gradient(0deg, #ef5350, #e53935)",
        color: "#FFFFFF",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.29)"
    },
    clearButton: {
        float: "right",
        marginRight: 15,
        marginTop: 15,
        marginBottom: -15,
        fontSize: 20,
        fontWeight: 800,
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 15
    },

    endModal : {
    position: "relative",
        top: "25vh",
        width: "50%",
        fontSize: '30px'
    }
};


class Reveal extends Component {
    async componentDidMount() {
        let chosenNumbers = await this.props.cookies.get('chosenNumbers');
        let commitTimestamps = new Date(await this.props.cookies.get('commitTimestamp'));
        if (!!chosenNumbers && commitTimestamps.toString() === this.props.timestamps['commit'].toString()) {
            this.setState({
                chosenNumbers
            })
        } else {
            this.props.cookies.remove('chosenNumbers', {path: '/'});
            this.props.cookies.remove('commitTimestamp', {path: '/'});

        }
        this.createTable()
    }

    createTable() {
        let table = [];
        for (let i = 0; i < 16; i++) {
            table.push(<Slot key={i} number={i + 1} chosenNumbers={this.state.chosenNumbers} callback={() => {
                this.chooseNumber(i + 1)
            }}/>)
        }
        this.setState({table})
    }

    chooseNumber(n) {
        let numbers = Object.assign([], this.state.chosenNumbers);
        let table = Object.assign([], this.state.table);
        //Avoid choosing twice the same number
        if (!numbers.includes(n)) {
            let lastSelected = this.state.chosenNumbers[(this.state.counter) % 2];
            numbers[this.state.counter % 2] = n;

            //update the numbers which are no longer selected
            if (lastSelected > 0) {
                table[lastSelected - 1] = (
                    <Slot key={lastSelected - 1} number={lastSelected} chosenNumbers={numbers} callback={() => {
                        this.chooseNumber(lastSelected)
                    }}/>
                );
            }
            //update the selected number
            table[n - 1] = (
                <Slot key={n - 1} number={n} chosenNumbers={numbers} callback={() => {
                    this.chooseNumber(n);
                }}/>
            );
            this.setState({
                table,
                chosenNumbers: numbers,
                counter: this.state.counter + 1
            });
        }
    }

    revealNumbers() {
        if (!this.state.chosenNumbers.includes(-1)) {
            let sortedNumbers = Object.assign([], this.state.chosenNumbers);
            sortedNumbers = sortedNumbers.sort((a, b) => {
                return a - b
            });
            let tx = Math.random() * 10000;
            this.props.contract.methods
                .reveal(sortedNumbers[0], sortedNumbers[1])
                .send({from: this.props.user})
                .on('transactionHash', () => {
                    this.props.transactionNotification('open', tx, 'Transaction Sent', 'Your transaction is being validated...');
                })
                .on('confirmation', (confirmationNumber) => {
                    if (confirmationNumber === 1) {
                        this.props.transactionNotification('close', tx);
                        this.props.transactionNotification('success', Math.random() * 10000, 'Transaction Validated', 'Your transaction has been validated');
                    }
                });
        } else {
            alert("NUMBERS NOT CHOSEN")
        }


    }

    constructor() {
        super();
        this.state = {
            chosenNumbers: [-1, -1],
            counter: 0,
        }
    }

    revealButton() {
        let tmp = Object.assign([], this.state.chosenNumbers);
        tmp = tmp.sort((a, b) => {
            return a - b
        });
        if (tmp.includes(-1)) {
            return "Re-select your numbers";
        } else {
            return `Reveal your numbers: ${tmp[0]}, ${tmp[1]}`;
        }
    }

    winningModal(){
        let modalText = [];
        if(this.props.winners.includes(this.props.user)){
            modalText[0] ='Congratulations! You won the lottery!';
        }else{
            modalText[0] = 'You lost!\n'
        }
        if(this.props.winners.length>0){
            modalText[1] = `${this.props.winners.length} participant won the lottery`;
        }else{
            modalText[1] = 'Nobody won the jackpot\n'
        }
        modalText[2] = `Extracted numbers: ${this.props.winningNumbers[0]} - ${this.props.winningNumbers[1]}`;

        return modalText
    }

    abortCommitPhase() {
        let tx = Math.random() * 10000;
        this.props.contract.methods
            .reset()
            .send({from: this.props.user})
            .on('transactionHash', () => {
                this.props.transactionNotification('open', tx, 'Transaction Sent', 'Your transaction is being validated...');
            })
            .on('confirmation', (confirmationNumber) => {
                if (confirmationNumber === 1) {
                    this.props.transactionNotification('close', tx);
                    this.props.transactionNotification('success', Math.random() * 10000, 'Transaction Validated', 'Your transaction has been validated');
                }
            });
    }

    payout() {
        this.props.contract.methods
            .payout()
            .send({from: this.props.user})
            .on('transactionHash', (ss) => {
                console.log("-------------->" + ss)
            })
            .on('confirmation', (confirmationNumber) => {
                console.log("---->" + confirmationNumber)
            });
    }

    render() {
        if (GAME_STATUS[this.props.currentPhase] === GAME_STATUS[0] || GAME_STATUS[this.props.currentPhase] === GAME_STATUS[1]) {
            return (<Redirect to="/lottery"/>)
        }
        return (
            <div style={{height: '70vh'}}>
                <Panel style={styles.HomeContainer}>
                    <Panel style={styles.Container}>
                        <div style={styles.CurrentGameContainer}>
                            < CurrentGame nrOfPlayers={this.props.committed}
                                          currentBet={this.props.fee}
                                          gameStatus={GAME_STATUS[this.props.currentPhase]}
                                          timeLeft={this.props.timeLeft}
                            />
                        </div>
                        <div style={styles.CurrentGameContainer}>
                            <Panel style={styles.Ticket}
                                   header={<h3 style={{fontWeight: "bold", color: "#4e4e4e"}}>Lottery Ticket</h3>}
                                   bordered>
                                <div style={styles.TicketNumbers}>
                                    {this.state.table}
                                </div>
                            </Panel>
                        </div>
                        <div style={styles.buttonGroup}>
                            <Button style={styles.abortRevealButton}
                                    onClick={() => {
                                        this.abortCommitPhase()
                                    }
                                    }
                            >
                                Abort Commit Phase
                            </Button>
                            <Button style={styles.betButton}
                                    color="green"
                                    disabled={this.state.chosenNumbers.includes(-1)}
                                    onClick={() => {
                                        this.revealNumbers()
                                    }
                                    }
                            >
                                {this.revealButton()}
                            </Button>
                            <Button style={styles.betButton}
                                    color="green"
                                    onClick={() => {
                                        this.payout()
                                    }
                                    }
                            >
                                REVEAL
                            </Button>
                        </div>
                    </Panel>
                </Panel>
                <Modal  style = {styles.endModal} show={this.props.winningNumbers.length > 0} onHide={this.props.refreshOnModalClose}>
                    <Modal.Header >
                        <Modal.Title style={{fontWeight: "bold", fontSize:"40px"}}>{this.winningModal()[0]}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>{this.winningModal()[1]}</div>
                        <div>{this.winningModal()[2]}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.refreshOnModalClose} appearance="primary">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

// const props = ({user})=>{
//     return {user}
// }

const mapStateToProps = (state, {user, committed, currentPhase, fee, web3, contract, cookies, timeLeft, timestamps, winners, refreshOnModalClose, winningNumbers}) => {
    return {
        isLoading: state.ui.isLoading,
        user,
        committed,
        currentPhase,
        fee,
        web3,
        contract,
        cookies,
        timeLeft,
        timestamps,
        winners,
        refreshOnModalClose,
        winningNumbers
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Reveal));
