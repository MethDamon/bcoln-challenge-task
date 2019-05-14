import React, {Component} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {withRouter} from 'react-router-dom'
import Web3 from "web3";
import Footer from "./views/Footer";
import Header from "./views/Header";
import RingLoader from 'react-spinners/RingLoader';
import styled from "styled-components";
import './App.css';
import {uiStartLoading, uiStartValidating, uiStopLoading, uiStopValidating} from "./store/actions/uiActionCreators";
import connect from "react-redux/es/connect/connect";
import {withCookies} from "react-cookie"
import DLottery from "./abis/DLottery"
import Routes from './routes/index'
import {Notification} from "rsuite";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import GAME_STATUS from "./const/GameStatus";

let web3 = window.web3;

const Loader = styled.div`
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-color: red;
`;

class App extends Component {

    constructor() {
        super();
        this.transactionNotification = this.transactionNotification.bind(this);
        this.refreshOnModalClose = this.refreshOnModalClose.bind(this);
        let CONTRACT_ADDRESS;
        let web3Instance = null;

        if (typeof  web3 !== 'undefined') {
            web3Instance = new Web3(web3.currentProvider);
            if (web3Instance.givenProvider.networkVersion)
                CONTRACT_ADDRESS = DLottery.networks[web3Instance.givenProvider.networkVersion].address;
            else
            // NetworkVersion = 3 (Ropsten) / 5777 (Ganache)
                CONTRACT_ADDRESS = DLottery.networks["3"].address
        } else {
            alert('Please install a Web3 Provider (Metamask)')
        }

        const dLotteryContract = new web3Instance.eth.Contract(
            DLottery.abi,
            CONTRACT_ADDRESS
        );

        this.state = {
            isLoading: true,
            web3: web3Instance,
            contract: dLotteryContract,
            user: '',
            timestamps: {},
            committed: 0,
            currentPhase: '',
            fee: 0,
            timers: {},
            timeLeft: -1,
            hasCommitted: false,
            transactionHashes: [],
            winners: [],
            winningNumbers: [],
        }
    }

    async componentDidMount() {
        //TODO: get the other variables required
        await this.loadDataFromSC();
        this.getRemainingTime();
        this.props.stopLoading();
        //this.setState({isLoading: false})
        const commitEvent = this.state.contract.events.NewCommit();
        commitEvent.on('data', async ({transactionHash}) => {
            if (!this.state.transactionHashes.includes(transactionHash)) {
                console.log("commitEvent");
                this.setState({
                    transactionHashes: [...this.state.transactionHashes, transactionHash]
                });
                this.loadDataFromSC();
            }
            //TODO: load only the new committed players?
        });
        //TEST TODO: reload only necessary data
        const revealEvent = this.state.contract.events.NewReveal();
        revealEvent.on('data', async ({transactionHash}) => {
            if (!this.state.transactionHashes.includes(transactionHash)) {
                console.log("revealEvent");
                this.setState({
                    transactionHashes: [...this.state.transactionHashes, transactionHash]
                });
                //TODO: do not reaload everything!
                //this.loadDataFromSC();
            }
            //TODO: load only the new committed players?
        });

        const resetEvent = this.state.contract.events.Reset();
        resetEvent.on('data', async ({transactionHash}) => {
            if (!this.state.transactionHashes.includes(transactionHash)) {
                console.log("commitEvent");
                this.setState({
                    transactionHashes: [...this.state.transactionHashes, transactionHash]
                });
                //await this.loadDataFromSC();
            }
            //TODO: load only the new committed players?
        });

        const phaseChangeEvent = this.state.contract.events.PhaseChange();
        phaseChangeEvent.on('data', async ({transactionHash, returnValues}) => {
            if (!this.state.transactionHashes.includes(transactionHash)) {
                console.log("phaseChangeEvent", returnValues);
                this.setState({
                    transactionHashes: [...this.state.transactionHashes, transactionHash]
                });
                if(returnValues.old_phase!==2&&returnValues.old_phase!==3){
                    //Avoid reloading data if the winning modal at the end is open
                    //It reloads anyway when the modal is closed
                    this.loadDataFromSC();
                }
            }
            //TODO: load only the new committed players?
        });

        const lotteryEndedEvent = this.state.contract.events.LotteryEnded();
        lotteryEndedEvent.on('data', async ({id, returnValues}) => {
                console.log("ENDED , ", id);
                if (!this.state.transactionHashes.includes(id)) {
                    console.log("lotterEndedEvent");
                    this.setState({
                        transactionHashes: [...this.state.transactionHashes, id],
                        winners: returnValues.winners
                    });
                }
            }
        );

        const winningNumberEvent = this.state.contract.events.Log();

        winningNumberEvent.on('data', async ({id, returnValues}) => {
            if (!this.state.transactionHashes.includes(id)) {
                let wNumber= this.state.web3.utils.hexToNumber(returnValues.number._hex)
                this.setState({
                    transactionHashes: [...this.state.transactionHashes, id],
                    winningNumbers: [...this.state.winningNumbers, wNumber]
                });
                console.log('Winning Numbers -->', this.state.winningNumbers);
                //await this.loadDataFromSC();
            }
        });


        this.timer = setInterval(() => {
            this.getRemainingTime()
        }, 1000);

        //TODO remove after testing
        this.timerBalance = setInterval(() => {
            this.getBalance();
        }, 5000);

    }

