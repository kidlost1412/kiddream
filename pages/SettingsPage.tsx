import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { AnimatedPage, StaggerContainer, AnimatedItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useToastStore } from '../stores/useToastStore';

const SettingsPage: React.FC = () => {
    const { user, fetchProfile } = useAuthStore();
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    if (!user) return null;

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    email,
                    avatar_url: avatarUrl
                })
                .eq('id', user.id);

            if (error) throw error;

            await fetchProfile();
            useToastStore.getState().push({ type: 'success', message: 'Đã cập nhật thông tin cá nhân' });
        } catch (error: any) {
            useToastStore.getState().push({ type: 'error', message: error.message || 'Không thể cập nhật thông tin' });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            useToastStore.getState().push({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }

        if (newPassword !== confirmPassword) {
            useToastStore.getState().push({ type: 'error', message: 'Mật khẩu mới không khớp' });
            return;
        }

        if (newPassword.length < 6) {
            useToastStore.getState().push({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        setLoadingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            useToastStore.getState().push({ type: 'success', message: 'Đã cập nhật mật khẩu' });
        } catch (error: any) {
            useToastStore.getState().push({ type: 'error', message: error.message || 'Không thể cập nhật mật khẩu' });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <AnimatedPage className="p-6 md:p-8 lg:p-10">
            <motion.h2
                className="text-3xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                Cài đặt
            </motion.h2>

            <StaggerContainer className="max-w-2xl mx-auto space-y-8">
                <AnimatedItem>
                    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
                        <Card title="Thông tin cá nhân">
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <Input
                                    label="Tên người dùng"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <Input
                                    label="Email"
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input
                                    label="Avatar URL"
                                    id="avatarUrl"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                                <div className="pt-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="submit" disabled={loadingProfile}>
                                            {loadingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </Button>
                                    </motion.div>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </AnimatedItem>

                <AnimatedItem>
                    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
                        <Card title="Đổi mật khẩu">
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <Input
                                    label="Mật khẩu hiện tại"
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <Input
                                    label="Mật khẩu mới"
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Input
                                    label="Xác nhận mật khẩu mới"
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <div className="pt-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="submit" disabled={loadingPassword}>
                                            {loadingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                                        </Button>
                                    </motion.div>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </AnimatedItem>
            </StaggerContainer>
        </AnimatedPage>
    );
};

export default SettingsPage;
