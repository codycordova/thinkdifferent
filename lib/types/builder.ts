export type ComponentType = 
  | 'hero'
  | 'text'
  | 'image'
  | 'button'
  | 'section'
  | 'values'
  | 'instagram-link';

export interface ComponentData {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  order: number;
}

export interface PageStructure {
  id: string;
  name: string;
  components: ComponentData[];
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  description?: string;
  pageStructure: PageStructure;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  githubPrNumber?: number;
  githubPrUrl?: string;
  createdAt: string;
  updatedAt: string;
}
