'use client';

import { useDraggable } from '@dnd-kit/core';
import type { ComponentType } from '@/lib/types/builder';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
}

const componentTypes: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Hero Section', icon: '🎯' },
  { type: 'text', label: 'Text Block', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'values', label: 'Values Grid', icon: '⭐' },
  { type: 'instagram-link', label: 'Instagram Link', icon: '📷' },
];

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-light mb-4 text-[#111]">Components</h2>
      <div className="space-y-2">
        {componentTypes.map(({ type, label, icon }) => (
          <DraggableComponent
            key={type}
            type={type}
            label={label}
            icon={icon}
            onAdd={onAddComponent}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableComponent({
  type,
  label,
  icon,
  onAdd,
}: {
  type: ComponentType;
  label: string;
  icon: string;
  onAdd: (type: ComponentType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onAdd(type)}
      className="flex items-center gap-3 p-3 border border-[#111]/20 rounded-sm cursor-move hover:bg-[#111]/5 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-light text-[#111]">{label}</span>
    </div>
  );
}
