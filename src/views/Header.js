import React from 'react';
import {connect} from 'react-redux'
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import styled from 'styled-components'
import {Icon} from "rsuite";
import {Link} from "react-router-dom"

const HeaderContainer = styled.div`
  font-size: 18px;
  padding: 16px;
  height: 50px;
`;

const GithubLink = styled.a`
  color: white;
`;
const Header = (props) => {
    return(
    <HeaderContainer>
        <GithubLink href="https://github.com/MethDamon/bcoln-challenge-task" target="_blank">
            <Icon style={{float: 'left'}} icon="github" size='lg'/>
        </GithubLink>
        {props.state.path == '/join' ? (
            <Icon componentClass={Link} to={"load"} style={{float: 'right'}} icon='gear' size='lg' inverse={true} onClick={()=>{
                props.changePath('/load')
            }}/>
        ) : (<Icon componentClass={Link} to={"join"} style={{float: 'right'}} icon='gear' size='lg' inverse={true} onClick={()=>{
            props.changePath('/join')
            }}/>
        )}
    </HeaderContainer>
    );
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.ui.isLoading,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default connect(mapStateToProps, mapActionsToProps)(Header);