    refreshOnModalClose(){
            this.loadDataFromSC();
            this.setState({
                winners: [],
                winningNumbers: []
            })
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        clearTimeout(this.timerBalance);

    }

    getRemainingTime() {
        let startPhase = new Date(this.state.timestamps[this.getPhaseForTimestamp(this.state.currentPhase)]);
        let endPhase = startPhase.setSeconds(startPhase.getSeconds() + this.getTimerForPhase(this.state.currentPhase));
        let remainingTime = endPhase - Date.now();
        //If payout phase then just show 0
        if (remainingTime <= 0 || this.state.currentPhase === 3) {
            remainingTime = 0;
        }
        this.setState({
            timeLeft: remainingTime
        });
    }

    async getBalance() {
        if (this.state.user) {
            let balance = await this.state.contract.methods
                .getBalance()
                .call({from: this.state.user})
                .then(res => {
                    return this.hexToNumberString(res._hex)
                });

            console.log(this.state.web3.utils.fromWei(balance))
        }
    }

    getUser() {
        return this.state.web3.eth
            .getAccounts()
            .then(addresses => {
                console.log(addresses)
                return addresses[0];
            })
            .catch(err => {
                console.log('error getting address ' + err);
            });
    }

    async getCurrentTimestamp() {
        return await this.state.contract.methods
            .getCurrentTimestamp()
            .call({from: this.state.user})
            .then(res => {
                console.log("TIMESTAMPS: ", res.commit._hex)
                console.log("TIMESTAMPS: ", res[0]._hex)
                return (({commit, commit_and_ready_for_reveal, payout, reveal}) => {
                    commit = new Date(this.hexToNumber(commit._hex) * 1000);
                    commit_and_ready_for_reveal = new Date(this.hexToNumber(commit_and_ready_for_reveal._hex) * 1000);
                    payout = new Date(this.hexToNumber(payout._hex) * 1000);
                    reveal = new Date(this.hexToNumber(reveal._hex) * 1000);
                    return {commit, commit_and_ready_for_reveal, payout, reveal}
                })(res);
            })
    }

    async getTimers() {
        return await this.state.contract.methods
            .getTimers()
            .call({from: this.state.user})
            .then(res => {
                return (({LEFT_COMMIT_AND_REVEAL, TO_ABORT, WAIT_TO_GO_TO_REVEAL_PHASE, TO_REVEAL}) => {
                    LEFT_COMMIT_AND_REVEAL = this.hexToNumber(LEFT_COMMIT_AND_REVEAL._hex);
                    TO_ABORT = this.hexToNumber(TO_ABORT._hex) * 1000;
                    WAIT_TO_GO_TO_REVEAL_PHASE = this.hexToNumber(WAIT_TO_GO_TO_REVEAL_PHASE._hex);
                    TO_REVEAL = this.hexToNumber(TO_REVEAL._hex);
                    return {LEFT_COMMIT_AND_REVEAL, TO_ABORT, WAIT_TO_GO_TO_REVEAL_PHASE, TO_REVEAL}
                })(res);
            })
    }

