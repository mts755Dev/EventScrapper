import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Chaffle Sales Discovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Find raffle-ready events across NC &amp; FL
          </p>
        </div>
        <LoginForm next={params.next ?? "/"} />
      </div>
    </main>
  );
}
