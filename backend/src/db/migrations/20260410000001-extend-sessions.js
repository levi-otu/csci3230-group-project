'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns
    await queryInterface.addColumn('sessions', 'topic', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'General',
    })

    await queryInterface.addColumn('sessions', 'scheduled_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    })

    await queryInterface.addColumn('sessions', 'duration_minutes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 60,
    })

    await queryInterface.addColumn('sessions', 'max_participants', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    // Add 'scheduled' to the status enum.
    // Postgres-specific: alter the existing enum type rather than recreating.
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_sessions_status\" ADD VALUE IF NOT EXISTS 'scheduled' BEFORE 'active'"
    )
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sessions', 'topic')
    await queryInterface.removeColumn('sessions', 'scheduled_at')
    await queryInterface.removeColumn('sessions', 'duration_minutes')
    await queryInterface.removeColumn('sessions', 'max_participants')
    // Note: removing an enum value in Postgres is non-trivial; left intentionally.
  },
}
