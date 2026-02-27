'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Proposal } from '@/lib/types/builder';

interface ProposalPanelProps {
  proposals: Proposal[];
  onRefresh: () => void;
}

export function ProposalPanel({ proposals, onRefresh }: ProposalPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const submitToGitHub = async (proposalId: string) => {
    setIsSubmitting(proposalId);
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/submit`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        alert(`PR created: ${data.prUrl}`);
        onRefresh();
      } else {
        const error = await res.json();
        alert(`Failed: ${error.message || error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit proposal');
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#111]/10 p-4 max-h-64 overflow-y-auto">
      <h3 className="text-lg font-light mb-4 text-[#111]">Proposals</h3>
      <div className="space-y-2">
        {proposals.length === 0 ? (
          <p className="text-sm text-[#111]/50">No proposals yet</p>
        ) : (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="flex items-center justify-between p-3 border border-[#111]/20 rounded-sm"
            >
              <div className="flex-1">
                <h4 className="font-light text-[#111]">{proposal.title}</h4>
                {proposal.description && (
                  <p className="text-sm text-[#111]/60">{proposal.description}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      proposal.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : proposal.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : proposal.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {proposal.status}
                  </span>
                  {proposal.githubPrUrl && (
                    <a
                      href={proposal.githubPrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      PR #{proposal.githubPrNumber}
                    </a>
                  )}
                </div>
              </div>
              {proposal.status === 'draft' && (
                <Button
                  variant="primary"
                  onClick={() => submitToGitHub(proposal.id)}
                  disabled={isSubmitting === proposal.id}
                  className="ml-4"
                >
                  {isSubmitting === proposal.id ? 'Submitting...' : 'Submit PR'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
