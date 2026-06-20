export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRow extends TaskItem {
  categoryName: string;
  categoryColor: string;
}

export interface TaskInsight {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  count: number;
}

export interface TaskStoreState {
  tasks: TaskItem[];
  categories: TaskCategory[];
  selectedCategoryId: string;
}

export interface HomeViewModel {
  tasks: TaskRow[];
  categories: TaskCategory[];
  filteredTasks: TaskRow[];
  selectedCategoryId: string;
  selectedCategoryName: string;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  categoryUsageById: Record<string, number>;
  categoryInsights: TaskInsight[];
}
