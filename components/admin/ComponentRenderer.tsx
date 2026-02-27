'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { ComponentData } from '@/lib/types/builder';

interface ComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (props: Record<string, any>) => void;
  onDelete: () => void;
}

export function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ComponentRendererProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-sm ${
        isSelected
          ? 'border-[#111] bg-white'
          : 'border-transparent hover:border-[#111]/30'
      }`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-move bg-[#111] text-[#f9f9f7] px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ⋮⋮ Drag
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        × Delete
      </button>
      <div className="p-6">
        <RenderComponent component={component} />
      </div>
    </div>
  );
}

function RenderComponent({ component }: { component: ComponentData }) {
  const { type, props } = component;

  switch (type) {
    case 'hero':
      return (
        <div className="text-center space-y-8">
          {props.logo && (
            <Image
              src={props.logo || '/thinkdifferent_logo.png'}
              alt="Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          )}
          <div>
            <p className="text-2xl font-handwritten font-bold text-[#111]">
              {props.subtitle || 'created to create'}
            </p>
            <p className="text-lg font-handwritten text-[#111]/60 mt-2">
              {props.description || 'Being creative is a necessity to life'}
            </p>
          </div>
        </div>
      );

    case 'text':
      return (
        <p className={`text-${props.size || 'base'} text-[#111]`}>
          {props.content || 'Your text here'}
        </p>
      );

    case 'button':
      const buttonContent = props.href ? (
        <a href={props.href} className="inline-block">
          <Button variant={props.variant || 'primary'}>
            {props.text || 'Click me'}
          </Button>
        </a>
      ) : (
        <Button variant={props.variant || 'primary'}>
          {props.text || 'Click me'}
        </Button>
      );
      return buttonContent;

    case 'image':
      return (
        <Image
          src={props.src || '/thinkdifferent_logo.png'}
          alt={props.alt || 'Image'}
          width={props.width || 200}
          height={props.height || 200}
          className="mx-auto"
        />
      );

    case 'values':
      return (
        <div className="grid grid-cols-3 gap-8 text-center">
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="space-y-2">
              <h3 className="text-lg font-light text-[#111]">{item.title}</h3>
              <p className="text-sm text-[#111]/70 font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      );

    case 'instagram-link':
      return (
        <a
          href={`https://instagram.com/${props.username || 'uthinkdifferent'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#111]/70 hover:text-[#111] hover:underline"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{props.text || `@${props.username || 'uthinkdifferent'}`}</span>
        </a>
      );

    default:
      return <div>Unknown component type: {type}</div>;
  }
}
