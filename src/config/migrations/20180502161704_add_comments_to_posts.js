exports.up = function(knex) {
  return knex.schema.createTable('post_comments', function(table) {
    table.increments('id').primary()
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .notNullable()
    table.text('comment')
    table
      .integer('post_id')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE')
      .notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('post_comments')
}
