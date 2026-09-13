'use client';

import React from 'react';
import { Navbar } from './Navbar';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <Navbar {...props} />;
};
