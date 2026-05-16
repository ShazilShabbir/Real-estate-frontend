"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, Home, AlertCircle, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useAuthContext } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/lib/use-translation";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("login.invalidEmail")).toLowerCase(),
    username: z.string().min(1, t("login.usernameRequired")).toLowerCase(),
    password: z.string().min(1, t("login.passwordRequired")),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export default function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
  });

  const { login, isLoading, error: authError, message } = useAuth();
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Replace current history entry to prevent back button navigation
      window.history.replaceState(null, '', '/');
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render the login form
  if (isAuthenticated) {
    return null;
  }

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
          <h1 className="text-3xl font-bold text-foreground">{t("login.heading")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("login.subtitle")}
          </p>
        </div>

        {(authError || Object.keys(errors).length > 0) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {authError || t("login.checkFields")}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} >
          <div className="space-y-4">
           <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground block mb-1"
              >
                {t("login.username")}
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
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.username ? "border-destructive" : "border-border"
                  }`}
                  placeholder={t("login.usernamePlaceholder")}
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
                {t("login.email")}
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
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  placeholder={t("login.emailPlaceholder")}
                  autoComplete="email"
                  inputMode="email"
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
                  {t("login.password")}
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  {t("login.forgotPassword")}
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
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-11 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
            {isLoading ? t("login.signingIn") : t("login.signIn")}
            {!isLoading && <ArrowRight className="ml-2" size={18} />}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {t("login.noAccount")}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
