'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/Button';
import { ComponentPalette } from '@/components/admin/ComponentPalette';
import { ComponentRenderer } from '@/components/admin/ComponentRenderer';
import { ProposalPanel } from '@/components/admin/ProposalPanel';
import type { ComponentData, PageStructure, Proposal } from '@/lib/types/builder';

export default function AdminBuilder() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Load existing page structure and proposals when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPageStructure();
      loadProposals();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const result = await res.json();
      setIsAuthenticated(result.authenticated === true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadPageStructure = async () => {
    try {
      const res = await fetch('/api/admin/page-structure');
      if (res.ok) {
        const data = await res.json();
        setComponents(data.components || []);
      }
    } catch (error) {
      console.error('Failed to load page structure:', error);
    }
  };

  const loadProposals = async () => {
    try {
      const res = await fetch('/api/admin/proposals');
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (error) {
      console.error('Failed to load proposals:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    // Handle dropping from palette
    if (typeof active.id === 'string' && active.id.startsWith('palette-')) {
      const type = active.id.replace('palette-', '') as ComponentData['type'];
      addComponent(type);
      return;
    }

    // Handle reordering
    setComponents((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  };

  const addComponent = (type: ComponentData['type']) => {
    const newComponent: ComponentData = {
      id: `comp-${Date.now()}`,
      type,
      props: getDefaultProps(type),
      order: components.length,
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (id: string, props: Record<string, any>) => {
    setComponents((items) =>
      items.map((item) =>
        item.id === id ? { ...item, props: { ...item.props, ...props } } : item
      )
    );
  };

  const deleteComponent = (id: string) => {
    setComponents((items) => items.filter((item) => item.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const saveProposal = async (title: string, description?: string) => {
    setIsSaving(true);
    try {
      const pageStructure: PageStructure = {
        id: 'current',
        name: 'Homepage',
        components,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          pageStructure,
        }),
      });

      if (res.ok) {
        await loadProposals();
        setShowSaveModal(false);
        setProposalTitle('');
        setProposalDescription('');
        alert('Proposal saved successfully!');
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.message || error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save proposal:', error);
      alert('Failed to save proposal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!proposalTitle.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    saveProposal(proposalTitle.trim(), proposalDescription.trim() || undefined);
  };

  // Show login if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#111] mb-4">Please log in to access the builder</p>
          <Button variant="primary" onClick={() => window.location.href = '/admin'}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7] flex items-center justify-center">
        <p className="text-[#111]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7]">
      <div className="border-b border-[#111]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-light text-[#111]">Admin Builder</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => loadPageStructure()}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setProposalTitle('');
                setProposalDescription('');
                setShowSaveModal(true);
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Proposal'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Component Palette */}
        <div className="w-64 border-r border-[#111]/10 bg-white overflow-y-auto">
          <ComponentPalette onAddComponent={addComponent} />
        </div>

        {/* Builder Canvas */}
        <div className="flex-1 overflow-y-auto bg-[#f9f9f7] p-8 pb-80">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={components.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-w-4xl mx-auto space-y-4">
                {components.length === 0 ? (
                  <div className="text-center py-20 text-[#111]/50">
                    <p className="text-lg mb-4">No components yet</p>
                    <p className="text-sm">Drag components from the left panel</p>
                  </div>
                ) : (
                  components.map((component) => (
                    <ComponentRenderer
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent === component.id}
                      onSelect={() => setSelectedComponent(component.id)}
                      onUpdate={(props) => updateComponent(component.id, props)}
                      onDelete={() => deleteComponent(component.id)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l border-[#111]/10 bg-white overflow-y-auto">
          {selectedComponent ? (
            <div className="p-4">
              <h2 className="text-lg font-light mb-4 text-[#111]">Properties</h2>
              <ComponentProperties
                component={components.find((c) => c.id === selectedComponent)!}
                onUpdate={(props) =>
                  updateComponent(selectedComponent, props)
                }
              />
            </div>
          ) : (
            <div className="p-4 text-center text-[#111]/50">
              <p>Select a component to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Proposals Panel */}
      <ProposalPanel proposals={proposals} onRefresh={loadProposals} />

      {/* Save Proposal Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-light text-[#111] mb-4">Save Proposal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-[#111] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && proposalTitle.trim()) {
                      handleSaveClick();
                    }
                  }}
                  className="w-full px-3 py-2 border border-[#111]/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#111]"
                  placeholder="Enter proposal title"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-light text-[#111] mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#111]/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#111] resize-none"
                  rows={3}
                  placeholder="Enter proposal description"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveModal(false);
                  setProposalTitle('');
                  setProposalDescription('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveClick}
                disabled={isSaving || !proposalTitle.trim()}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultProps(type: ComponentData['type']): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        subtitle: 'created to create',
        description: 'Being creative is a necessity to life',
      };
    case 'text':
      return {
        content: 'Your text here',
        size: 'base',
      };
    case 'button':
      return {
        text: 'Click me',
        variant: 'primary',
        href: '#',
      };
    case 'image':
      return {
        src: '/thinkdifferent_logo.png',
        alt: 'Image',
        width: 200,
        height: 200,
      };
    case 'values':
      return {
        items: [
          { title: 'Creativity', description: 'Fostering imagination' },
          { title: 'Individuality', description: 'Celebrating uniqueness' },
          { title: 'Curiosity', description: 'Questioning assumptions' },
        ],
      };
    case 'instagram-link':
      return {
        username: 'uthinkdifferent',
        text: '@uthinkdifferent',
      };
    default:
      return {};
  }
}

function ComponentProperties({
  component,
  onUpdate,
}: {
  component: ComponentData;
  onUpdate: (props: Record<string, any>) => void;
}) {
  const props = component.props;

  return (
    <div className="space-y-4">
      {Object.entries(props).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-light text-[#111] mb-1">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
            <div className="space-y-2">
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey}>
                  <label className="block text-xs text-[#111]/70 mb-1">
                    {subKey}
                  </label>
                  <input
                    type="text"
                    value={String(subValue)}
                    onChange={(e) => {
                      onUpdate({
                        [key]: { ...value, [subKey]: e.target.value },
                      });
                    }}
                    className="w-full px-3 py-2 border border-[#111]/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#111] text-sm"
                  />
                </div>
              ))}
            </div>
          ) : Array.isArray(value) ? (
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate({ [key]: parsed });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full px-3 py-2 border border-[#111]/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#111] text-sm font-mono"
              rows={6}
            />
          ) : (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => {
                onUpdate({ [key]: e.target.value });
              }}
              className="w-full px-3 py-2 border border-[#111]/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#111]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
