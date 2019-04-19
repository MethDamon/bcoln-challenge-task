import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import { css } from '@emotion/core';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from './CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import RingLoader from 'react-spinners/RingLoader';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
`;

const HomeStyle = styled.div`
    height: 65vh
`;

const Loader = styled.div`
    height: 70vh
        display: flex;
      flex-direction: column;
  justify-content: center;
  align-items: center;
    border-color: red;
`;


const styles = {
    width: 300,
    marginBottom: 10,
};
const stylesCurrentGame = {
    width: 300,
    marginBottom: 100,
    borderRadius: 7
};

class Home extends Component {
    async componentDidMount() {

    }

    constructor({user}) {
       super()
    }

    render() {
        return (
            <HomeStyle>
                {this.props.isLoading ?
                    (<Loader>
                    <RingLoader
                        sizeUnit={"px"}
                        size={500}
                        color={'red'}
                        loading={this.props.isLoading}/>
                    </Loader>) : (
                        <div>
                            < Container >
                                < CurrentGame style={stylesCurrentGame}
                                              nrOfPlayers={this.props.committed}
                                              currentBet={200}
                                              gameStatus={GAME_STATUS[this.props.currentPhase]}
                                />
                                <InputGroup inside style={styles}>
                                    <InputGroup.Addon>
                                        <Icon icon="avatar"/>
                                    </InputGroup.Addon>
                                    <Input defaultValue = {this.props.user}
                                    disabled = {true}/>
                                </InputGroup>

                                <InputGroup style={styles}>
                                    <InputGroup.Addon>$</InputGroup.Addon>
                                    <Input/>
                                    <InputGroup.Addon>.00</InputGroup.Addon>
                                </InputGroup>
                                {this.user}
                                <Button color="yellow">
                                    Login
                                </Button>
                            </Container>

                        </div>)}
            </HomeStyle>
        );
    }
}

// const props = ({user})=>{
//     return {user}
// }

const mapStateToProps = (state, {user, committed, currentPhase}) => {
    return {
        isLoading: state.ui.isLoading,
        user,
        committed,
        currentPhase
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default connect(mapStateToProps, mapActionsToProps)(Home);
