import React, { useState } from 'react';
import Calendar2Grid from '../components/features/calendar2/Calendar2Grid';
import Calendar2Agenda from '../components/features/calendar2/Calendar2Agenda';
import CalendarHeader from '../components/features/calendar2/CalendarHeader';
import CalendarFull from '../components/features/calendar2/CalendarFull';
import ImprovedAddTodoModal from '../components/features/todos/ImprovedAddTodoModal';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation } from 'react-router-dom';

type ViewMode = 'list' | 'grid' | 'week' | 'month';

const TodosPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysToShow, setDaysToShow] = useState(7);
    const { t } = useTranslation();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const v2Param = params.get('v2');
    const isV2 = v2Param === '0' ? false : true;
    const useFullCalendar = params.get('fc') === '1';
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
    const [tagFilter, setTagFilter] = useState('');

    // Compute startDate so that currentDate nằm gần trung tâm (preserve anchor)
    const getStartDateForRange = (date: Date, days: number) => {
        const d = new Date(date);
        const offset = Math.floor((days - 1) / 2);
        d.setDate(d.getDate() - offset);
        return d;
    };

    const dayOptions = React.useMemo(() => [1, 3, 5, 7, 14], []);

    const handleDaysChange = React.useCallback((days: number) => {
        setDaysToShow(days);
    }, []);

    const handleDaysStep = React.useCallback((dir: 'in' | 'out') => {
        setDaysToShow(prev => {
            const idx = dayOptions.indexOf(prev);
            if (idx === -1) return prev;
            if (dir === 'in' && idx > 0) return dayOptions[idx - 1];
            if (dir === 'out' && idx < dayOptions.length - 1) return dayOptions[idx + 1];
            return prev;
        });
    }, [dayOptions]);

    const startDate = getStartDateForRange(currentDate, daysToShow);

    return (
        <div className="h-full flex flex-col p-4 md:p-6 lg:p-8">
            <CalendarHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                daysToShow={daysToShow}
                onDaysChange={handleDaysChange}
                onNewTask={() => setIsModalOpen(true)}
                availableDayOptions={dayOptions}
                onDaysStep={handleDaysStep}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                tagFilter={tagFilter}
                onTagFilterChange={setTagFilter}
            />
            
            <div className="flex-1 overflow-hidden min-h-0">
                 {viewMode === 'list' ? (
                    <Calendar2Agenda 
                      startDate={startDate}
                      daysToShow={daysToShow}
                      searchTerm={searchTerm}
                      priorityFilter={priorityFilter}
                      tagFilter={tagFilter}
                    />
                 ) : useFullCalendar ? (
                    <CalendarFull
                      startDate={startDate}
                      daysToShow={daysToShow}
                      searchTerm={searchTerm}
                      priorityFilter={priorityFilter}
                      tagFilter={tagFilter}
                    />
                 ) : (
                    <Calendar2Grid
                      startDate={startDate}
                      daysToShow={daysToShow}
                      searchTerm={searchTerm}
                      priorityFilter={priorityFilter}
                      tagFilter={tagFilter}
                    />
                 )}
            </div>
            <ImprovedAddTodoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default TodosPage;
