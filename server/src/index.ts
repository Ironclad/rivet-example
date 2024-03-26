/**
 * Setup express server.
 */

import morgan from 'morgan';
import express, { Request, Response, NextFunction } from 'express';
import winston from 'winston';

import 'express-async-errors';

import BaseRouter from './Router.js';

import EnvVars from './constants/EnvVars.js';
import HttpStatusCodes from './constants/HttpStatusCodes.js';

import { NodeEnvs } from './constants/misc.js';
import { RouteError } from './other/classes.js';


// **** Variables **** //

const app = express();


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Add APIs, must be after middleware
app.use('/api', BaseRouter);

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test) {
    winston.error(err);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});

// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.Port.toString());

app.listen(EnvVars.Port, () => winston.info(SERVER_START_MSG));
