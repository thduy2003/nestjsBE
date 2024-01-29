import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//thằng này là middleware để kiểm tra chúng ta sử dụng localStrategy sau đó nó sẽ nhảy vào local.strategy để gọi
//khi vào trong local.strategy nó sẽ chạy validate hàm validate này return cái gì thì req.user ở cái hàm mà sử dụng
//useGuards sẽ nhận được
//tương tự cho middleware của jwt-auth.guard xong rồi nó sẽ nhảy vào jwt.strategy để gọi validate rồi return cho req.user
export class LocalAuthGuard extends AuthGuard('local') {}
