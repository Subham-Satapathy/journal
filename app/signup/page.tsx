"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed.");
        return;
      }
      if (data?.message) setInfo(data.message);
      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-24 -left-12 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-16 -right-12 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-4">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="Pnlogix logo" className="w-12 h-12 rounded-md border border-zinc-700/70 shadow-lg" />
          <div className="mt-2 text-lg font-bold text-white">Pnlogix</div>
          <div className="text-xs text-zinc-500">Trading Journal</div>
        </div>

        <Card className="w-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">Create your Pnlogix account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-300 mb-1">Name (optional)</label>
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  minLength={8}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-indigo-300">{info}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </form>
            <p className="text-xs text-zinc-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