    hexToNumber(n) {
        return this.state.web3.utils.hexToNumber(n);
    }

    hexToNumberString(n) {
        return this.state.web3.utils.hexToNumberString(n);
    }

    async getFee() {
        return await this.state.contract.methods
            .getFee()
            .call({from: this.state.user})
            .then(res => {
                return this.hexToNumberString(res._hex)
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
            timers: await this.getTimers(),
            hasCommitted: await this.hasCommitted(),
        });
        //await  this.getNumberOfPlayers();
        //Load jackpot
        //load time
        //load numberofPlayers
        //load entryFee
    }

    getCurrentPhase() {
        return this.state.contract.methods
            .getCurrentPhase()
            .call({from: this.state.user})
            .then(res => {
                console.log("CURRENT PHASE", res)
                return res
            })
    }

    transactionNotification(type, key, title, description) {
        setTimeout(() => {
            if (type === 'open') {
                this.props.startValidating();
                Notification.open({
                    title,
                    description,
                    key,
                    duration: 60000,
                });
            }
            else if (type === 'success') {
                this.props.stopValidating();
                Notification.success({
                    title,
                    description,
                    key,
                    duration: 5000,
                });
            }
            else if (type === 'error') {
                this.props.stopValidating();
                Notification.error({
                    title,
                    description,
                    key,
                    duration: 5000,
                });
            }
            else if (type === 'close') {
                Notification.remove(key)
            }
        })
    }

    getCommitted() {
        return this.state.contract.methods
            .getCommitted()
            .call({from: this.state.user})
            .then(res => {
                return res.length
            })
    }

    hasCommitted() {
        return this.state.contract.methods
            .user_committed()
            .call({from: this.state.user})
            .then(res => {
                return res
            })
    }

    getTimerForPhase(phase) {
        switch (phase) {
            case 0:
                return this.state.timers['LEFT_COMMIT_AND_REVEAL'];
            case 1:
                return this.state.timers['WAIT_TO_GO_TO_REVEAL_PHASE'];
            case 2:
                return this.state.timers['TO_REVEAL'];
            case 3:
                return 'PAYOUT';
        }
    }

    getPhaseForTimestamp(status) {
        switch (status) {
            case 0:
                return 'commit';
            case 1:
                return 'commit_and_ready_for_reveal';
            case 2:
                return 'reveal';
            case 3:
                return 'payout';
        }
    }

    render() {
        return (
            <div className="App">
                {this.props.isLoading ?
                    (<Loader>
                        <RingLoader
                            sizeUnit={"px"}
                            size={150}
                            color={'orange'}
                            loading={this.props.isLoading}/>
                    </Loader>) : (
                        <div>
                            {this.props.isValidating ? (<LinearProgress style={{height: '5px'}}/>) : (
                                <div style={{height: '5px'}}/>)}
                            <div>
                                <BrowserRouter>
                                    <Header/>
                                    <div id="style-7" style={{overflowY: 'auto'}}>
                                        <Routes state={this.state} cookies={this.props.cookies}
                                                transactionNotification={(type, key, title, message) => this.transactionNotification(type, key, title, message)}
                                                refreshOnModalClose = {()=> this.refreshOnModalClose()}/>
                                    </div>
                                    <Footer/>
                                </BrowserRouter>
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        isLoading: state.ui.isLoading,
        isValidating: state.ui.isValidating,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
        startValidating: () => dispatch(uiStartValidating()),
        stopValidating: () => dispatch(uiStopValidating()),
    }
};

export default withCookies(withRouter(connect(mapStateToProps, mapActionsToProps)(App)));
