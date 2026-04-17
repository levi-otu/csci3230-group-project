'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('drawings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true, // I set this to true so unauthenticated users don't crash the database!
        references: {
          model: 'users', // Tells PostgreSQL this links to the users table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If a user is deleted, keep their drawings but nullify the ID
      },
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      imageData: {
        type: Sequelize.BLOB('long'),
        allowNull: false,
      },
      imageMimeType: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'image/png',
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('drawings')
  },
}