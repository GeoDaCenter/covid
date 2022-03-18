import { useEffect, useRef } from "react";
import styled from "styled-components";

const TickMarsContainer = styled.div`
  width:100%;
  display: flex;
  flex-direction: row;
  height:2px;
  position:absolute;
  top:calc(50% + 1px);
  transform:translateY(-50%);
`;

const TickCanvas = styled.canvas`
  width:100%;
  height:6px;
  transform:translateY(1px);
`
export default function Ticks({ available, fullLength }) {
  const canvasRef = useRef(null);
  const draw = (ctx, startX, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(startX, 0, startX+1, 50);
  }

  useEffect(() => {
    console.log('rendering ticks')
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    for (let i = 0; i < fullLength; i++) {
      draw(context, context.canvas.width*(i/fullLength), available[i] ? 'white' : 'black')
    }
  },[fullLength, JSON.stringify(available)])
  
  return (
    <TickMarsContainer>
      <TickCanvas ref={canvasRef} />
    </TickMarsContainer>
  );
}
