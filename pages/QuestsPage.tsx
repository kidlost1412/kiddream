import React, { useMemo, useState } from 'react';
import QuestCard from '../components/features/quests/QuestCard';
import QuestStats from '../components/features/quests/QuestStats';
import { useQuestStore } from '../stores/useQuestStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';
import { AIQuestService } from '../services/aiQuestService';
import Button from '../components/ui/Button';

const QuestsPage: React.FC = () => {
    const { quests, userQuests, fetchQuests } = useQuestStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [generating, setGenerating] = useState(false);

    const mainQuests = useMemo(() => quests.filter(q => q.type === 'main'), [quests]);
    const sideQuests = useMemo(() => quests.filter(q => q.type === 'side'), [quests]);

    const getQuestProgress = (questId: string) => {
        const userQuest = userQuests.find(uq => uq.quest_id === questId);
        if (!userQuest || !userQuest.progress || userQuest.progress.length === 0) return 0;
        return userQuest.progress[0] || 0;
    };

    const handleGenerateQuests = async () => {
        if (!user?.id) return;
        
        setGenerating(true);
        try {
            const newQuests = await AIQuestService.generatePersonalizedQuests(user.id);
            await AIQuestService.saveQuestsToDatabase(newQuests);
            await fetchQuests();
            alert(`✨ Đã tạo ${newQuests.length} nhiệm vụ mới dành riêng cho bạn!`);
        } catch (error) {
            console.error('Error generating quests:', error);
            alert('❌ Không thể tạo nhiệm vụ. Vui lòng thử lại sau.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in p-6 md:p-8 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{t('quests.title')}</h2>
                <Button onClick={handleGenerateQuests} disabled={generating}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    {generating ? 'Đang tạo...' : 'Tạo nhiệm vụ AI'}
                </Button>
            </div>
            
            <QuestStats />

            <div className="space-y-8 mt-8">
                <div>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-4 border-b-2 border-slate-700 pb-2">{t('quests.mainStory')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mainQuests.length > 0 ? (
                            mainQuests.map(quest => (
                                <QuestCard key={quest.id} quest={quest} progress={getQuestProgress(quest.id)} />
                            ))
                        ) : (
                            <p className="text-slate-400 col-span-2 text-center py-8">{t('quests.noMainQuests')}</p>
                        )}
                    </div>
                </div>

                 <div>
                    <h3 className="text-2xl font-semibold text-sky-300 mb-4 border-b-2 border-slate-700 pb-2">{t('quests.sideMissions')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sideQuests.length > 0 ? (
                            sideQuests.map(quest => (
                                <QuestCard key={quest.id} quest={quest} progress={getQuestProgress(quest.id)} />
                            ))
                        ) : (
                            <p className="text-slate-400 col-span-2 text-center py-8">{t('quests.noSideQuests')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestsPage;
