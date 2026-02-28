"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        // Check if user is admin
        const { data: admin } = await supabase
            .from("Admin")
            .select("id")
            .eq("email", email)
            .single();

        revalidatePath("/", "layout");

        if (admin) {
            redirect("/dashboard");
        } else {
            redirect("/student/dashboard");
        }
    } catch (err: unknown) {
        // Re-throw redirect responses (Next.js uses thrown responses for redirects)
        if (isRedirectError(err)) {
            throw err;
        }
        console.error("[Login Error]:", err);
        return { error: "Unable to connect to the server. Please check your internet connection and try again." };
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            return { error: error.message };
        }

        // Auto sign-in after signup (no email confirmation required)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return { error: signInError.message };
        }

        // Insert user into the public."User" table
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user.id;

        if (userId) {
            if (role === 'admin') {
                await supabase.from("Admin").insert({
                    email: email,
                    name: fullName,
                });
            } else {
                await supabase.from("User").insert({
                    id: userId,
                    email: email,
                    full_name: fullName,
                });
            }
        }

        revalidatePath("/", "layout");
        if (role === 'admin') {
            redirect("/dashboard");
        } else {
            redirect("/student/dashboard");
        }
    } catch (err: unknown) {
        // Re-throw redirect responses (Next.js uses thrown responses for redirects)
        if (isRedirectError(err)) {
            throw err;
        }
        console.error("[Signup Error]:", err);
        return { error: "Unable to connect to the server. Please check your internet connection and try again." };
    }
}
