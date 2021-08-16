import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Story from 'App/Models/Story'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class StoriesController {
  public async index({ params: { page = 1, limit = 10 } }: HttpContextContract) {
    return Story.query().paginate(page, limit)
  }

  public async store({ request, auth }: HttpContextContract) {
    const requestSchema = schema.create({
      text: schema.string({ trim: true }, [rules.required(), rules.minLength(3)]),
      font: schema.string({ trim: true }),
      color: schema.string({ trim: true }),
    })

    const user = auth.user

    const payload = await request.validate({
      schema: requestSchema,
    })

    const story = await user?.related('stories').create(payload)

    return story
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Story.query().where('id', id).firstOrFail()
  }

  public async update({ params: { id }, request }: HttpContextContract) {
    const story = await Story.query().where('id', id).firstOrFail()

    story.merge(request.only(['text', 'font', 'color']))

    await story.save()

    return story
  }

  public async destroy({ params: { id } }: HttpContextContract) {
    const story = await Story.query().where('id', id).firstOrFail()

    await story.delete()
    return { status: true, message: 'Story deleted successfully' }
  }
}
