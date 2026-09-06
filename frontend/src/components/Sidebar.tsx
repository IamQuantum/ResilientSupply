import React from 'react';
import { 
  Network, 
  Boxes, 
  LayoutGrid, 
  TrendingUp, 
  BarChart3, 
  Sliders, 
  CheckSquare, 
  History, 
  HelpCircle, 
  Headphones 
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  pendingApprovalsCount = 1
}) => {
  const navItems = [
    { id: 'control-center' as NavigationTab, label: 'Control Center', icon: LayoutGrid },
    { id: 'monitor' as NavigationTab, label: 'Monitor', icon: TrendingUp },
    { id: 'analysis' as NavigationTab, label: 'Analysis', icon: BarChart3 },
    { id: 'options' as NavigationTab, label: 'Options', icon: Sliders },
    { 
      id: 'approvals' as NavigationTab, 
      label: 'Approvals', 
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
    },
    { id: 'audit' as NavigationTab, label: 'Audit', icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
          <Network className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          ResilientChain
        </span>
      </div>

      {/* Scope Sub-Header Card */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 leading-tight">Autonomous Ops</div>
            <div className="text-[11px] text-slate-400 font-medium">India Logistics Hub</div>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-900 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Support Links */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        <button 
          onClick={() => alert('ResilientChain AI Documentation & Knowledge Base')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Help</span>
        </button>
        <button 
          onClick={() => alert('24/7 Supply Chain Incident Response Hotline')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Headphones className="w-4 h-4 text-slate-500" />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
