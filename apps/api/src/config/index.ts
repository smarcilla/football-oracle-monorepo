export const config = {
  port: process.env.PORT || 4000,
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },
}
