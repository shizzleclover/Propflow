import { z } from 'zod';

export function validate({ body, params, query }) {
  const bodySchema = body ?? z.any();
  const paramsSchema = params ?? z.any();
  const querySchema = query ?? z.any();

  return (req, _res, next) => {
    const parsedBody = bodySchema.parse(req.body);
    const parsedParams = paramsSchema.parse(req.params);
    const parsedQuery = querySchema.parse(req.query);

    req.body = parsedBody;
    req.params = parsedParams;
    req.query = parsedQuery;

    next();
  };
}

