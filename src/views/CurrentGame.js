import React from 'react';
import { Panel } from 'rsuite';
import lotto from '../assets/lotto.png'
import GameStatusBadge from "./GameStatusBadge";
import AnimatedNumber from 'react-animated-number';
import prettyBytes from 'pretty-bytes';



const styles = {
    Panel: {
        marginTop: "5px",
        background: 'linear-gradient(0deg, #11cdef 0,#1171ef 100%)',
        color: "white",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.5)",
        width: 450,
    },
    PanelHeader: {
        color: "white"
    },
    LotteryLogo: {
      width: '55px',
    },
    Info: {
        fontWeight: "bold"
    },
    Jackpot: {
        fontWeight: "bold",
        fontSize: 22
    }
};

const CurrentGame = ({currentFee, nrOfPlayers, gameStatus, timeLeft, jackpot}) =>{
    console.log(jackpot)
    return(
        <Panel header={<img style={styles.LotteryLogo} src={lotto} alt="Logo" />} style={styles.Panel}>
            <div>
                <h4 style={styles.Jackpot}>Jackpot</h4>
                <AnimatedNumber component="text" value={jackpot}
                                stepPrecision={4}
                                style={{
                                    transition: '0.8s ease-out',
                                    fontSize: 23,
                                    transitionProperty:
                                        'background-color, color, opacity'
                                }}
                                duration={600}
                                formatValue={n => `${n} ETH` }/>
            </div>
            <br/>
            <h4 style={styles.Info}>Current Number Of Players: {nrOfPlayers}</h4>
            {/*<div style={styles.Info}>Current Fee: {currentFee} WEI</div>*/}
            <h4 style={styles.Info}>Lottery Status: <GameStatusBadge status={gameStatus}/></h4>
            <h4 style={styles.Info}>Time left: {getTimeString(timeLeft)}</h4>
        </Panel>
    );
};

function getTimeString(t){
    return `${Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}:${Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor((t % (1000 * 60)) / 1000)}`
}

export default CurrentGame;