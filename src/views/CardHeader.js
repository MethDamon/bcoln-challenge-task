import styled from 'styled-components'
import React from 'react'
import {Icon} from "rsuite";

const Container = styled.div`
  font-size: 18px;
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  color: white;
`;

const CardHeader = ({ title , iconName, backgroundColor, position, width, zIndex, borderRadius, boxShadow, justifyContent}) => (
    <Container style={{background: backgroundColor, position: position, width: width, zIndex: zIndex, borderRadius: borderRadius, boxShadow: boxShadow, justifyContent}}>
        <Icon icon={iconName} size="2x" />
        <h2>{title}</h2>
    </Container>
);

export default CardHeader
