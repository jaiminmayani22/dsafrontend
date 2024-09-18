import ComponentsTablesCaptions from '@/components/tables/components-tables-captions';
import ComponentsTablesCheckboxes from '@/components/tables/components-tables-checkboxes';
import ComponentsTablesDropdown from '@/components/tables/components-tables-dropdown';
import ComponentsTablesHover from '@/components/tables/components-tables-hover';
import ComponentsTablesProgress from '@/components/tables/components-tables-progress';
import ComponentsTablesSimple from '@/components/tables/components-tables-simple';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Tables',
};

const Tables = () => {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Simple */}
            <ComponentsTablesSimple />
            {/* Hover Table  */}
            <ComponentsTablesHover />
            {/* captions */}
            <ComponentsTablesCaptions />
            {/* progress */}
            <ComponentsTablesProgress />
            {/* dropdown */}
            <ComponentsTablesDropdown />
            {/* checkboxes */}
            <ComponentsTablesCheckboxes />
        </div>
    );
};

export default Tables;
