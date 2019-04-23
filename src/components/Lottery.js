import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import {css} from '@emotion/core';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from './CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import RingLoader from 'react-spinners/RingLoader';
import {withRouter} from 'react-router-dom'
import Slot from "./Slot";

const Table = styled.div`
width: 350px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: white;
  flex-wrap: wrap;
`;

const Container = styled.div`
   
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


class Lottery extends Component {
    async componentDidMount() {
        this.createTable()
    }

    createTable() {
        let table = [];
        for (let i = 0; i < 15; i++) {
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
            let toHash = sortedNumbers[0] + this.props.user + sortedNumbers[1];
            let hash = this.props.web3.utils.sha3(toHash);
            this.props.contract.methods
                .commit(hash)
                .send({from: this.props.user, value: this.props.fee}, (res) => {
                    if (!res.message.includes('error'))
                        this.setState({redirectToLottery: true})
                })
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

    joinButton() {
        let tmp = Object.assign([], this.state.chosenNumbers);
        tmp = tmp.sort((a, b) => {
            return a - b
        });
        if (tmp.includes(-1)) {
            return "Select your numbers";
        } else {
            return `Join with numbers: ${tmp[0]}, ${tmp[1]}`;
        }
    }

    abortCommitPhase() {
        this.props.contract.methods
            .abort()
            .send({from: this.props.user}, (res) => {
                    if (!res.message.includes('error')) {
                        console.log("aborted commit phase");
                    } else {
                        console.log(res)
                    }
                }
            )
    }


    render() {
        return (
            <Container>
                < CurrentGame style={stylesCurrentGame}
                              nrOfPlayers={this.props.committed}
                              currentFee={this.props.fee}
                              gameStatus={GAME_STATUS[this.props.currentPhase]}
                              timestamps={this.props.timestamps}
                />
                <Table>
                    {this.state.table}
                </Table>
                <Button style={betButtonStyle}
                        color="yellow"
                        disabled={this.state.chosenNumbers.includes(-1)}
                        onClick={() => {
                            this.joinLottery()
                        }
                        }
                >
                    {this.joinButton()}
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
            </Container>
        );
    }
}

// const props = ({user})=>{
//     return {user}
// }

const mapStateToProps = (state, {user, committed, currentPhase, fee, web3, contract, cookies, timestamps}) => {
    return {
        isLoading: state.ui.isLoading,
        user,
        committed,
        currentPhase,
        fee,
        web3,
        contract,
        cookies,
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
