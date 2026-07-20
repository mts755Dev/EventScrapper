import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Event Opportunity Discovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Find raffle-ready events across NC and FL
          </p>
        </div>
        <LoginForm next={params.next ?? "/"} />
      </div>
    </main>
  );
}
