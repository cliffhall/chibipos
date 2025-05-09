import escpos from 'escpos'
import escposNetwork from 'escpos-network'
import escposUSB from 'escpos-usb'
// import usb from 'usb'

import path from 'path'
escpos.USB = escposUSB
escpos.Network = escposNetwork;

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function printTicket(event, data) {
  const logoPath = path.resolve(__dirname, '../../static/img/chibi_logo-print.png');
  // ************************************
  // Print Data
  // ************************************
  const { ticket, details, printerIP } = data;

  const time = new Date(ticket.date).toLocaleTimeString()
  const date = new Date(ticket.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const timeRowPadding = 32 - time.length - date.length

  const minRows = 6
  const detailPaddingRows = details.length >= minRows ? 0 : (minRows - details.length) * 2

  const order = 320
  const totalText = 'TOTAL:'
  const totalAmount = `$${ticket.total_amount.toFixed(2)}`
  const totalRowPadding = 32 - totalAmount.length - totalText.length

  const discountRate = `-${Number(ticket.discount_rate * 100)}%`
  const discountAmount = `-$${ticket.discount_amount.toFixed(2)}`
  const subtotalAmount = `$${ticket.subtotal.toFixed(2)}`

  const cardAmount = `$${ticket.card.toFixed(2)}`
  const cardLabel = 'tarjeta:'
  const cardPadding = 48 - cardAmount.length - cardLabel.length

  const receivedCashAmount = `$${ticket.cash_received.toFixed(2)}`
  const cashLabel = 'efectivo:'
  const cashPadding = 48 - receivedCashAmount.length - cashLabel.length

  const changeAmount = `$${ticket.change.toFixed(2)}`
  const changeLabel = 'CAMBIO:'
  const changePadding = 32 - changeAmount.length - changeLabel.length

  console.log('Resolved Image Path:', logoPath);

  // ************************************
  // Printing orders
  // ************************************
  try {

    // const devices = usb.getDeviceList()
    // console.log('devices: ', devices)


    function getPrinter() {
      const devices = escpos.USB.findPrinter()

      if (devices && devices.length > 0) {
        const device = new escpos.USB()
        return new escpos.Printer(device)
      } else {
        const device = new escpos.Network(printerIP)
        return new escpos.Printer(device)
      }
    }

    // const device = new escpos.Network(printerIP);
    // const printer = new escpos.Printer(device);

    const printer = getPrinter()

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
      .feed(1)
      // Order
      .font('B')
      .size(1, 1)
      .align('LT')
      .style('B')
      .text(`Orden: ${order}`)
      // Line
      .text('-'.repeat(32))
      // Time
      .style('NORMAL')
      .text(`${date}${' '.repeat(timeRowPadding)}${time}`)
      // Line
      .text('-'.repeat(32))
      .feed(1)

    // Print ticket details
    details.forEach(detail => {
      printer
        .font('A')
        .style('NORMAL')
        .size(0, 0)
        .lineSpace(45)
        .tableCustom([
          { text: `${detail.quantity}  `, align: 'RIGHT', width: 0.1 },
          { text: detail.product.name, align: 'LEFT', width: 0.5 },
          { text: `$${detail.price}`, align: 'RIGHT', width: 0.2 },
          { text: `$${detail.price * detail.quantity}`, align: 'RIGHT', width: 0.2 }
        ])
        .feed(0)
    });
    for (let i = 0; i < detailPaddingRows; i++) {
      printer.feed(1)
    }
    // spacing
    printer.feed(1)
    printer
      .font('B')
      .size(1, 1)
      .text('-'.repeat(32))
    // disount
    if (ticket.discount_amount > 0) {
      printer
        .font('B')
        .style('NORMAL')
        .align('RT')
        .size(1, 1)
        .text(`${subtotalAmount}`)
        .feed(1)
        .text(`${discountRate}: ${discountAmount}`)
        .feed(1)
    }
    // total
    printer
      .font('B')
      .style('B')
      .size(1, 1)
      .text(`${totalText}${' '.repeat(totalRowPadding)}${totalAmount}`)
      .text('-'.repeat(32))

    // cash
    if (ticket.cash > 0) {
      printer
        .style('NORMAL')
        .font('A')
        .size(0, 0)
        .text(`${cardLabel}${' '.repeat(cardPadding)}${cardAmount}`)
        .feed(1)
        .text(`${cashLabel}${' '.repeat(cashPadding)}${receivedCashAmount}`)
        .feed(1)
        .style('B')
        .font('B')
        .size(1, 1)
        .text(`${changeLabel}${' '.repeat(changePadding)}${changeAmount}`)
        .feed(1)
    } else {
      printer
        .style('NORMAL')
        .font('A')
        .align('CT')
        .size(0, 0)
        .text('pago con tarjeta')
        .feed(1)
    }

    const catWithEars = `
  /\\_/\\  
  (=^o^=)  
  (  __  )  
  `;
    printer
      .feed(2)
      .align('CT')
      .style('b')
      .text(catWithEars)

    // Arigato
    printer
      .font('A')
      .size(0, 0)
      .align('CT')
      .style('NORMAL')
      .text('arigato')
      .feed(2)
      .text('')

    // end
    await new Promise((resolve) => {
      printer
        .cut()
        .close(() => {
          console.log('ticket print completed')
          resolve()
        })
    })

    return { success: true, message: 'ticket print completed' }

  } catch (error) {
    console.error('Print failed: ', error)
    // throw error
    return { success: false, message: 'Error imprimiendo' }
  }
}
