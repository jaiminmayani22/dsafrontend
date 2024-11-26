import ComponentsAppsVariables from '@/components/apps/variables/components-apps-variables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Variables',
};

const Variables = () => {
    return <ComponentsAppsVariables />;
};

export default Variables;
