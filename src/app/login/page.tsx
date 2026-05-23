import { ArrowLeft, LogIn } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Login | RightHand",
  description: "Entrada privada para negocios que usan RightHand.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
          <CardTitle className="text-2xl">Entrar a RightHand</CardTitle>
          {demoMode ? (
            <p className="text-sm text-muted-foreground">
              Modo demo activo: cualquier intento abre el dashboard local.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="dueno@tienda.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="********" />
            </div>
            <Button>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Entrar
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
