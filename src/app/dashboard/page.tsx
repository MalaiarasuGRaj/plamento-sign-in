import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
          <CardDescription>Welcome to your account!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">You have successfully logged in.</p>
          <Button asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
