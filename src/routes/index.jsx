import {Route, Switch, Redirect} from "react-router-dom";

import React from "react";
import Home from "../components/Home";
import Lottery from "../components/Lottery";
import Reveal from "../components/Reveal";

const Routes = ({state, cookies, transactionNotification}) => (
    <Switch>
        <Route path="/join" render={(props) => (
            <Home {...props}
                  user={state.user}
                  committed={state.committed}
                  currentPhase={state.currentPhase}
                  fee={state.fee}
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
                     contract={state.contract}
                     web3={state.web3}
                     cookies={cookies}
                     timeLeft={state.timeLeft}
                     timestamps = {state.timestamps}
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
                    contract={state.contract}
                    web3={state.web3}
                    cookies={cookies}
                    timeLeft={state.timeLeft}
                    timestamps = {state.timestamps}
                    hasCommitted={state.hasCommitted}
                    transactionNotification={transactionNotification}/>
        )
        }/>
        <Redirect from='/*' to='/join' />
    </Switch>
);

export default Routes