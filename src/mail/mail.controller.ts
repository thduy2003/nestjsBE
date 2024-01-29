import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
@ApiTags("mail")
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  testCron() {
    console.log(">>> call me after 10 seconds")
  }
  @Get()
  @Public()
  @ResponseMessage("Test email")
  async handleTestMail() {
      const subscribers = await this.subscriberModel.find({});
        for (const subs of subscribers) {
            const subsSkills = subs.skills;
            const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
            if (jobWithMatchingSkills?.length) {
                const jobs = jobWithMatchingSkills.map((job) => {
                    return {
                        name: job.name,
                        company: job.company.name,
                        salary: `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
                        skills: job.skills,
                    };
                });
                await this.mailerService.sendMail({
                    to: 'tranhoangduy.work@gmail.com',
                    from: '"Support Team" <support@example.com>', // override default from
                    subject: 'Welcome to Nice App! Confirm your Email',
                    // html: '<b>welcome bla bla</b>', // HTML body content
                    template: 'new-job',
                    context: {
                        receiver: subs.name,
                        jobs: jobs,
                    },
                });

            }
        }
        return {
            result: 'Email sent successfully',
        };
  }
}
