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
        <div class="icons" style={{float: 'right', display:'flex', flexDirection:'row'}}>
            <Icon componentClass={Link} to={"join"} style={{flex:1, paddingRight: 15}} icon='home' size='lg' inverse={true}/>
            <Icon componentClass={Link} to={"history"} style={{flex:1, paddingRight: 15}} icon='history' size='lg' inverse={true}/>
            <Icon componentClass={Link} to={"load"} style={{flex:1, paddingRight: 15}} icon='gear' size='lg' inverse={true}/>
        </div>

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
