import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class UsersController {
  /**
   * role
   */
  public async role({ request, auth }: HttpContextContract) {
    const requestSchema = schema.create({
      role: schema.string({ trim: true }, [rules.required()]),
    })

    const validation = await request.validate({
      schema: requestSchema,
    })

    const user = auth.user

    user?.merge(validation)

    await user?.save()

    return { status: true, message: 'Role acquired successfully' }
  }
}
