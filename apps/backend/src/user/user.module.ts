import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { userProviders } from "./providers";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    ...userProviders, // Include all user domain providers
  ],
  exports: [UserService],
})
export class UserModule {}
