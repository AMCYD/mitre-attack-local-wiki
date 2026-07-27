import { Technique } from '../types/mitre'

export const DEFAULT_TECHNIQUES: Technique[] = [
  {
    id: "T1651",
    name: "Cloud Administration Command",
    tactic: "Execution",
    platforms: ["IaaS"],
    description: "Adversaries may abuse cloud APIs, CLI tools, or administration consoles to execute commands on remote cloud instances or services. Many cloud platforms provide tools and APIs to run scripts or commands directly inside virtual machines or serverless environments. For example, AWS Systems Manager Run Command, Azure Run Command, or Google Cloud Run Command can be leveraged by attackers who have acquired administrative credentials to execute commands without direct network access to the target systems.",
    procedures: [
      {
        id: "S0677",
        name: "AADInternals",
        description: "AADInternals can be used to execute commands remotely on Azure Virtual Machines using Azure Run Command features or custom script extensions.",
        url: "https://attack.mitre.org/software/S0677/"
      }
    ],
    subTechniques: [],
    detection: "Monitor API calls associated with command execution capabilities in cloud environments (e.g., Azure RunCommand, AWS Systems Manager SendCommand, Google Cloud Compute Exec). Audit user accounts executing these APIs, looking for anomalous or unauthorized administrative actions. Collect host-level event logs from virtual machines to match cloud API logs with local shell execution.",
    references: [
      {
        id: "ref-1",
        url: "https://attack.mitre.org/techniques/T1651/",
        description: "MITRE ATT&CK: Cloud Administration Command",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["Adrien Bataille", "Anders Vejlby", "Caio Silva", "Cisco", "Jared Wilson", "Nader Zaveri"],
    version: "2.1",
    created: "2023-03-13T00:00:00.000Z",
    modified: "2023-03-13T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["cloud", "azure", "aws", "execution"]
  },
  {
    id: "T1197",
    name: "BITS Jobs",
    tactic: "Execution",
    platforms: ["Windows"],
    description: "Adversaries may abuse Background Intelligent Transfer Service (BITS) jobs to execute commands, transfer files, or run payloads. BITS is a Windows component that enables asynchronous, prioritized, and throttled file transfers between machines using HTTP or HTTPS. BITS jobs run in the context of the LocalSystem account, making them attractive for defense evasion and persistence.",
    procedures: [
      {
        id: "G0096",
        name: "APT41",
        description: "APT41 has used BITS jobs to download and execute malicious payloads on compromised systems.",
        url: "https://attack.mitre.org/groups/G0096/"
      }
    ],
    subTechniques: [],
    detection: "Monitor BITS jobs creation and execution using PowerShell (Get-BitsTransfer) and Windows Event Logs (Microsoft-Windows-Bits-Client/Operational). Look for suspicious file download paths, unusual source URLs, or jobs that persist for long periods. Correlate BITS file writes with network connection telemetry.",
    references: [
      {
        id: "ref-2",
        url: "https://attack.mitre.org/techniques/T1197/",
        description: "MITRE ATT&CK: BITS Jobs",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["MITRE"],
    version: "1.3",
    created: "2017-05-31T00:00:00.000Z",
    modified: "2017-05-31T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["windows", "bits", "file-transfer"]
  },
  {
    id: "T1566",
    name: "Phishing",
    tactic: "Initial Access",
    platforms: ["Linux", "macOS", "Windows", "SaaS", "Office 365"],
    description: "Adversaries may send phishing messages to gain access to victim systems. All forms of phishing are targeted at an individual or a broader group to induce the victim to execute malicious code, provide sensitive credentials, or perform actions that weaken the security posture of the environment. Phishing can be conducted via email, direct messages, or other communication mediums.",
    procedures: [
      {
        id: "G0007",
        name: "APT28",
        description: "APT28 has initiated campaigns using spearphishing emails containing malicious attachments or links targeting credentials.",
        url: "https://attack.mitre.org/groups/G0007/"
      },
      {
        id: "G0016",
        name: "APT29",
        description: "APT29 has leveraged phishing emails containing ISO or LNK files to launch initial compromise scripts.",
        url: "https://attack.mitre.org/groups/G0016/"
      }
    ],
    subTechniques: [
      { id: "T1566.001", name: "Spearphishing Attachment" },
      { id: "T1566.002", name: "Spearphishing Link" },
      { id: "T1566.003", name: "Spearphishing via Service" }
    ],
    detection: "Deploy email filtering tools to analyze inbound messages for malicious links, attachments, or spoofed senders. Monitor host events for suspicious child processes spawned from email clients or web browsers (e.g., cmd.exe spawned by outlook.exe). Log and audit incoming network connections to known phishing domains.",
    references: [
      {
        id: "ref-3",
        url: "https://attack.mitre.org/techniques/T1566/",
        description: "MITRE ATT&CK: Phishing",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["MITRE"],
    version: "2.4",
    created: "2020-03-02T00:00:00.000Z",
    modified: "2020-03-02T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["initial-access", "phishing", "social-engineering"]
  },
  {
    id: "T1059",
    name: "Command and Scripting Interpreter",
    tactic: "Execution",
    platforms: ["Linux", "macOS", "Windows", "Network", "IaaS"],
    description: "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries. Many systems come with built-in command-line shells and scripting utilities (like PowerShell, cmd.exe, bash, or python). Adversaries often exploit these tools to bypass execution policies, run payloads, interact with system functions, or perform administrative tasks on remote machines.",
    procedures: [
      {
        id: "G0032",
        name: "Lazarus Group",
        description: "Lazarus Group frequently uses command-line scripts, PowerShell scripts, and scripting tools to deploy backdoors and harvest credentials.",
        url: "https://attack.mitre.org/groups/G0032/"
      }
    ],
    subTechniques: [
      { id: "T1059.001", name: "PowerShell" },
      { id: "T1059.002", name: "AppleScript" },
      { id: "T1059.003", name: "Windows Command Shell" },
      { id: "T1059.004", name: "Unix Shell" },
      { id: "T1059.005", name: "Visual Basic" },
      { id: "T1059.006", name: "Python" },
      { id: "T1059.007", name: "JavaScript" }
    ],
    detection: "Enable script transcription block logging for PowerShell (Event ID 4104) and command line argument auditing. Analyze parent-child process chains (e.g., web server spawning bash, or document viewer spawning cmd.exe). Flag command lines that contain obfuscated content, Base64 strings, or download commands.",
    references: [
      {
        id: "ref-4",
        url: "https://attack.mitre.org/techniques/T1059/",
        description: "MITRE ATT&CK: Command and Scripting Interpreter",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["MITRE"],
    version: "2.5",
    created: "2017-05-31T00:00:00.000Z",
    modified: "2017-05-31T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["execution", "powershell", "bash", "scripts"]
  },
  {
    id: "T1078",
    name: "Valid Accounts",
    tactic: "Initial Access",
    platforms: ["Linux", "macOS", "Windows", "Azure AD", "Office 365", "SaaS", "IaaS"],
    description: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion. Compromised accounts can belong to default admin profiles, regular domain users, service accounts, or cloud administrators. Because this access uses authentic credentials, it is often difficult to detect and distinguish from normal user activity.",
    procedures: [
      {
        id: "G0087",
        name: "APT39",
        description: "APT39 has logged in using stolen credentials to valid local and domain accounts on compromised systems to move laterally.",
        url: "https://attack.mitre.org/groups/G0087/"
      }
    ],
    subTechniques: [
      { id: "T1078.001", name: "Default Accounts" },
      { id: "T1078.002", name: "Domain Accounts" },
      { id: "T1078.003", name: "Local Accounts" },
      { id: "T1078.004", name: "Cloud Accounts" }
    ],
    detection: "Perform anomaly detection on login locations, times, and device profiles (e.g., impossible travel alerts). Track failed login attempts followed by sudden success. Monitor creation and modifications of API keys, credentials, and OAuth permissions in cloud service accounts.",
    references: [
      {
        id: "ref-5",
        url: "https://attack.mitre.org/techniques/T1078/",
        description: "MITRE ATT&CK: Valid Accounts",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["MITRE"],
    version: "2.6",
    created: "2017-05-31T00:00:00.000Z",
    modified: "2017-05-31T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["credentials", "accounts", "authentication"]
  },
  {
    id: "T1055",
    name: "Process Injection",
    tactic: "Defense Evasion",
    platforms: ["Linux", "macOS", "Windows"],
    description: "Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges. Process injection is a method of executing arbitrary code in the address space of a separate running process. Running code in the context of another process may allow access to the process's memory, system resources, and network permissions, while hiding execution from process monitoring utilities.",
    procedures: [
      {
        id: "S0154",
        name: "Cobalt Strike",
        description: "Cobalt Strike uses process injection techniques, such as DLL injection and thread execution hijacking, to run its Beacon payload inside legitimate processes.",
        url: "https://attack.mitre.org/software/S0154/"
      }
    ],
    subTechniques: [
      { id: "T1055.001", name: "DLL Injection" },
      { id: "T1055.002", name: "PE Injection" },
      { id: "T1055.003", name: "Thread Execution Hijacking" },
      { id: "T1055.012", name: "Process Hollowing" }
    ],
    detection: "Audit system API calls related to remote memory allocation and thread creation (e.g., VirtualAllocEx, WriteProcessMemory, CreateRemoteThread). Use Endpoint Detection and Response (EDR) utilities to detect process cross-memory writes and unbacked memory execution. Monitor process creation chains for abnormal behavior.",
    references: [
      {
        id: "ref-6",
        url: "https://attack.mitre.org/techniques/T1055/",
        description: "MITRE ATT&CK: Process Injection",
        sourceName: "MITRE ATT&CK"
      }
    ],
    contributors: ["MITRE"],
    version: "1.3",
    created: "2017-05-31T00:00:00.000Z",
    modified: "2017-05-31T00:00:00.000Z",
    isCustom: false,
    notes: "",
    tags: ["defense-evasion", "process-injection", "evasion"]
  }
]
