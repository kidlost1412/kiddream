import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, username);

    if (response.error) {
      setError(response.error.message);
    }
    // On success, the onAuthStateChange listener in App.tsx will handle navigation
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md text-center">
        <motion.h1
          className="text-6xl mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          ZenQuest
        </motion.h1>
        <motion.p
          className="text-slate-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Gamify your life, one quest at a time.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <Card className="relative overflow-visible shadow-2xl shadow-indigo-900/50">
            <motion.div
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-lg opacity-20"
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative p-2 bg-slate-800/80 rounded-xl">
              <div className="flex justify-center border-b border-slate-700 mb-6">
                <motion.button
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className={`px-4 py-2 text-lg font-semibold transition-colors ${isLogin ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className={`px-4 py-2 text-lg font-semibold transition-colors ${!isLogin ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                 <Input
                    id="username"
                    type="text"
                    placeholder="PlayerOne"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    label="Username"
                  />
              )}
              <Input
                id="email"
                type="email"
                placeholder="player@zenquest.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                label="Email"
              />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                label="Password"
              />
              {error && (
                <motion.p
                  className="text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" variant="dots" className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    isLogin ? 'Đăng nhập' : 'Bắt đầu hành trình'
                  )}
                </Button>
              </motion.div>
            </form>
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a href="#" className="text-sm text-indigo-400 hover:underline">Quên mật khẩu?</a>
            </motion.div>
          </div>
        </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
