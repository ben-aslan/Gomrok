import { BadGatewayException, ForbiddenException, Injectable } from '@nestjs/common';
import User, { UserDocument } from '../models/concrete/user';
import { Model, Types } from 'mongoose';
import { HashHelper } from '@app/contracts/utils/hashing/hashHelper';
import TelegramLoginDto from '@app/contracts/models/dtos/telegramLogin.dto';
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
import { JwtService } from '@nestjs/jwt';
import AccessTokenDto from '@app/contracts/models/dtos/accessToken.dto';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwt: JwtService) {
    dotenv.config();

  }

  async login(loginDto: TelegramLoginDto): Promise<any> {
    // if (HashHelper.comparePassword('password1234', (await this.userDal.findOne({ name: 'taha2' }))!.passwordHash, () => { }))
    //   return await this.userDal.find({}).then((r) => { r.reverse(); return r[0] });
    // throw new BadGatewayException();
    const parsed = new URLSearchParams(loginDto.raw)
    const hash = parsed.get("hash")
    if (!hash) throw new ForbiddenException()
    parsed.delete("hash")

    const calculatedHash = crypto
      .createHmac("sha256", crypto
        .createHmac("sha256", "WebAppData")
        .update(process.env.BOT_TOKEN ?? '')
        .digest())
      .update(Array.from(parsed.entries())
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join("\n"))
      .digest("hex")

    if (calculatedHash !== hash)
      throw new ForbiddenException()

    const rawUser = JSON.parse(parsed.get("user") ?? '')

    let user = await this.userModel.findOne({ chatId: rawUser.id })

    const expiration = new Date(new Date().getTime() + 1 * 60 * 60 * 1000)

    if (user) {
      const token = await this.jwt.signAsync({ chatId: user.chatId, claims: user.claims, sub: String(user._id) })

      const accessToken: AccessTokenDto = {
        type: 'Bearer',
        token: token,
        expiration: expiration
      }

      return accessToken
    }

    const userToAdd = await this.userModel.create({
      chatId: rawUser.id,
      firstName: rawUser.first_name,
      lastName: rawUser.last_name,
      username: rawUser.username,
      languageCode: rawUser.language_code,
      allowsWriteToPm: rawUser.allows_write_to_pm,
      photoUrl: rawUser.photo_url,
      passwordHash: rawUser.chatId + parsed.get('auth_date')
    })

    await userToAdd.save()

    const token = await this.jwt.signAsync({ chatId: rawUser.id, claims: userToAdd.claims, sub: String(userToAdd._id) })

    const accessToken: AccessTokenDto = {
      type: 'Bearer',
      token: token,
      expiration: expiration
    }

    return accessToken
  }
}
