import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';
import styled from 'styled-components';
import CurrentGame from '../views/CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {Redirect, withRouter} from 'react-router-dom'
import Slot from "../views/Slot";

var Buffer = require('buffer/').Buffer;


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

const revealPhaseButtonStyle = {
    width: 250,
    height: 50,
    margin: 10,
    fontSize: 20,
    fontWeight: 800,
}


class Lottery extends Component {
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
            .send({from: this.props.user},()=>{
                window.location.reload();
            })
    }


    render() {
        if (GAME_STATUS[this.props.currentPhase] === GAME_STATUS[2]) {
            return (<Redirect to="/reveal"/>)
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
                {GAME_STATUS[this.props.currentPhase] == GAME_STATUS[1] &&
                this.props.timeLeft === 0 ? (
                    <Button style={revealPhaseButtonStyle}
                            color="red"
                            onClick={() => {
                                this.goToRevealPhase()
                                }
                            }>
                        {'Go to reveal phase'}
                    </Button>
                ) : (
                    <Button style={betButtonStyle}
                            color="yellow"
                            disabled={this.state.chosenNumbers.includes(-1)}
                            onClick={() => {
                                this.joinLottery()
                                }
                            }>
                        {this.joinButton()}
                    </Button>)}

                <Button style={betButtonStyle}
                        color="yellow"
                        onClick={() => {
                            this.abortCommitPhase()
                            }
                        }>
                    Abort Commit Phase
                </Button>
            </Container>
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
