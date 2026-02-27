"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import Image from "next/image";
import lanyardLogo from "@/components/ui/lanyard.png";
import { FadeIn, PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'student' | 'admin'>('student');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setIsLoading(true);

        const result = isLogin ? await login(formData) : await signup(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-background text-foreground antialiased overflow-hidden h-screen flex flex-col font-sans relative">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
            </div>

            <main className="flex-1 overflow-y-auto relative z-10 w-full flex flex-col md:flex-row">

                {/* Left Side - Branding & Features */}
                <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                    <PageTransition>
                        <FadeIn direction="up">
                            <div className="flex justify-center md:justify-start items-center gap-4 mb-16">
                                <div className="w-16 h-16 flex items-center justify-center rounded-2xl overflow-hidden ring-1 ring-white/10">
                                    <Image src={lanyardLogo} alt="EventSphere Logo" width={48} height={48} className="object-contain" />
                                </div>
                                <span className="font-extrabold text-3xl md:text-4xl tracking-tight text-white drop-shadow-sm">EventSphere</span>
                            </div>

                            <div className="text-center md:text-left mt-8 md:mt-24">
                                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                                    Your Campus Events, <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Streamlined.</span>
                                </h1>

                                <StaggerContainer className="space-y-6 mt-12 text-zinc-300 md:max-w-md mx-auto md:mx-0">
                                    <StaggerItem className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <span className="material-symbols-outlined text-indigo-400 text-[24px]">explore</span>
                                        </div>
                                        <p className="text-xl">Discover technical, cultural, and sports events.</p>
                                    </StaggerItem>
                                    <StaggerItem className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <span className="material-symbols-outlined text-purple-400 text-[24px]">how_to_reg</span>
                                        </div>
                                        <p className="text-xl">Register with a single click.</p>
                                    </StaggerItem>
                                    <StaggerItem className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <span className="material-symbols-outlined text-emerald-400 text-[24px]">notifications_active</span>
                                        </div>
                                        <p className="text-xl">Get instant updates and reminders.</p>
                                    </StaggerItem>
                                </StaggerContainer>
                            </div>
                        </FadeIn>
                    </PageTransition>
                </div>

                {/* Right Side - Auth Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
                    <FadeIn direction="left" delay={0.2} className="w-full max-w-md">
                        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-3xl font-bold text-white mb-2 text-center">
                                {isLogin ? (role === 'admin' ? "Admin Portal" : "Welcome Back") : "Create an Account"}
                            </h2>
                            <p className="text-center text-muted-foreground mb-6">
                                {isLogin ? (role === 'admin' ? "Secure access for administrators." : "Sign in to manage your events.") : "Join EventSphere today."}
                            </p>

                            {/* Role Toggle Slider */}
                            {isLogin && (
                                <div className="mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl flex relative overflow-hidden">
                                    <div
                                        className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"
                                        style={{
                                            left: role === 'student' ? '4px' : '50%',
                                            width: 'calc(50% - 4px)'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setRole('student')}
                                        className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'student' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${role === 'admin' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-5">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="text-sm font-medium text-zinc-300">
                                            Full Name
                                        </label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required={!isLogin}
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@college.edu"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            {isLogin ? "Sign In" : "Create Account"}
                                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {isLogin && role === 'student' && (
                                <div className="mt-8 text-center">
                                    <p className="text-zinc-400 text-sm">
                                        Don't have an account?
                                        <button
                                            onClick={() => {
                                                setIsLogin(false);
                                                setError(null);
                                            }}
                                            className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                        >
                                            Sign Up
                                        </button>
                                    </p>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="mt-8 text-center">
                                    <p className="text-zinc-400 text-sm">
                                        Already have an account?
                                        <button
                                            onClick={() => {
                                                setIsLogin(true);
                                                setError(null);
                                            }}
                                            className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                        >
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </div>
            </main>
        </div>
    );
}
