import React from 'react';
import styled from 'styled-components';
import GAME_STATUS from "../const/GameStatus";

const Tab = styled.div`    
background: linear-gradient(to right, #f7971e, #ffd200)
`;

const CurrentGame = ({style, currentFee, nrOfPlayers, gameStatus, timeLeft}) =>{
    return(
        <Tab style={style}>
            <div>Current Number Of Players: {nrOfPlayers}</div>
            <div>Current Fee: {currentFee} WEI</div>
            <div>Game Status: {gameStatus}</div>
            <div>Time left: {getTimeString(timeLeft)}</div>
        </Tab>
    );
};

function getTimeString(t){
    return `${Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}:${Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor((t % (1000 * 60)) / 1000)}`
}





export default CurrentGame;