import { runMessageGraph } from '@src/services/RivetRunner';
import { RequestHandler } from 'express';

export const rivetExample: RequestHandler = async (req, res) => {
  const input = req.body.input as { type: 'user' | 'assistant'; message: string }[];
  const response = await runMessageGraph(input);

  res.json({ output: response });
};
