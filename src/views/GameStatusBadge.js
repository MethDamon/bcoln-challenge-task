import React from "react";
import {Tag} from "rsuite";

const styles = {
    committed: {
        background: "linear-gradient(60deg, #66bb6a, #43a047)",
        color: "white"
    },
    readyForReveal: {
        background: 'linear-gradient(60deg, #ffa726, #fb8c00)',
        color: "white"
    },
    reveal: {
        background: "linear-gradient(60deg, #ef5350, #e53935)",
        color: "white"
    }
};

const GameStatusBadge = ({status}) =>(
    <Tag style={getStyle(status)}>{status}</Tag>
);

const getStyle = (status) => {
    return status === 'OPEN' ? styles.committed : status === 'STARTED' ? styles.readyForReveal: styles.reveal
};

export default GameStatusBadge
