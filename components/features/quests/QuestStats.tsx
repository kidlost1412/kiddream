
import React from 'react';
import Card from '../../ui/Card';

const QuestStats: React.FC = () => {
    return (
        <Card title="Adventurer's Log">
            <div className="grid grid-cols-2 divide-x divide-slate-700">
                <div className="text-center">
                    <p className="text-4xl font-bold text-green-400">12</p>
                    <p className="text-sm text-slate-400 font-medium">Quests Completed</p>
                </div>
                <div className="text-center">
                    <p className="text-4xl font-bold text-cyan-400">12,500</p>
                    <p className="text-sm text-slate-400 font-medium">Total XP Earned</p>
                </div>
            </div>
        </Card>
    );
};

export default QuestStats;
