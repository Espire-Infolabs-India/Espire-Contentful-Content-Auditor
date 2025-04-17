import { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import {
  Heading,
  Form,
  Paragraph,
  Flex,
  TextInput,
} from '@contentful/f36-components';
import { css } from 'emotion';
import { useSDK } from '@contentful/react-apps-toolkit';

// Update the interface to include the token
export interface AppInstallationParameters {
  cmaToken?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const sdk = useSDK<ConfigAppSDK>();

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();

    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex
      flexDirection="column"
      className={css({ margin: '80px', maxWidth: '800px' })}
    >
      <Form>
        <Heading>App Config</Heading>
        <Paragraph>
          Welcome to your Contentful app. Enter the CMA token to use it across
          the app.
        </Paragraph>

        <TextInput
          name="cmaToken"
          placeholder="Enter CMA Token"
          value={parameters.cmaToken || ''}
          onChange={(e) =>
            setParameters((prev) => ({
              ...prev,
              cmaToken: e.target.value,
            }))
          }
        />
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
