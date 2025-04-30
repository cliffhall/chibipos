import { json } from '@sveltejs/kit'
import { Product } from '$lib/db/models/product.js'
import { Ticket } from '$lib/db/models/ticket.js'
import { TicketDetails } from '$lib/db/models/ticketDetails.js'


export async function GET({ request, params }) {
  try {
    console.log('params: ', params)
    const ticket = await Ticket.findByPk(params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model: TicketDetails,
        attributes: ['quantity', 'price'],
        include: [{
          model: Product,
          attributes: ['name']
        }]
      }]
    })
    return json(ticket)
  } catch (error) {
    console.error('no ticket by id', error)
    return ({ status: 500 })
  }
}

export async function PATCH({ request, params }) {
  console.log('cancel ticket')
  try {
    const ticket = await Ticket.findByPk(params.id)
    if (!ticket) {
      return json({ error: 'no ticket' }, { status: 400 })
    }
    ticket.canceled = true
    await ticket.save()
    return json(true)
  } catch (error) {
    console.error('error canceling ticket: ', error)
    return ({ status: 500 })
  }
}