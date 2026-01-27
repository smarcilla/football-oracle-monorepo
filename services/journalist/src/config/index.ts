export const config = {
  kafka: {
    brokers: (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(','),
    clientId: 'journalist-service',
    groupId: 'journalist-group',
  },
};
