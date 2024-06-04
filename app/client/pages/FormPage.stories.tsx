import { Meta, StoryObj } from "@storybook/react";

import { reactRouterParameters, withRouter } from 'storybook-addon-remix-react-router';

import FormPage from "./FormPage";

const meta: Meta<typeof FormPage> = {
  title: "Page/FormPage",
  component: FormPage,
  decorators: [
    (Story) => (
      <div style={{ width: '800px'}}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormPage>;

export const Default: Story = {
  // parameters: {
  //   reactRouter: reactRouterParameters({
  //     location: {
  //       pathParams: { userId: '42' },
  //       searchParams: { tab: 'activityLog' },
  //       state: { fromPage: 'homePage' },
  //     },
  //     routing: {
  //       path: '/users/:userId',
  //       handle: 'Profile',
  //     },
  //   }),
  // },
};

