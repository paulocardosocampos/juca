import { cache } from "react";
import { prisma } from "./prisma";

// cache() deduplica a consulta dentro do mesmo request (layout + página).
export const getSettings = cache(() =>
  prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  }),
);
