import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';

const Footer = () => (
    <div style = {{ 'color': 'white'}}>
        <p
            style={{
                marginBottom: 0,
                marginTop: '5em',
                fontSize: 18,
                fontWeight: 'bold'
            }}
        >
            Developed by:{' '}
        </p>
        <p style={{marginTop: 5, marginBottom: 0}}>Ile Cepilov </p>
        <p style={{marginTop: 5, marginBottom: 0}}>Elfat Esati</p>
        <p style={{marginTop: 5, marginBottom: 0}}>Tim Strasser</p>
        <p style={{marginTop: 5, marginBottom: 0}}>Erion Sula</p>
        <p style={{marginTop: 5, marginBottom: 0}}>Ledri Thaqi</p>
    </div>
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
