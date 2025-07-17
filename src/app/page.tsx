import { LoginForm } from '@/components/login-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-20 pb-20">
      <div className="w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </main>
  );
}
