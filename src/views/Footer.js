import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import styled from 'styled-components'

const Developer = styled.p`
  margin-top: 5px;
`;

const Title = styled.p`
  margin-bottom: 0;
  margin-top: 5em;
  font-size: 18px;
  font-weight: bold
`;

const Container = styled.div`
  color: white;
  margin-top: 180px;
`;

const Footer = () => (
    <Container>
        <Title>
            Developed by:{' '}
        </Title>
        <Developer>Ile Cepilov </Developer>
        <Developer>Elfat Esati</Developer>
        <Developer>Tim Strasser</Developer>
        <Developer>Erion Sula</Developer>
        <Developer>Ledri Thaqi</Developer>
    </Container>
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

export default connect(mapStateToProps, mapActionsToProps)(Footer);
