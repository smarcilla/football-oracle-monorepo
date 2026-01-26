export const config = {
  port: process.env.PORT || 4000,
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: 'api-service',
    groupId: 'api-group',
  },
};
