export default function Onboarding() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Get started</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <a href="/onboarding/stakeholder" className="card hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">I have an idea</h2>
          <p>Submit your idea to get an AI-generated brief and plan. Create your account after to view details.</p>
        </a>
        <a href="/onboarding/producer" className="card hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">I am a producer/creative</h2>
          <p>Submit your portfolio links to get an assessment. Create your account after to view your results.</p>
        </a>
      </div>
    </div>
  );
}


