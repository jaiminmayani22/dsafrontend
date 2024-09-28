import ComponentsAppsTrash from '@/components/apps/trash/components-apps-trash';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Trash',
};

const Trash = () => {
    return <ComponentsAppsTrash />;
};

export default Trash;
