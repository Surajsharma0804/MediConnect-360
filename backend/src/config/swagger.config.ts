import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('MediConnect 360 API')
    .setDescription(
      'Comprehensive Healthcare Platform API - World-class medical services including appointments, telehealth, prescriptions, lab results, and more.',
    )
    .setVersion('1.0.0')
    .setContact(
      'MediConnect 360',
      'https://mediconnect360.com',
      'support@mediconnect360.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Appointments', 'Appointment scheduling and management')
    .addTag('AI', 'AI-powered symptom checker and health assistant')
    .addTag('EHR', 'Electronic Health Records')
    .addTag('Prescriptions', 'Prescription management')
    .addTag('Lab & Diagnostics', 'Lab tests and imaging studies')
    .addTag('Insurance', 'Insurance and billing')
    .addTag('Pharmacy', 'Pharmacy and medication')
    .addTag('Providers', 'Healthcare provider directory')
    .addTag('Messaging', 'Secure messaging')
    .addTag('Emergency', 'Emergency services and SOS')
    .addTag('Family', 'Family member management')
    .addTag('Health Tracking', 'Health metrics and wellness')
    .addTag('Documents', 'Medical document management')
    .addTag('Care Coordination', 'Care plans and care teams')
    .addTag('Reminders', 'Medication and appointment reminders')
    .addTag('Integrations', 'Wearable device integrations')
    .addTag('Payment', 'Payment processing')
    .addServer('http://localhost:5000', 'Development')
    .addServer('https://api.mediconnect360.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'MediConnect 360 API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}
