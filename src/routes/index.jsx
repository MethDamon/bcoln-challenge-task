import {Route, Switch, Redirect} from "react-router-dom";

import React from "react";
import Home from "../components/Home";
import Load from "../components/Load";
import Lottery from "../components/Lottery";
import Reveal from "../components/Reveal";
import History from "../components/History";

const Routes = ({state, cookies, transactionNotification, refreshOnModalClose}) => (
    <Switch>
        <Route path="/join" render={(props) => (
            <Home {...props}
                  user={state.user}
                  committed={state.committed}
                  currentPhase={state.currentPhase}
                  fee={state.fee}
                  jackpot={state.jackpot}
                  contract={state.contract}
                  web3={state.web3}
                  cookies={cookies}
                  timeLeft={state.timeLeft}
                  hasCommitted={state.hasCommitted}
                  lotteryIndex={state.lotteryIndex}
                  transactionNotification={transactionNotification}/>)
        }/>
        <Route path="/lottery" render={(props) => (
            <Lottery {...props}
                     user={state.user}
                     committed={state.committed}
                     currentPhase={state.currentPhase}
                     fee={state.fee}
                     jackpot={state.jackpot}
                     contract={state.contract}
                     web3={state.web3}
                     cookies={cookies}
                     timeLeft={state.timeLeft}
                     timestamps={state.timestamps}
                     hasCommitted={state.hasCommitted}
                     lotteryIndex={state.lotteryIndex}
                     transactionNotification={transactionNotification}
                     remainingTimeAbort={state.remainingTimeAbort}/>
        )
        }/>
        <Route path="/reveal" render={(props) => (
            <Reveal {...props}
                    user={state.user}
                    committed={state.committed}
                    currentPhase={state.currentPhase}
                    fee={state.fee}
                    jackpot={state.jackpot}
                    contract={state.contract}
                    web3={state.web3}
                    cookies={cookies}
                    timeLeft={state.timeLeft}
                    timestamps={state.timestamps}
                    hasCommitted={state.hasCommitted}
                    transactionNotification={transactionNotification}
                    winners={state.winners}
                    lotteryIndex={state.lotteryIndex}
                    refreshOnModalClose={refreshOnModalClose}
                    winningNumbers={state.winningNumbers}
                    remainingTimeAbort={state.remainingTimeAbort}/>
        )
        }/>
        <Route path="/load" render={(props) => (
            <Load {...props}
                    user={state.user}
                    committed={state.committed}
                    currentPhase={state.currentPhase}
                    fee={state.fee}
                    jackpot={state.jackpot}
                    contract={state.contract}
                    web3={state.web3}
                    cookies={cookies}
                    timeLeft={state.timeLeft}
                    timestamps={state.timestamps}
                    hasCommitted={state.hasCommitted}
                    transactionNotification={transactionNotification}
                    winners={state.winners}
                    lotteryIndex={state.lotteryIndex}
                    refreshOnModalClose={refreshOnModalClose}
                    winningNumbers={state.winningNumbers}
                    remainingTimeAbort={state.remainingTimeAbort}/>
        )
        }/>
        <Route path="/history" render={(props) => (
            <History {...props}
                  user={state.user}
                  committed={state.committed}
                  currentPhase={state.currentPhase}
                  fee={state.fee}
                  jackpot={state.jackpot}
                  contract={state.contract}
                  web3={state.web3}
                  cookies={cookies}
                  timeLeft={state.timeLeft}
                  timestamps={state.timestamps}
                  hasCommitted={state.hasCommitted}
                  transactionNotification={transactionNotification}
                  winners={state.winners}
                  lotteryIndex={state.lotteryIndex}
                  refreshOnModalClose={refreshOnModalClose}
                  winningNumbers={state.winningNumbers}
                  remainingTimeAbort={state.remainingTimeAbort}/>
        )
        }/>
        <Redirect from='/*' to='/join'/>
    </Switch>
);

export default Routes
