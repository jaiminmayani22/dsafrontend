import ComponentsAppsGroups from '@/components/apps/groups/components-apps-groups';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Groups',
};

const Groups = () => {
    return <ComponentsAppsGroups />;
};

export default Groups;
