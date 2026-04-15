import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen cork-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-handwritten font-bold text-foreground mb-2">Triplet</h1>
        <p className="text-muted mb-8">Plan your next adventure</p>
        <SignIn />
      </div>
    </div>
  );
}
