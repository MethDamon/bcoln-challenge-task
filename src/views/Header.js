import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import styled from 'styled-components'

const HeaderContainer = styled.div`
  height: 50px;
  background: #eeeeee;
`;
const Header = () => (
    <HeaderContainer>
        <span>Header Content --></span>
        <button onClick={() => {
            if (this.props.isLoading) {
                this.props.stopLoading()
            } else {
                this.props.startLoading()
            }
        }}>TOGGLE LOADING
        </button>
    </HeaderContainer>
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

export default connect(mapStateToProps, mapActionsToProps)(Header);
