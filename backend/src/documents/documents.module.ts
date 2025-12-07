import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from '../entities/medical-document.entity';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { DocumentService } from './services/document.service';
import { DocumentController } from './controllers/document.controller';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalDocument, User, Provider])],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    StorageService,
    NotificationService,
    EmailService,
  ],
  exports: [DocumentService],
})
export class DocumentsModule {}
