import { Text, TextStyle } from 'react-native';
import React from 'react';

interface TextCustomProps {
  style?: TextStyle; // Make style optional
  fontSize?: number;
  children: React.ReactNode;
}

const TextCustom: React.FC<TextCustomProps> = ({ style = {}, fontSize = 16, children }) => {
  return <Text style={[style, { fontSize }]}>{children}</Text>;
};

export default TextCustom;
