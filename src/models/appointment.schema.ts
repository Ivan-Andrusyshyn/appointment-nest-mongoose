import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema()
export class Appointment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
