import ComponentsAppsCreateTemplate from '@/components/apps/create-template/components-apps-create-template';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create Template',
};

const CreateTemplate = () => {
    return <ComponentsAppsCreateTemplate />;
};

export default CreateTemplate;
