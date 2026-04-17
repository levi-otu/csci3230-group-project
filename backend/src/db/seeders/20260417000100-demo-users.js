'use strict'

const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = 'Password123'

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date()

    const users = [
      {
        username: 'admin1',
        email: 'admin1@example.com',
        password_hash: await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS),
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        username: 'tutor1',
        email: 'tutor1@example.com',
        password_hash: await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS),
        role: 'instructor',
        created_at: now,
        updated_at: now,
      },
      {
        username: 'student1',
        email: 'student1@example.com',
        password_hash: await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS),
        role: 'student',
        created_at: now,
        updated_at: now,
      },
    ]

    await queryInterface.bulkInsert('users', users)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['admin1', 'tutor1', 'student1'],
    })
  },
}