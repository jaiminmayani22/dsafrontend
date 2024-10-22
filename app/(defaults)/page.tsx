import ComponentsDashboardSales from '@/components/dashboard/components-dashboard-sales';
import ComponentsContacts from '@/components/apps/contacts/components-apps-contacts';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'DSA',
};

const Sales = () => {
    return <ComponentsContacts />;
    // return <ComponentsDashboardSales />;
};

export default Sales;
