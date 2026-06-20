import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';
import {
  HomeViewModel,
  TaskCategory,
  TaskInsight,
  TaskItem,
  TaskRow,
  TaskStoreState,
} from '../models/task.models';

const STORAGE_KEY = 'ionic-task-manager-state-v1';
const ALL_FILTER = 'all';
const UNCATEGORIZED_FILTER = 'uncategorized';
const DEFAULT_CATEGORY_COLOR = '#4f46e5';
const FALLBACK_CATEGORY_COLOR = '#64748b';
const UNCATEGORIZED_LABEL = 'Sin categoria';

@Injectable({
  providedIn: 'root',
})
export class TaskStoreService {
  private readonly stateSubject = new BehaviorSubject<TaskStoreState>(this.loadState());
  readonly state$ = this.stateSubject.asObservable();
  readonly vm$: Observable<HomeViewModel> = this.state$.pipe(
    map((state) => this.buildViewModel(state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  addTask(title: string, categoryId: string | null): void {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    this.updateState((state) => ({
      ...state,
      tasks: [
        this.createTask(trimmedTitle, categoryId),
        ...state.tasks,
      ],
    }));
  }

  toggleTask(taskId: string): void {
    this.updateState((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: this.nowIso(),
            }
          : task
      ),
    }));
  }

