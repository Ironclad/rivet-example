import { Request, Response, Router } from 'express';
import WebSocket from 'ws';

import { GraphId, GraphInputs, GraphProcessor, RivetDebuggerServer, startDebuggerServer } from '@ironclad/rivet-node';

export const rivetDebuggerServerState = {
  server: null as RivetDebuggerServer | null,
};

export function startRivetDebuggerServer(
  wss: WebSocket.Server,
  options: {
    /** Gets the debugger ws client given a processor */
    getClientsForProcessor?: (processor: GraphProcessor, allClients: WebSocket[]) => WebSocket[];

    /** Gets the processors for a given ws client. */
    getProcessorsForClient?: (client: WebSocket, allProcessors: GraphProcessor[]) => GraphProcessor[];

    dynamicGraphRun?: (data: { client: WebSocket; graphId: GraphId; inputs?: GraphInputs }) => Promise<void>;
  } = {},
) {
  if (rivetDebuggerServerState.server) {
    return;
  }

  const {
    getClientsForProcessor = (processor, allClients) => allClients,
    getProcessorsForClient = (client, allProcessors) => allProcessors,
    dynamicGraphRun,
  } = options;

  const rivetDebuggerServer = startDebuggerServer({
    server: wss,

    getClientsForProcessor,
    getProcessorsForClient,
    dynamicGraphRun,
  });

  rivetDebuggerServer.on('error', (err) => {
    console.error('Error from rivet debugger', { err });
  });

  rivetDebuggerServerState.server = rivetDebuggerServer;

  console.info('Started rivet debugger');
}

export function rivetDebuggerSocketRoutes(
  router: Router,
  options: {
    path?: string;
    onConnected?: (socket: WebSocket.WebSocket, req: Request, wss: WebSocket.Server) => void;
    validate?: (req: Request) => Promise<string | undefined>;
    wss?: WebSocket.Server;
  } = {},
) {
  const {
    path = '/rivet/debugger',
    onConnected = (socket, req, wsServer) => {
      wsServer.emit('connection', socket, req);

      console.info('Rivet debugger connected');
      socket.on('close', () => {
        console.info('Rivet debugger disconnected');
      });
    },
    validate = () => { return undefined },
    wss = new WebSocket.Server({ noServer: true }),
  } = options;

  router.get(path, async (req: Request, res: Response) => {
    try {
      const validationError = await validate?.(req);

      if (validationError) {
        res.status(400).send(validationError);
        return;
      }

      if (req.headers.upgrade !== 'websocket') {
        res.status(400).send('Expected a WebSocket connection');
        return;
      }

      wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        onConnected(ws, req, wss);
      });
    } catch (err) {
      console.error('Error while upgrading websocket', { err });
      res.status(500).send('Internal Server Error');
    }
  });

  return {
    wss,
  };
}
