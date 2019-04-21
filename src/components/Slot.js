import React from 'react';
import styled from 'styled-components';

const SlotStyle = styled.div`
  display: flex;
  text-transform: uppercase;
  flex-direction: row;
  justify-content: center;
  align-items: center;
color: #fff !important;
  //background: #f0cb35; /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: ${({chosenNumbers, number}) => (chosenNumbers.includes(number) ? "grey" : "#f6b93b")} ;
  margin: 3px;
  height: 60px;
  width: 60px;
  font-size: 20px;
  border-radius: 10px;
  
    :hover {
color: black !important;
background: white;
border-color: #f6b93b !important;
transition: all 0.4s ease 0s;
}`


const Slot = ({number, chosenNumbers, callback}) => {
    return (
        <SlotStyle onClick={callback} chosenNumbers={chosenNumbers} number={number}>
            {number}
        </SlotStyle>
    );
};


export default Slot;