import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
      INSERT INTO public."Tenants"(status, "ownerId", "createdAt", "updatedAt", name, "businessHours", "messageBusinessHours", "maxUsers", "maxConnections") VALUES
      ('active', NULL, '2021-03-10 17:28:29.000', '2021-03-10 17:28:29.000', 'Empresa 01', '[{"day": 0, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Domingo"}, {"day": 1, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Lunes"}, {"day": 2, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Martes"}, {"day": 3, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Miércoles"}, {"day": 4, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Jueves"}, {"day": 5, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Viernes"}, {"day": 6, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sábado"}]', '¡Hola! ¡Fantástico recibir tu contacto! En este momento estamos ausentes y no podremos atenderte, pero priorizaremos tu atención y te responderemos pronto. Agradecemos mucho el contacto.', '99', '99')
      `
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Tenants", {});
  }
};
