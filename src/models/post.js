import { Model } from 'objection'

export default class Post extends Model {
  static get tableName() {
    return 'posts'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content', 'title'],

      properties: {
        id: { type: 'integer' },
        content: { type: 'string', minLength: 1 },
        title: { type: 'string', minLength: 1 },
      }
    }
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString()
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }

  $beforeDelete() {
    this.deleted_at = new Date().toISOString()
  }
}
