'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE drawings ALTER COLUMN "sessionId" TYPE VARCHAR(255) USING "sessionId"::text',
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE drawings ALTER COLUMN "sessionId" TYPE INTEGER USING "sessionId"::integer',
    )
  },
}
