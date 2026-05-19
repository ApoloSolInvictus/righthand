import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";

import { register } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function RegisterPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
          <CardTitle className="text-2xl">Crear negocio en RightHand</CardTitle>
          {demoMode ? (
            <p className="text-sm text-muted-foreground">
              Sin variables de Supabase, el formulario entra al demo local.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form action={register} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre del dueno</Label>
              <Input id="fullName" name="fullName" required placeholder="Ana Rodriguez" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input id="businessName" name="businessName" required placeholder="Mi tienda" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="dueno@tienda.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Minimo 8 caracteres" />
            </div>
            <Button variant="delivery">
              <Store className="h-4 w-4" aria-hidden="true" />
              Crear tienda
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Entra aqui
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
