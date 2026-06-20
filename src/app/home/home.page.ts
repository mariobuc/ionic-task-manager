import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { TaskCategory, TaskInsight, TaskRow } from '../models/task.models';
import { RemoteConfigService } from '../services/remote-config.service';
import { TaskStoreService } from '../services/task-store.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HomePage {
  private readonly taskStore = inject(TaskStoreService);
  private readonly remoteConfig = inject(RemoteConfigService);

  readonly vm$ = combineLatest([
    this.taskStore.vm$,
    this.remoteConfig.categoryInsightsEnabled$,
  ]).pipe(
    map(([vm, showCategoryInsights]) => ({
      ...vm,
      showCategoryInsights,
    }))
  );

  taskTitle = '';
  taskCategoryId = '';

  newCategoryName = '';
  newCategoryColor = '#4f46e5';

  editingCategoryId: string | null = null;
  editingCategoryName = '';
  editingCategoryColor = '#4f46e5';

  addTask(): void {
    this.taskStore.addTask(this.taskTitle, this.taskCategoryId || null);
    this.taskTitle = '';
    this.taskCategoryId = '';
  }

  toggleTask(task: TaskRow): void {
    this.taskStore.toggleTask(task.id);
  }

  removeTask(task: TaskRow): void {
    this.taskStore.deleteTask(task.id);
  }

  updateTaskCategory(task: TaskRow, categoryId: string): void {
    this.taskStore.updateTaskCategory(task.id, categoryId || null);
  }

  setFilter(categoryId: string): void {
    this.taskStore.setCategoryFilter(categoryId);
  }

  addCategory(): void {
    this.taskStore.addCategory(this.newCategoryName, this.newCategoryColor);
    this.newCategoryName = '';
    this.newCategoryColor = '#4f46e5';
  }

  startCategoryEdit(category: TaskCategory): void {
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
    this.editingCategoryColor = category.color;
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.editingCategoryColor = '#4f46e5';
  }

  saveCategoryEdit(): void {
    if (!this.editingCategoryId) {
      return;
    }

    this.taskStore.updateCategory(
      this.editingCategoryId,
      this.editingCategoryName,
      this.editingCategoryColor
    );
    this.cancelCategoryEdit();
  }

  deleteCategory(categoryId: string): void {
    if (this.editingCategoryId === categoryId) {
      this.cancelCategoryEdit();
    }

    this.taskStore.deleteCategory(categoryId);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByInsight(_: number, item: TaskInsight): string {
    return item.categoryId ?? 'uncategorized';
  }
}
