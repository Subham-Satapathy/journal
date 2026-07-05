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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      router.push("/pricing");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/60">
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
  );
}
