import { Op } from "sequelize";
import { subHours } from "date-fns";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import CreateTicketService from "./CreateTicketService";

interface Request {
  contact: Contact;
  whatsappId: number;
  unreadMessages: number;
  tenantId: number | string;
  groupContact?: Contact;
  channel?: string;
  isGroup?: boolean;
  msg?: any; // Agregar propiedad msg para compatibilidad con otros servicios
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  unreadMessages,
  tenantId,
  groupContact,
  channel = "whatsapp",
  isGroup = false
}: Request): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      tenantId,
      whatsappId
    }
  });

  if (ticket) {
    await ticket.update({ unreadMessages });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        tenantId,
        whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id,
        tenantId,
        whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await CreateTicketService({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup,
      unreadMessages,
      whatsappId,
      tenantId,
      channel
    });
  }

  return ticket;
};

export default FindOrCreateTicketService;
