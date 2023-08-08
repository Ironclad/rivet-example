import { Request, Response, Router } from 'express';
import WebSocket from 'ws';

import { logger } from '@ironclad/logging-iso';
import { UserId } from '@ironclad/precedent-iso';
import { GraphId, GraphInputs, GraphProcessor, RivetDebuggerServer, startDebuggerServer } from '@ironclad/rivet-node';

export const rivetDebuggerServerState = {
  server: null as RivetDebuggerServer | null,
};

export const registeredDebuggers: { userId: UserId; ws: WebSocket.WebSocket }[] = [];

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
    // Could be multiple services, but that's fine, chats is global too
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
    logger.error('Error from rivet debugger', { err });
  });

  rivetDebuggerServerState.server = rivetDebuggerServer;

  logger.info('Started rivet debugger');
}

export function registerRivetDebugger(userId: UserId, ws: WebSocket.WebSocket) {
  const info = { userId, ws };
  registeredDebuggers.push(info);

  ws.on('close', () => {
    const index = registeredDebuggers.indexOf(info);
    if (index !== -1) {
      registeredDebuggers.splice(index, 1);
    }
  });
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

      logger.info('Rivet debugger connected');
      socket.on('close', () => {
        logger.info('Rivet debugger disconnected');
      });
    },
    validate,
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
      logger.error('Error while upgrading websocket', { err });
      res.status(500).send('Internal Server Error');
    }
  });

  return {
    wss,
  };
}
