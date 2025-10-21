'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'cashier' | 'admin'>('cashier');
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = async () => {
    // Initiate the sign-up process.
    // The user document creation will be handled by the useEffect below.
    initiateEmailSignUp(auth, email, password);
  };

  useEffect(() => {
    // This effect runs when the `user` object changes after signup.
    if (user && firestore && firstName && lastName) {
      // Create the main user profile document.
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(
        userRef,
        {
          id: user.uid,
          username: `${firstName} ${lastName}`,
          email: user.email,
          role: role,
        },
        { merge: true }
      );

      // If the user signed up as an admin, create a record in `roles_admin`.
      // This is what the security rules will check for admin privileges.
      if (role === 'admin') {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        setDocumentNonBlocking(
          adminRoleRef,
          {
            id: user.uid,
            username: `${firstName} ${lastName}`,
            email: user.email,
            role: 'admin',
          },
          { merge: true }
        );
      }
    }
  }, [user, firestore, firstName, lastName, role]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <RadioGroup
              defaultValue="cashier"
              className="flex gap-4"
              onValueChange={(value) => setRole(value as 'cashier' | 'admin')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cashier" id="cashier" />
                <Label htmlFor="cashier">Cashier</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignUp}>
            Sign up
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
