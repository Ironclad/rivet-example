import {
  GraphId,
  GraphInputs,
  GraphOutputs,
  coerceType,
  createProcessor,
  currentDebuggerState,
  loadProjectFromFile,
} from '@ironclad/rivet-node';

import { rivetDebuggerServerState } from '../RivetDebuggerRoutes.js';
import { env } from 'process';
import { calculateExpression } from './CalculationService.js';

export async function runMessageGraph(input: { type: 'assistant' | 'user'; message: string }[]): Promise<string> {
  const outputs = await runRivetGraph('5BI0Pfuu2naOUKqGUO-yZ' as GraphId, {
    messages: {
      type: 'object[]',
      value: input,
    },
  });

  return coerceType(outputs.output, 'string');
}

export async function runRivetGraph(graphId: GraphId, inputs?: GraphInputs): Promise<GraphOutputs> {
  const project = currentDebuggerState.uploadedProject ?? await loadProjectFromFile('../chat.rivet-project');

  const { run } = createProcessor(project, {
    graph: graphId,
    openAiKey: env.OPENAI_API_KEY as string,
    inputs,
    remoteDebugger: rivetDebuggerServerState.server ?? undefined,
    externalFunctions: {
      calculate: async (_context: any, calculationStr: any) => {
        if (typeof calculationStr !== 'string') {
          throw Error('expected a string input');
        }
        const value = calculateExpression(calculationStr);
        if (value) {
          return {
            type: 'number',
            value,
          };
        } else {
          return {
            type: 'string',
            value: 'Error calculating',
          };
        }
      },
    },
  });

  const outputs = await run();

  return outputs;
}
