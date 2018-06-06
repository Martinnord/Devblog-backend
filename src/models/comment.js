import { Model } from 'objection'

export default class Comment extends Model {
  static get tableName() {
    return 'post_comments'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['comment'],

      properties: {
        user_id: { type: 'integer' },
        comment: { type: 'string', minLength: 1 },
        post_id: { type: 'integer' }
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
