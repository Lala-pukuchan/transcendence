import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Post, UploadedFile, UseInterceptors, Param, HttpStatus, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { UsersService } from '../user/users.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';


@Controller()
@ApiTags('avatar')
export class AvatarController {
  constructor(private usersService: UsersService) {}

  @Post('/users/:username/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const dir = `/uploads/${req.params.username}`;

        // ディレクトリが存在しない場合、作成します
        if (!existsSync(dir)){
            mkdirSync(dir, { recursive: true });
        }

        callback(null, dir);  // ファイルの保存先
      },
      filename: (req, file, callback) => {
        const fileExtension = file.mimetype.split('/')[1];
        callback(null, `${Date.now()}.${fileExtension}`);
      }
    })
  }))
  @ApiResponse({ status: HttpStatus.OK, description: 'The file has been successfully uploaded.'})
  async uploadFile(@UploadedFile() file, @Param('username') username: string) {
    console.log(file);
    const avatarPath = `${file.destination}/${file.filename}`; 
    await this.usersService.changeAvatar(username, avatarPath);
    return { status: HttpStatus.OK, message: 'The file has been successfully uploaded.'};
  }

  @Get('users/:username/avatar')
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the avatar image.'})
  async getAvatar(@Param('username') username: string, @Res() res: Response) {
    const user = await this.usersService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found.`);
    }
    res.sendFile(user.avatar);
  }
}
