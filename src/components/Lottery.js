import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button, Icon, Panel} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';
import CurrentGame from '../views/CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {Redirect, withRouter} from 'react-router-dom'
import Slot from "../views/Slot";

const Buffer = require('buffer/').Buffer;

const styles = {
    HomeContainer: {
        marginTop: 150,
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
        let commitTimestamps = new Date(await this.props.cookies.get('commitTimestamp'));
        if(!!chosenNumbers&&commitTimestamps.toString()===this.props.timestamps['commit'].toString()){
            this.setState({
                chosenNumbers
            })
        }else{
            this.props.cookies.remove('chosenNumbers',{ path: '/' });
            this.props.cookies.remove('commitTimestamp', { path: '/' });

        }
        this.createTable()
    }

    wipeCookies(){

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
            let toHash = Buffer.concat([n1, Buffer.from(this.props.user), n2]);
            console.log('hash', toHash);
            let hash = this.props.web3.utils.sha3(toHash);
            this.props.contract.methods
                .commit(hash)
                .send({from: this.props.user, value: this.props.fee},()=>{
                    this.props.cookies.set('chosenNumbers', this.state.chosenNumbers, { path: '/' });
                    //save the timestamp of the commit phase and used it as id for saving only the numbers
                    //of the current lottery
                    this.props.cookies.set('commitTimestamp', this.props.timestamps['commit'], { path: '/' });

                })
        } else {
            alert("NUMBERS NOT CHOSEN")
        }
    }

    goToRevealPhase() {
        this.props.contract.methods
            .goToRevealPhase()
            .send({from: this.props.user, value: this.props.fee});
    }

    abortCommitPhase() {
        this.props.contract.methods
            .abort()
            .send({from: this.props.user},()=>{
                window.location.reload();
            })
    }


    render() {
        if (GAME_STATUS[this.props.currentPhase] === GAME_STATUS[2]) {
            return (<Redirect to="/reveal"/>)
        }
        return (
            <Panel style={styles.HomeContainer}>
                <Panel style={styles.Container}>
                    <div style={styles.CurrentGameContainer}>
                        <CurrentGame
                            nrOfPlayers={this.props.committed}
                            currentBet={this.props.fee}
                            gameStatus={GAME_STATUS[this.props.currentPhase]}
                            timeLeft={this.props.timeLeft}
                        />
                    </div>
                    <div style={styles.CurrentGameContainer}>
                        <Panel style={styles.Ticket} header={<h3 style={{fontWeight: "bold", color: "#4e4e4e"}}>Lottery Ticket</h3>} bordered>
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
                                }>
                            Abort Commit Phase
                        </Button>
                        {GAME_STATUS[this.props.currentPhase] == GAME_STATUS[1] &&
                        this.props.timeLeft === 0 ? (
                            <Button style={styles.abortRevealButton}
                                    onClick={() => {
                                        this.goToRevealPhase()
                                    }
                                    }>
                                {'Go to reveal phase'}
                            </Button>
                        ) : (
                            <Button color="green"
                                    style={styles.betButton}
                                    disabled={this.state.chosenNumbers.includes(-1)}
                                    onClick={() => {
                                        this.joinLottery()
                                    }
                                    }>
                                Buy
                            </Button>)}
                    </div>
                </Panel>
            </Panel>
        );
    }
}

const mapStateToProps = (state, {user, committed, currentPhase, fee, web3, contract, cookies, timeLeft, timestamps}) => {
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
        timestamps
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Lottery));
