"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, Home, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  username: z.string().min(1, "Username is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isLoading, error: authError, message } = useAuth();

  const onSubmit = async (data: LoginFormData) => {

     return await login(data)
  };




  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="text-primary-foreground" size={24} />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your property listings
          </p>
        </div>

        {(authError || Object.keys(errors).length > 0) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {authError || "Please check your input fields"}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} >
          <div className="space-y-4">
           <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground block mb-1"
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  {...register("username")}
                  id="username"
                  type="username"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.username ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

              <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground block mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground block"
                >
                  Password
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading && <ArrowRight className="ml-2" size={18} />}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
