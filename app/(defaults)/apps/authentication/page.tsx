import ComponentsAppsAuthentication from '@/components/apps/authentication/components-apps-authentication';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Authentication',
};

const Authentication = () => {
    return <ComponentsAppsAuthentication />;
};

export default Authentication;
