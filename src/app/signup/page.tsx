"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const supabase = createSupabaseBrowserClient();
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            setSuccess("Account created! Check your email to confirm, then log in.");
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8 px-6">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <span className="material-symbols-outlined text-3xl text-primary">
                            person_add
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Create an account
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Join EventSphere to manage campus events
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            {success}
                        </div>
                        <Link
                            href="/login"
                            className="mt-2 inline-block font-medium text-emerald-400 hover:underline"
                        >
                            Go to Login →
                        </Link>
                    </div>
                )}

                {/* Form */}
                {!success && (
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-xl">
                                    progress_activity
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>

                {/* Back to home */}
                <div className="text-center">
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to events
                    </Link>
                </div>
            </div>
        </div>
    );
}
