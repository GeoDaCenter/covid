import { useMemo } from "react";
import styled from "styled-components";

const TickMarsContainer = styled.div`
  width:100%;
  display: flex;
  flex-direction: row;
  height:2px;
  position:absolute;
  top:calc(50% + 1px);
  transform:translateY(-50%);
  span {
    height:100%;
    flex:1;
    min-width:0;
  }
`;

export default function Ticks({ loaded, available, fullLength }) {
  const ticks = useMemo(() => {
    if (!loaded || !available || !fullLength) return null;
    const items = [];
    for (let i = 0; i < fullLength; i++) {
      items.push(
        <span
          key={i}
          style={{ background: loaded.includes(i) || available[i]
            ? "white" 
            : "black" 
          }}
        />
      );
    }
    return items;
  }, [fullLength, JSON.stringify(loaded), JSON.stringify(available)]);

  return (
    <TickMarsContainer>
      {ticks}
    </TickMarsContainer>
  );
}
