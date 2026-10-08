import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return res.status(400).json({
        error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input.',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    (req as any)[source === 'body' ? 'body' : `validated_${source}`] = parsed.data;
    next();
  };
}
