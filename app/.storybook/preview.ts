import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon'; // Import the mswLoader module
import { http, HttpResponse } from 'msw';
import { TestDataCombinationLocker, TestDataKeyLocker } from './locker-mocks';
import { withRouter } from 'storybook-addon-remix-react-router'; // Import the router decorator

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
        msw: {
            handlers: {
                locker: [
                    http.get('/api/getLockers/unit/1', () => {
                        return HttpResponse.json(TestDataKeyLocker);
                    }),
                    http.get('/api/getLockers/unit/2', () => {
                        return HttpResponse.json(TestDataCombinationLocker);
                    }),
                ],
            },
        },
        layout: 'centered',
    },
    loaders: [mswLoader], // 👈 Add the MSW loader to all stories
    decorators: [withRouter], // 👈 Add the router decorator to all stories
};

export default preview;
