exports.up = knex => {
  return knex.schema
    .alterTable('users', table => {
      table.text('profile_image').defaultTo('https://cdn3.iconfinder.com/data/icons/faticons/32/user-01-512.png').alter()
  })
}

exports.down = knex => {
  return knex.schema.alterTable('users', table => {
      table.text('profile_image').defaultTo('https://cdn3.iconfinder.com/data/icons/faticons/32/user-01-512.png').alter()
  })
}
