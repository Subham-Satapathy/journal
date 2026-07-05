"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CryptoCheckoutButtonProps {
  planId: string;
  billingCycle: "monthly" | "yearly";
  label: string;
  disabled?: boolean;
}

export function CryptoCheckoutButton({ planId, billingCycle, label, disabled }: CryptoCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/crypto/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, billingCycle }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not create crypto checkout link.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleCheckout} loading={loading} disabled={disabled}>
        {label}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
