import axios from 'axios';
import config from 'config/config';
import { FetchDistanceRequestDto, FetchDistanceResponseDto } from './dto/fetch-distance.dto';

export class DistanceService {
  public async getDistanceBetweenTwoPointsFromGoogleApi(data: FetchDistanceRequestDto): Promise<FetchDistanceResponseDto> {
    const url = config.GOOGLE_API_URL;
    const key = config.GOOGLE_API_KEY;

    const result = await axios.get(url, {
      params: {
        destinations: data.destinations.join('|'),
        origins: data.origins.join('|'),
        units: data.units,
        key,
      },
    });

    if (result.data.status !== 'OK') {
      throw new Error(result.data.status);
    }

    return result.data as FetchDistanceResponseDto;
  }
}
