import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { AnimatedPage, StaggerContainer, AnimatedItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) return null;

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
                            <form className="space-y-4">
                                <Input label="Tên người dùng" id="username" defaultValue={user.username} />
                                <Input label="Email" id="email" type="email" defaultValue={user.email} />
                                <Input label="Avatar URL" id="avatarUrl" defaultValue={user.avatarUrl} />
                                <div className="pt-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button>Lưu thay đổi</Button>
                                    </motion.div>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </AnimatedItem>

                <AnimatedItem>
                    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
                        <Card title="Đổi mật khẩu">
                            <form className="space-y-4">
                                <Input label="Mật khẩu hiện tại" id="currentPassword" type="password" />
                                <Input label="Mật khẩu mới" id="newPassword" type="password" />
                                <Input label="Xác nhận mật khẩu mới" id="confirmPassword" type="password" />
                                <div className="pt-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button>Cập nhật mật khẩu</Button>
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
