import React from 'react';
import styled from 'styled-components';

const SlotStyle = styled.div`
  display: flex;
  text-transform: uppercase;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${({chosenNumbers, number}) => (chosenNumbers.includes(number) ? "white" : "black")} ;
  //background: #f0cb35; /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: ${({chosenNumbers, number}) => (chosenNumbers.includes(number) ? "linear-gradient(45deg,#f9b18e,#EA5455 100%)" : "#ffffff")} ;
  margin: 3px;
  height: 60px;
  width: 60px;
  font-size: 20px;
  border-radius: 100%;
  border-color: black;
  
:hover {
    transition: all 0.4s ease 0s;
    cursor: pointer;
}`;

const Slot = ({number, chosenNumbers, callback}) => {
    return (
        <SlotStyle onClick={callback} chosenNumbers={chosenNumbers} number={number}>
            {number}
        </SlotStyle>
    );
};

export default Slot;