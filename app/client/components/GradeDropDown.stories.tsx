import { FormProvider, useForm } from "react-hook-form";
import { ContactProvider } from "../contexts/ContactContext";
import GradeDropDown from "./GradeDropDown";

import { Meta, StoryObj } from "@storybook/react";
import { JSX } from "react/jsx-runtime";
import React from "react";

const withFormDecorator = (Story: any) => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <Story />
      </FormProvider>
    );
};

const meta = {
    title: 'Base/GradeDropDown',
    component: GradeDropDown,
    tags: ['autodocs'],
    decorators: [withFormDecorator,
        (Story) => (
            <div style={{ width: '120px'}}>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof GradeDropDown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
    args: {
      message: 'Klasse',
      grades: ['5N', '6N', '7N', '7A', '7B', '8N', '8A', '8B', '9N', '9A', '9B', '10N', '10A', '10B', '11', '12'],
    },
};

export const SelectedGrade: Story = {
    args: {
      ...DefaultTest.args,
      selectedGrade: '7A',
    },
};
