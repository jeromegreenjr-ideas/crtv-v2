import { notFound } from 'next/navigation';
import { getIdeaData } from '../../../lib/data';
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
  const { idea, brief, events } = await getIdeaData(ideaId);

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
        {/* Idea Header */}
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
      </main>
    </div>
  );
}
