import { faker } from '@faker-js/faker';
import { AMOUNT_OF_TEST_FARMS } from 'helpers/utils';

const mockDistanceValues: any[] = [];

for (let i = 0; i < AMOUNT_OF_TEST_FARMS; i++) {
  mockDistanceValues.push({
    distance: {
      text: faker.word.noun(),
      value: i,
    },
    duration: {
      text: faker.word.noun(),
      value: i,
    },
    status: 'OK',
  });
}

export const mockedDistanceApiResponse = () => ({
  destination_addresses: [faker.location.streetAddress()],
  origin_addresses: [faker.location.streetAddress()],
  rows: [
    {
      elements: mockDistanceValues,
    },
  ],
});
