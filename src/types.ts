export interface Lab {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  icon: string;
}

export interface Commit {
  id: string;
  hash: string;
  role: string;
  company: string;
  details: string[];
  date: string;
  branch?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string;
  icon: string;
  status: string;
}
