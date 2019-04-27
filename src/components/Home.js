import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button, Panel} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from '../views/CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import { withRouter, Redirect } from 'react-router-dom'

const styles = {
    HomeContainer: {
        marginTop: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    Container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        width: 600
    },
    Inputs: {
        width: 450,
        marginBottom: 10,
        marginTop: 10,
    },
    LoginButton: {
        width: 250,
        height: 50,
        marginBottom: 10,
        fontSize: 20,
        fontWeight: 800,
        background: "#ff771c",
        color: "#FFFFFF"
    },
    CurrentGame: {
        width: 500,
        marginTop: 20,
        marginBottom: 100,
        borderRadius: 7,
        fontSize: 30
    }
};

class Home extends Component {

    constructor() {
       super();
        this.state = {
            redirectToLottery: false,
        }
    }

    joinLottery(){
        this.setState({redirectToLottery: true})
    }

    render() {
        if (this.state.redirectToLottery) {
            return (
                <Redirect to='/lottery'/>
            )
        }
        return(
            <Panel style={styles.HomeContainer}>
                <Panel style={styles.Container}>
                    < CurrentGame style={styles.CurrentGame}
                                  nrOfPlayers={this.props.committed}
                                  currentBet={this.props.fee}
                                  gameStatus={GAME_STATUS[this.props.currentPhase]}
                                  timeLeft={this.props.timeLeft}
                    />
                    <InputGroup inside style={styles.Inputs}>
                        <InputGroup.Addon>
                            <Icon icon="avatar"/>
                        </InputGroup.Addon>
                        <Input  size = {'lg'} defaultValue = {this.props.user}
                                disabled = {true}/>
                    </InputGroup>

                    <InputGroup style={styles.Inputs}>
                        <InputGroup.Addon>ETH</InputGroup.Addon>
                        <Input size={'lg'}
                               defaultValue = {this.props.fee}
                               disabled = {true}
                        />
                    </InputGroup>
                    <Button style={styles.LoginButton}
                            onClick={this.joinLottery.bind(this)}>
                        Join the Lottery
                    </Button>
                </Panel>
            </Panel>

        );
    }
}

const mapStateToProps = (state, {user, committed, currentPhase, fee, web3, contract, cookies, timeLeft}) => {
    return {
        isLoading: state.ui.isLoading,
        user,
        committed,
        currentPhase,
        fee,
        web3,
        contract,
        cookies,
        timeLeft
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Home));
