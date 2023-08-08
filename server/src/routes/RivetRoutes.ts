import { loadProjectFromFile, runGraph } from '@ironclad/rivet-node';
import { Router } from 'express';

export function rivetExample() {
  const router = Router();

  router.post(
    '/rivet-example',
    async (req, res) => {
      const input = req.body.input as string;

      const project = await loadProjectFromFile('../rivet/chat.rivet-project');

      const outputs = await runGraph(project, {
        graph: 'Example Graph',
        openAiKey: 'TBD',
        inputs: {
          input: {
            type: 'string',
            value: input,
          },
        },
      });

      if (typeof outputs.output !== 'string') {
        throw new Error('Expected string output');
      }

      res.json({ output: outputs.output });
    });

  return router;
}