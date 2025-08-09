import Link from "next/link";
import { Sparkles, Lightbulb, Target, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CRTV Studio</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/studio/new" className="text-gray-600 hover:text-primary-600 transition-colors">
                Studio
              </Link>
              <Link href="/projects" className="text-gray-600 hover:text-primary-600 transition-colors">
                Projects
              </Link>
              <Link href="/ideas" className="text-gray-600 hover:text-primary-600 transition-colors">
                Ideas
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your
            <span className="text-primary-600 block">Creative Process</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform ideas into reality with our comprehensive workflow: from concept to brief, 
            through 5-phase planning, checkpoints, and task management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/studio/new" 
              className="btn-primary inline-flex items-center justify-center text-lg px-8 py-3"
            >
              Start New Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/projects/demo" 
              className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-3"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Idea Intake</h3>
            <p className="text-gray-600">
              Capture and refine your creative ideas with our intelligent intake system.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Strategic Planning</h3>
            <p className="text-gray-600">
              Break down projects into 5-phase plans with clear objectives and milestones.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Manage checkpoints, tasks, and team feedback in one centralized platform.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/studio/new" 
              className="card hover:shadow-md transition-shadow text-center group"
            >
              <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">New Idea</h3>
              <p className="text-sm text-gray-600">Start a new project</p>
            </Link>
            
            <Link 
              href="/projects" 
              className="card hover:shadow-md transition-shadow text-center group"
            >
              <Target className="w-8 h-8 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">View Projects</h3>
              <p className="text-sm text-gray-600">See all projects</p>
            </Link>
            
            <Link 
              href="/ideas" 
              className="card hover:shadow-md transition-shadow text-center group"
            >
              <Lightbulb className="w-8 h-8 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Browse Ideas</h3>
              <p className="text-sm text-gray-600">Explore concepts</p>
            </Link>
            
            <Link 
              href="/projects/demo" 
              className="card hover:shadow-md transition-shadow text-center group"
            >
              <Users className="w-8 h-8 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Demo Project</h3>
              <p className="text-sm text-gray-600">See it in action</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">CRTV Studio</span>
          </div>
          <p className="text-gray-400">
            Streamlining creative workflows for modern teams
          </p>
        </div>
      </footer>
    </div>
  );
}
