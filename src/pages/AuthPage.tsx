import React, { useState } from 'react';
import { supabase } from '../api/supabase';

interface AuthPageProps {
    onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                // If signup is successful, we might want to alert the user to check email if confirmation is enabled
            }
            onSuccess();
        } catch (err: any) {
            let message = 'Ocurrió un error inesperado';
            if (err.message.includes('Invalid login credentials')) {
                message = 'Email o contraseña incorrectos';
            } else if (err.message.includes('User already registered')) {
                message = 'Este correo ya está registrado';
            } else {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-background-dark/50">
            <div className="w-full max-w-[450px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo & Branding */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-primary/20 p-4 rounded-2xl text-primary shadow-inner">
                        <span className="material-symbols-outlined text-4xl">terrain</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Trek PWA</h1>
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Adventure Ready</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a2e23] rounded-3xl border border-slate-200 dark:border-[#234833] shadow-2xl overflow-hidden relative">
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                            </h2>
                            <p className="text-slate-500 dark:text-[#92c9a9] text-sm">
                                {isLogin
                                    ? 'Carga tus datos para continuar tu expedición.'
                                    : 'Únete a nuestra comunidad de exploradores.'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-start gap-3 animate-in shake duration-300">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#92c9a9]/60 ml-1">Nombre Completo</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                                        <input
                                            required
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-[#102218] border border-slate-200 dark:border-[#2a4435] rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Ej: Juan Pérez"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#92c9a9]/60 ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#102218] border border-slate-200 dark:border-[#2a4435] rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#92c9a9]/60">Contraseña</label>
                                    {isLogin && <button type="button" className="text-[10px] text-primary font-black uppercase tracking-widest hover:brightness-125 transition-all">¿La olvidaste?</button>}
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#102218] border border-slate-200 dark:border-[#2a4435] rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-primary text-background-dark py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-slate-500 dark:text-[#92c9a9]/60 text-xs font-medium uppercase tracking-wider">
                                    {isLogin ? "¿No tienes cuenta aún?" : "¿Ya tienes cuenta?"}
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-primary font-bold ml-2 hover:brightness-125 transition-all"
                                    >
                                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Social Auth Section */}
                    <div className="px-8 pb-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-[#2a4435]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-white dark:bg-[#1a2e23] px-4 text-slate-400 dark:text-[#92c9a9]/40 font-black tracking-widest">O continúa con</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-[#2a4435] rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-white font-bold text-xs uppercase tracking-widest">
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-[#2a4435] rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-white font-bold text-xs uppercase tracking-widest">
                                <img src="https://github.com/favicon.ico" className="w-4 h-4 invert dark:invert-0 grayscale group-hover:grayscale-0" alt="GitHub" />
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 dark:text-[#92c9a9]/40 text-[9px] leading-relaxed uppercase tracking-[0.2em] px-10">
                    Al continuar, aceptas los términos de explorador y la política de privacidad de Trek PWA.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
