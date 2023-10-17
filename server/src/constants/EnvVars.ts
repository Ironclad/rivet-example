/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */


export default {
  NodeEnv: (process.env.NODE_ENV ?? 'development'),
  Port: (process.env.PORT ?? 3001),
} as const;