  updateTaskCategory(taskId: string, categoryId: string | null): void {
    this.updateState((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              categoryId,
              updatedAt: this.nowIso(),
            }
          : task
      ),
    }));
  }

  deleteTask(taskId: string): void {
    this.updateState((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  }

  addCategory(name: string, color: string): void {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    this.updateState((state) => ({
      ...state,
      categories: [this.createCategory(trimmedName, color), ...state.categories],
    }));
  }

  updateCategory(categoryId: string, name: string, color: string): void {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    this.updateState((state) => ({
      ...state,
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              name: trimmedName,
              color: color || category.color,
              updatedAt: this.nowIso(),
            }
          : category
      ),
    }));
  }

  deleteCategory(categoryId: string): void {
    this.updateState((state) => ({
      ...state,
      categories: state.categories.filter((category) => category.id !== categoryId),
      tasks: state.tasks.map((task) =>
        task.categoryId === categoryId
          ? {
              ...task,
              categoryId: null,
              updatedAt: this.nowIso(),
            }
          : task
      ),
      selectedCategoryId:
        state.selectedCategoryId === categoryId ? ALL_FILTER : state.selectedCategoryId,
    }));
  }

  setCategoryFilter(categoryId: string): void {
    this.updateState((state) => ({
      ...state,
      selectedCategoryId: categoryId,
    }));
  }

  private updateState(mutator: (state: TaskStoreState) => TaskStoreState): void {
    const nextState = mutator(this.stateSubject.value);
    this.stateSubject.next(nextState);
    this.persistState(nextState);
  }

  private loadState(): TaskStoreState {
    const seedState = this.getSeedState();

    try {
      const rawState = localStorage.getItem(STORAGE_KEY);

      if (!rawState) {
        this.persistState(seedState);
        return seedState;
      }

      const parsed = JSON.parse(rawState) as Partial<TaskStoreState>;

      if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.categories)) {
        this.persistState(seedState);
        return seedState;
      }

      return {
        tasks: parsed.tasks,
        categories: parsed.categories,
        selectedCategoryId:
          typeof parsed.selectedCategoryId === 'string' ? parsed.selectedCategoryId : ALL_FILTER,
      };
    } catch {
      this.persistState(seedState);
      return seedState;
    }
  }

  private persistState(state: TaskStoreState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private buildViewModel(state: TaskStoreState): HomeViewModel {
    const categoryMap = this.buildCategoryMap(state.categories);
    const tasks = this.decorateTasks(state.tasks, categoryMap);
    const usageByCategoryId: Record<string, number> = {};
    let activeCount = 0;
    let completedCount = 0;
    let uncategorizedCount = 0;

    for (const task of state.tasks) {
      if (task.completed) {
        completedCount += 1;
      } else {
        activeCount += 1;
      }

      if (!task.categoryId) {
        uncategorizedCount += 1;
        continue;
      }

      usageByCategoryId[task.categoryId] = (usageByCategoryId[task.categoryId] ?? 0) + 1;
    }

    return {
      tasks,
      categories: [...state.categories].sort((left, right) => left.name.localeCompare(right.name)),
      filteredTasks: this.filterTasks(tasks, state.selectedCategoryId),
      selectedCategoryId: state.selectedCategoryId,
      selectedCategoryName: this.resolveSelectedCategoryName(
        state.selectedCategoryId,
        categoryMap
      ),
      totalCount: state.tasks.length,
      activeCount,
      completedCount,
      categoryUsageById: usageByCategoryId,
      categoryInsights: this.buildCategoryInsights(state.categories, usageByCategoryId, uncategorizedCount),
    };
  }

  private getSeedState(): TaskStoreState {
    const workCategory = this.createCategory('Trabajo', '#0ea5e9');
    const personalCategory = this.createCategory('Personal', '#f97316');
    const studyCategory = this.createCategory('Estudio', '#22c55e');

    return {
      selectedCategoryId: ALL_FILTER,
      categories: [workCategory, personalCategory, studyCategory],
      tasks: [
        this.createTask('Enviar avance semanal', workCategory.id),
        this.createTask('Pagar servicios del mes', personalCategory.id),
        this.createTask('Repasar Ionic', studyCategory.id),
      ],
    };
  }

  private createCategory(name: string, color: string): TaskCategory {
    const now = this.nowIso();

    return {
      id: this.buildId(),
      name,
      color: color || DEFAULT_CATEGORY_COLOR,
      createdAt: now,
      updatedAt: now,
    };
  }

  private createTask(title: string, categoryId: string | null): TaskItem {
    const now = this.nowIso();

    return {
      id: this.buildId(),
      title,
      completed: false,
      categoryId,
      createdAt: now,
      updatedAt: now,
    };
  }

  private buildCategoryMap(categories: TaskCategory[]): Record<string, TaskCategory> {
    return categories.reduce<Record<string, TaskCategory>>((map, category) => {
      map[category.id] = category;
      return map;
    }, {});
  }

  private decorateTasks(tasks: TaskItem[], categoryMap: Record<string, TaskCategory>): TaskRow[] {
    return tasks
      .map<TaskRow>((task) => {
        const category = task.categoryId ? categoryMap[task.categoryId] : undefined;

        return {
          ...task,
          categoryName: category?.name ?? UNCATEGORIZED_LABEL,
          categoryColor: category?.color ?? FALLBACK_CATEGORY_COLOR,
        };
      })
      .sort((left, right) => this.compareTasks(left, right));
  }

  private filterTasks(tasks: TaskRow[], selectedCategoryId: string): TaskRow[] {
    if (selectedCategoryId === ALL_FILTER) {
      return tasks;
    }

    if (selectedCategoryId === UNCATEGORIZED_FILTER) {
      return tasks.filter((task) => !task.categoryId);
    }

    return tasks.filter((task) => task.categoryId === selectedCategoryId);
  }

  private resolveSelectedCategoryName(
    selectedCategoryId: string,
    categoryMap: Record<string, TaskCategory>
  ): string {
    if (selectedCategoryId === ALL_FILTER) {
      return 'Todas';
    }

    if (selectedCategoryId === UNCATEGORIZED_FILTER) {
      return UNCATEGORIZED_LABEL;
    }

    return categoryMap[selectedCategoryId]?.name ?? UNCATEGORIZED_LABEL;
  }

  private buildCategoryInsights(
    categories: TaskCategory[],
    usageByCategoryId: Record<string, number>,
    uncategorizedCount: number
  ): TaskInsight[] {
    return [
      ...categories.map<TaskInsight>((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        count: usageByCategoryId[category.id] ?? 0,
      })),
      {
        categoryId: null,
        categoryName: UNCATEGORIZED_LABEL,
        categoryColor: FALLBACK_CATEGORY_COLOR,
        count: uncategorizedCount,
      },
    ].sort((left, right) => right.count - left.count || left.categoryName.localeCompare(right.categoryName));
  }

  private compareTasks(left: TaskRow, right: TaskRow): number {
    return Number(left.completed) - Number(right.completed) || right.createdAt.localeCompare(left.createdAt);
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private buildId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
