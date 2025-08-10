import Link from 'next/link';
import { getAllIdeas } from '../../lib/data';
import { Skeleton } from '../../components/Skeleton';
import { ArrowLeft, Plus, Lightbulb, Clock, CheckCircle, Sparkles } from 'lucide-react';

export default async function IdeasPage() {
  const ideas = await getAllIdeas();

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
              New Idea
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Ideas</h1>
          </div>
          <p className="text-gray-600">
            Browse and manage your creative ideas and projects.
          </p>
        </div>

        {/* Ideas Grid */}
        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Ideas Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by creating your first idea. Describe your creative vision and we'll help you bring it to life.
            </p>
            <Link href="/studio/new" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Idea
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Link 
                key={idea.id} 
                href={`/ideas/${idea.id}`}
                className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {idea.status === 'active' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Draft
                      </>
                    )}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {idea.summary}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Created {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'Recently'}
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
        {ideas.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{ideas.length}</h3>
              <p className="text-gray-600">Total Ideas</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {ideas.filter(i => i.status === 'active').length}
              </h3>
              <p className="text-gray-600">Active Projects</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {ideas.filter(i => i.status === 'draft').length}
              </h3>
              <p className="text-gray-600">Draft Ideas</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
