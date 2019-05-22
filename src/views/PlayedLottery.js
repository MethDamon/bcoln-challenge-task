import React from 'react';
import {Typography} from "@material-ui/core";
import {Icon} from "rsuite";

const PlayedLottery = ({winner, winningNumbers, jackpot, lotteryIndex}) => {
    return (
        <div style={{height: 180, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
            <div>
                <Typography component="p" align="justify" color="textSecondary" style={{fontSize: 10, fontWeight: "bold"}}>
                    Lottery #{lotteryIndex}
                </Typography>
            </div>
            <div style={{display: "flex", flexDirection: "column", justifyContent: "space-evenly", height: 170}}>
                <div style={{height: 70, display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
                    <Typography component="p" align="justify" color="textSecondary" style={{fontSize: 15, fontWeight: "bold"}}>
                        Winning Numbers
                    </Typography>
                    <div style={{display: "flex", justifyContent: "space-evenly", width: 46}}>
                        {winningNumbers.map((n, index )=> (
                            <div key={index} style={{fontSize: "15px", textAlign: "center", fontWeight: "bold", color: "white", background: "linear-gradient(60deg, #ffa726, #fb8c00)", borderRadius: "50%", width: 20}}>
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{height: 70, display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
                        <Typography component="p" align="justify" color="textSecondary" style={{fontSize: 15, fontWeight: "bold"}}>
                            Winners
                        </Typography>
                        <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "baseline", width: 46}}>
                            <h2>{winner}</h2>
                            <Icon icon={"user-circle"} size="sm" />
                        </div>
                    </div>
                    <div style={{height: 70, display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
                        <Typography component="p" align="justify" color="textSecondary" style={{fontSize: 15, fontWeight: "bold"}}>
                            Jackpot
                        </Typography>
                        <h3>{jackpot} ETH</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayedLottery;
