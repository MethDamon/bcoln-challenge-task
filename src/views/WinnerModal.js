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
        top: "5vh",
        width: "40%",
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

const WinnerModal = (props) => {
    function getJackpot() {
        if(props.winners.length===1){
            return 2*props.jackpot/props.winningNumbers.length;
        }
        return props.jackpot/props.winningNumbers.length;
    }
    return (
    <Modal style={styles.endModal} show={props.winningNumbers.length > 0}
           onHide={props.refreshOnModalClose}>
        <Modal.Header>
            <Modal.Title style={{fontWeight: "bold", fontSize: "40px", textAlign: "center"}}>
                {props.winners.includes(props.user) ? (
                    <div>
                        {"Congratulations!"}
                        <ModalTitle>{`You won ${getJackpot()} ETH`}</ModalTitle>
                    </div>
                ) : (
                    <div style={{color: "red"}}>
                        {"You Lost!"}
                    </div>
                )}
            </Modal.Title>
        </Modal.Header>
        <Divider/>
        <h3 style={{fontSize: "21px", textAlign: "center", fontWeight: "bold"}}>{'Number of Winners: '}</h3>
        <div style={{display: 'flex', justifyContent: "space-evenly", marginTop: 20}}>
            <div style={{fontSize: "30px", textAlign: "center", fontWeight: "bold", color: "white", background: "linear-gradient(60deg, #ffa726, #fb8c00)", borderRadius: "50%", width: 45}}>
                {props.winners.length}
            </div>
        </div>
        <Modal.Body>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 30}}>
                <img style={{width: 150}} src={lottery} alt="Logo" />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h3 style={{fontSize: "21px", textAlign: "center", fontWeight: "bold"}}>{"Winning Numbers:"}</h3>
                    <div style={{display: 'flex', justifyContent: "space-evenly", marginTop: 20}}>
                        {props.winningNumbers.map((n, index )=> (
                            <div key={index} style={{fontSize: "30px", textAlign: "center", fontWeight: "bold", color: "white", background: "linear-gradient(60deg, #ffa726, #fb8c00)", borderRadius: "50%", width: 45}}>
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
)};

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
