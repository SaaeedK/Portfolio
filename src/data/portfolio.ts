/** Static lab cards and project highlights shown on the dashboard. */
import type { Lab, Project } from '@/types';

export const labs: Lab[] = [
  {
    id: 'LAB_01',
    title: 'Splunk Log Analysis',
    description:
      'SSH brute-force hunt on linux_secure auth logs — correlate failed root logins and post-compromise session events with SPL.',
    category: 'SPLUNK_ENT_8.2',
    status: 'ACTIVE',
    difficulty: 'MEDIUM',
    icon: 'analytics',
    visualizerHeights: [8, 14, 6, 18, 10, 12, 7, 16, 9, 11, 13, 8],
  },
  {
    id: 'LAB_02',
    title: 'Wireshark Packet Sniffing',
    description:
      'DNS beaconing lab — Zeek-style query logs from PCAP exports; spot high-volume lookups to a suspect domain.',
    category: 'NETWORK_ANALYSIS',
    status: 'ACTIVE',
    difficulty: 'HARD',
    icon: 'wifi_tethering',
    visualizerHeights: [12, 8, 16, 10, 14, 7, 18, 9, 11, 6, 15, 10],
  },
  {
    id: 'LAB_03',
    title: 'Metasploit Environments',
    description:
      'WAF + access_log triage after Metasploit staging — webshell upload blocks, PHP probe paths, and attacker IP correlation.',
    category: 'PENETRATION_TESTING',
    status: 'ACTIVE',
    difficulty: 'CRITICAL',
    icon: 'bug_report',
    visualizerHeights: [10, 18, 8, 12, 14, 9, 16, 7, 11, 13, 6, 17],
  },
];

export const projects: Project[] = [
  {
    id: '1',
    title: 'Automated Nmap Scanner',
    description: 'Python script wrapping Nmap for automated subnet enumeration.',
    tech: 'PYTHON',
    icon: 'data_object',
    status: 'STABLE_RELEASE',
  },
  {
    id: '2',
    title: 'CloudTrail Monitor',
    description: 'Serverless AWS Lambda function alerting on unauthorized IAM changes.',
    tech: 'AWS',
    icon: 'cloud',
    status: 'ACTIVE_MONITORING',
  },
  {
    id: '3',
    title: 'Threat Intel Dashboard',
    description: 'React frontend visualizing real-time threat feeds from open APIs.',
    tech: 'NEXT.JS',
    icon: 'language',
    status: 'v2.1.0',
  },
  {
    id: '4',
    title: 'This portfolio',
    description: 'Terminal-inspired security portfolio on Cloudflare Pages with contact API.',
    tech: 'REACT',
    icon: 'language',
    status: 'LIVE',
    repoUrl: 'https://github.com/SaaeedK/Portfolio',
  },
];
