import { notFound } from 'next/navigation';
import { getIdeaWithAssessment } from '../../../lib/data';
import { RubricBreakdown } from '../../../components/RubricBreakdown';
import { getProjectsByIdea, getCheckpointsByProject, getTasksByCheckpoint } from '../../../lib/data';
import ActivityStream from './ActivityStream';
import { ArrowLeft, CheckCircle, Clock, Users, Target, FileText } from 'lucide-react';
import Link from 'next/link';

interface IdeaDetailPageProps {
  params: { id: string };
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const ideaId = parseInt(params.id);
  
  if (isNaN(ideaId)) {
    notFound();
  }

  // Get idea data from database (with fallback to in-memory storage)
  const { idea, brief, events, assessment } = await getIdeaWithAssessment(ideaId) as any;

  if (!idea) {
    notFound();
  }

  const isApproved = idea.status === 'active';
  const hasProjects = isApproved; // Simplified logic for demo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea Header + Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {idea.summary}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  idea.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {idea.status === 'active' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      Draft
                    </>
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  Created {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
            
            {!isApproved && (
              <form action={async () => {
                'use server';
                const { approveBrief } = await import('../../studio/new/actions');
                await approveBrief(ideaId);
              }}>
                <button 
                  type="submit"
                  disabled={hasProjects}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasProjects ? 'Already Approved' : 'Approve Brief'}
                </button>
              </form>
            )}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex gap-3 text-sm">
              <a href={`#overview`} className="px-3 py-1 rounded-full bg-gray-100">Overview</a>
              <a href={`#projects`} className="px-3 py-1 rounded-full bg-gray-100">Projects</a>
              <a href={`#tasks`} className="px-3 py-1 rounded-full bg-gray-100">Tasks</a>
              <a href={`#reports`} className="px-3 py-1 rounded-full bg-gray-100">Reports</a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div id="overview" />
            {/* Brief Section */}
            {brief && (
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Project Brief</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-700 leading-relaxed">{brief.content.overview}</p>
                  </div>
                  
                  {brief.content.objectives && brief.content.objectives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Objectives</h3>
                      <ul className="space-y-2">
                        {brief.content.objectives.map((objective: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {brief.content.audience && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Target Audience</h3>
                      <p className="text-gray-700">{brief.content.audience}</p>
                    </div>
                  )}

                  {brief.content.constraints && brief.content.constraints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Constraints</h3>
                      <ul className="space-y-2">
                        {brief.content.constraints.map((constraint: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assessment Overview */}
            {assessment?.rubric?.criteria && (
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <Target className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Assessment Overview</h2>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold">{assessment.overallScore}</div>
                  <div className="text-sm text-gray-600">Timeline: {assessment.estTimeline || '—'}</div>
                </div>
                <RubricBreakdown criteria={assessment.rubric.criteria} preview={true} />
              </div>
            )}

            {/* Activity Section */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
              </div>
              <ActivityStream ideaId={ideaId} initialEvents={events} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">5</span>
                    </div>
                    <span className="text-gray-700">Phases</span>
                  </div>
                  <span className="text-sm text-gray-500">{isApproved ? 'Planned' : 'Pending'}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">5</span>
                    </div>
                    <span className="text-gray-700">Checkpoints</span>
                  </div>
                  <span className="text-sm text-gray-500">{isApproved ? 'Planned' : 'Pending'}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">3</span>
                    </div>
                    <span className="text-gray-700">Tasks</span>
                  </div>
                  <span className="text-sm text-gray-500">{isApproved ? 'Created' : 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href={`/projects/${ideaId}`}
                  className="w-full btn-secondary text-center"
                >
                  View Project Board
                </Link>
                <Link 
                  href="/studio/new"
                  className="w-full btn-primary text-center"
                >
                  Create New Idea
                </Link>
              </div>
            </div>

            {/* Project Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Brief</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    brief ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {brief ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approval</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Planning</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isApproved ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isApproved ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div id="projects" className="mt-8" />
        <ProjectsForIdea ideaId={ideaId} />
        <div id="tasks" className="mt-6" />
        <TasksForIdea ideaId={ideaId} />
        <div id="reports" className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600 text-sm">AI assessment details and rollups.</p>
        </div>
      </main>
    </div>
  );
}

async function ProjectsForIdea({ ideaId }: { ideaId: number }) {
  const projs = await getProjectsByIdea(ideaId);
  if (projs.length === 0) return (
    <div className="card mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
      </div>
      <p className="text-gray-600 text-sm">No projects yet. Approve the brief to create structured phases.</p>
    </div>
  );
  return (
    <div className="card mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
      </div>
      <div className="space-y-4">
        {await Promise.all(projs.map(async (p: any) => {
          const cps = await getCheckpointsByProject(p.id);
          return (
            <div key={p.id} className="border rounded-xl p-3">
              <div className="font-semibold mb-2">Phase {p.phase}</div>
              <div className="space-y-2">
                {await Promise.all(cps.map(async (cp: any) => {
                  const ts = await getTasksByCheckpoint(cp.id);
                  return (
                    <div key={cp.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{cp.name}</div>
                        <div className="text-xs text-gray-600">{ts.length} tasks</div>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {ts.slice(0, 5).map((t: any) => (
                          <li key={t.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{t.title}</li>
                        ))}
                        {ts.length === 0 && <li className="text-xs text-gray-600">No tasks</li>}
                      </ul>
                    </div>
                  );
                }))}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

async function TasksForIdea({ ideaId }: { ideaId: number }) {
  const projs = await getProjectsByIdea(ideaId);
  const allTasks: any[] = [];
  for (const p of projs as any[]) {
    const cps = await getCheckpointsByProject(p.id);
    for (const c of cps as any[]) {
      const ts = await getTasksByCheckpoint(c.id);
      for (const t of ts as any[]) {
        allTasks.push({ ...t, projectPhase: p.phase, checkpointName: c.name });
      }
    }
  }
  const byStatus = (status: string) => allTasks.filter(t => t.status === status);
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Tasks</h2>
      {allTasks.length === 0 ? (
        <p className="text-gray-600 text-sm">No tasks yet.</p>
      ) : (
        <>
          <div className="flex gap-2 mb-3 text-sm">
            {['todo','in_progress','review','done'].map((s) => (
              <a key={s} href={`#task-${s}`} className="px-2 py-0.5 rounded-full bg-gray-100">{s}</a>
            ))}
          </div>
          {['todo','in_progress','review','done'].map((s) => (
            <div key={s} id={`task-${s}`} className="mb-4">
              <div className="font-medium mb-2 capitalize">{s.replace('_',' ')}</div>
              <ul className="space-y-2">
                {byStatus(s).map((t: any) => (
                  <li key={t.id} className="border rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{t.title}</div>
                        <div className="text-xs text-gray-600">Phase {t.projectPhase} · {t.checkpointName}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">P{t.priority ?? 2}</div>
                  </li>
                ))}
                {byStatus(s).length === 0 && (
                  <li className="text-sm text-gray-600">No tasks in this status</li>
                )}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
