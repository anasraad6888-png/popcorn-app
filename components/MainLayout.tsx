"use client";
import React from 'react';
import { useSidebar } from '@/app/context/SidebarContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isVisible } = useSidebar();

  return (
    <main 
      className={`transition-all duration-500 ease-in-out ${isVisible ? 'md:ps-12' : 'md:ps-0'}`}
    >
      {children}
    </main>
  );
}