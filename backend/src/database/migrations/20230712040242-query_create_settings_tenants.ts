import { QueryInterface, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Obtiene la lista de tenants existentes en la base de datos
    const tenants = await queryInterface.sequelize.query(
      'SELECT id FROM "Tenants"',
      { type: QueryTypes.SELECT }
    );

    const settingId:any = await queryInterface.sequelize.query(
      'select max(id) mId from "Settings"',
      { type: QueryTypes.SELECT }
    );

    // Recorre los tenants e inserta las nuevas configuraciones para cada uno
    await Promise.all(
      tenants.map(async (tenant: any, idx) => {
        const { id } = tenant;
        const newSettings = [
          {
            key: "newTicketTransference",
            value: "disabled",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            key: "rejectCalls",
            value: "disabled",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            key: "callRejectMessage",
            value:
              "Las llamadas de voz y vídeo están deshabilitadas para este WhatsApp, favor enviar un mensaje de texto.",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        const bulk = newSettings.map((s, i) => {
          return {
            ...s,
            id: settingId[0].mid + idx + 1 + i,
          }
        })

        // Inserta las nuevas configuraciones para el tenant
        await queryInterface.bulkInsert("Settings", bulk);
      })
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Elimina las configuraciones insertadas para cada tenant
    await queryInterface.sequelize.query('SELECT id FROM "Tenants"', {
      type: QueryTypes.SELECT
    });
  }
};
