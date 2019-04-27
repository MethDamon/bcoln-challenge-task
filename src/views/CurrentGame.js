import React from 'react';
import { Panel } from 'rsuite';
import lotto from '../assets/lotto.png'
import GameStatusBadge from "./GameStatusBadge";

const styles = {
    Panel: {
        marginTop: "5px",
        background: 'linear-gradient(0deg, #11cdef 0,#1171ef 100%)',
        color: "white",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.5)"
    },
    PanelHeader: {
        color: "white"
    },
    LotteryLogo: {
      width: '55px',
    },
    Info: {
        fontWeight: "bold"
    }
};

const CurrentGame = ({currentFee, nrOfPlayers, gameStatus, timeLeft}) =>{
    return(
        <Panel header={<img style={styles.LotteryLogo} src={lotto} alt="Logo" />} style={styles.Panel}>

            <h4 style={styles.Info}>Current Number Of Players: {nrOfPlayers}</h4>
            {/*<div style={styles.Info}>Current Fee: {currentFee} WEI</div>*/}
            <h4 style={styles.Info}>Game Status: <GameStatusBadge status={gameStatus}/></h4>
            <h4 style={styles.Info}>Time left: {getTimeString(timeLeft)}</h4>
        </Panel>
    );
};

function getTimeString(t){
    return `${Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}:${Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor((t % (1000 * 60)) / 1000)}`
}

export default CurrentGame;