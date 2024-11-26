import ComponentsAppsCampaignOverview from '@/components/apps/create-campaign/components-apps-overview';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create New Campaign',
};

const CampaignOverview = () => {
    return <ComponentsAppsCampaignOverview />;
};

export default CampaignOverview;
