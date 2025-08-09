import { notFound } from 'next/navigation';
import { getIdeaData } from '../../../lib/data';
import ActivityList from './ActivityList';

interface IdeaDetailPageProps {
  params: { id: string };
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const ideaId = parseInt(params.id);
  
  if (isNaN(ideaId)) {
    notFound();
  }

  // Get idea data from in-memory storage
  const { idea, brief, events } = getIdeaData(ideaId);

  if (!idea) {
    notFound();
  }

  const isApproved = idea.status === 'active';
  const hasProjects = isApproved; // Simplified logic for demo

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1>Idea: {idea.summary}</h1>
        <p style={{ color: '#666' }}>Status: {idea.status}</p>
      </div>

      {brief && (
        <section style={{ marginBottom: 32 }}>
          <h2>Brief</h2>
          <div style={{ 
            padding: 16, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 8,
            marginBottom: 16
          }}>
            <h3>Overview</h3>
            <p>{brief.content.overview}</p>
            
            <h3>Objectives</h3>
            <ul>
              {brief.content.objectives?.map((objective: string, index: number) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>

            {brief.content.audience && (
              <>
                <h3>Target Audience</h3>
                <p>{brief.content.audience}</p>
              </>
            )}

            {brief.content.constraints && brief.content.constraints.length > 0 && (
              <>
                <h3>Constraints</h3>
                <ul>
                  {brief.content.constraints.map((constraint: string, index: number) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2>Project Plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ 
            padding: 16, 
            backgroundColor: '#e3f2fd', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <h3>Phases</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{isApproved ? 5 : 0}</p>
          </div>
          <div style={{ 
            padding: 16, 
            backgroundColor: '#f3e5f5', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <h3>Checkpoints</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{isApproved ? 5 : 0}</p>
          </div>
          <div style={{ 
            padding: 16, 
            backgroundColor: '#e8f5e8', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <h3>Tasks</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>{isApproved ? 3 : 0}</p>
          </div>
        </div>
      </section>

      {!isApproved && (
        <section style={{ marginBottom: 32 }}>
          <h2>Approval</h2>
          <form action={async () => {
            'use server';
            const { approveBrief } = await import('../../studio/new/actions');
            await approveBrief(ideaId);
          }}>
            <button 
              type="submit"
              disabled={hasProjects}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: hasProjects ? '#ccc' : '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: hasProjects ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {hasProjects ? 'Already Approved' : 'Approve Brief'}
            </button>
          </form>
        </section>
      )}

      <section>
        <h2>Activity</h2>
        <ActivityList events={events} />
      </section>
    </main>
  );
}
