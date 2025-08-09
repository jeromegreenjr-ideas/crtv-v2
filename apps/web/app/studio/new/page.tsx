"use client";
import { useState } from "react";
import { generateBriefAndPlan } from "./actions";
import { useRouter } from "next/navigation";
import { Sparkles, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewIdea() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateBriefAndPlan(formData);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.ideaId) {
        // Redirect to idea detail page
        router.push(`/ideas/${result.ideaId}`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Studio — Idea Intake
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your creative idea and we'll generate a comprehensive brief and project plan to bring it to life.
          </p>
        </div>
        
        <div className="card max-w-2xl mx-auto">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Idea
              </label>
              <textarea 
                id="summary"
                name="summary"
                placeholder="Share your creative vision... What are you trying to achieve? Who is your target audience? What makes this idea unique?" 
                value={summary} 
                onChange={e => setSummary(e.target.value)} 
                rows={8} 
                className="input-field resize-none"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Be as detailed as possible. Include context, objectives, and any constraints you're aware of.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit" 
                disabled={!summary.trim() || isLoading}
                className="btn-primary flex-1 flex items-center justify-center text-lg py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Brief & Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Brief & Plan
                  </>
                )}
              </button>
              
              <Link 
                href="/" 
                className="btn-secondary flex-1 flex items-center justify-center text-lg py-3"
              >
                Cancel
              </Link>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Brief</h3>
            <p className="text-sm text-gray-600">
              Get a detailed project brief with objectives, audience, and constraints.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">5-Phase Plan</h3>
            <p className="text-sm text-gray-600">
              Structured project phases with clear milestones and deliverables.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Team Ready</h3>
            <p className="text-sm text-gray-600">
              Generate checkpoints and tasks for your team to execute.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
