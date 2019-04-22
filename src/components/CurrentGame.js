import React from 'react';
import styled from 'styled-components';
import GAME_STATUS from "../const/GameStatus";
const Tab = styled.div`    
background: linear-gradient(to right, #f7971e, #ffd200)
`


const CurrentGame = ({style, currentFee, nrOfPlayers, gameStatus, timestamps}) =>{
    return(
        <Tab style={style}>
            <div>Current Number Of Players: {nrOfPlayers}</div>
            <div>Current Fee: {currentFee} WEI</div>
            <div>Game Status: {gameStatus}</div>
            <div>Timestamps: {getTime(timestamps[getPhaseForTimestamp(gameStatus)])}</div>

        </Tab>
    );
};

function getTime(date){
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

function getPhaseForTimestamp(status){
    switch(status){
        case GAME_STATUS["0"]:
            return 'commit';
        default:
            return 'asd';
    }
}


export default CurrentGame;