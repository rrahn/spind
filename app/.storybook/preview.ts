import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon'; // Import the mswLoader module

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    loaders: [mswLoader] // 👈 Add the MSW loader to all stories
};

export default preview;
