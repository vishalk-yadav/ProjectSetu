import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { AIChatDrawer } from '../ai/AIChatDrawer';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F4F6F9] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar on the Left (full height fixed static) */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace on the Right: TopNav + Outlet */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNav
          setMobileOpen={setMobileOpen}
          onOpenAIChat={() => setAiChatOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0 bg-[#F4F6F9] dark:bg-[#070D18]">
          <Outlet />
        </main>
      </div>

      {/* Persistent AI Assistant Drawer */}
      <AIChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </div>
  );
};

