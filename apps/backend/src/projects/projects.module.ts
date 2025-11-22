import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { AuthModule } from "../auth/auth.module";
import { queryProviders, authorizationProviders } from "../user/providers";

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...queryProviders, ...authorizationProviders],
  exports: [ProjectsService],
})
export class ProjectsModule {}
