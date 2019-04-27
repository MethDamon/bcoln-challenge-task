import React from "react";
import {Tag} from "rsuite";

const styles = {
    committed: {
        background: "green",
        color: "white"
    },
    readyForReveal: {
        background: 'orange',
        color: "white"
    },
    reveal: {
        background: "red",
        color: "white"
    }
};

const GameStatusBadge = ({status}) =>(
    <Tag style={getStyle(status)}>{status}</Tag>
);

const getStyle = (status) => {
    return status === 'COMMITTED' ? styles.committed : status === 'READY FOR REVEAL' ? styles.readyForReveal: styles.reveal
};

export default GameStatusBadge