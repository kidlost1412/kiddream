import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Button from '../../ui/Button';
import { useUIStore } from '../../../stores/useUIStore';

type ViewMode = 'list' | 'grid' | 'week' | 'month';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  daysToShow: number;
  onDaysChange: (days: number) => void;
  onNewTask: () => void;
  // Filters
  searchTerm?: string;
  onSearchChange?: (v: string) => void;
  priorityFilter?: number | 'all';
  onPriorityChange?: (v: number | 'all') => void;
  tagFilter?: string;
  onTagFilterChange?: (v: string) => void;
  availableDayOptions?: number[];
  onDaysStep?: (dir: 'in'|'out') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  currentDate,
  onDateChange,
  daysToShow,
  onDaysChange,
  onNewTask,
  searchTerm = '',
  onSearchChange,
  priorityFilter = 'all',
  onPriorityChange,
  tagFilter = '',
  onTagFilterChange,
  availableDayOptions = [1,3,5,7,14],
  onDaysStep,
}) => {
  const { t } = useTranslation();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - daysToShow);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysToShow);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDateRange = () => {
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + daysToShow - 1);
    
    const startMonth = currentDate.toLocaleDateString('vi-VN', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('vi-VN', { month: 'short' });
    const startDay = currentDate.getDate();
    const endDay = endDate.getDate();
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Row: Title + New Task */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Mở thanh bên' : 'Thu gọn thanh bên'}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isSidebarCollapsed ? (
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-white">{t('calendar.title')}</h2>
        </div>
        <Button onClick={onNewTask}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t('calendar.newTask')}
        </Button>
      </div>

      {/* Bottom Row: Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      {/* Left: View Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded transition-all ${
            viewMode === 'list'
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={t('calendar.viewMode.list')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded transition-all ${
            viewMode === 'grid'
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={t('calendar.viewMode.grid')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>

      {/* Center: Date Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white min-w-[140px] text-center">
            {formatDateRange()}
          </span>
          <Button size="sm" onClick={goToToday} variant="secondary">
            {t('calendar.today')}
          </Button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Right: Days Selector + Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
          <button
            onClick={() => onDaysStep?.('in')}
            disabled={daysToShow <= Math.min(...availableDayOptions)}
            className={`p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition ${daysToShow <= Math.min(...availableDayOptions) ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Thu nhỏ phạm vi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>
          </button>
          <span className="text-xs text-slate-400">{daysToShow} ngày</span>
          <button
            onClick={() => onDaysStep?.('out')}
            disabled={daysToShow >= Math.max(...availableDayOptions)}
            className={`p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition ${daysToShow >= Math.max(...availableDayOptions) ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Mở rộng phạm vi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <span className="text-sm text-slate-400">{t('calendar.daysCount', { count: daysToShow })}</span>
        <select
          value={daysToShow}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {availableDayOptions.map(v => (
            <option key={v} value={v}>{v} ngày</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={String(priorityFilter)}
          onChange={(e) => onPriorityChange && onPriorityChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả ưu tiên</option>
          <option value={0}>Thấp</option>
          <option value={1}>Trung bình</option>
          <option value={2}>Cao</option>
        </select>

        {/* Tag Filter */}
        <input
          value={tagFilter}
          onChange={(e) => onTagFilterChange && onTagFilterChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="#tag"
        />

        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('common.search')}
        />
      </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
