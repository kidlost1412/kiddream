
import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';

const SettingsPage: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
            <div className="max-w-2xl mx-auto space-y-8">
                <Card title="Profile">
                    <form className="space-y-4">
                        <Input label="Username" id="username" defaultValue={user.username} />
                        <Input label="Email" id="email" type="email" defaultValue={user.email} />
                        <Input label="Avatar URL" id="avatarUrl" defaultValue={user.avatarUrl} />
                        <div className="pt-2">
                           <Button>Save Changes</Button>
                        </div>
                    </form>
                </Card>
                 <Card title="Change Password">
                    <form className="space-y-4">
                        <Input label="Current Password" id="currentPassword" type="password" />
                        <Input label="New Password" id="newPassword" type="password" />
                        <Input label="Confirm New Password" id="confirmPassword" type="password" />
                        <div className="pt-2">
                           <Button>Update Password</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
