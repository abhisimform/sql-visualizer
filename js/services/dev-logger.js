export const LOGCONFIG = {
  query: {
    lifecycle: false,
    stateChanges: false,
    stepNavigation: false,
    reset: false,
    input: false
  },
  parser: {
    startEnd: false,
    clauses: false,
    expressions: false,
    conditions: false,
    subqueries: false,
    aliases: false,
    sources: false,
    errors: false
  },
  validator: {
    startEnd: false,
    clauses: false,
    tables: false,
    columns: false,
    aliases: false,
    aggregates: false,
    having: false,
    types: false,
    subqueries: false,
    errors: false
  },
  engine: {
    startEnd: false,
    steps: true,
    tableAccess: false,
    joins: false,
    filtering: false,
    grouping: false,
    aggregates: false,
    projection: false,
    sorting: false,
    pagination: false,
    subqueries: false,
    aliasResolution: false,
    rowCounts: false,
    snapshots: false,
    errors: false,
    data: false
  },
  app: {
    lifecycle: false,
    flow: false,
    highlights: false,
    previews: false,
    animation: false,
    errors: false
  },
  highlight: {
    sequence: true,
    activeClause: false,
    nested: false,
    sources: false
  },
  animation: {
    lifecycle: false,
    transitions: false,
    state: false,
    skipped: false,
    timings: false
  },
  renderer: {
    lifecycle: false,
    dataset: false,
    mode: false,
    copy: false,
    errors: false
  },
  data: {
    tableAccess: false,
    schemaAccess: false,
    missing: false
  },
  storage: {
    query: false,
    theme: false
  }
};

let GLOBAL_LOGGING_ENABLED = true;

function getFlag(path) {
  return path.split(".").reduce((current, key) => (current && key in current ? current[key] : undefined), LOGCONFIG);
}

function cloneDetails(details) {
  if (details === undefined) {
    return undefined;
  }

  try {
    return structuredClone(details);
  } catch (error) {
    return details;
  }
}

export function isLogEnabled(path) {
  return GLOBAL_LOGGING_ENABLED && getFlag(path) === true;
}

export function setGlobalLoggingEnabled(value) {
  GLOBAL_LOGGING_ENABLED = Boolean(value);
}

export function getGlobalLoggingEnabled() {
  return GLOBAL_LOGGING_ENABLED;
}

export function createLogger(moduleName) {
  const formatPrefix = (path, level) => `[${moduleName}] [${level}] [${path}]`;

  const emit = (level, path, message, details) => {
    if (!isLogEnabled(path)) {
      return;
    }

    const prefix = formatPrefix(path, level);
    const payload = cloneDetails(details);
    const method = level === "ERROR" ? "error" : level === "WARN" ? "warn" : "log";

    if (payload === undefined) {
      console[method](prefix, message);
      return;
    }

    console[method](prefix, message, payload);
  };

  return {
    debug(path, message, details) {
      emit("DEBUG", path, message, details);
    },
    warn(path, message, details) {
      emit("WARN", path, message, details);
    },
    error(path, message, details) {
      emit("ERROR", path, message, details);
    }
  };
}
