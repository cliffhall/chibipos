import { j as json } from './index-BIAFQWR9.js';
import { Op } from 'sequelize';
import { s as sequelize } from './catProduct-D_19IU5e.js';
import { P as Product } from './product-DVzY65Xo.js';
import { T as TicketDetails, a as Ticket } from './ticketDetails-BoI0an_9.js';
import 'path';

async function GET({ url }) {
  const date = url.searchParams.get("date");
  try {
    let tickets;
    if (date) {
      const start = new Date(date);
      start.setUTCHours(6, 0, 0, 0);
      const end = new Date(date);
      end.setUTCDate(end.getUTCDate() + 1);
      end.setUTCHours(5, 59, 59, 999);
      let startISO = start.toISOString();
      let endISO = end.toISOString();
      tickets = await Ticket.findAll({
        where: {
          date: {
            [Op.between]: [startISO, endISO]
          }
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        order: [["date", "DESC"]]
      });
    } else {
      tickets = await Ticket.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] }
      });
    }
    return json(tickets);
  } catch (error) {
    console.error("get tickets error", error);
    return { status: 500 };
  }
}
async function POST({ request }) {
  const saleData = await request.json();
  const { cash, card, discountRate, frontendTotal, products, cashReceived, change } = saleData;
  const date = (/* @__PURE__ */ new Date()).toISOString();
  if (!date || !products || !Array.isArray(products)) {
    return { error: "Invalid data" };
  }
  if (discountRate > 1 || discountRate < 0) {
    return { error: "Invalid data" };
  }
  if (cash + card < frontendTotal) {
    return { error: "Invalid data" };
  }
  try {
    let ticket;
    let ticketDetails;
    let subtotal = 0;
    let discountAmount = 0;
    let totalAmount = 0;
    await sequelize.transaction(async (transaction) => {
      const productPrices = await Promise.all(
        products.map(async (product) => {
          const { product_id, quantity } = product;
          if (quantity < 0) {
            throw new Error(`invalid product quantity`);
          }
          const existingProduct = await Product.findByPk(product_id, { transaction });
          if (!existingProduct) {
            throw new Error(`product does not exist`);
          }
          subtotal += existingProduct.price * quantity;
          return existingProduct.price;
        })
      );
      if (discountRate && discountRate > 0) {
        discountAmount = subtotal * discountRate;
      }
      totalAmount = subtotal - discountAmount;
      const frontBackTotalDifference = frontendTotal - totalAmount;
      console.log(`Total difference: ${frontBackTotalDifference}`);
      if (Math.abs(frontBackTotalDifference) > 0.1) {
        return json({ error: "Frontend and backend totals do not match" }, { status: 400 });
      }
      ticket = await Ticket.create({
        date,
        cash,
        card,
        cash_received: cashReceived,
        change,
        subtotal,
        total_amount: totalAmount,
        discount_rate: discountRate,
        discount_amount: discountAmount,
        canceled: false
      }, { transaction });
      await Promise.all(
        products.map(async (product, index) => {
          const { product_id, quantity } = product;
          const unitPrice = productPrices[index];
          const discountAmount2 = unitPrice * quantity * discountRate;
          const extendedPrice = unitPrice * quantity - discountAmount2;
          await TicketDetails.create({
            ticket_id: ticket.id,
            product_id,
            quantity,
            price: unitPrice,
            extended_price: extendedPrice,
            discount_amount: discountAmount2
          }, { transaction });
        })
      );
      ticketDetails = await TicketDetails.findAll({
        where: { ticket_id: ticket.id },
        include: {
          model: Product,
          attributes: ["name"]
          // Include only product name
        },
        transaction
      });
    });
    return json({ ticket, ticketDetails, status: 200 });
  } catch (error) {
    console.error("post ticket error", error);
    return { status: 500 };
  }
}
async function DELETE() {
  console.log("delete tickets");
  try {
    await TicketDetails.destroy({
      truncate: true
    });
    await Ticket.destroy({
      truncate: true,
      cascade: true
    });
  } catch (error) {
    console.error("error deleting: ", error);
    return json({ status: 500 });
  }
}
async function PATCH({ request }) {
  try {
    const tickets = await Ticket.findAll();
    tickets.forEach((ticket) => {
      console.log("ticket.date: ", ticket.date);
    });
    for (const ticket of tickets) {
      if (ticket.date) {
        const date = new Date(ticket.date);
        date.setDate(date.getDate() - 1);
        await ticket.update({ date: date.toISOString() });
      }
    }
    return json({ status: 200, message: "ticket dates updated succesfully" });
  } catch (error) {
    console.error("error patching tickets", error);
    return json({ status: 500 });
  }
}

export { DELETE, GET, PATCH, POST };
//# sourceMappingURL=_server-2kavG7km.js.map
