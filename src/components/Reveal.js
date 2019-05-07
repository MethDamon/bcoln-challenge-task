import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
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

const Table = styled.div`
width: 550px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: white;
  flex-wrap: wrap;
`;

const Container = styled.div`
  height: 70vh
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  flex-wrap: wrap;
`;

const stylesCurrentGame = {
    width: 500,
    marginTop: 20,
    marginBottom: 100,
    borderRadius: 7,
    fontSize: 30
};

const betButtonStyle = {
    width: 250,
    height: 50,
    margin: 10,
    fontSize: 20,
    fontWeight: 800
}


class Reveal extends Component {
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
            let tx = Math.random()*10000;
            this.props.contract.methods
                .reveal(sortedNumbers[0], sortedNumbers[1])
                .send({from: this.props.user, value: this.props.fee})
                .on('transactionHash',()=>{
                    this.props.transactionNotification('open', tx,'Transaction Sent', 'Your transaction is being validated...');
                })
                .on('confirmation',(confirmationNumber)=>{
                    if(confirmationNumber===1){
                        this.props.transactionNotification('close',tx);
                        this.props.transactionNotification('success', Math.random()*10000,'Transaction Validated','Your transaction has been validated');
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

    abortCommitPhase() {
        let tx = Math.random()*10000;
        this.props.contract.methods
            .reset()
            .send({from: this.props.user})
            .on('transactionHash',()=>{
                this.props.transactionNotification('open', tx,'Transaction Sent', 'Your transaction is being validated...');
            })
            .on('confirmation',(confirmationNumber)=>{
                if(confirmationNumber===1){
                    this.props.transactionNotification('close',tx);
                    this.props.transactionNotification('success', Math.random()*10000,'Transaction Validated','Your transaction has been validated');
                }
            });
    }

    payout() {
        this.props.contract.methods
            .payout()
            .send({from: this.props.user})
            .on('transactionHash',(ss)=>{
                console.log("-------------->" + ss)
            })
            .on('confirmation',(confirmationNumber)=>{
                console.log("---->" + confirmationNumber)
            });
    }


    render() {
        if (GAME_STATUS[this.props.currentPhase] === GAME_STATUS[0]||GAME_STATUS[this.props.currentPhase] === GAME_STATUS[1]) {
            return (<Redirect to="/lottery"/>)
        }
        return (
            <Container>
                < CurrentGame style={stylesCurrentGame}
                              nrOfPlayers={this.props.committed}
                              currentBet={this.props.fee}
                              gameStatus={GAME_STATUS[this.props.currentPhase]}
                              timeLeft={this.props.timeLeft}
                />
                <Table>
                    {this.state.table}
                </Table>
                <Button style={betButtonStyle}
                        color="yellow"
                        disabled={this.state.chosenNumbers.includes(-1)}
                        onClick={() => {
                            this.revealNumbers()
                        }
                        }
                >
                    {this.revealButton()}
                </Button>
                <Button style={betButtonStyle}
                        color="yellow"
                        onClick={() => {
                            this.abortCommitPhase()
                        }
                        }
                >
                    Abort Commit Phase
                </Button>
                <Button style={betButtonStyle}
                        color="green"
                        onClick={() => {
                            this.payout()
                        }
                        }
                >
                    REVEAL
                </Button>
            </Container>
        );
    }
}

// const props = ({user})=>{
//     return {user}
// }

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

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Reveal));
