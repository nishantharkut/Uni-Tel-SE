import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  ClipboardList,
  ExternalLink,
  FileJson,
  FolderOpen,
  GraduationCap,
  Shield,
  Upload,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResourceCard {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  actionLabel: string;
  href?: string;
  route?: string;
  status: 'available' | 'planned' | 'reference';
}

const resources: ResourceCard[] = [
  {
    id: 'ordinance',
    title: 'IIITM Academic Ordinance',
    description: 'Reference for grades, attendance minimum, credit rules, and assessment structure.',
    icon: GraduationCap,
    actionLabel: 'Open ordinance',
    href: 'https://www.iiitm.ac.in/public/uploads/media_uploads/1768561107_UP-IPG-ordinances-2025.pdf',
    status: 'reference',
  },
  {
    id: 'grading',
    title: 'Grading Rules Implemented',
    description: 'UNI-TEL uses IIITM GPA grades, non-GPA handling, earned-credit rules, and backlog detection.',
    icon: ClipboardList,
    actionLabel: 'Review subjects',
    route: '/semesters',
    status: 'available',
  },
  {
    id: 'attendance',
    title: 'Attendance Policy Tools',
    description: 'Track the 75% minimum, safe skips, and required recovery classes from recorded totals.',
    icon: BookOpen,
    actionLabel: 'Open attendance',
    route: '/attendance',
    status: 'available',
  },
  {
    id: 'json-import',
    title: 'JSON Import and Export Guide',
    description: 'Use JSON backup/restore for semesters, subjects, attendance, and marks records.',
    icon: FileJson,
    actionLabel: 'Open settings',
    route: '/settings',
    status: 'available',
  },
  {
    id: 'planning',
    title: 'Student Planning Tools',
    description: 'Estimate target CGPA requirements and marks needed in remaining assessment weightage.',
    icon: BookmarkCheck,
    actionLabel: 'Open analytics',
    route: '/analytics',
    status: 'available',
  },
  {
    id: 'hub',
    title: 'Knowledge Hub Scope',
    description: 'Resource upload, peer discovery, bookmarking, and moderation are planned as a separate backend-backed module.',
    icon: FolderOpen,
    actionLabel: 'Track locally for now',
    route: '/dashboard',
    status: 'planned',
  },
  {
    id: 'uploads',
    title: 'Uploads and Bookmarks',
    description: 'Upload and bookmark workflows are intentionally marked planned until storage, moderation, and ownership rules are built.',
    icon: Upload,
    actionLabel: 'Return to dashboard',
    route: '/dashboard',
    status: 'planned',
  },
  {
    id: 'admin',
    title: 'Admin and Moderation Controls',
    description: 'Admin users, moderation queues, and role-based controls require backend policy work before release.',
    icon: Shield,
    actionLabel: 'Open settings',
    route: '/settings',
    status: 'planned',
  },
];

function getStatusBadge(status: ResourceCard['status']) {
  if (status === 'available') return <Badge>Available</Badge>;
  if (status === 'reference') return <Badge variant="secondary">Reference</Badge>;
  return <Badge variant="outline">Planned</Badge>;
}

export default function ComingSoon() {
  const location = useLocation();
  const selectedResource = new URLSearchParams(location.search).get('resource');
  const orderedResources = selectedResource
    ? [
        ...resources.filter((resource) => resource.id === selectedResource),
        ...resources.filter((resource) => resource.id !== selectedResource),
      ]
    : resources;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section className="rounded-3xl color-primary p-6 shadow-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/20 p-3">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Knowledge Hub Foundation</h1>
                  <p className="text-sm text-white/80 sm:text-base">
                    Useful references are available now. Backend-heavy community/admin modules are clearly marked planned.
                  </p>
                </div>
              </div>
              <p className="max-w-3xl text-white/85">
                This page replaces generic placeholder messaging with concrete project scope: what is implemented,
                what is reference material, and what needs backend work before it should be presented as complete.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/20">
                <FolderOpen className="mr-1 h-3 w-3" />
                Resources
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/20">
                <Users className="mr-1 h-3 w-3" />
                Planned community module
              </Badge>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedResources.map((resource) => (
            <Card
              key={resource.id}
              className={selectedResource === resource.id ? 'border-academic-primary shadow-xl' : 'border-0 shadow-lg'}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-muted p-3">
                    <resource.icon className="h-5 w-5 text-academic-primary" />
                  </div>
                  {getStatusBadge(resource.status)}
                </div>
                <CardTitle className="text-xl">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {resource.href ? (
                  <Button asChild variant="outline" className="w-full justify-between">
                    <a href={resource.href} target="_blank" rel="noreferrer">
                      {resource.actionLabel}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to={resource.route || '/dashboard'}>
                      {resource.actionLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Engineering note for presentation</CardTitle>
            <CardDescription>
              These modules are intentionally separated because upload storage, moderation, and admin controls require
              database policies and role-based access control. They should be presented as planned extensions, not fake
              completed features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
