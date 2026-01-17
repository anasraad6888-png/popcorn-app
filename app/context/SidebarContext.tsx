"use client";
import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isVisible: false,
  setIsVisible: () => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <SidebarContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);