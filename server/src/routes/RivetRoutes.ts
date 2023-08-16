import { runMessageGraph } from '@src/services/RivetRunner';
import { RequestHandler } from 'express';

export const rivetExample: RequestHandler = async (req, res) => {
  const input = req.body.input as string;
  const response = await runMessageGraph([{ type: 'user', message: input }])

  res.json({ output: response });
};
