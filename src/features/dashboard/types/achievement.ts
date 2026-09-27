// ─── Models ───────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  /** Nombre del icono de Lucide (e.g. "Container", "Cloud") */
  icon?: string | null;
  /** Color en formato hex (e.g. "#f97316") */
  color?: string | null;
  estado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  firstPage: number;
  lastPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedAchievements {
  data: Achievement[];
  meta: PaginationMeta;
}
