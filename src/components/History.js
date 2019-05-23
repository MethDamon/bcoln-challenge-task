import React, {Component} from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {withRouter} from 'react-router-dom';
import {Card, CardContent} from "semantic-ui-react";
import CardHeader from "../views/CardHeader";
import {Typography} from "@material-ui/core";
import {Icon, Loader} from "rsuite";
import PlayedLottery from "../views/PlayedLottery"
import './History.css';


const styles = {
    HistoryContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "85vh",
        justifyContent: "space-evenly",
    },
    SummaryContainer: {
        width: 400,
        height: 240,
        background: "white",
        borderRadius: "15px 15px 15px 15px"
    },
    PlayedLotteriesContainer: {
        overflow: "scroll",
        width: 600,
        height: "50vh",
        background: "white",
        borderRadius: "15px 15px 15px 15px",
    },
    hr: {
        border: 0,
        width: "100%",
        background:"rgba(177,180,177,0.78)",
        height: "1px",
    },
    Info: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: 16,
    }
};

class History extends Component {

    constructor() {
        super();
        this.state = {
            jackpots: null,
            winningNumbersPerLottery: null,
            totalWinners: null
        }
    }

    componentDidMount() {
        this.getLotteries();
    }

    getLotteries = async () => {
        await this.props.contract.methods
            .getLotteries()
            .call({from: this.props.user})
            .then(res => {
                this.setState({
                    jackpots: res.jackpots.map(num => this.props.web3.utils.fromWei(this.props.web3.utils.hexToNumberString(num._hex))),
                    winningNumbersPerLottery: res.winning_numbers_per_lottery,
                    totalWinners : res.winners_per_lottery.map(num => this.props.web3.utils.hexToNumberString(num._hex)),
                });
            });
    };

    getTotalJackpot() {
        let totalJackpot = 0;
        this.state.totalWinners.forEach((n, index) => {
            totalJackpot += (n > 0) ? Number(this.state.jackpots[index]) : 0
        });
        return totalJackpot
    }

    render() {
        return (
            <div style={styles.HistoryContainer}>
                <div style={styles.SummaryContainer}>
                    <Card>
                        <CardHeader title='Summary' backgroundColor='linear-gradient(0deg, #26c6da, #00acc1)' borderRadius={"15px 15px 0 0"} boxShadow={"0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(0, 188, 212, 0.4)"} justifyContent={"center"}/>
                        <CardContent style={{padding: 23, display: "flex", flexDirection: "column", justifyContent: "center", height: 174}}>
                            {this.state.jackpots !== null && this.state.winningNumbersPerLottery !== null ? (
                                <CardContent style={{padding: 23, display: "flex", flexDirection: "column", alignItems: "center"}}>
                                    <div>
                                        <Typography component="p" align="justify" color="textSecondary" style={{fontWeight: "bold", marginBottom: 5}}>
                                            Total Amount Awarded:
                                        </Typography>
                                        <div style={styles.Info}>
                                            {this.getTotalJackpot()}

                                            <Icon style={{marginLeft: 4}} icon={"money"} size="sm" />
                                        </div>
                                    </div>
                                    <hr style={styles.hr}/>
                                    <div>
                                        <Typography component="p" align="justify" color="textSecondary" style={{fontWeight: "bold", marginBottom: 5}}>
                                            Total Winning Tickets:
                                        </Typography>
                                        <div style={styles.Info}>
                                            {this.state.totalWinners.reduce((total, winners) => total + Number(winners), 0)}
                                            <Icon style={{marginLeft: 4}} icon={"ticket"} size="sm" />
                                        </div>
                                    </div>
                                </CardContent>
                            ):(
                                <Loader/>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div id="scroll" style={styles.PlayedLotteriesContainer}>
                    <Card>
                        <CardHeader title='Played Lotteries' iconName={"history"} backgroundColor='linear-gradient(0deg, rgb(255, 167, 38), rgb(251, 140, 0))' borderRadius={"15px 15px 0 0"} boxShadow={"0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(255, 152, 0, 0.4)"} marginLeft={12}/>
                        <CardContent style={{padding: 23}}>
                            {this.state.jackpots !== null && this.state.winningNumbersPerLottery !== null && this.state.totalWinners !== null ? (
                                <div>
                                    {this.state.totalWinners.slice(0).reverse().map((winner, i) => (
                                        <div key={i}>
                                            <PlayedLottery winner={winner} winningNumbers={[this.state.winningNumbersPerLottery[i*2], this.state.winningNumbersPerLottery[i*2+1]]} jackpot={this.state.jackpots[i]} lotteryIndex={reverted.length-i}/>
                                            <hr style={styles.hr}/>
                                        </div>
                                        ))}
                                </div>
                            ):(
                                <Loader/>
                            )}
                        </CardContent>
                    </Card>
                </div>
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

export default withRouter(connect(mapStateToProps, mapActionsToProps)(History));
