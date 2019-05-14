import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import {Button, Modal, Divider} from "rsuite";
import lottery from '../assets/lottery.png'
import styled from 'styled-components'
const styles = {
    endModal: {
        position: "relative",
        top: "25vh",
        width: "50%",
        fontSize: '30px'
    },
    body: {
        display: "flex",
        alignItems: "center",
    }
};

const ModalTitle = styled.h3`
   font-size: 25px;
   text-align: center;
   font-weight: bold;
   color: #3a9c6c
`;

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
    <Modal style={styles.endModal} show={props.winningNumbers.length > 0}
           onHide={props.refreshOnModalClose}>
        <Modal.Header>
            <Modal.Title style={{fontWeight: "bold", fontSize: "40px", textAlign: "center"}}>
                {props.winners.includes(props.user) ? (
                        <div>
                            {"Congratulations!"}
                            <ModalTitle>{"You won the lottery"}</ModalTitle>
                        </div>
                ) : (
                    <div style={{color: "red"}}>
                        {"You Lost!"}
                    </div>
                    )}
            </Modal.Title>
        </Modal.Header>
        <Divider/>
        <Modal.Body>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <img style={{width: 150}} src={lottery} alt="Logo" />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h3 style={{fontSize: "21px", textAlign: "center", fontWeight: "bold"}}>{"Winning Numbers:"}</h3>
                    <div style={{display: 'flex', justifyContent: "space-evenly", marginTop: 20}}>
                        {props.winningNumbers.map(n => (
                            <div style={{fontSize: "30px", textAlign: "center", fontWeight: "bold", color: "white", background: "linear-gradient(60deg, #ffa726, #fb8c00)", borderRadius: "50%", width: 45}}>
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
