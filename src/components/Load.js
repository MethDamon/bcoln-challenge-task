import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button, Panel} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css';
import {InputNumber, InputGroup} from 'rsuite';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import { withRouter } from 'react-router-dom'

let web3 = window.web3;

const styles = {
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 15,
    },
    HomeContainer: {
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
        flex:1,
        width: '100%',
        marginBottom: 10,
        marginTop: 20,
    },
    LoginButton: {
        width: 250,
        height: 50,
        marginBottom: 10,
        marginTop: 10,
        fontSize: 20,
        fontWeight: 800,
        margin: 10,
        background: "linear-gradient(0deg, #ffa726, #fb8c00)",
        color: "#FFFFFF",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.29)"
    },
    CurrentGame: {
        width: 500,
        marginTop: 20,
        marginBottom: 100,
        borderRadius: 7,
        fontSize: 25
    }
};

class Load extends Component {

    constructor() {
       super();
        this.state = {
            value: 0
        };
    }

    handleChange(value) {
        console.log(typeof value, value);
        this.setState({
            value
        });
    }

    loadBalance(){
        let tx = Math.random()*10000;
        let balance = parseFloat(this.state.value)*1000000000000000000;
        this.props.contract.methods
            .load()
            .send({from: this.props.user, value: balance}, )
            .on('transactionHash',()=>{
                this.props.transactionNotification('open', tx,'Transaction Sent', 'Your transaction is being validated...');
            })
            .on('confirmation',(confirmationNumber)=>{
                if(confirmationNumber===1){
                    this.props.transactionNotification('close',tx);
                    this.props.transactionNotification('success', Math.random()*10000,'Transaction Validated','Your transaction has been validated');
                }
                return this.props.history.push('/join')
            });
    }

    withdrawBalance(){
        let tx = Math.random()*10000;
        this.props.contract.methods
            .withdraw()
            .send({from: this.props.user}, )
            .on('transactionHash',()=>{
                this.props.transactionNotification('open', tx,'Transaction Sent', 'Your transaction is being validated...');
            })
            .on('confirmation',(confirmationNumber)=>{
                if(confirmationNumber===1){
                    this.props.transactionNotification('close',tx);
                    this.props.transactionNotification('success', Math.random()*10000,'Transaction Validated','Your transaction has been validated');
                }
                this.props.history.push('/join');
                window.location.reload()
            });
    }


    render() {
        return(
            <div style={{height:'70vh'}}>
                <Panel style={styles.HomeContainer}>
                <Panel style={styles.Container}>
                    <InputGroup style={styles.Inputs}>
                        <InputGroup.Addon>Load Balance</InputGroup.Addon>
                        <InputNumber size={'lg'}
                                     value={this.state.value}
                                     onChange={this.handleChange.bind(this)}
                                     prefix="ETH"
                                     defaultValue={1} min={0} step={0.5}
                        />
                    </InputGroup>
                    <div style={styles.buttonGroup}>
                        <Button style={styles.LoginButton}
                                onClick={this.loadBalance.bind(this)}>
                            Load
                        </Button>
                        <Button style={styles.LoginButton}
                                onClick={this.withdrawBalance.bind(this)}>
                            Withdraw
                        </Button>
                    </div>
                </Panel>
            </Panel>
            </div>
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
        timeLeft,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Load));
