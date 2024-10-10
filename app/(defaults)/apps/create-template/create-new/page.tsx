import ComponentsAppsCreateNewTemplate from '@/components/apps/create-template/components-apps-create-new-template';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create New Template',
};

const CreateNewTemplate = () => {
    return <ComponentsAppsCreateNewTemplate />;
};

export default CreateNewTemplate;
