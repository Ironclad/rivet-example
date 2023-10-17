import { Router } from 'express';
import WebSocket from 'ws';

import { rivetDebuggerSocketRoutes, startRivetDebuggerServer } from './RivetDebuggerRoutes';
import { runMessageGraph, runRivetGraph } from '@src/services/RivetRunner';


// **** Variables **** //

const apiRouter = Router();

apiRouter.post('/rivet-example', async (req, res) => {
  const input = req.body.input as { type: 'user' | 'assistant'; message: string }[];
  const response = await runMessageGraph(input);

  res.json({ output: response });
});

// **** Websocket for Rivet debugger **** //

const debuggerServer = new WebSocket.Server({ noServer: true });
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
