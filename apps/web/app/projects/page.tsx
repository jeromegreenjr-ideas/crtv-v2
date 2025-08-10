import Link from 'next/link';
import { getAllProjects, calcProjectPct } from '../../lib/data';
import ProgressBar from '../../components/ProgressBar';

export const dynamic = 'force-dynamic';

import RequireRole from '../../components/RequireRole';

export default async function ProjectsPage() {
  const list = await getAllProjects();
  return (
    <RequireRole allow={["stakeholder","director","pm","producer","hr"]}>
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/studio/new" className="btn-primary">New idea</Link>
      </div>
      {list.length === 0 ? (
        <div className="card text-center">No projects yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {await Promise.all(list.map(async (p: any) => {
            const pct = await calcProjectPct(p.id);
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="card hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Phase {p.phase}</h3>
                    <div className="text-gray-600 text-sm">Idea {p.ideaId}</div>
                  </div>
                  <div className="text-right w-40">
                    <div className="text-xs text-gray-600 mb-1">{pct}% complete</div>
                    <ProgressBar value={pct} label={`Project ${p.id} completion`} />
                  </div>
                </div>
              </Link>
            );
          }))}
        </div>
      )}
    </div>
    </RequireRole>
  );
}

import Link from 'next/link';
import { getAllIdeas } from '../../lib/data';
import { ArrowLeft, Plus, Target, Clock, CheckCircle, Sparkles, Users } from 'lucide-react';

export default async function ProjectsPage() {
  const ideas = await getAllIdeas();
  const activeProjects = ideas.filter(idea => idea.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <Link 
              href="/studio/new"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          </div>
          <p className="text-gray-600">
            Manage your active projects and track progress through phases, checkpoints, and tasks.
          </p>
        </div>

        {/* Projects Grid */}
        {activeProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Projects</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by creating a new idea and approving it to begin project planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/studio/new" className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Idea
              </Link>
              <Link href="/ideas" className="btn-secondary inline-flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Browse Ideas
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-status-success/15 text-status-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {project.summary}
                </h3>
                
                {/* Project Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-sm font-semibold text-blue-600">5</div>
                    <div className="text-xs text-gray-600">Phases</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-sm font-semibold text-purple-600">5</div>
                    <div className="text-xs text-gray-600">Checkpoints</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-sm font-semibold text-green-600">3</div>
                    <div className="text-xs text-gray-600">Tasks</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <span>
                    Started {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>View</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {activeProjects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{activeProjects.length}</h3>
              <p className="text-gray-600">Active Projects</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {activeProjects.length * 5}
              </h3>
              <p className="text-gray-600">Total Phases</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {activeProjects.length * 5}
              </h3>
              <p className="text-gray-600">Checkpoints</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {activeProjects.length * 3}
              </h3>
              <p className="text-gray-600">Total Tasks</p>
            </div>
          </div>
        )}

        {/* Demo Project Link */}
        <div className="mt-8">
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Try the Demo Project</h3>
                <p className="text-gray-600 mb-4">
                  Explore a fully configured project to see how CRTV Studio works in action.
                </p>
                <Link 
                  href="/projects/demo"
                  className="btn-primary inline-flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Demo Project
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
