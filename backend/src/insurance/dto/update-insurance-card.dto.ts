import { PartialType } from '@nestjs/mapped-types';
import { CreateInsuranceCardDto } from './create-insurance-card.dto';

export class UpdateInsuranceCardDto extends PartialType(CreateInsuranceCardDto) {}