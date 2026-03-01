
export const initialChats = [
    { id: 1, name: 'Sarah Jenkins', preview: 'I need to return order #192837...', time: '2m ago', unread: 2, platform: 'whatsapp', sla: 'red', status: 'urgent',
      messages: [
          { id: 1, sender: 'customer', text: 'Hi, I received my order #192837 yesterday but the shirt is ripped.', time: '10:42 AM' },
          { id: 2, sender: 'agent', text: 'Hi Sarah, I am so sorry to hear that. Could you please send me a picture of the damage?', time: '10:45 AM' },
          { id: 3, sender: 'customer', text: 'Sure, here it is.', time: '10:46 AM', type: 'image' },
          { id: 4, sender: 'customer', text: 'I really needed it for an event this weekend. Is there any way to get a replacement fast?', time: '10:47 AM' },
          { id: 5, sender: 'customer', text: 'I need to return order #192837...', time: '10:49 AM' },
          { id: 6, sender: 'system', text: 'SLA Warning: Response time exceeding 5 minutes. Tagged as High Priority.', time: '10:52 AM' }
      ]
    },
    { id: 2, name: 'Michael Chen', preview: 'Do you ship to Canada?', time: '15m ago', unread: 0, platform: 'instagram', sla: 'green', status: 'orders',
      messages: [
          { id: 1, sender: 'customer', text: 'Hey, do you ship to Canada?', time: '11:05 AM' }
      ]
    },
    { id: 3, name: 'Elena Rodriguez', preview: '/qq', time: '1h ago', unread: 1, platform: 'whatsapp', sla: 'yellow', status: 'all',
      messages: [
          { id: 1, sender: 'customer', text: 'Can I get a quote for a bulk order of 50 jackets?', time: '09:00 AM' },
          { id: 2, sender: 'customer', text: '/qq', time: '09:30 AM' }
      ]
    },
    { id: 4, name: 'James Wilson', preview: 'Thanks for the quick refund!', time: '2h ago', unread: 0, platform: 'instagram', sla: 'green', status: 'refunds',
      messages: [
          { id: 1, sender: 'customer', text: 'Thanks for the quick refund!', time: '08:00 AM' }
      ]
    },
    { id: 5, name: 'Amanda Smith', preview: 'Where is my package?? It was due yesterday', time: '1m ago', unread: 5, platform: 'whatsapp', sla: 'red', status: 'urgent',
      messages: [
          { id: 1, sender: 'customer', text: 'Where is my package?? It was due yesterday', time: '10:59 AM' }
      ]
    },
];
