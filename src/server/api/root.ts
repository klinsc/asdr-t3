import { exampleRouter } from '~/server/api/routers/example'
import { createTRPCRouter } from '~/server/api/trpc'
import { mlServerRouter } from './routers/mlServerRouter'
import { healthRouter } from './routers/health'
import { drawingTypeRouter } from './routers/drawingType'
import { lineTypeRouter } from './routers/lineType'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  mlServer: mlServerRouter,
  health: healthRouter,
  drawingType: drawingTypeRouter,
  lineType: lineTypeRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
