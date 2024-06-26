import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../client/**/*.mdx', '../client/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    staticDirs: ['../public', '../public/assets'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-onboarding',
        '@storybook/addon-interactions',
        '@storybook/addon-mdx-gfm',
        '@storybook/addon-webpack5-compiler-swc',
        '@storybook/addon-interactions',
        'storybook-addon-remix-react-router',
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {
            builder: {},
        },
    },
    swc: () => ({
        jsc: {
            transform: {
            react: {
                runtime: 'automatic'
            }
            }
        }
    }),
    docs: {
        autodocs: 'tag',
    },
    core: {
        disableTelemetry: true,
    },
};
export default config;
