import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import styled from 'styled-components'
import {Icon} from "rsuite";

const Developer = styled.p`
  margin-top: 5px;
  display: flex;
  justify-content: center
`;

const Title = styled.p`
  margin-bottom: 0;
  font-size: 18px;
  font-weight: bold;
`;

const Container = styled.div`
  color: white;
  position: absolute;
  width:100%;
  bottom:10px;
`;
const GithubLink = styled.a`
  color: white;
  margin: 0 0 0 5px;
`;
const Footer = () => (
    <Container>
        <Title>
            Developed by:{' '}
        </Title>
        <Developer >Ile Cepilov
            <GithubLink href="https://github.com/ilecipi" target="_blank" >
                <Icon style={{float: 'right'}} icon="github" size='lg'/>
            </GithubLink></Developer>
        <Developer>Elfat Esati</Developer>
        <Developer>Tim Strasser
            <GithubLink href="https://github.com/MethDamon" target="_blank" >
                <Icon style={{float: 'right'}} icon="github" size='lg'/>
            </GithubLink></Developer>
        <Developer>Erion Sula
            <GithubLink href="https://github.com/sulasdeli" target="_blank" >
                <Icon style={{float: 'right'}} icon="github" size='lg'/>
            </GithubLink></Developer>
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
