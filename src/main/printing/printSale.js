import escpos from 'escpos'
import escposNetwork from 'escpos-network'

import path from 'path'

escpos.Network = escposNetwork;

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function printSale(event, data) {
  console.log('printSale')
  const logoPath = path.resolve(__dirname, '../../static/img/chibi_logo-print.png');

  // ************************************
  // Print Data
  // ************************************
  console.log('data: ', data)

  const { sale, printerIP } = data

  const {
    cash,
    card,
    total_sales,
    net_sales,
    average_ticket,
    ticket_count,
    canceled_count,
    discount_amount,
    date,
    id
  } = sale

  const cashLabel = 'efectivo:'
  const cashAmount = `$${cash.toFixed(2)}`
  const cashPadding = 20 - cashAmount.length - cashLabel.length

  const cardLabel = 'tarjeta:'
  const cardAmount = `$${card.toFixed(2)}`
  const cardPadding = 20 - cardAmount.length - cardLabel.length

  const totalLabel = 'SUBTOTAL:'
  const totalSales = `$${total_sales.toFixed(2)}`
  const totalSalesPadding = 20 - totalSales.length - totalLabel.length

  const discountLabel = 'descuentos:'
  const discountAmount = `$${discount_amount.toFixed(2)}`
  const discountPadding = 32 - discountAmount.length - discountLabel.length

  const ticketCountLabel = 'transacciones:'
  const ticketCount = ticket_count.toString()
  const ticketCountPadding = 32 - ticketCountLabel.length - ticketCount.length

  const cancelCountLabel = 'cancelaciones:'
  const cancelCount = canceled_count.toString()
  const cancelCountPadding = 32 - cancelCountLabel.length - cancelCount.length

  const netLabel = 'TOTAL:'
  const netSales = `$${net_sales.toFixed(2)}`
  const netSalesPadding = 20 - netSales.length - netLabel.length

  const avTicketLabel = 'ticket promedio:'
  const avTicket = `$${average_ticket.toFixed(2)}`
  const avTicketPadding = 32 - avTicketLabel.length - avTicket.length

  // ************************************
  // Printing orders
  // ************************************
  try {
    const device = new escpos.Network(printerIP);
    const printer = new escpos.Printer(device);

    const image = await new Promise((resolve, reject) => {
      escpos.Image.load(logoPath, (img) => {
        if (!img) {
          reject(new Error('Failed to load image'))
        } else {
          resolve(img)
        }
      })
    })

    await new Promise((resolve, reject) => {
      device.open((deviceError) => {
        if (deviceError) {
          console.error('Printer error: ', deviceError)
          reject(new Error(`Printer error: ${deviceError.message}`))
        }
        resolve()
      })
    })

    await printer
      .align('CT')
      .image(image, 'd24')

    printer
      .font('B')
      .size(1, 1)
      .text('-'.repeat(32))
      .size(2, 2)
      .text('CORTE DE CAJA')
      .size(1, 1)
      .text('-'.repeat(32))
      .feed(1)
      .size(2, 2)
      .text(`${date}`)
      .feed(1)
      .align('lt')
      .size(0, 0)
      .font('a')
      .text(`id: ${id}`)
      .size(1, 1)
      .font('b')
      .text('-'.repeat(32))
      .feed(1)
      .size(2, 2)
      .style('NORMAL')
      .text(`${cashLabel}${' '.repeat(cashPadding)}${cashAmount}`)
      .feed(2)
      .text(`${cardLabel}${' '.repeat(cardPadding)}${cardAmount}`)
      .feed(2)
      .style('b')
      .text(`${netLabel}${' '.repeat(netSalesPadding)}${netSales}`)
      .feed(1)
      .size(1, 1)
      .text('-'.repeat(32))
      .text(`${ticketCountLabel}${' '.repeat(ticketCountPadding)}${ticketCount}`)
      .feed(1)
      .text(`${cancelCountLabel}${' '.repeat(cancelCountPadding)}${cancelCount}`)
      .feed(1)
      .text(`${avTicketLabel}${' '.repeat(avTicketPadding)}${avTicket}`)
      .text('-'.repeat(32))
      .size(0, 0)
      .feed(1)
      .font('A')
      .align('CT')
      .text(`cr: ${new Date().toLocaleString('es-ES')}`)
      .feed(4)

    // end
    await new Promise((resolve) => {
      printer
        .cut()
        .close(() => {
          resolve()
        })
    })

    return { success: true, message: 'sale print completed' }
  } catch (error) {
    console.error('Print failed: ', error)
    return { success: false, message: error.message }
  }
}
