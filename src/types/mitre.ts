export type TacticName =
  | 'Reconnaissance' | 'Resource Development' | 'Initial Access'
  | 'Execution' | 'Persistence' | 'Privilege Escalation'
  | 'Defense Evasion' | 'Credential Access' | 'Discovery'
  | 'Lateral Movement' | 'Collection' | 'Command and Control'
  | 'Exfiltration' | 'Impact';

export type PlatformName =
  | 'Windows' | 'macOS' | 'Linux' | 'IaaS' | 'Azure AD'
  | 'Office 365' | 'SaaS' | 'Google Workspace' | 'Network'
  | 'PRE' | 'Containers';

export interface Reference {
  id:          string;
  url:         string;
  description: string;
  sourceName:  string;
}

export interface Procedure {
  id:          string;    // e.g. S0677
  name:        string;    // e.g. AADInternals
  description: string;
  url?:        string;
}

export interface SubTechnique {
  id:   string;           // e.g. T1059.001
  name: string;           // e.g. PowerShell
}

export interface Technique {
  id:             string;
  name:           string;
  tactic:         string;
  platforms:      string[];
  description:    string;
  procedures:     Procedure[];
  subTechniques:  SubTechnique[];
  detection:      string;
  references:     Reference[];
  contributors:   string[];
  version:        string;
  created:        string;   // ISO 8601
  modified:       string;   // ISO 8601
  isCustom:       boolean;
  notes:          string;
  tags:           string[];
}

export interface WikiStats {
  totalTechniques:  number;
  totalTactics:     number;
  customTechniques: number;
  lastModified:     string | null;
  storageUsed:      string;
}
