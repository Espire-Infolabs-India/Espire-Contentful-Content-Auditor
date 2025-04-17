import { createClient, Environment } from 'contentful-management';

export const getContentfulEnvironment = async (
  accessToken: string,
  spaceId: string,
  environmentId: string
): Promise<Environment> => {
  const client = createClient({ accessToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);
  return environment;
};
