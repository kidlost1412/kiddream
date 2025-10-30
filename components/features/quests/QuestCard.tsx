import React from 'react';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import { useTranslation } from '../../../hooks/useTranslation';
import type { Quest } from '../../../stores/useQuestStore';

interface QuestCardProps {
    quest: Quest;
    progress: number;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, progress }) => {
    const { t } = useTranslation();
    const isCompleted = progress >= (quest.goals[0]?.target || 1);
    const borderColor = quest.type === 'main' ? 'border-purple-500/80' : 'border-sky-500/80';
    
    return (
        <div className={`relative rounded-xl overflow-hidden border-2 ${borderColor} bg-slate-900 group transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
            <img src={quest.background_image} alt={quest.title} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative p-5 flex flex-col justify-between h-full bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                <div>
                    <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                    <p className="text-slate-400 mt-1 mb-4 text-sm h-12">{quest.description}</p>
                </div>
                <div>
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                            <span>{t('quests.progress').toUpperCase()}</span>
                            <span>{progress} / {quest.goals[0].target}</span>
                        </div>
                        <ProgressBar value={progress} max={quest.goals[0].target} />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <span className="font-semibold text-cyan-400">{quest.rewards.xp} {t('quests.xp')}</span>
                            <span className="font-semibold text-amber-400">{quest.rewards.points} {t('quests.points')}</span>
                        </div>
                        <Button size="sm" variant={isCompleted ? 'primary' : 'secondary'} disabled={!isCompleted}>
                            {isCompleted ? t('quests.claimReward') : t('quests.inProgress')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestCard;
