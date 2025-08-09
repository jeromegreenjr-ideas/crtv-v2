"use client";
import { useState } from "react";
import { generateBriefAndPlan } from "./actions";
import { useRouter } from "next/navigation";

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
    <main style={{ padding: 24, display: "grid", gap: 16, maxWidth: 800 }}>
      <h2>Studio — Idea Intake</h2>
      
      <form action={handleSubmit}>
        <textarea 
          name="summary"
          placeholder="Describe your idea..." 
          value={summary} 
          onChange={e => setSummary(e.target.value)} 
          rows={6} 
          style={{ width: "100%", marginBottom: 16 }}
          required
        />
        <button 
          type="submit" 
          disabled={!summary || isLoading}
          style={{ 
            padding: "12px 24px", 
            backgroundColor: isLoading ? "#ccc" : "#0070f3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Generating..." : "Generate Brief & Plan"}
        </button>
      </form>

      {error && (
        <div style={{ 
          padding: 16, 
          backgroundColor: "#fee", 
          border: "1px solid #fcc", 
          borderRadius: "4px",
          color: "#c33"
        }}>
          {error}
        </div>
      )}
    </main>
  );
}
