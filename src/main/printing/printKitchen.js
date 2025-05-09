import escpos from 'escpos'
import escposNetwork from 'escpos-network'
escpos.Network = escposNetwork;


export default async function printKitchen(event, data) {
  // ************************************
  // Print Data
  // ************************************
  const { ticket, details, printerIP } = data;
  const time = new Date(ticket.date).toLocaleTimeString()


  // ************************************
  // Printing orders
  // ************************************

  try {
    const device = new escpos.Network(printerIP);
    const printer = new escpos.Printer(device);

    // Wait for the device to open
    await new Promise((resolve, reject) => {
      device.open((deviceError) => {
        if (deviceError) {
          console.error('Printer error:', deviceError);
          reject(new Error(`Printer error: ${deviceError.message}`));
          return;
        }
        resolve();
      });
    });

    // Print data
    printer
      .font('B')
      .text('-'.repeat(32))
      // COMANDA
      .font('A')
      .size(1, 1)
      .align('CT')
      .text('COMANDA')
      //line
      .font('B')
      .text('-'.repeat(32))
      // ORDER
      .align('RT')
      .size(2, 2)
      .text(time)
      //line
      .font('B')
      .size(1, 1)
      .text('-'.repeat(32))

    details.forEach((item) => {
      if (item.quantity < 10) {
        item.quantity = '0' + item.quantity
      }
      printer
        .font('A')
        .align('LT')
        .style('NORMAL')
        .size(1, 1)
        .lineSpace(45)
        .text(`${item.quantity} | ${item.product.name}`)
        .feed(1);
    });

    printer
      .font('B')
      .size(1, 1)
      .text('-'.repeat(32))
      .feed(4)

    // Close
    await new Promise((resolve) => {
      printer.cut().close(() => {
        console.log('Kitchen print completed.');
        resolve();
      });
    });

    return { success: true, message: 'kitchen print completed' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}