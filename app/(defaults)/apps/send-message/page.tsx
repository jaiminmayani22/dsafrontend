import ComponentsAppsSendMessage from '@/components/apps/send-message/components-apps-send-message';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Send Message',
};

const SendMessage = () => {
    return <ComponentsAppsSendMessage />;
};

export default SendMessage;
