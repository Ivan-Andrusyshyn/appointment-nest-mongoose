import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
} from 'src/models/appointment.schema';
import { AppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private meetingModel: Model<AppointmentDocument>,
  ) {}

  async createMeeting(appointmentDto: AppointmentDto) {
    const newMeeting = new this.meetingModel(appointmentDto);
    return newMeeting.save();
  }

  async getMeetings(username: string): Promise<Appointment[]> {
    return this.meetingModel.find({ username });
  }
}
