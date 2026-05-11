import { Lab, Commit, Project } from './types';

export const LABS: Lab[] = [
  {
    id: 'LAB_01',
    title: 'Splunk Log Analysis',
    description: 'Advanced threat hunting using SPL queries. Correlating authentication logs to identify lateral movement patterns.',
    category: 'SPLUNK_ENT_8.2',
    status: 'ACTIVE',
    difficulty: 'MEDIUM',
    icon: 'analytics'
  },
  {
    id: 'LAB_02',
    title: 'Wireshark Packet Sniffing',
    description: 'Deep packet inspection to analyze encrypted payloads and detect anomalous network traffic anomalies.',
    category: 'NETWORK_ANALYSIS',
    status: 'ACTIVE',
    difficulty: 'HARD',
    icon: 'wifi_tethering'
  },
  {
    id: 'LAB_03',
    title: 'Metasploit Environments',
    description: 'Simulated exploit staging. Developing custom modules to test vulnerability resilience in isolated sandbox networks.',
    category: 'PENETRATION_TESTING',
    status: 'ACTIVE',
    difficulty: 'CRITICAL',
    icon: 'bug_report'
  }
];

export const COMMITS: Commit[] = [
  {
    id: '1',
    hash: '9f8a7b6',
    branch: 'HEAD -> master',
    role: 'Senior Security Engineer',
    company: 'CyberDyne',
    details: [
      'Implemented zero-trust architecture.',
      'Reduced intrusion incidents by 40%.'
    ],
    date: '2022 - Present'
  },
  {
    id: '2',
    hash: '3e4d5c2',
    role: 'Security Analyst',
    company: 'OmniCorp',
    details: [
      'Conducted weekly penetration tests.',
      'Managed SIEM dashboard alerts.'
    ],
    date: '2019 - 2022'
  },
  {
    id: '3',
    hash: '1a2b3c4',
    role: 'B.S. Computer Science',
    company: 'Tech Institute',
    details: [
      'Specialization in Information Security.'
    ],
    date: '2015 - 2019'
  }
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Automated Nmap Scanner',
    description: 'Python script wrapping Nmap for automated subnet enumeration.',
    tech: 'PYTHON',
    icon: 'data_object',
    status: 'STABLE_RELEASE'
  },
  {
    id: '2',
    title: 'CloudTrail Monitor',
    description: 'Serverless AWS Lambda function alerting on unauthorized IAM changes.',
    tech: 'AWS',
    icon: 'cloud',
    status: 'ACTIVE_MONITORING'
  },
  {
    id: '3',
    title: 'Threat Intel Dashboard',
    description: 'React frontend visualizing real-time threat feeds from open APIs.',
    tech: 'NEXT.JS',
    icon: 'language',
    status: 'v2.1.0'
  }
];
