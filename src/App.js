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

let web3 = window.web3;

const Loader = styled.div`
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-color: red;
`;

const initialState = {
    isLoading: true,
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
    jackpot: 0,
    lotteryIndex: null,
    remainingTimeAbort: 999,
};

class App extends Component {

    constructor() {
        super();
        this.transactionNotification = this.transactionNotification.bind(this);
        this.refreshOnModalClose = this.refreshOnModalClose.bind(this);
        this.changePath = this.changePath.bind(this);
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
            ...initialState,
            web3: web3Instance,
            contract: dLotteryContract,
            path: window.location.pathname,
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
            }
        });


        this.timer = setInterval(() => {
            this.getRemainingTime()
        }, 2000);

    }

    refreshOnModalClose(){
        this.props.history.push("/join");
        window.location.reload()
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
        let openPhase = new Date(this.state.timestamps['start']);
        let abort = openPhase.setSeconds(openPhase.getSeconds() + this.state.timers['TO_ABORT']);
        let remainingTimeAbort = abort - Date.now();
        //If payout phase then just show 0
        if(openPhase.getFullYear()==1970){
            remainingTimeAbort=999;
        }else if (remainingTimeAbort <= 0) {
            remainingTimeAbort = 0;
        }
        this.setState({
            timeLeft: remainingTime,
            remainingTimeAbort
        });
    }

    async getJackpot() {
        return await this.state.contract.methods
                .getBalance()
                .call({from: this.state.user})
                .then(res => {
                    return this.state.web3.utils.fromWei(this.hexToNumberString(res._hex))/2;
                });
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
            .getCurrentTimestamp()
            .call({from: this.state.user})
            .then(res => {
                return (({open, start, payout, reveal}) => {
                    open = new Date(this.hexToNumber(open._hex) * 1000);
                    start = new Date(this.hexToNumber(start._hex) * 1000);
                    payout = new Date(this.hexToNumber(payout._hex) * 1000);
                    reveal = new Date(this.hexToNumber(reveal._hex) * 1000);
                    return {open, start, payout, reveal}
                })(res);
            })
    }

    async getTimers() {
        return await this.state.contract.methods
            .getTimers()
            .call({from: this.state.user})
            .then(res => {
                return (({TIME_LEFT_START, TO_ABORT, WAIT_TO_GO_TO_REVEAL, TO_REVEAL}) => {
                    TIME_LEFT_START = this.hexToNumber(TIME_LEFT_START._hex);
                    TO_ABORT = this.hexToNumber(TO_ABORT._hex);
                    WAIT_TO_GO_TO_REVEAL = this.hexToNumber(WAIT_TO_GO_TO_REVEAL._hex);
                    TO_REVEAL = this.hexToNumber(TO_REVEAL._hex);
                    return {TIME_LEFT_START, TO_ABORT, WAIT_TO_GO_TO_REVEAL, TO_REVEAL}
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

        let user = await this.getUser();
        this.setState({user: user});

        let timestamps = await this.getCurrentTimestamp();
        let currentPhase = await this.getCurrentPhase();
        let committed = await this.getCommitted();
        let fee = await this.getFee();
        let timers = await this.getTimers();
        let hasCommitted = await this.hasCommitted();
        let  jackpot = await this.getJackpot();
        let lotteryIndex = await this.getLotteryIndex();

        this.setState({
            timestamps: timestamps,
            currentPhase: currentPhase,
            committed: committed,
            fee: fee,
            timers: timers,
            hasCommitted: hasCommitted,
            jackpot: jackpot,
            lotteryIndex: lotteryIndex
        });
    }

    getCurrentPhase() {
        return this.state.contract.methods
            .getCurrentPhase()
            .call({from: this.state.user})
            .then(res => {
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

    getLotteryIndex() {
        return this.state.contract.methods
            .getLotteryIndex()
            .call({from: this.state.user})
            .then(res => {
                return this.hexToNumber(res._hex)
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
                return this.state.timers['TIME_LEFT_START'];
            case 1:
                return this.state.timers['WAIT_TO_GO_TO_REVEAL'];
            case 2:
                return this.state.timers['TO_REVEAL'];
            case 3:
                return 'PAYOUT';
        }
    }

    getPhaseForTimestamp(status) {
        switch (status) {
            case 0:
                return 'open';
            case 1:
                return 'start';
            case 2:
                return 'reveal';
            case 3:
                return 'payout';
        }
    }

    changePath(location){
        this.setState({
            path: location
        })
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
                                    <Header changePath = {(location)=>{
                                        this.changePath(location);
                                }} state={this.state}/>
                                    <div id="style-7" style={{overflowY: 'auto', height:'100%'}}>
                                        <Routes state={this.state} cookies={this.props.cookies}
                                                transactionNotification={(type, key, title, message) => this.transactionNotification(type, key, title, message)}
                                                refreshOnModalClose = {()=> this.refreshOnModalClose()}/>
                                    <Footer/>
                                    </div>

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
