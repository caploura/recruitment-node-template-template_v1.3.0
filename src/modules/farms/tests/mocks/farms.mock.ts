import { faker } from '@faker-js/faker';

export const mockedAverage = 48.65;

export const mockedFarmWithOwner = () => [
  {
    name: faker.word.words(3),
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.longitude()},${faker.location.latitude()}`,
    size: parseFloat(faker.number.float().toFixed(2)),
    yield: 5, // Below mocked average
    owner: faker.internet.email(),
    createdAt: faker.date.past(),
  },
  {
    name: faker.word.words(3),
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.longitude()},${faker.location.latitude()}`,
    size: parseFloat(faker.number.float().toFixed(2)),
    yield: 45.78, // Within average 30% range
    owner: faker.internet.email(),
    createdAt: faker.date.past(),
  },
  {
    name: faker.word.words(3),
    address: faker.location.streetAddress(),
    coordinates: `${faker.location.longitude()},${faker.location.latitude()}`,
    size: parseFloat(faker.number.float().toFixed(2)),
    yield: 140.56, // Above mocked average
    owner: faker.internet.email(),
    createdAt: faker.date.past(),
  },
];
