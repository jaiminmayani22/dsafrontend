import ComponentsAppsCreateNewCampaign from '@/components/apps/create-campaign/components-apps-create-new-campaign';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create New Campaign',
};

const CreateNewCampaign = () => {
    return <ComponentsAppsCreateNewCampaign />;
};

export default CreateNewCampaign;
