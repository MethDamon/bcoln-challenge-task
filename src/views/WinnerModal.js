import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {Button, Modal, Divider} from "rsuite";

const styles = {
    endModal: {
        position: "relative",
        top: "25vh",
        width: "50%",
        fontSize: '30px'
    },
    body: {
        display: "flex",
        justifyContent: "center"
    }
};

const modalTitle = (props) => {
    let modalText = [];
    if (props.winners.includes(this.props.user)) {
        modalText[0] = 'Congratulations! You won the lottery!';
    } else {
        modalText[0] = 'You lost!\n'
    }
    if (props.winners.length > 0) {
        modalText[1] = `${props.winners.length} participant won the lottery`;
    } else {
        modalText[1] = 'Nobody won the jackpot\n'
    }
    modalText[2] = `Extracted numbers: ${props.winningNumbers[0]} - ${props.winningNumbers[1]}`;

    return modalText
};

const WinnerModal = (props) => (
    <Modal style={styles.endModal} show={false}
           onHide={props.refreshOnModalClose}>
        <Modal.Header>
            <Modal.Title style={{fontWeight: "bold", fontSize: "40px", textAlign: "center"}}>
                {"Congratulations!"}
                <h3 style={{fontSize: "25px", textAlign: "center", fontWeight: "bold", color: "#3a9c6c"}}>{"You won the lottery"}</h3>
            </Modal.Title>
        </Modal.Header>
        <Divider/>
        <Modal.Body style={styles.body}>
            <div>{1}</div>
            <div>{2}</div>
        </Modal.Body>
        <Divider/>
        <Modal.Footer>
            <Button onClick={props.refreshOnModalClose} appearance="primary">
                Close
            </Button>
        </Modal.Footer>
    </Modal>
);

const mapStateToProps = (state) => {
    return {
        isLoading: state.ui.isLoading,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default connect(mapStateToProps, mapActionsToProps)(WinnerModal);
