import { Router } from 'express';
import { WebSocketServer } from 'ws';

import { rivetDebuggerSocketRoutes, startRivetDebuggerServer } from './RivetDebuggerRoutes.js';
import { runMessageGraph, runRivetGraph } from './services/RivetRunner.js';


// **** Variables **** //

const apiRouter = Router();

apiRouter.post('/rivet-example', async (req, res) => {
  const input = req.body.input as { type: 'user' | 'assistant'; message: string }[];
  const response = await runMessageGraph(input);

  res.json({ output: response });
});

// **** Websocket for Rivet debugger **** //

const debuggerServer = new WebSocketServer({ noServer: true });
startRivetDebuggerServer(debuggerServer, {
  dynamicGraphRun: async ({ inputs, graphId }) => {
    await runRivetGraph(graphId, inputs);
  },
});
rivetDebuggerSocketRoutes(apiRouter, {
  path: '/rivet/debugger',
  wss: debuggerServer,
});

// **** Export default **** //

export default apiRouter;
