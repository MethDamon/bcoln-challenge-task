import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button, Icon, Panel} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';
import CurrentGame from '../views/CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {withRouter, Redirect} from 'react-router-dom';
import Slot from "../views/Slot";

const Buffer = require('buffer/').Buffer;

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
        borderRadius: "6px",
        border: "1px solid rgb(175,175,175)"
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
        marginBottom: 0,
        fontSize: 20,
        fontWeight: 800,
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 15
    },
};

class Lottery extends Component {

    constructor() {
        super();
        this.state = {
            chosenNumbers: [-1, -1],
            counter: 0,
        }
    }


    async componentDidMount() {
        let chosenNumbers = await this.props.cookies.get('chosenNumbers');
        let lotteryIndex = await this.props.cookies.get('lotteryIndex');
        if (!!chosenNumbers && lotteryIndex.toString() === this.props.lotteryIndex.toString()) {
            this.setState({
                chosenNumbers
            })
        } else {
            this.props.cookies.remove('chosenNumbers', {path: '/'});
            this.props.cookies.remove('lotteryIndex', {path: '/'});

        }
        this.createTable();
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
        if (this.props.hasCommitted) {
            console.log("COMMITED")
            return
        }
        ;
        let numbers = Object.assign([], this.state.chosenNumbers);
        let table = Object.assign([], this.state.table);

        //Avoid choosing twice the same number
        if (!numbers.includes(n)) {
            let lastSelected = this.state.chosenNumbers[(this.state.counter) % 2];
            numbers[this.state.counter % 2] = n;

            //update the numbers which are no longer selected
            if (lastSelected > 0) {
                table[lastSelected - 1] = (
                    <Slot key={lastSelected - 1} number={lastSelected} chosenNumbers={numbers}
                          hasCommitted={this.props.hasCommitted} callback={() => {
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

    joinLottery() {
        if (!this.state.chosenNumbers.includes(-1)) {
            let sortedNumbers = Object.assign([], this.state.chosenNumbers);
            sortedNumbers = sortedNumbers.sort((a, b) => {
                return a - b
            });
            //TODO. fix the hash
            let n1 = new Buffer.alloc(1);
            n1.writeInt8(sortedNumbers[0]);
            let n2 = new Buffer.alloc(1);
            n2.writeInt8(sortedNumbers[1]);
            //let addressedHash = this.props.web3.utils.sha3(this.props.user);
            //let toHash = Buffer.concat([n1, Buffer.from(addressedHash), n2]);
            let first_number = sortedNumbers[0];
            let second_number = sortedNumbers[1];
            let toHash = this.props.web3.eth.abi.encodeParameters(['uint8', 'address', 'uint8'], [first_number, this.props.user, second_number]);
            let hash = this.props.web3.utils.soliditySha3(toHash);
            let tx = Math.random() * 10000;
            this.props.contract.methods
                .commit(hash)
                .send({from: this.props.user, value: this.props.fee},)
                .on('transactionHash', () => {
                    this.props.transactionNotification('open', tx, 'Transaction Sent', 'Your transaction is being validated...');
                })
                .on('confirmation', (confirmationNumber) => {
                    if (confirmationNumber === 1) {
                        this.props.transactionNotification('close', tx);
                        this.props.transactionNotification('success', Math.random() * 10000, 'Transaction Validated', 'Your transaction has been validated');
                    }
                });
            this.props.cookies.set('chosenNumbers', this.state.chosenNumbers, {path: '/'});
            //save the timestamp of the commit phase and used it as id for saving only the numbers
            //of the current lottery
            this.props.cookies.set('lotteryIndex', this.props.lotteryIndex, {path: '/'});
        } else {
            alert("NUMBERS NOT CHOSEN")
        }
    }

    goToRevealPhase() {
        let tx = Math.random() * 10000;
        this.props.contract.methods
            .goToRevealPhase()
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

    reset() {
        let tx = Math.random() * 10000;
        this.props.contract.methods
            .abort()
            .send({from: this.props.user})
            .on('transactionHash', () => {
                this.props.transactionNotification('open', tx, 'Transaction Sent', 'Your transaction is being validated...');
            })
            .on('confirmation', (confirmationNumber) => {
                if (confirmationNumber === 1) {
                    this.props.transactionNotification('close', tx);
                    this.props.transactionNotification('success', Math.random() * 10000, 'Transaction Validated', 'Your transaction has been validated');
                }
                window.location.reload();
            });
    }

    render() {
        if (GAME_STATUS[this.props.currentPhase] === GAME_STATUS[2]) {
            return (<Redirect to="/reveal"/>)
        }
        return (
            <div id="style-7" style={{height: '80vh',  overflow: "scroll",
                overflowY: "auto",
                overflowX: "hidden"}}>
                <Panel style={styles.HomeContainer}>
                    <Panel style={styles.Container}>
                        <div style={styles.CurrentGameContainer}>
                            <CurrentGame
                                nrOfPlayers={this.props.committed}
                                currentBet={this.props.fee}
                                gameStatus={GAME_STATUS[this.props.currentPhase]}
                                timeLeft={this.props.timeLeft}
                                jackpot={this.props.jackpot}
                            />
                        </div>
                        <div style={styles.CurrentGameContainer}>
                            <div style={styles.Ticket}>
                                <h3 style={{fontWeight: "bold", color: "#4e4e4e"}}>Lottery Ticket</h3>
                                <div style={styles.TicketNumbers}>
                                    {this.state.table}
                                </div>
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <Button color="red"
                                    style={styles.abortRevealButton}
                                    disabled={this.props.remainingTimeAbort > 0 || GAME_STATUS[this.props.currentPhase] == GAME_STATUS[0]}
                                    onClick={() => {
                                        this.reset()
                                    }
                                    }>
                                Abort
                            </Button>
                            {GAME_STATUS[this.props.currentPhase] == GAME_STATUS[1] &&
                            this.props.timeLeft === 0 ? (
                                <Button color="red"
                                        style={styles.abortRevealButton}
                                        disabled={this.props.remainingTimeAbort == 0}
                                        onClick={() => {
                                            this.goToRevealPhase()
                                        }
                                        }>
                                    {'Go to reveal phase'}
                                </Button>
                            ) : (
                                <Button color="green"
                                        style={styles.betButton}
                                        disabled={this.state.chosenNumbers.includes(-1) || this.props.hasCommitted || this.props.remainingTimeAbort == 0}
                                        onClick={() => {
                                            this.joinLottery()
                                        }
                                        }>
                                    Buy
                                </Button>)}
                        </div>
                    </Panel>
                </Panel>
            </div>
        );
    }
}

const mapStateToProps = (state, {user, remainingTimeAbort, committed, currentPhase, fee, web3, contract, cookies, timeLeft, timestamps, hasCommitted, transactionNotification}) => {
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
        hasCommitted,
        transactionNotification,
        remainingTimeAbort
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Lottery));
