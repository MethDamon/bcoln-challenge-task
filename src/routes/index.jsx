import {Route, Switch, Redirect} from "react-router-dom";

import React from "react";
import Home from "../components/Home";
import Lottery from "../components/Lottery";
import Reveal from "../components/Reveal";

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
                     transactionNotification={transactionNotification}/>
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
                    refreshOnModalClose={refreshOnModalClose}
                    winningNumbers={state.winningNumbers}/>
        )
        }/>
        <Redirect from='/*' to='/join'/>
    </Switch>
);

export default Routes