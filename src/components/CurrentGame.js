import React from 'react';
import styled from 'styled-components';
const Tab = styled.div`    
background: linear-gradient(to right, #f7971e, #ffd200)
`


const CurrentGame = ({style, currentBet, nrOfPlayers, gameStatus}) =>{
    return(
        <Tab style={style}>
            <div>Current Number Of Players: {nrOfPlayers}</div>
                <div>Current Bet: {currentBet}</div>
            <div>Game Status: {gameStatus}</div>
        </Tab>
    );
};


export default CurrentGame;