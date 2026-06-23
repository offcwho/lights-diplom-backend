import { IsString, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString() @MaxLength(1000)
  body: string;
}
