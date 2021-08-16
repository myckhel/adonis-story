import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  /**
   * signup
   */
  public async register({ request, auth }) {
    const requestSchema = schema.create({
      name: schema.string({ trim: true }, [rules.required(), rules.minLength(3)]),
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.required(), rules.confirmed('password')]),
      dob: schema.date({}, [rules.required()]),
      sex: schema.string({}, [rules.required()]),
    })

    const payload = await request.validate({
      schema: requestSchema,
    })

    const user = await User.create(payload)

    const { token } = await auth.attempt(payload.email, payload.password)
    return { token, user }
  }

  /**
   * login
   */
  public async login({ auth, request }) {
    const requestSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.exists({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.required()]),
    })

    const { email, password } = await request.validate({
      schema: requestSchema,
    })

    const { token } = await auth.attempt(email, password)
    return { token, user: auth.user }
  }

  /**
   * logout
   */
  public async logout({ auth }) {
    await auth.use('api').revoke()
    return { status: true }
  }
}
