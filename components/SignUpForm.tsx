"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signUpSchema } from "@/schemas/signUpSchema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: unknown) {
      console.error("Sign-up error:", error);
      setAuthError(error.errors?.[0]?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerificationError("Verification could not be completed.");
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);
      setVerificationError(error.errors?.[0]?.message || "Invalid code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification code to your email.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          {verificationError && (
            <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {verificationError}
            </div>
          )}
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Didn`&apos`t get the code?
            <button
              type="button"
              onClick={() =>
                signUp?.prepareEmailAddressVerification({
                  strategy: "email_code",
                })
              }
              className="text-primary hover:underline"
            >
              Resend
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          Sign up to start managing your images securely.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        {authError && (
          <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {authError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-muted-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("passwordConfirmation")}
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-muted-foreground"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.passwordConfirmation && (
              <p className="text-sm text-red-600 mt-1">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          <div className="flex items-start text-sm text-muted-foreground gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            By signing up, you agree to our Terms and Privacy Policy.
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
