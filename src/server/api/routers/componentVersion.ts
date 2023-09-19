import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const componentVersionRouter = createTRPCRouter({
  createOne: publicProcedure
    .input(
      z.object({
        name: z.string(),
        emoji: z.string(),
        description: z.string().optional(),
        labels: z
          .array(
            z.object({
              index: z.number(),
              label: z.string(),
              color: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const newVersion = await ctx.prisma.componentVersion.create({
        data: {
          name: input.name,
          emoji: input.emoji,
          description: input.description,
        },
      })

      await ctx.prisma.componentVersion.updateMany({
        where: {
          selected: true,
        },
        data: {
          selected: false,
        },
      })

      // get partId
      const defaulPart = await ctx.prisma.part.findFirst({
        where: {
          name: 'universal',
        },
      })
      if (!defaulPart) {
        throw new Error('Part not found')
      }

      // create labels
      if (input.labels) {
        await Promise.all(
          input.labels.map(async (label) => {
            // get a component with similar name
            const similarPart = await ctx.prisma.part.findFirst({
              where: {
                name: label.label,
              },
            })

            await ctx.prisma.component.create({
              data: {
                index: label.index,
                name: label.label,
                color: label.color,
                partId: similarPart?.id ?? defaulPart.id,
                componentVersionId: newVersion.id,
              },
            })
          }),
        )
      }

      return ctx.prisma.componentVersion.updateMany({
        where: {
          id: newVersion.id,
        },
        data: {
          selected: true,
        },
      })
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.componentVersion.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })
  }),
  updateOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        emoji: z.string().optional(),
        description: z.string().optional(),
        selected: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // check if componentVersion exists
      const componentVersionToUpdate =
        await ctx.prisma.componentVersion.findUnique({
          where: {
            id: input.id,
          },
        })
      if (!componentVersionToUpdate) {
        throw new Error('Component Version not found')
      }

      // check if selected is true
      if (input.selected) {
        // if true, set all other componentVersion to false
        await ctx.prisma.componentVersion.updateMany({
          where: {
            selected: true,
          },
          data: {
            selected: false,
          },
        })
      }

      return ctx.prisma.componentVersion.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          emoji: input.emoji,
          description: input.description,
          selected: input.selected,
        },
      })
    }),

  deleteOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // check if componentVersion exists
      const componentVersionToDelete =
        await ctx.prisma.componentVersion.findUnique({
          where: {
            id: input.id,
          },
        })
      if (!componentVersionToDelete) {
        throw new Error('Component Version not found')
      }

      // check if selected is true
      if (componentVersionToDelete.selected) {
        throw new Error('Cannot delete selected component version')
      }

      // delete related components
      await ctx.prisma.component.deleteMany({
        where: {
          componentVersionId: input.id,
        },
      })

      return ctx.prisma.componentVersion.delete({
        where: {
          id: input.id,
        },
      })
    }),
})
