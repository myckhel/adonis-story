import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import PasswordReset from 'App/Models/PasswordReset'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'

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

  /**
   * recover password
   */
  public async recover({ request }) {
    const requestSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.exists({ table: 'users', column: 'email' }),
      ]),
    })

    const { email } = await request.validate({
      schema: requestSchema,
    })

    await PasswordReset.query().where('email', email).delete()
    const { token, expires_at } = await PasswordReset.create({
      email,
      token: new Date().getTime() + '',
      expires_at: DateTime.now().plus({ hours: 1 }),
    })

    await Mail.use('mailgun').send((message) => {
      message.to(email).subject('Reset Story Password!').htmlView('emails/password_reset', {
        token,
        expires_at,
      })
    })

    return { email, reset_token: token, expires_at }
  }

  /**
   * reset password
   */
  public async reset({ request }) {
    const requestSchema = schema.create({
      password: schema.string({ trim: true }, [rules.required(), rules.confirmed('password')]),
      token: schema.string({}, [rules.required()]),
    })

    const { password, token } = await request.validate({
      schema: requestSchema,
    })

    const { email } = await PasswordReset.query().where('token', token).firstOrFail()

    const user = await User.query().where('email', email).first()
    user?.merge({ password })

    await user?.save()

    return { message: 'Password updated successfully' }
  }
}
