import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Includeable, Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import ContactWallet from "../../models/ContactWallet";


interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
  tags?: number[] | string[];
  wallets?: number[] | string[];
  ddds?: number[] | string[];
  userId: number;
  profile: string;
  searchParam?: string;
}

interface Response {
  contacts: Contact[];
}

const ListContactsService = async ({
  startDate,
  endDate,
  tenantId,
  tags,
  wallets,
  ddds,
  userId,
  profile,
  searchParam
}: Request): Promise<Response> => {
  let includeCondition: Includeable[] = [];
  let where: any = {
    tenantId,
    isGroup: false
  };

  if (searchParam) {
    where = {
      ...where,
      [Op.or]: [
        {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        },
        { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
      ]
    };
  }

  if (startDate && endDate) {
    where = {
      ...where,
      createdAt: {
        [Op.between]: [
          +startOfDay(parseISO(startDate)),
          +endOfDay(parseISO(endDate))
        ]
      }
    };
  }

  if (tags) {
    includeCondition = [
      {
        model: Tag,
        as: "tags",
        where: {
          id: {
            [Op.in]: tags
          }
        },
        required: true
      }
    ];
  }

  if (wallets) {
    includeCondition.push({
      model: ContactWallet,
      // as: "wallets",
      where: {
        walletId: wallets
      },
      required: true
    });
  } else if (profile !== "admin") {
    includeCondition.push({
      model: ContactWallet,
      // as: "wallet",
      where: {
        walletId: userId
      },
      required: true
    });
  }

  if (ddds) {
    let dddsFilter: string[] = [];
    // eslint-disable-next-line consistent-return
    ddds.forEach((el: any) => {
      if (el) {
        const d = dddsPorEstado.find((ddd: any) => ddd.estado === el)?.ddds;
        if (d) {
          dddsFilter = dddsFilter.concat(d);
        }
      }
    });
    where = {
      ...where,
      number: {
        [Op.or]: dddsFilter.map(ddd => ({ [Op.like]: `55${ddd}%` }))
      }
    };
  }

  const contacts = await Contact.findAll({
    where,
    attributes: ["id", "name", "number", "email"],
    include: includeCondition,
    order: [["name", "ASC"]]
  });

  return { contacts };
};

export default ListContactsService;
