
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { User, Save, Shield, Bell, Download, Upload, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { UserPreferences } from '@/services/userPreferencesService';
import { Link } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  college?: string;
  role: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
        college: profileData?.college || '',
        role: profileData?.role || 'student'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            college: profile.college,
            role: profile.role,
            avatar_url: profile.avatar_url
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        toast({
          title: 'Error saving profile',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been saved successfully'
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error saving profile',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const { data: semesters } = await supabase.from('semesters').select('*');
      const { data: subjects } = await supabase.from('subjects').select('*');
      const { data: attendance } = await supabase.from('attendance_records').select('*');
      const { data: marks } = await supabase.from('marks_records').select('*');

      const exportData = {
        profile,
        semesters: semesters || [],
        subjects: subjects || [],
        attendance: attendance || [],
        marks: marks || [],
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `academic-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your academic data has been exported successfully'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export your data',
        variant: 'destructive'
      });
    }
  };

  const updateNotificationPreference = (
    key: keyof UserPreferences['notifications'],
    checked: boolean
  ) => {
    updatePreferences({
      notifications: {
        [key]: checked,
      } as Partial<UserPreferences['notifications']>,
    });
  };

  const resetAcademicPreferences = () => {
    resetPreferences();
    toast({
      title: 'Preferences reset',
      description: 'Academic preferences have been reset to defaults.'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (!profile) {
    return <div className="text-center py-8">Error loading profile</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.full_name || profile.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from here
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="college">College/University</Label>
              <Input
                id="college"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                placeholder="Enter your college/university"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={profile.role}
                onValueChange={(value) => setProfile({ ...profile, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={saveProfile} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Academic Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Academic Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Grade Scale</Label>
            <Select
              value={preferences.gradeScale}
              onValueChange={(value) => updatePreferences({ gradeScale: value as UserPreferences['gradeScale'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10-point">10-Point IIITM Scale</SelectItem>
                <SelectItem value="4-point">4-Point Display Preference</SelectItem>
                <SelectItem value="percentage">Percentage Display Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Attendance Warning Threshold</Label>
            <Select
              value={String(preferences.attendanceWarningThreshold)}
              onValueChange={(value) => updatePreferences({ attendanceWarningThreshold: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="80">80%</SelectItem>
                <SelectItem value="85">85%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cgpa-target">CGPA Target</Label>
              <Input
                id="cgpa-target"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={preferences.cgpaTarget}
                onChange={(event) => updatePreferences({ cgpaTarget: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="exam-reminder-days">Exam Reminder Window (days)</Label>
              <Input
                id="exam-reminder-days"
                type="number"
                min="0"
                max="30"
                step="1"
                value={preferences.examReminderDays}
                onChange={(event) => updatePreferences({ examReminderDays: Number(event.target.value) })}
              />
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={resetAcademicPreferences}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Academic Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attendance Warnings</p>
              <p className="text-sm text-muted-foreground">
                Get notified when attendance falls below threshold
              </p>
            </div>
            <Switch
              checked={preferences.notifications.attendanceWarnings}
              onCheckedChange={(checked) => updateNotificationPreference('attendanceWarnings', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Grade Updates</p>
              <p className="text-sm text-muted-foreground">
                Notifications for new grades and CGPA changes
              </p>
            </div>
            <Switch
              checked={preferences.notifications.gradeUpdates}
              onCheckedChange={(checked) => updateNotificationPreference('gradeUpdates', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exam Reminders</p>
              <p className="text-sm text-muted-foreground">
                Reminders for upcoming exams and assignments
              </p>
            </div>
            <Switch
              checked={preferences.notifications.examReminders}
              onCheckedChange={(checked) => updateNotificationPreference('examReminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Health Alerts</p>
              <p className="text-sm text-muted-foreground">
                Alerts for missing grades and target gaps
              </p>
            </div>
            <Switch
              checked={preferences.notifications.dataHealthAlerts}
              onCheckedChange={(checked) => updateNotificationPreference('dataHealthAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your academic data as JSON
              </p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Import Data</p>
              <p className="text-sm text-muted-foreground">
                Import academic data from a JSON file through the Semesters page
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/semesters">
                <Upload className="w-4 h-4 mr-2" />
                Open Import
              </Link>
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
