import React from 'react';
import { Panel } from 'rsuite';
import lotto from '../assets/lotto.png'

const styles = {
    Panel: {
        marginTop: "5px",
        background: 'linear-gradient(0deg,#ff771c,#ff8b2d)',
        color: "white",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.29)"
    },
    PanelHeader: {
        color: "white"
    },
    LotteryLogo: {
      width: '55px',
    }
};


const CurrentGame = ({currentFee, nrOfPlayers, gameStatus, timeLeft}) =>{
    return(
        <Panel header={<img style={styles.LotteryLogo} src={lotto} alt="Logo" />} style={styles.Panel}>


            <div>Current Number Of Players: {nrOfPlayers}</div>
            <div>Current Fee: {currentFee} WEI</div>
            <div>Game Status: {gameStatus}</div>
            <div>Time left: {getTimeString(timeLeft)}</div>
        </Panel>
    );
};

function getTimeString(t){
    return `${Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}:${Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor((t % (1000 * 60)) / 1000)}`
}





export default CurrentGame;