import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'

import { auth } from '#/lib/auth'
import { searchFlights } from '#/lib/serpapi'

const searchSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tripType: z.enum(['1', '2']).default('2'),
  passengers: z.string().default('1'),
  travelClass: z.enum(['1', '2', '3', '4']).default('1'),
})

export const searchFlightsFn = createServerFn({ method: 'GET' })
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })

    if (!session) {
      throw new Error('Unauthorized')
    }

    return searchFlights({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      returnDate: data.returnDate,
      tripType: data.tripType,
      passengers: data.passengers,
      travelClass: data.travelClass,
    })
  })
