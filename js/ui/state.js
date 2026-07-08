// state.js
// Dedicated state manager for Query execution sessions

export class QuerySessionState {
  constructor() {
    this.reset();
  }

  reset() {
    this.executionSteps = [];
    this.steps = [];
    this.stepIndex = 0;
    this.currentData = [];
    this.visibleData = [];
    this.queryError = null;
    this.previewState = new Map();
    this.previewContextCounter = 0;
  }

  setError(error) {
    this.queryError = error;
    this.steps = [];
    this.stepIndex = 0;
    this.currentData = [];
    this.visibleData = [];
  }

  setPipeline(executionSteps, steps) {
    this.executionSteps = executionSteps;
    this.steps = steps;
    this.stepIndex = 0;
    this.currentData = [];
    this.visibleData = [];
    this.queryError = null;
  }
}
