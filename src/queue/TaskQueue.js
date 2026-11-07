/**
 * Subtitle Wizard - Task Queue
 */

import { logger } from '../utils/logger.js';

/**
 * Task queue for sequential processing
 */
export class TaskQueue {
  constructor(options = {}) {
    this.tasks = [];
    this.isRunning = false;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Add a task to the queue
   */
  add(task) {
    const newTask = {
      id: this.generateId(),
      ...task,
      retries: 0,
      status: 'pending',
      createdAt: Date.now()
    };

    this.tasks.push(newTask);
    logger.debug(`Task added: ${newTask.id} - ${newTask.name}`);

    // Auto-start if not running
    if (!this.isRunning) {
      this.start();
    }

    return newTask.id;
  }

  /**
   * Add multiple tasks
   */
  addBulk(tasks) {
    const ids = [];
    for (const task of tasks) {
      ids.push(this.add(task));
    }
    return ids;
  }

  /**
   * Get next pending task
   */
  getNextTask() {
    return this.tasks.find(t => t.status === 'pending');
  }

  /**
   * Start processing the queue
   */
  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info('Task queue started');

    while (this.tasks.some(t => t.status === 'pending' || t.status === 'retrying')) {
      const task = this.getNextTask();

      if (!task) break;

      task.status = 'running';
      this.notifyTaskStart(task);

      try {
        await task.execute();
        task.status = 'completed';
        task.completedAt = Date.now();
        this.notifyTaskComplete(task);

      } catch (error) {
        if (task.retries < this.maxRetries) {
          task.retries++;
          task.status = 'retrying';
          this.notifyTaskRetry(task, error);

          await this.delay(this.retryDelay * task.retries);

        } else {
          task.status = 'failed';
          task.error = error.message;
          this.notifyTaskFailed(task, error);
        }
      }
    }

    this.isRunning = false;
    logger.info('Task queue completed');
    this.notifyQueueComplete();
  }

  /**
   * Execute task by ID
   */
  async executeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'pending') return false;

    this.tasks = this.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'running' } : t
    );

    try {
      await task.execute();
      this.tasks = this.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed', completedAt: Date.now() } : t
      );
      return true;
    } catch (error) {
      this.tasks = this.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'failed', error: error.message } : t
      );
      return false;
    }
  }

  /**
   * Cancel all tasks
   */
  cancelAll() {
    this.tasks = this.tasks.map(t => ({
      ...t,
      status: t.status === 'pending' ? 'cancelled' : t.status
    }));

    this.isRunning = false;
    logger.info('All tasks cancelled');
  }

  /**
   * Cancel specific task
   */
  cancelTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      task.status = 'cancelled';
      logger.info(`Task cancelled: ${taskId}`);
    }
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return this.tasks;
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  /**
   * Get pending tasks count
   */
  getPendingCount() {
    return this.tasks.filter(t => t.status === 'pending').length;
  }

  /**
   * Get completed tasks count
   */
  getCompletedCount() {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  /**
   * Get failed tasks count
   */
  getFailedCount() {
    return this.tasks.filter(t => t.status === 'failed').length;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      total: this.tasks.length,
      pending: this.getPendingCount(),
      running: this.tasks.filter(t => t.status === 'running').length,
      completed: this.getCompletedCount(),
      failed: this.getFailedCount(),
      cancelled: this.tasks.filter(t => t.status === 'cancelled').length
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Register callback for task events
   */
  onTaskStart(callback) {
    this.onTaskStartCallback = callback;
  }

  /**
   * Register callback for task completion
   */
  onTaskComplete(callback) {
    this.onTaskCompleteCallback = callback;
  }

  /**
   * Register callback for task failure
   */
  onTaskFailed(callback) {
    this.onTaskFailedCallback = callback;
  }

  /**
   * Register callback for task retry
   */
  onTaskRetry(callback) {
    this.onTaskRetryCallback = callback;
  }

  /**
   * Register callback for queue completion
   */
  onQueueComplete(callback) {
    this.onQueueCompleteCallback = callback;
  }

  /**
   * Notify task start
   */
  notifyTaskStart(task) {
    if (this.onTaskStartCallback) {
      this.onTaskStartCallback(task);
    }
  }

  /**
   * Notify task complete
   */
  notifyTaskComplete(task) {
    if (this.onTaskCompleteCallback) {
      this.onTaskCompleteCallback(task);
    }
  }

  /**
   * Notify task failed
   */
  notifyTaskFailed(task, error) {
    if (this.onTaskFailedCallback) {
      this.onTaskFailedCallback(task, error);
    }
  }

  /**
   * Notify task retry
   */
  notifyTaskRetry(task, error) {
    if (this.onTaskRetryCallback) {
      this.onTaskRetryCallback(task, error);
    }
  }

  /**
   * Notify queue complete
   */
  notifyQueueComplete() {
    if (this.onQueueCompleteCallback) {
      this.onQueueCompleteCallback();
    }
  }
}

// Export singleton
export const taskQueue = new TaskQueue();
