import { Router } from 'express';
import WebSocket from 'ws';

import Paths from './constants/Paths';
import { rivetExample } from './RivetRoutes';
import { rivetDebuggerSocketRoutes, startRivetDebuggerServer } from './DebuggerRoutes';
import { runRivetGraph } from '@src/services/RivetRunner';


// **** Variables **** //

const apiRouter = Router();

apiRouter.post(Paths.RivetExample, rivetExample);

// **** Websocket for Rivet debugger **** //

const debuggerServer = new WebSocket.Server({ noServer: true });
startRivetDebuggerServer(debuggerServer, {
  dynamicGraphRun: async ({ inputs, graphId }) => {
    await runRivetGraph(graphId, inputs);
  }
});
rivetDebuggerSocketRoutes(apiRouter, {
  path: Paths.RivetDebugger,
  wss: debuggerServer,
});

// **** Export default **** //

export default apiRouter;
