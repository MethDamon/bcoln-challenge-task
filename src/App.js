import React, {Component} from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import './App.css';
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from './components/CurrentGame'
import GAME_STATUS from './const/GameStatus';
import Web3 from 'web3';
import contractConfig from './const/contractConfig'
import {uiStartLoading, uiStopLoading} from './store/actions/uiActionCreators';
import Home from "./components/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";


let web3 = window.web3;
const Web3Providers = {
    META_MASK: 'META MASK',
    LOCALHOST: 'LOCAL HOST',
    MIST: 'MIST'
};


class App extends Component {
    async componentDidMount() {
        //TODO: get the other variables required
        await this.loadDataFromSC();

        this.props.stopLoading();
        const commitEvent = this.state.contract.events.NewCommit();
        commitEvent.on('data', async ()=>{
            console.log("new event");
            //TODO: load only the new committed players?
            await this.loadDataFromSC();
        })
        //document.getElementById('root').style.height = "100vh";
        // await this.state.contract.methods
        //     .commit('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
        //     .send({from: '0x15453360c1DF6125aC3CEEE936B32EEF1c7E83c2'})
        //     .then(res => {
        //         console.log(res)
        //     })
        // await this.state.contract.methods
        //     .getCommitted()
        //     .call({from: '0x15453360c1DF6125aC3CEEE936B32EEF1c7E83c2'})
        //     .then(res => {
        //         console.log(res)
        //     })
    }

    getUser() {
        return this.state.web3.eth
            .getAccounts()
            .then(addresses => {
                return addresses[0];
            })
            .catch(err => {
                console.log('error getting address ' + err);
            });
    }

    async getCurrentTimestamp() {
        return await this.state.contract.methods
            .current_timestamps()
            .call({from: this.state.user})
            .then(res => {
                return (({commit, commit_and_ready_for_reveal, payout, reveal}) => {
                    commit = new Date(this.hexToNumber(commit._hex));
                    commit_and_ready_for_reveal = new Date(this.hexToNumber(commit_and_ready_for_reveal._hex));
                    payout = new Date(this.hexToNumber(payout._hex));
                    reveal = new Date(this.hexToNumber(reveal._hex));
                    return {commit, commit_and_ready_for_reveal, payout, reveal}
                })(res);
            })
    }

    hexToNumber(n){
        return this.state.web3.utils.hexToNumber(n);
    }
    hexToNumberString(n){
        return this.state.web3.utils.hexToNumberString(n);
    }


    async getFee(){
        return await this.state.contract.methods
            .getFee()
            .call({from: this.state.user})
            .then(res => {
                return this.state.web3.utils.fromWei(this.hexToNumberString(res._hex))
            })
    }

    async loadDataFromSC() {
        this.setState({
            user: await this.getUser(),
        });
        this.setState({
            timestamps: await this.getCurrentTimestamp(),
            currentPhase: await this.getCurrentPhase(),
            committed: await this.getCommitted(),
            fee: await this.getFee(),
        });
        //await  this.getNumberOfPlayers();
        //Load jackpot
        //load time
        //load numberofPlayers
        //load entryFee
    }
    getCurrentPhase(){
        return this.state.contract.methods
            .current_phase()
            .call({from: this.state.user})
            .then(res => {
                return res
            })
    }

    getCommitted(){
        return this.state.contract.methods
            .getCommitted()
            .call({from: this.state.user})
            .then(res => {
                return res.length
            })
    }

    constructor() {
        super();
        let CONTRACT_ADDRESS;
        let web3Instance = null;
        let provider;

        if (typeof  web3 !== 'undefined') {
            this.web3Provider = web3.currentProvider;
            web3Instance = new Web3(web3.currentProvider);

            // MetaMask
            CONTRACT_ADDRESS = contractConfig.METAMASK_CONTRACT_ADDRESS;
            provider = Web3Providers.META_MASK
        } else {
            this.web3Provider = new Web3.providers.HttpProvider(
                'http://localhost:8545'
            );

            web3Instance = new Web3(this.web3Provider);
            CONTRACT_ADDRESS = contractConfig.LOCALHOST_CONTRACT_ADDRESS;
            provider = Web3Providers.LOCALHOST;
        }


        const dLotteryContract = new web3Instance.eth.Contract(
            contractConfig.CONTRACT_ABI,
            CONTRACT_ADDRESS
        );

        this.state = {
            web3: web3Instance,
            contract: dLotteryContract,
            user: '',
            timestamps: {},
            committed: 0,
            currentPhase: '',
            fee: 0,
        }
    }

    render() {
        return (
            <div className="App">
                <Header/>
                <Home user = {this.state.user}
                committed = {this.state.committed}
                currentPhase = {this.state.currentPhase}
                fee = {this.state.fee}
                contract = {this.state.contract}
                web3 = {this.state.web3}/>
                <Footer/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.ui.isLoading,
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default connect(mapStateToProps, mapActionsToProps)(App);
