'use client';

/**
 * StudentOS Profile Page
 *
 * Displays the current user's profile information, stats, and activity.
 * Protected by <ProtectedRoute>.
 */

import { ProtectedRoute } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Calendar,
  Award,
  Flame,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getInitials } from '@/utils/format';

function ProfileContent() {
  const { user, profile } = useAuth();

  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const email = profile?.email ?? user?.email ?? '';
  const initials = getInitials(displayName) || '🎓';
  const photoURL = user?.photoURL ?? undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header card */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div className="from-primary/30 via-secondary/20 to-primary/30 h-32 bg-gradient-to-r" />
        <CardContent className="pb-6">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="border-background h-32 w-32 border-4">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {profile?.role && (
                  <Badge variant="secondary" className="capitalize">
                    {profile.role}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{email}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">XP</CardTitle>
            <TrendingUp className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.xp ?? 0}</div>
            <p className="text-muted-foreground mt-1 text-xs">Level {profile?.level ?? 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.streak?.current ?? 0} days</div>
            <p className="text-muted-foreground mt-1 text-xs">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.subjects?.length ?? 0}</div>
            <p className="text-muted-foreground mt-1 text-xs">Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Role</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{profile?.role ?? 'student'}</div>
            <p className="text-muted-foreground mt-1 text-xs">Account type</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-sm font-medium">{email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Award className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Display Name</p>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Member Since</p>
                <p className="text-sm font-medium">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'Recently'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {['🎓', '🔥', '📚', '🏆', '⚡', '🎯'].map((emoji, i) => (
                <div
                  key={i}
                  className="border-border/50 bg-muted/30 flex aspect-square flex-col items-center justify-center rounded-lg border"
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-muted-foreground mt-1 text-[10px]">Badge</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-4 text-center text-xs">
              Complete more activities to unlock achievements
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
