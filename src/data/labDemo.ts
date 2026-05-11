/**
 * Static fictional data for the Splunk-style portfolio demo (not a live SIEM).
 */

export const labDemoBanner = {
  environmentLabel: 'UI mock · Splunk-style',
  statusLabel: 'Demo scenario (not a live incident)',
} as const;

export const labDemoQuery = `index=main sourcetype="linux_secure" action="failure" user="root"
| stats count by src_ip
| where count > 50
| sort - count`;

export const labDemoLogRows = [
  {
    time: '2024-10-27 14:02:11',
    type: 'sshd_fail',
    data: 'Failed password for root from 192.168.1.105 port 49122 ssh2',
    isError: true,
  },
  {
    time: '2024-10-27 14:02:13',
    type: 'sshd_fail',
    data: 'Failed password for root from 192.168.1.105 port 49122 ssh2',
    isError: true,
  },
  {
    time: '2024-10-27 14:02:15',
    type: 'sshd_success',
    data: 'Accepted password for root from 192.168.1.105 port 49122 ssh2',
    isSuccess: true,
  },
  {
    time: '2024-10-27 14:02:16',
    type: 'session_open',
    data: 'pam_unix(sshd:session): session opened for user root by (uid=0)',
  },
] as const;

export const labDemoAggregates = [
  { ip: '192.168.1.105', count: 4142, severity: 95, color: 'bg-error-fixed' as const },
  { ip: '10.0.0.44', count: 12, severity: 15, color: 'bg-secondary-fixed' as const },
];

export const labDemoThreatSummary = [
  {
    label: 'HIGHLIGHT_IP',
    value: '192.168.1.105',
    valClass: 'text-primary-fixed',
  },
  {
    label: 'SCENARIO',
    value: 'SSH brute force (sample)',
    valClass: 'text-on-surface',
  },
  {
    label: 'CONTEXT',
    value: 'Portfolio UI only',
    valClass: 'text-secondary-fixed',
  },
] as const;

export const labDemoToolboxQueries = [
  'index=main sourcetype="linux_secure"',
  '| stats count by src_ip | sort - count',
  'index=main "Accepted password"',
] as const;
