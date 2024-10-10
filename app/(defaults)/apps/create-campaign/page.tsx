import ComponentsAppsCreateCampaign from '@/components/apps/create-campaign/components-apps-create-campaign';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create Campaign',
};

const CreateCampaign = () => {
    return <ComponentsAppsCreateCampaign />;
};

export default CreateCampaign;
