import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Story from 'App/Models/Story'

export default class StoryPolicy extends BasePolicy {
  public async update(user: User, story: Story) {
    return user.id === story.userId
  }
  public async delete(user: User, story: Story) {
    return user.id === story.userId
  }
}
