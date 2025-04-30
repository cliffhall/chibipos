import { j as json } from './index-BIAFQWR9.js';
import { P as Product } from './product-DVzY65Xo.js';
import { a as Ticket, T as TicketDetails } from './ticketDetails-BoI0an_9.js';
import './catProduct-D_19IU5e.js';
import 'sequelize';
import 'path';

async function GET({ request, params }) {
  try {
    console.log("params: ", params);
    const ticket = await Ticket.findByPk(params.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [{
        model: TicketDetails,
        attributes: ["quantity", "price"],
        include: [{
          model: Product,
          attributes: ["name"]
        }]
      }]
    });
    return json(ticket);
  } catch (error) {
    console.error("no ticket by id", error);
    return { status: 500 };
  }
}
async function PATCH({ request, params }) {
  console.log("cancel ticket");
  try {
    const ticket = await Ticket.findByPk(params.id);
    if (!ticket) {
      return json({ error: "no ticket" }, { status: 400 });
    }
    ticket.canceled = true;
    await ticket.save();
    return json(true);
  } catch (error) {
    console.error("error canceling ticket: ", error);
    return { status: 500 };
  }
}

export { GET, PATCH };
//# sourceMappingURL=_server-Itjx4VyL.js.map
