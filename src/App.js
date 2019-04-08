import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import { Input, InputGroup, Icon } from 'rsuite';
import CurrentGame from './components/CurrentGame'
import GAME_STATUS from './const/GameStatus';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 55vh;
  color: white;
`;
const Footer = styled.div`
  min-height: 10vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
`;

const styles = {
    width: 300,
    marginBottom: 10,
};
const stylesCurrentGame= {
    width: 300,
    marginBottom: 100,
    borderRadius: 7
};
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header" >
        </header>
          <Container>
              <CurrentGame style={stylesCurrentGame}
                           nrOfPlayers={5}
                           currentBet ={200}
                           gameStatus = {GAME_STATUS.GAME_STARTED}
              />
              <InputGroup inside style={styles}>
                  <InputGroup.Addon>
                      <Icon icon="avatar" />
                  </InputGroup.Addon>
                  <Input />
              </InputGroup>

              <InputGroup style={styles}>
                      <InputGroup.Addon>$</InputGroup.Addon>
                      <Input />
                      <InputGroup.Addon>.00</InputGroup.Addon>
                  </InputGroup>
              <Button color="yellow" >
                  Login
              </Button>
          </Container>
          <Footer>

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


          </Footer>
      </div>
    );
  }
}



export default App;
