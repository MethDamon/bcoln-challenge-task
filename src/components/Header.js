import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from './CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';

class Header extends Component {

    constructor() {
        super()
    }

    render() {
        return (
            <div style = {{'height':'50px', 'backgroundColor': 'grey'}}>
                <span>THIS IS THE HEADER --></span>
            <button onClick={() => {
                if (this.props.isLoading) {
                    this.props.stopLoading()
                } else {
                    this.props.startLoading()
                }
            }}>TOGGLE LOADING
            </button>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.ui.isLoading,
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default connect(mapStateToProps, mapActionsToProps)(Header);
