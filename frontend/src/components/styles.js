import styled from "styled-components";
// body container 
export const Container = styled.div`
  min-height: 100vh; display:flex; justify-content:center; align-items:center;
  background:#e0e5ec; padding:20px;
`;
export const Card = styled.div`
  width:100%; max-width:420px; background:#e0e5ec; border-radius:30px;
  padding:50px 40px; box-shadow:20px 20px 60px #bec3cf, -20px -20px 60px #ffffff;
`;


// Profile css 
// Neumorphic input
export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
  border: none;
  background: #e0e5ec;
  box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  outline: none;
`;

// Neumorphic button
export const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  background: #e0e5ec;
  box-shadow: 6px 6px 12px #bec3cf, -6px -6px 12px #ffffff;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  &:hover {
    box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  }
`;

export const ProfileIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e0e5ec;
  box-shadow: 8px 8px 20px #bec3cf, -8px -8px 20px #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  svg {
    width: 40px;
    height: 40px;
    color: #6c7293;
  }
`;

// activity 


export const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  background: #e0e5ec;
  display: flex;
  justify-content: center;
  filter: ${(props) => (props.blur ? "blur(5px)" : "none")};
  transition: filter 0.3s ease-in-out;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 900px;
`;

export const PageTitle = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
  gap: 0.75rem;
`;