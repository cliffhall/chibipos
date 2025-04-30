// *********************
// API / UPDATE REPORTS
// *********************
import { Op } from 'sequelize';
import { json } from '@sveltejs/kit'

import db from '$lib/db/config'
import { Product } from '$lib/db/models/product.js'
import { Ticket } from '$lib/db/models/ticket'
import { TicketDetails } from '$lib/db/models/ticketDetails.js'
import { DailySales } from '$lib/db/models/daily_sales.js'
import { DailySalesDetails } from '$lib/db/models/daily_salesDetails.js'
import { Sequelize } from 'sequelize'


export async function GET({ url }) {
  const transaction = await db.transaction()

  try {
    const date = url.searchParams.get('date')
    const start = new Date(date)
    start.setUTCHours(6, 0, 0, 0);
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 1)
    end.setUTCHours(5, 59, 59, 999);
    let startISO = start.toISOString()
    let endISO = end.toISOString()

    // TICKET DATA
    const canceledTickets = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('ticket.id')), 'canceled_count'],
      ],
      where: {
        date: { [Op.between]: [startISO, endISO] },
        canceled: true,
      },
      raw: true,
      transaction
    })

    const validTickets = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('ticket.id')), 'ticket_count'],
        [Sequelize.fn('SUM', Sequelize.col('ticket.cash')), 'sum_cash'],
        [Sequelize.fn('SUM', Sequelize.col('ticket.card')), 'sum_card'],
      ],
      where: {
        date: { [Op.between]: [startISO, endISO] },
        canceled: false,
      },
      raw: true,
      transaction
    })
    // TICKET DETAILS DATA
    const lineItems = await TicketDetails.findAll({
      attributes: [
        'product_id',
        [Sequelize.fn('SUM', Sequelize.col('ticket_details.quantity')), 'sum_quantity'],
        [Sequelize.fn('SUM', Sequelize.col('ticket_details.extended_price')), 'sum_extended_price'],
        [Sequelize.fn('SUM', Sequelize.col('ticket_details.discount_amount')), 'sum_discount_amount'],
        [Sequelize.fn('SUM', Sequelize.literal('ticket_details.price * ticket_details.quantity')), 'sum_total_sale'],

      ],
      include: [
        {
          model: Ticket,
          attributes: [],
          where: {
            date: { [Op.between]: [startISO, endISO] },
            canceled: false,
          }
        },
        {
          model: Product,
          attributes: ['id', 'name']
        }
      ],
      group: ['product_id', 'Product.id'],
      raw: true,
      transaction
    })

    // summarize data from details
    const netSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_extended_price), 0)
    const totalSales = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_total_sale), 0)
    const discountAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.sum_discount_amount), 0)
    // summarize data from tickets
    const totalCash = validTickets.reduce((sum, ticket) => sum + parseFloat(ticket.sum_cash), 0)
    const totalCard = validTickets.reduce((sum, ticket) => sum + parseFloat(ticket.sum_card), 0)
    const ticketCount = validTickets[0].ticket_count
    const canceledCount = canceledTickets[0]?.canceled_count || 0

    // CREATE RECORDS
    const dailySale = await DailySales.create({
      date,
      net_sales: netSales,
      total_sales: totalSales,
      cash: totalCash,
      card: totalCard,
      ticket_count: ticketCount,
      canceled_count: canceledCount,
      average_ticket: Math.round(netSales / ticketCount),
      discount_amount: discountAmount,
    }, { transaction })

    // Prepare date for bulk create
    const saleDetails = lineItems.map(item => ({
      date,
      daily_sales_id: dailySale.id,
      product_id: item.product_id,
      quantity: item.sum_quantity,
      net_sales: item.sum_extended_price,
      av_price: Math.round(item.sum_extended_price / item.sum_quantity),
      discount_amount: item.sum_discount_amount
    }))

    await DailySalesDetails.bulkCreate(saleDetails, { transaction })

    await transaction.commit()
    return json({ dailySale })

  } catch (error) {
    console.error('error on sales report: ', error)
    await transaction.rollback()
    return json({ status: 500 })
  }
}


